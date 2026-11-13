'use strict';
const express = require('express');
const crypto = require('crypto');
const https = require('https');
const { Database } = require('node:sqlite');
const app = express();
app.disable('x-powered-by');
app.disable('etag');
app.set('case sensitive routing', true);
const PORT = 3000;
const EXPIRY_STEP_MS = 600000;
const MAX_ATTEMPTS = 5;
const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET || '';
const DB_PATH = process.env.SECRETDROP_DB || '/var/lib/secretdrop/secrets.db';
const setting = (name, min) => {
  const s = process.env[name] || '';
  const n = Number(s);
  if (!/^\d+$/.test(s) || !Number.isSafeInteger(n) || n < min) throw new Error('Missing or invalid setting ' + name);
  return n;
};
const MAX_BYTES = setting('SECRETDROP_MAX_BYTES', 1);
const MESSAGE_FRAME_BYTES = 32807;
const MESSAGE_RESERVE = Math.min(setting('SECRETDROP_MESSAGE_RESERVE', 0), MAX_BYTES);
const MAX_PAYLOAD = setting('SECRETDROP_MAX_PAYLOAD', 1);
const MAX_DB_BYTES = setting('SECRETDROP_MAX_DB_BYTES', 1);
const ONION_FILE_BUDGET = setting('SECRETDROP_ONION_FILE_BUDGET', 1);
const ONION_BUDGET_WINDOW_MS = 3600000;
const onionFileUploads = [];

const db = new Database(DB_PATH, { timeout: 5000 });
db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA synchronous = NORMAL');
db.exec('PRAGMA busy_timeout = 5000');
db.exec('PRAGMA temp_store = MEMORY');
db.exec('PRAGMA secure_delete = ON');
db.exec('PRAGMA journal_size_limit = 4194304');
const PAGE_SIZE = db.prepare('PRAGMA page_size').get().page_size;
db.exec('PRAGMA max_page_count = ' + Math.floor(MAX_DB_BYTES / PAGE_SIZE));
db.exec(
  'CREATE TABLE IF NOT EXISTS secrets(id TEXT PRIMARY KEY,payload BLOB NOT NULL,salt TEXT NOT NULL,tag TEXT NOT NULL,attempts INTEGER NOT NULL DEFAULT 0,expires_at INTEGER NOT NULL)'
);
db.exec('CREATE INDEX IF NOT EXISTS idx_secrets_exp ON secrets(expires_at)');
db.exec('CREATE TABLE IF NOT EXISTS meta(k TEXT PRIMARY KEY,v INTEGER NOT NULL)');
db.prepare("INSERT OR IGNORE INTO meta(k,v) VALUES('total_bytes',0)").run();

const stMetaGet = db.prepare("SELECT v FROM meta WHERE k='total_bytes'");
const stMetaAdd = db.prepare("UPDATE meta SET v=v+? WHERE k='total_bytes'");
const stMetaSub = db.prepare("UPDATE meta SET v=max(0,v-?) WHERE k='total_bytes'");
const stInsert = db.prepare(
  'INSERT OR IGNORE INTO secrets(id,payload,salt,tag,attempts,expires_at) VALUES(?,?,?,?,0,?)'
);
const stAuth = db.prepare('SELECT salt,expires_at FROM secrets WHERE id=?');
const stTag = db.prepare('SELECT tag,expires_at FROM secrets WHERE id=?');
const stClaim = db.prepare('DELETE FROM secrets WHERE id=? RETURNING payload AS payload,length(payload) AS n');
const stAttempt = db.prepare('SELECT attempts,length(payload) AS n,expires_at FROM secrets WHERE id=?');
const stSetAttempts = db.prepare('UPDATE secrets SET attempts=? WHERE id=?');
const stDel = db.prepare('DELETE FROM secrets WHERE id=? RETURNING length(payload) AS n');
const stCleanOne = db.prepare(
  'DELETE FROM secrets WHERE rowid=(SELECT rowid FROM secrets WHERE expires_at<=? LIMIT 1) RETURNING length(payload) AS n'
);

const transaction =
  fn =>
  (...args) => {
    db.exec('BEGIN');
    try {
      const r = fn(...args);
      db.exec('COMMIT');
      return r;
    } catch (e) {
      if (db.isTransaction) db.exec('ROLLBACK');
      throw e;
    }
  };
