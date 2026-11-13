'use strict';
function asciiAt(b, at, n) {
  return String.fromCharCode(...b.subarray(at, at + n));
}

function imageKind(b) {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpeg';
  if (asciiAt(b, 0, 8) === '\x89PNG\r\n\x1a\n') return 'png';
  if (asciiAt(b, 0, 4) === 'RIFF' && asciiAt(b, 8, 4) === 'WEBP') return 'webp';
  return null;
}

function jpegOrientation(seg) {
  if (asciiAt(seg, 4, 6) !== 'Exif\0\0') return 1;
  try {
    const v = new DataView(seg.buffer, seg.byteOffset + 10, seg.length - 10);
    const le = v.getUint16(0) === 0x4949;
    const ifd = v.getUint32(4, le);
    for (let k = 0, n = v.getUint16(ifd, le); k < n; k++) {
      if (v.getUint16(ifd + 2 + k * 12, le) === 0x0112) return v.getUint16(ifd + 10 + k * 12, le);
    }
  } catch (e) {}
  return 1;
}

function cleanJpeg(b) {
  const parts = [b.subarray(0, 2)];
  let orientation = 1;
  for (let i = 2; ;) {
    if (b[i] !== 0xff) throw new Error('strip');
    const m = b[i + 1];
    if (m === 0xff) {
      i++;
      continue;
    }
    if (m === 0xd9) {
      if (orientation > 1 && orientation < 9)
        parts.splice(
          1,
          0,
          new Uint8Array([
            0xff,
            0xe1,
            0,
            34,
            0x45,
            0x78,
            0x69,
            0x66,
            0,
            0,
            0x4d,
            0x4d,
            0,
            0x2a,
            0,
            0,
            0,
            8,
            0,
            1,
            0x01,
            0x12,
            0,
            3,
            0,
            0,
            0,
            1,
            0,
            orientation,
            0,
            0,
            0,
            0,
            0,
            0
          ])
        );
      parts.push(b.subarray(i, i + 2));
      return parts;
    }
    const end = i + 2 + ((b[i + 2] << 8) | b[i + 3]);
    if (!(end <= b.length)) throw new Error('strip');
    const seg = b.subarray(i, end);
    if (m === 0xe1 && orientation === 1) orientation = jpegOrientation(seg);
    if (
      (m >= 0xc0 && m <= 0xcf && m !== 0xc8) ||
      (m >= 0xda && m <= 0xdf) ||
      (m === 0xee && seg.length === 16 && asciiAt(seg, 4, 5) === 'Adobe')
    )
      parts.push(seg);
    if (m !== 0xda) {
      i = end;
      continue;
    }
    i = b.indexOf(0xff, end);
    while (i !== -1 && (b[i + 1] === 0 || (b[i + 1] >= 0xd0 && b[i + 1] <= 0xd7))) i = b.indexOf(0xff, i + 2);
    if (i === -1) throw new Error('strip');
    parts.push(b.subarray(end, i));
  }
}

const PNG_KEEP = ['IHDR', 'PLTE', 'tRNS', 'gAMA', 'cHRM', 'sRGB', 'cICP', 'acTL', 'fcTL', 'IDAT', 'fdAT', 'IEND'];

function cleanPng(b) {
  const v = new DataView(b.buffer, b.byteOffset, b.length);
  const parts = [b.subarray(0, 8)];
  for (let i = 8; ;) {
    const end = i + 12 + v.getUint32(i);
    const type = asciiAt(b, i + 4, 4);
    if (!(end <= b.length)) throw new Error('strip');
    if (PNG_KEEP.includes(type)) parts.push(b.subarray(i, end));
    if (type === 'IEND') return parts;
    i = end;
  }
}

const WEBP_KEEP = ['VP8 ', 'VP8L', 'VP8X', 'ALPH', 'ANIM', 'ANMF'];

function cleanWebp(b) {
  const v = new DataView(b.buffer, b.byteOffset, b.length);
  const riffEnd = 8 + v.getUint32(4, true);
  if (!(riffEnd <= b.length)) throw new Error('strip');
  const parts = [b.subarray(0, 12)];
  for (let i = 12; i < riffEnd;) {
    const size = v.getUint32(i + 4, true);
    const next = i + 8 + size + (size & 1);
    if (!(next <= riffEnd)) throw new Error('strip');
    const type = asciiAt(b, i, 4);
    if (type === 'VP8X') b[i + 8] &= ~0x2c;
    if (WEBP_KEEP.includes(type)) parts.push(b.subarray(i, next));
    i = next;
  }
  v.setUint32(4, parts.reduce((sum, p) => sum + p.length, 0) - 8, true);
  return parts;
}

const IMAGE_CLEANERS = { jpeg: cleanJpeg, png: cleanPng, webp: cleanWebp };

const UNCLEANABLE_EXT =
  /\.(heic|heif|hif|avif|jxl|jp2|j2k|jpf|jpx|jpm|psd|psb|tiff?|dng|cr2|cr3|crw|nef|nrw|arw|srf|sr2|raf|orf|rw2|pef|srw|x3f|3fr|iiq|erf|kdc|mrw|mef|mos|rwl|dcr)$/i;
const HEIF_BRANDS = [
  'heic',
  'heix',
  'hevc',
  'hevx',
  'heim',
  'heis',
  'mif1',
  'mif2',
  'miaf',
  'msf1',
  'avif',
  'avis',
  'crx '
];
const UNCLEANABLE_MAGIC = [
  'II*\0',
  'MM\0*',
  'IIRO',
  'IIRS',
  'MMOR',
  'IIU\0',
  'FUJIFILM',
  '8BPS',
  '\xFF\x0A',
  '\xFF\x4F\xFF\x51'
];
const UNCLEANABLE_BOXES = ['JXL ', 'jP  '];

function uncleanableImage(b, name) {
  if (UNCLEANABLE_MAGIC.some(m => asciiAt(b, 0, m.length) === m)) return true;
  if (UNCLEANABLE_BOXES.includes(asciiAt(b, 4, 4))) return true;
  if (asciiAt(b, 4, 4) === 'ftyp' && HEIF_BRANDS.includes(asciiAt(b, 8, 4))) return true;
  return UNCLEANABLE_EXT.test(name);
}

async function stripImageMetadata(file) {
  const head = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const kind = imageKind(head);
  if (!kind && !file.type.startsWith('image/') && !uncleanableImage(head, file.name)) return file;
  try {
    if (!kind) throw new Error('strip');
    const clean = new File(IMAGE_CLEANERS[kind](new Uint8Array(await file.arrayBuffer())), file.name, {
      type: 'image/' + kind
    });
    const img = new Image();
    img.src = URL.createObjectURL(clean);
    await img.decode().finally(() => URL.revokeObjectURL(img.src));
    return clean;
  } catch (e) {
    const err = alertError(kind ? 'alerts.strip_failed' : 'alerts.strip_unsupported');
    err.toastMs = 8000;
    throw err;
  }
}
