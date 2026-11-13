'use strict';
window._argon2Ready = new Promise(function (resolve, reject) {
  var src = '/js/vendor/argon2.js';
  var s = document.createElement('script');
  s.onload = function () {
    resolve();
  };
  s.onerror = function () {
    reject(new Error('argon2 load failed'));
  };
  s.src = src;
  document.head.appendChild(s);
});

function bytesToBase64Url(bytes) {
  let binary = '';
  bytes.forEach(b => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToBytes(str) {
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4));
  return Uint8Array.from(binary, c => c.charCodeAt(0));
}

function secureRandomIndex(max) {
  const limit = Math.floor(65536 / max) * max;
  const buf = new Uint16Array(1);
  let v;
  do {
    crypto.getRandomValues(buf);
    v = buf[0];
  } while (v >= limit);
  return v % max;
}

function randomPassphrase(words) {
  const picks = [];
  for (let i = 0; i < 5; i++) picks.push(words[secureRandomIndex(words.length)]);
  return picks.join('-');
}

function generateLinkKey() {
  return bytesToBase64Url(crypto.getRandomValues(new Uint8Array(32)));
}

async function deriveMaster(password, salt) {
  await window._argon2Ready;
  const result = await argon2.hash({
    pass: password.normalize('NFC'),
    salt: salt,
    type: argon2.ArgonType.Argon2id,
    mem: 65536,
    time: 3,
    parallelism: 1,
    hashLen: 32,
    distPath: '/'
  });
  return new Uint8Array(result.hash);
}

async function deriveSecretMaster(linkKey, password, salt) {
  if (linkKey) return base64UrlToBytes(linkKey);
  return deriveMaster(password, salt);
}

async function deriveSubKeys(masterRaw) {
  const masterKey = await crypto.subtle.importKey('raw', masterRaw, 'HKDF', false, ['deriveKey', 'deriveBits']);
  const aesKey = await crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: new Uint8Array(0),
      info: new TextEncoder().encode('secretdrop:aes-gcm-256')
    },
    masterKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
  const authBits = await crypto.subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(0), info: new TextEncoder().encode('secretdrop:hmac-auth') },
    masterKey,
    256
  );
  return { aesKey, authKeyRaw: new Uint8Array(authBits) };
}

function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function getUint8Array(input) {
  if (Array.isArray(input)) return new Uint8Array(input);
  if (typeof input === 'string') return new Uint8Array(base64ToArrayBuffer(input));
  return new Uint8Array(input);
}

function paddedLength(len) {
  if (len <= 32768) return 32768;
  const e = 31 - Math.clz32(len);
  const step = 2 ** (e - (31 - Math.clz32(e)) - 1);
  return Math.max(len, Math.min(Math.ceil(len / step) * step, 51 * 1024 * 1024));
}

async function buildEncryptedFrame(type, entries, password, linkKey) {
  const masterSalt = crypto.getRandomValues(new Uint8Array(16));
  const masterRaw = await deriveSecretMaster(linkKey, password, masterSalt);
  const { aesKey, authKeyRaw } = await deriveSubKeys(masterRaw);
  const items = [];
  const parts = [];
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    const hdr = {};
    if (e.name !== undefined) hdr.name = e.name;
    if (e.mime !== undefined) hdr.mime = e.mime;
    const hdrBytes = new TextEncoder().encode(JSON.stringify(hdr));
    const dataBytes = e.data instanceof Uint8Array ? e.data : new Uint8Array(e.data);
    items.push({ len: 4 + hdrBytes.length + dataBytes.length });
    parts.push({ hdrBytes, dataBytes });
  }
  const innerMeta = new TextEncoder().encode(JSON.stringify({ type, items }));
  let plainLen = 4 + innerMeta.length;
  for (let i = 0; i < items.length; i++) plainLen += items[i].len;
  const plain = new Uint8Array(paddedLength(plainLen));
  const view = new DataView(plain.buffer);
  view.setUint32(0, innerMeta.length, false);
  plain.set(innerMeta, 4);
  let off = 4 + innerMeta.length;
  for (let i = 0; i < parts.length; i++) {
    view.setUint32(off, parts[i].hdrBytes.length, false);
    plain.set(parts[i].hdrBytes, off + 4);
    plain.set(parts[i].dataBytes, off + 4 + parts[i].hdrBytes.length);
    off += items[i].len;
  }
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, aesKey, plain));
  const metaBytes = new TextEncoder().encode(JSON.stringify({ v: 5 }));
  const frame = new Uint8Array(4 + metaBytes.length + iv.length + ct.length);
  new DataView(frame.buffer).setUint32(0, metaBytes.length, false);
  frame.set(metaBytes, 4);
  frame.set(iv, 4 + metaBytes.length);
  frame.set(ct, 4 + metaBytes.length + iv.length);
  return { frame, masterSalt, authKeyRaw };
}

function parseEncryptedFrame(bytes) {
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const metaLen = dv.getUint32(0, false);
  let off = 4;
  const meta = JSON.parse(new TextDecoder().decode(bytes.subarray(off, off + metaLen)));
  off += metaLen;
  if (meta.v !== 5) throw new Error('format');
  return { iv: bytes.slice(off, off + 12), ct: bytes.slice(off + 12) };
}

function unwrapItem(decryptedBuf) {
  const u = decryptedBuf instanceof Uint8Array ? decryptedBuf : new Uint8Array(decryptedBuf);
  const hdrLen = new DataView(u.buffer, u.byteOffset, u.byteLength).getUint32(0, false);
  const hdr = JSON.parse(new TextDecoder().decode(u.subarray(4, 4 + hdrLen)));
  return { name: hdr.name, mime: hdr.mime, data: u.subarray(4 + hdrLen) };
}

async function decryptFrame(frame, aesKey) {
  const plain = new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: frame.iv }, aesKey, frame.ct));
  const metaLen = new DataView(plain.buffer).getUint32(0, false);
  const meta = JSON.parse(new TextDecoder().decode(plain.subarray(4, 4 + metaLen)));
  let off = 4 + metaLen;
  const items = meta.items.map(item => {
    const part = plain.subarray(off, off + item.len);
    off += item.len;
    return unwrapItem(part);
  });
  return { type: meta.type, items };
}

async function computeAuthTag(authKeyRaw, idStr) {
  const key = await crypto.subtle.importKey('raw', authKeyRaw, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(idStr));
  return arrayBufferToBase64(sig);
}