const txStore = transaction((id, payload, salt, tag, exp) => {
  const used = stMetaGet.get().v;
  const big = payload.length > MESSAGE_FRAME_BYTES;
  if (used + payload.length > (big ? MAX_BYTES - MESSAGE_RESERVE : MAX_BYTES))
    return big && used + MESSAGE_FRAME_BYTES <= MAX_BYTES ? 3 : 2;
  const r = stInsert.run(id, payload, salt, tag, exp);
  if (r.changes === 0) return 1;
  stMetaAdd.run(payload.length);
  return 0;
});
const txClaim = transaction(id => {
  const r = stClaim.get(id);
  if (!r) return null;
  stMetaSub.run(r.n);
  return Buffer.from(r.payload.buffer, r.payload.byteOffset, r.payload.byteLength);
});
const txFail = transaction((id, now) => {
  const row = stAttempt.get(id);
  if (!row || row.expires_at <= now) {
    if (row) {
      const d = stDel.get(id);
      if (d) stMetaSub.run(d.n);
    }
    return -2;
  }
  const n = row.attempts + 1;
  if (n >= MAX_ATTEMPTS) {
    const d = stDel.get(id);
    if (d) stMetaSub.run(d.n);
    return -1;
  }
  stSetAttempts.run(n, id);
  return n;
});
const txExpire = transaction(id => {
  const d = stDel.get(id);
  if (d) stMetaSub.run(d.n);
});
const txCleanOne = transaction(now => {
  const r = stCleanOne.get(now);
  if (r) stMetaSub.run(r.n);
  return !!r;
});

const truncateWal = () => {
  try {
    db.exec('PRAGMA busy_timeout = 0');
    db.exec('PRAGMA wal_checkpoint(TRUNCATE)');
  } catch (_) {}
  db.exec('PRAGMA busy_timeout = 5000');
};
const compact = () => {
  try {
    db.exec('PRAGMA busy_timeout = 0');
    if (db.prepare('PRAGMA freelist_count').get().freelist_count > 0 && stMetaGet.get().v <= 16777216)
      db.exec('VACUUM');
  } catch (_) {}
  db.exec('PRAGMA busy_timeout = 5000');
};
let cleaning = false;
const clean = now => {
  let more = false;
  try {
    more = txCleanOne(now);
  } catch (_) {}
  if (more) setImmediate(clean, now);
  else {
    cleaning = false;
    compact();
    truncateWal();
  }
};
setInterval(() => {
  if (cleaning) return;
  cleaning = true;
  clean(Date.now());
}, 60000);

const CORS_ORIGINS = [
  'https://secretdrop.to',
  'https://www.secretdrop.to',
  'http://secretdimtmcoa7iq2lqkmwmrbze5qknena75f5xlge226jmxfrcg5yd.onion'
];
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (!origin || CORS_ORIGINS.includes(origin)) next();
  else next(new Error('Not allowed'));
});

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const B64_RE = /^[A-Za-z0-9+/]+={0,2}$/;
const POW_DIFFICULTY = 3;
const TICKET_WINDOW_MS = 120000;
const UPLOAD_MAX_MS = 1800000;
const usedTickets = new Map();
const TICKET_KEY = crypto.randomBytes(32);
const SIG_RE = /^[0-9a-f]{64}$/;

setInterval(() => {
  const now = Date.now();
  for (const [k, v] of usedTickets) {
    if (now - v > TICKET_WINDOW_MS + UPLOAD_MAX_MS) usedTickets.delete(k);
  }
}, 60000);

function signTicket(kind) {
  const id = crypto.randomUUID();
  const data = Date.now().toString(36) + '.' + kind + '.' + id;
  return { ticket: data + '.' + crypto.createHmac('sha256', TICKET_KEY).update(data).digest('hex'), id };
}
function readTicket(ticket, uploadMs) {
  if (typeof ticket !== 'string') return null;
  const parts = ticket.split('.');
  if (parts.length !== 4 || !SIG_RE.test(parts[3])) return null;
  const expect = crypto.createHmac('sha256', TICKET_KEY).update(parts.slice(0, 3).join('.')).digest('hex');
  if (!crypto.timingSafeEqual(Buffer.from(parts[3]), Buffer.from(expect))) return null;
  const t = parseInt(parts[0], 36);
  if (!Number.isFinite(t) || uploadMs > UPLOAD_MAX_MS || Date.now() - uploadMs - t > TICKET_WINDOW_MS) return null;
  return { kind: parts[1], id: parts[2], sig: parts[3] };
}
function uploadDurationMs(req) {
  const s = Number.parseFloat(req.get('X-Upload-Time'));
  return Number.isFinite(s) && s > 0 ? s * 1000 : 0;
}

function verifyPoW(challenge, nonce, difficulty) {
  const hash = crypto
    .createHash('sha256')
    .update(challenge + nonce)
    .digest('hex');
  return hash.startsWith('0'.repeat(difficulty));
}

function onionFileBytes(now) {
  while (onionFileUploads.length && now - onionFileUploads[0][0] >= ONION_BUDGET_WINDOW_MS) onionFileUploads.shift();
  let sum = 0;
  for (const [, n] of onionFileUploads) sum += n;
  return sum;
}

function safeEqualB64(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (!B64_RE.test(a) || !B64_RE.test(b)) return false;
  let bufA, bufB;
  try {
    bufA = Buffer.from(a, 'base64');
    bufB = Buffer.from(b, 'base64');
  } catch (_) {
    return false;
  }
  if (bufA.length !== bufB.length || bufA.length === 0) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function verifyTurnstile(token) {
  return new Promise(resolve => {
    if (!TURNSTILE_SECRET || !token) {
      resolve(false);
      return;
    }
    const body = JSON.stringify({ secret: TURNSTILE_SECRET, response: token });
    const req = https.request(
      {
        hostname: 'challenges.cloudflare.com',
        path: '/turnstile/v0/siteverify',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
      },
      res => {
        let data = '';
        res.on('data', c => (data += c));
        res.on('end', () => {
          try {
            const j = JSON.parse(data);
            resolve(j.success === true && (j.hostname === 'secretdrop.to' || j.hostname === 'www.secretdrop.to'));
          } catch (_) {
            resolve(false);
          }
        });
        res.on('close', () => resolve(false));
      }
    );
    req.on('error', () => resolve(false));
    req.setTimeout(5000, () => {
      req.destroy();
      resolve(false);
    });
    req.write(body);
    req.end();
  });
}

app.get('/api/pow-challenge', async (req, res) => {
  try {
    const token = req.get('X-Turnstile-Token');
    if (!token) return res.json({ ...signTicket('pow'), difficulty: POW_DIFFICULTY });
    if (!(await verifyTurnstile(token))) return res.status(403).json({ error: 'Turnstile failed' });
    res.json(signTicket('ts'));
  } catch (err) {
    res.status(400).json({ error: 'Bad request' });
  }
});

function refuse(req, res, status, error) {
  req.resume();
  req.once('end', () => res.status(status).json({ error }));
}

function checkTicket(req, res, next) {
  try {
    const channel = req.get('X-Access-Channel');
    if (channel !== 'clearnet' && channel !== 'onion') return refuse(req, res, 400, 'Bad request');
    const raw = req.get('X-Ticket');
    const ticket = readTicket(raw, uploadDurationMs(req));
    if (!ticket) return refuse(req, res, 400, 'Ticket unknown');
    if (channel === 'clearnet' && ticket.kind !== 'ts') return refuse(req, res, 403, 'Turnstile failed');
    if (usedTickets.has(ticket.sig)) return refuse(req, res, 400, 'Ticket used');
    if (channel === 'onion' && (ticket.kind !== 'pow' || !verifyPoW(raw, req.get('X-Pow-Nonce'), POW_DIFFICULTY)))
      return refuse(req, res, 400, 'PoW invalid');
    usedTickets.set(ticket.sig, Date.now());
    req.secretId = ticket.id;
    req.clearnet = channel === 'clearnet';
    next();
  } catch (err) {
    refuse(req, res, 400, 'Bad request');
  }
}

app.post(
  '/api/store',
  checkTicket,
  express.raw({ type: 'application/octet-stream', limit: MAX_PAYLOAD, inflate: false }),
  (req, res) => {
    res.on('close', () => {
      if (Buffer.isBuffer(req.body)) req.body.fill(0);
    });
    try {
      const id = req.secretId;
      const clearnet = req.clearnet;
      const ttl = req.get('X-Secret-Ttl');
      const authSalt = req.get('X-Auth-Salt');
      const authTag = req.get('X-Auth-Tag');
      const payload = req.body;
      if (!authSalt || !authTag || typeof authSalt !== 'string' || typeof authTag !== 'string')
        return res.status(400).json({ error: 'Auth required' });
      if (!B64_RE.test(authSalt) || !B64_RE.test(authTag)) return res.status(400).json({ error: 'Auth format' });
      if (Buffer.from(authSalt, 'base64').length !== 16) return res.status(400).json({ error: 'Bad authSalt' });
      if (Buffer.from(authTag, 'base64').length !== 32) return res.status(400).json({ error: 'Bad authTag' });
      if (!Buffer.isBuffer(payload) || payload.length === 0) return res.status(400).json({ error: 'Payload required' });
      const onionFile = !clearnet && payload.length > MESSAGE_FRAME_BYTES;
      if (onionFile && onionFileBytes(Date.now()) + payload.length > ONION_FILE_BUDGET)
        return res.status(503).json({ error: 'Files paused' });
      const maxTtl = payload.length > 102400 ? 259200 : 604800;
      const ttlSec = Math.min(Math.max(parseInt(ttl) || 86400, 60), maxTtl);
      let result;
      try {
        result = txStore(
          id,
          payload,
          authSalt,
          authTag,
          Math.ceil((Date.now() + ttlSec * 1000) / EXPIRY_STEP_MS) * EXPIRY_STEP_MS
        );
      } catch (e) {
        return res.status(503).json({ error: 'Unavailable' });
      }
      if (result === 2) return res.status(503).json({ error: 'Unavailable' });
      if (result === 3) return res.status(503).json({ error: 'Files paused' });
      if (result === 1) return res.status(409).json({ error: 'ID exists' });
      if (onionFile) onionFileUploads.push([Date.now(), payload.length]);
      res.json({ status: 'ok' });
    } catch (err) {
      res.status(400).json({ error: 'Bad request' });
    }
  }
);

app.get('/api/auth/:id', (req, res) => {
  try {
    const id = req.params.id;
    if (!UUID_RE.test(id)) return res.status(400).json({ error: 'Invalid ID' });
    let row;
    try {
      row = stAuth.get(id);
    } catch (e) {
      return res.status(503).json({ error: 'Unavailable' });
    }
    if (!row) return res.status(404).json({ error: 'Not found' });
    if (row.expires_at <= Date.now()) {
      try {
        txExpire(id);
      } catch (_) {}
      return res.status(404).json({ error: 'Not found' });
    }
    res.json({ authSalt: row.salt });
  } catch (err) {
    res.status(400).json({ error: 'Bad request' });
  }
});

app.post('/api/retrieve/:id', express.json({ limit: '1kb', inflate: false }), (req, res) => {
  try {
    const id = req.params.id;
    if (!UUID_RE.test(id)) return res.status(400).json({ error: 'Invalid ID' });
    const authTag = req.body && req.body.authTag;
    if (!authTag || typeof authTag !== 'string') return res.status(400).json({ error: 'authTag required' });
    let row;
    try {
      row = stTag.get(id);
    } catch (e) {
      return res.status(503).json({ error: 'Unavailable' });
    }
    if (!row) return res.status(404).json({ error: 'Not found' });
    if (row.expires_at <= Date.now()) {
      try {
        txExpire(id);
      } catch (_) {}
      return res.status(404).json({ error: 'Not found' });
    }
    if (safeEqualB64(authTag, row.tag)) {
      let payload;
      try {
        payload = txClaim(id);
      } catch (e) {
        return res.status(503).json({ error: 'Unavailable' });
      }
      if (!payload) return res.status(404).json({ error: 'Not found' });
      res.setHeader('Content-Type', 'application/octet-stream');
      res.on('close', () => {
        payload.fill(0);
        truncateWal();
      });
      return res.send(payload);
    }
    let n;
    try {
      n = txFail(id, Date.now());
    } catch (e) {
      return res.status(503).json({ error: 'Unavailable' });
    }
    if (n === -2) return res.status(404).json({ error: 'Not found' });
    if (n === -1) return res.status(410).json({ error: 'Too many attempts', remaining: 0 });
    return res.status(401).json({ error: 'Wrong tag', remaining: MAX_ATTEMPTS - n });
  } catch (err) {
    res.status(400).json({ error: 'Bad request' });
  }
});

app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, req, res, next) => {
  if (res.headersSent) return res.destroy();
  if (err && err.message === 'Not allowed') return res.status(403).json({ error: 'Not allowed' });
  const s = err && Number.isInteger(err.status) && err.status >= 400 && err.status < 500 ? err.status : 500;
  res.status(s).json({ error: s === 500 ? 'Unavailable' : 'Bad request' });
});

app.listen(PORT, '127.0.0.1');
