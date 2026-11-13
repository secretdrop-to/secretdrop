'use strict';
window._tsReady = new Promise(function (resolve) {
  window._tsReadyResolve = resolve;
});
window._tsOnLoad = function () {
  if (!location.hash) {
    window._tsId = turnstile.render('#ts-widget', { sitekey: '0x4AAAAAADYavlqUz7537_Gy', execution: 'execute' });
    _tsWarm();
  }
  window._tsReadyResolve();
};
function _tsLoad() {
  if (
    window._tsLoaded ||
    location.hash ||
    location.hostname === 'secretdimtmcoa7iq2lqkmwmrbze5qknena75f5xlge226jmxfrcg5yd.onion'
  )
    return;
  window._tsLoaded = true;
  resetRetrieveState();
  const s = document.createElement('script');
  s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=_tsOnLoad&render=explicit';
  s.async = true;
  s.defer = true;
  s.onerror = window._tsReadyResolve;
  document.head.appendChild(s);
}
function _tsRun() {
  if (!window.turnstile || window._tsId === undefined) return Promise.resolve('');
  if (window._tsPromise) return window._tsPromise;
  window._tsPromise = new Promise(res => {
    turnstile.reset(window._tsId);
    turnstile.execute(window._tsId, {
      callback: t => {
        window._tsNext = t;
        window._tsNextAt = Date.now();
        window._tsPromise = null;
        res(t);
      }
    });
  });
  return window._tsPromise;
}
function _tsWarm() {
  if (!window.turnstile || window._tsId === undefined) return;
  if (window._tsNext && Date.now() - window._tsNextAt < 240000) return;
  _tsRun();
}

const LINK_ORIGIN = location.hostname.endsWith('.onion') ? 'https://secretdrop.to' : location.origin;
const ONION_ORIGIN = 'http://secretdimtmcoa7iq2lqkmwmrbze5qknena75f5xlge226jmxfrcg5yd.onion';

let LANG = {};
let CURRENT_LANG = 'en';
let WANTED_LANG = 'en';

const FALLBACK = {
  'global.back': '← Back',
  'global.copy': 'Copy',
  'global.copied': 'Copied!',
  'global.optional': 'Optional...',
  'global.download': 'Download',
  'home.title_1': 'Send confidentially.',
  'home.title_2': 'Read once.',
  'home.lead': 'Share an encrypted message or file via a link that works exactly once. Afterwards, the secret is gone.',
  'home.btn_retrieve': 'Retrieve secret',
  'home.proto_title': 'Create, share, gone.',
  'home.trans_title': "Don't just trust us. Verify.",
  'home.trust_canary_t': 'Warrant canary',
  'home.trust_canary_d':
    'We attest that we have received no data requests and run no backdoors. If this page ever stops updating, take note.',
  'home.trust_onion_t': 'Tor onion service',
  'home.trust_onion_d': 'Reach SecretDrop as a hidden service for network-level anonymity. Best opened in Tor Browser.',
  'home.trust_source_t': 'Source code',
  'home.trust_source_d': 'The code of this site and our server is open source.',
  'home.step1_t': 'Write or upload',
  'home.step1_d': 'Type a message or drop files. Add a password and choose how long it stays available.',
  'home.step2_t': 'Share the link',
  'home.step2_d': 'A unique link is generated in your browser. Send it through any channel you trust.',
  'home.step3_t': 'It self-destructs',
  'home.step3_d': 'Once it is opened, the secret is decrypted on your device and permanently erased from the server.',
  'home.anat_title': 'Anatomy of a link',
  'home.anat_lead': 'Every SecretDrop link has three parts. Only the first two reach our server.',
  'home.anat_addr_t': 'Address',
  'home.anat_addr_d': 'Loads this page. Browsers never send anything after the # to a server.',
  'home.anat_id_t': 'ID',
  'home.anat_id_d': 'Your browser uses it to fetch one encrypted blob. Our server releases it once, then erases it.',
  'home.anat_key_t': 'Key',
  'home.anat_key_d': 'Decrypts the secret on the recipient’s device. It never reaches our server.',
  'home.anat_pw':
    'With a password, the link carries no key at all. Your browser derives the key from the password with Argon2id.',
  'create.tab_msg': 'Message',
  'create.tab_file': 'File',
  'create.lbl_msg': 'Message',
  'create.plc_msg': 'Write your confidential message here...',
  'create.encryption_label': 'AES-256-GCM encrypted',
  'create.lbl_expiry': 'Expiration',
  'create.lbl_pwd': 'Password',
  'create.time_1h': '1 hour',
  'create.time_12h': '12 hours',
  'create.time_1d': '1 day',
  'create.time_2d': '2 days',
  'create.time_3d': '3 days',
  'create.time_7d': '7 days',
  'create.btn_submit': 'Create secret',
  'create.tab_link': 'Link',
  'create.tab_code': 'Code',
  'create.result_code_hint':
    'The recipient opens secretdrop.to or our Onion address and pastes the code under “Retrieve secret”.',
  'create.result_onion_hint': 'Opens only in Tor Browser.',
  'create.file_drop_title': 'Select file here',
  'create.file_drop_desc': 'Maximum 50 MB · Up to 10 files',
  'create.upload_label': 'Encrypt & Upload',
  'create.uploading': 'Uploading...',
  'create.encrypting': 'Encrypting...',
  'create.sending': 'Sending...',
  'create.btn_qr_show': 'Show QR Code',
  'create.btn_qr_hide': 'Hide QR Code',
  'create.anon_names': 'Anonymize file names',
  'create.strip_meta': 'Remove image metadata',
  'create.pwd_weak': 'Weak',
  'create.pwd_fair': 'Fair',
  'create.pwd_strong': 'Strong',
  'create.pwd_very_strong': 'Very Strong',
  'create.pwd_blocked': 'Too easy to guess. Use the dice or share without a password.',
  'create.pwd_fair_hint': 'Tip: the dice creates a stronger password.',
  'create.remove_file': 'Remove file',
  'create.result_valid': 'Valid until {date}. Opens only once.',
  'create.result_pw_hint': 'Send the password separately, not in the same message.',
  'retrieve.title': 'Retrieve secret',
  'retrieve.subtitle': 'Open once and save securely.',
  'retrieve.notice':
    'This secret will be permanently deleted after retrieval. Save it right away if you need it later.',
  'retrieve.lbl_id': 'Link or code',
  'retrieve.plc_id': 'Paste link or code...',
  'retrieve.btn_submit': 'Retrieve secret',
  'retrieve.btn_opening': 'Opening...',
  'retrieve.phase_download': 'Downloading',
  'retrieve.phase_decrypt': 'Decrypting',
  'retrieve.progress_size': '{loaded} of {total}',
  'retrieve.keep_open': 'Keep this tab open. The secret has already been deleted from our server.',
  'retrieve.output_msg_title': 'Message',
  'retrieve.btn_new_secret': 'Create new secret',
  'retrieve.deleted': 'This secret has been irrevocably deleted.',
  'retrieve.files_ready': 'Ready to save:\n{files}',
  'retrieve.save_prefix': 'Save {file}',
  'retrieve.lbl_pwd': 'Password from the sender',
  'retrieve.e2e_note': 'Decrypted in your browser. The key never reaches our server.',
  'retrieve.e2e_link': 'How it works',
  'hints.desc': 'If you paste a complete link here, the ID and key will be applied automatically.',
  'alerts.invalid_id': 'Invalid code. Please enter the complete link or code.',
  'alerts.enter_id': 'Please enter a link or code.',
  'alerts.enter_pw': 'Please enter the password.',
  'alerts.enter_pw_or_link': 'Please enter the password or paste the complete link or code.',
  'alerts.invalid_format': 'The link or code is incomplete or invalid.',
  'alerts.not_found': 'Secret not found or already deleted.',
  'alerts.retrieve_error': 'Retrieval currently not possible.',
  'alerts.download_interrupted':
    'The download was interrupted. The secret has already been deleted on our server. Please ask the sender for a new one.',
  'alerts.decrypt_failed': 'Decryption failed. Wrong password or corrupted data.',
  'alerts.server_unreachable': 'No connection to the server. Check your connection and try again.',
  'alerts.rate_limited': 'Too many requests right now. Please wait a minute and try again.',
  'alerts.save_error': 'Saving is not possible right now. Please try again later.',
  'alerts.files_paused': 'File uploads are temporarily unavailable. Text messages still work. Please try again later.',
  'alerts.verify_failed':
    'The security check did not finish. Reload the page and try again, or use our Onion address in Tor Browser.',
  'alerts.file_too_large': 'This file would exceed the total limit of 50 MB.',
  'alerts.max_files': 'You can only upload a maximum of 10 files.',
  'alerts.strip_failed':
    'Could not remove the image metadata, so nothing was uploaded. Try again or turn off “Remove image metadata”.',
  'alerts.strip_unsupported':
    'Image metadata can only be removed from JPEG, PNG and WebP images, so nothing was uploaded. Turn off “Remove image metadata” to send other image formats.',
  'alerts.general_error': 'An error occurred.',
  'alerts.derive_failed':
    'Your device could not process the password. Close other tabs or apps and try again. The secret is still intact.',
  'alerts.wrong_password_remaining': 'Wrong password. {remaining} attempts remaining.',
  'alerts.wasm_create':
    'Passwords need WebAssembly, which your browser blocks. Share without a password, or allow WebAssembly (e.g. Tor Browser: “Standard”).',
  'alerts.wasm_open':
    'This secret needs WebAssembly, which your browser blocks. Allow it (e.g. Tor Browser: “Standard”) or use another browser, then try again. The secret is still intact.',
  'alerts.too_many_attempts': 'Too many wrong attempts. Secret was permanently deleted.'
};

function resolve(obj, key) {
  return key.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), obj);
}

function t(key, vars) {
  let str = resolve(LANG, key);
  if (str === undefined) str = FALLBACK[key];
  if (str === undefined) return '';
  if (vars) {
    for (const k in vars) {
      str = str.split('{' + k + '}').join(vars[k]);
    }
  }
  return str;
}

function alertError(key) {
  const err = new Error(t(key));
  err.alertKey = key;
  return err;
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = t(key, el.dataset.i18nVars && JSON.parse(el.dataset.i18nVars));
    if (!val) return;
    const parts = el.hasAttribute('data-i18n-sentences') ? val.replace(/([.!?:—])\s+/g, '$1\n').split('\n') : [val];
    if (parts.length === 1) {
      el.textContent = val;
      return;
    }
    el.replaceChildren(
      ...parts.flatMap((part, i) => {
        const span = document.createElement('span');
        span.textContent = part;
        return i ? [' ', span] : [span];
      })
    );
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    const val = t(key);
    if (val) el.setAttribute('placeholder', val);
  });
  document.documentElement.setAttribute('lang', CURRENT_LANG);
  renderValidity();
}

function renderValidity() {
  document.querySelectorAll('.result-valid[data-until]').forEach(el => {
    el.textContent = t('create.result_valid', {
      date: new Date(Number(el.dataset.until)).toLocaleString(CURRENT_LANG, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      })
    });
  });
}

function setI18nText(el, key, vars) {
  el.dataset.i18n = key;
  if (vars) el.dataset.i18nVars = JSON.stringify(vars);
  el.textContent = t(key, vars);
}

async function loadLanguage(code, request) {
  WANTED_LANG = code;
  const lang =
    code === 'en'
      ? null
      : await (request || fetch('/lang/' + code + '.json')).then(res => (res.ok ? res.json() : null)).catch(() => null);
  if (code !== WANTED_LANG) return;
  LANG = lang || {};
  CURRENT_LANG = lang ? code : 'en';
  applyTranslations();
}

function setLanguage(code) {
  loadLanguage(code).then(() => {
    updateMessageUI();
    updateStrengthUI('msg-pw');
    updateStrengthUI('file-pw');
  });
  try {
    sessionStorage.setItem('sd_lang', code);
  } catch (e) {}
}

function initLangSwitcher() {
  const wrap = document.getElementById('lang-select');
  if (!wrap) return;
  const current = wrap.querySelector('input[value="' + CURRENT_LANG + '"]');
  if (current) current.checked = true;
  wrap.querySelectorAll('input[type="radio"]').forEach(r => {
    r.addEventListener('change', () => {
      if (r.checked) setLanguage(r.value);
    });
  });
}

let selectedFiles = [];
let currentPreviewUrls = [];
let hasViewedSecret = false;

function showScreen(name) {
  if (name === 'retrieve' && window._tsLoaded) {
    location.reload();
    return;
  }
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + name).classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (name === 'create' && window._tsLoaded) _tsWarm();
  if (name === 'create') preloadCreateLists();
}

function stripHash() {
  if (window.location.hash) {
    history.replaceState(null, document.title, window.location.pathname + window.location.search);
  }
}

function cleanupPreview() {
  currentPreviewUrls.forEach(url => URL.revokeObjectURL(url));
  currentPreviewUrls = [];
  const wrap = document.getElementById('image-preview-wrap');
  if (wrap) {
    wrap.innerHTML = '';
    wrap.classList.remove('show');
  }
}

function clearRetrieveOutputOnly() {
  cleanupPreview();
  document.body.classList.remove('secret-open');
  document.getElementById('output').classList.remove('show');
  const box = document.getElementById('output-box');
  box.textContent = '';
  delete box.dataset.i18n;
  delete box.dataset.i18nVars;
  const btnWrap = document.getElementById('download-buttons-wrap');
  if (btnWrap) btnWrap.querySelectorAll('.dynamic-dl-btn').forEach(b => b.remove());
  const status = document.getElementById('status');
  status.classList.remove('show');
  status.textContent = '';
  document.getElementById('retrieve-inputs').classList.remove('hide');
  document.getElementById('retrieve-notice').textContent = t('retrieve.notice');
  document.getElementById('output-header').classList.add('hide');
  document.getElementById('retrieve-progress-wrap').classList.add('hide');
}

function resetRetrieveState() {
  clearRetrieveOutputOnly();
  document.getElementById('rid').value = '';
  document.getElementById('rpw').value = '';
  document.getElementById('screen-retrieve').classList.remove('from-link', 'is-void', 'needs-pw');
  stripHash();
}

function goHome() {
  hasViewedSecret = false;
  resetRetrieveState();
  showScreen('create');
}

function goToCreate() {
  resetCreateResult();
  goHome();
}

function resetCreateResult() {
  document.getElementById('screen-create').classList.remove('is-done');
  ['msg', 'file'].forEach(m => {
    document.getElementById(m + '-result').classList.remove('show');
    document.getElementById(m + '-url').textContent = '';
    setResultView(document.getElementById(m + '-result'), 'link');
  });
}

function setResultView(result, view) {
  result.classList.toggle('is-code', view === 'code');
  result.classList.toggle('is-onion', view === 'onion');
  result.querySelectorAll('.result-tabs button').forEach(b => b.classList.toggle('active', b.dataset.view === view));
  const qr = result.querySelector('.qr-container');
  qr.classList.add('hide');
  qr.innerHTML = '';
  setI18nText(result.querySelector('.qr-section .btn'), 'create.btn_qr_show');
  const el = result.querySelector('.result-url');
  const link = el.textContent;
  if (link) showLink(el, (view === 'onion' ? ONION_ORIGIN : LINK_ORIGIN) + link.slice(link.indexOf('/#')));
}

function openScreen(name) {
  if (!window.location.hash) {
    if (history.state && history.state.sdScreen) history.replaceState({ sdScreen: name }, '');
    else history.pushState({ sdScreen: name }, '');
  }
  showScreen(name);
}

function leaveScreen() {
  if (history.state && history.state.sdScreen) history.back();
  else goHome();
}

function handleHashRoute() {
  if (window.location.hash) {
    hasViewedSecret = false;
    const parsed = parseSecretInput(window.location.href);
    if (parsed.id && isValidUUID(parsed.id)) {
      if (window._tsLoaded) {
        location.reload();
        return;
      }
      clearRetrieveOutputOnly();
      showScreen('retrieve');
      document.getElementById('rid').value = window.location.href;
      const retrieveScreen = document.getElementById('screen-retrieve');
      retrieveScreen.classList.add('from-link');
      retrieveScreen.classList.toggle('needs-pw', !parsed.key);
    }
  } else if (history.state && history.state.sdScreen === 'retrieve') {
    showScreen('retrieve');
  } else {
    goHome();
  }
}

function setCreateMode(mode) {
  const textBtn = document.getElementById('mode-text-btn');
  const fileBtn = document.getElementById('mode-file-btn');
  const textMode = document.getElementById('text-mode');
  const fileMode = document.getElementById('file-mode');
  if (mode === 'text') {
    textBtn.classList.add('active');
    fileBtn.classList.remove('active');
    textMode.classList.remove('hide');
    fileMode.classList.add('hide');
  } else {
    fileBtn.classList.add('active');
    textBtn.classList.remove('active');
    fileMode.classList.remove('hide');
    textMode.classList.add('hide');
  }
}

function updateMessageUI() {
  const el = document.getElementById('msg');
  const counter = document.getElementById('msg-counter');
  const btn = document.getElementById('msg-btn');
  const len = el.value.length;
  counter.textContent = len.toLocaleString(CURRENT_LANG) + ' / ' + (10000).toLocaleString(CURRENT_LANG);
  counter.classList.toggle('warn', len > 9800);
  btn.disabled = el.value.trim().length === 0 || isPasswordBlocked('msg-pw');
}

function updateFileButton() {
  document.getElementById('file-btn').disabled = selectedFiles.length === 0 || isPasswordBlocked('file-pw');
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1024 / 1024).toFixed(1) + ' MB';
}
function showToast(msg, duration) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  container.appendChild(el);
  const dismiss = () => {
    el.classList.add('toast--fade');
    el.addEventListener('animationend', () => el.remove(), { once: true });
  };
  const timer = setTimeout(dismiss, duration || 3500);
  el.addEventListener(
    'click',
    () => {
      clearTimeout(timer);
      dismiss();
    },
    { once: true }
  );
}

function showLink(el, url) {
  el.textContent = '';
  const hash = url.indexOf('#');
  const dot = hash < 0 ? -1 : url.indexOf('.', hash);
  const parts =
    hash < 0
      ? [[url, 'lk-addr']]
      : [
          [url.slice(0, hash), 'lk-addr'],
          ['#', 'lk-id lk-hash'],
          [dot < 0 ? url.slice(hash + 1) : url.slice(hash + 1, dot), 'lk-id']
        ];
  if (dot >= 0) parts.push([url.slice(dot), 'lk-key']);
  parts.forEach(([text, cls]) => {
    const span = document.createElement('span');
    span.className = cls;
    span.textContent = text;
    el.appendChild(span);
  });
}

function copyUrl(elId, btn) {
  const el = document.getElementById(elId);
  const url = el.textContent;
  navigator.clipboard
    .writeText(el.closest('.result').classList.contains('is-code') ? url.slice(url.indexOf('#') + 1) : url)
    .then(() => {
      const old = btn.textContent;
      btn.textContent = t('global.copied');
      setTimeout(() => {
        btn.textContent = old;
      }, 1600);
    })
    .catch(() => {});
}

function copySecretText(btn) {
  navigator.clipboard.writeText(document.getElementById('output-box').textContent).then(() => {
    const old = btn.textContent;
    btn.textContent = t('global.copied');
    setTimeout(() => {
      btn.textContent = old;
    }, 2000);
  });
}

function copyPassword(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input.value) return;
  navigator.clipboard
    .writeText(input.value)
    .then(() => {
      const old = btn.innerHTML;
      btn.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"></path></svg>';
      btn.classList.add('pw-copy--ok');
      setTimeout(() => {
        btn.innerHTML = old;
        btn.classList.remove('pw-copy--ok');
      }, 1500);
    })
    .catch(() => {});
}

function togglePasswordVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  const svgOpen =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
  const svgClosed =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>';
  if (input.type === 'password') {
    input.type = 'text';
    btn.innerHTML = svgClosed;
  } else {
    input.type = 'password';
    btn.innerHTML = svgOpen;
  }
}

let wordlistCache = null;

async function loadWordlist() {
  if (!wordlistCache) {
    const res = await fetch('/data/wordlist.json');
    wordlistCache = await res.json();
  }
  return wordlistCache;
}

let commonPasswords = null;
let commonPasswordsLoading = null;
let commonPasswordsStatus = 0;

function preloadCreateLists() {
  loadWordlist().catch(() => {});
  if (commonPasswords || commonPasswordsLoading) return;
  commonPasswordsStatus = 0;
  commonPasswordsLoading = fetch('/data/common-passwords.txt')
    .then(res => {
      commonPasswordsStatus = res.status;
      if (!res.ok) throw new Error('common-passwords');
      return res.text();
    })
    .then(text => {
      commonPasswords = new Set(text.split('\n'));
      updateStrengthUI('msg-pw');
      updateStrengthUI('file-pw');
    })
    .catch(() => {})
    .finally(() => {
      commonPasswordsLoading = null;
    });
}

const LEET_MAP = { 0: 'o', 3: 'e', 4: 'a', 5: 's', 7: 't', '@': 'a', $: 's' };

function passwordVariants(pw) {
  const lower = pw.toLowerCase();
  const trim = s => s.replace(/^[^\p{L}]+|[^\p{L}]+$/gu, '');
  const unleet = (s, one) => s.replace(/[013457@$]/g, c => (c === '1' ? one : LEET_MAP[c]));
  const trimmed = trim(lower);
  return [
    lower,
    trimmed,
    unleet(trimmed, 'i'),
    unleet(trimmed, 'l'),
    trim(unleet(lower, 'i')),
    trim(unleet(lower, 'l'))
  ];
}

function isCommonPassword(pw) {
  return !!commonPasswords && passwordVariants(pw).some(v => v.length >= 3 && commonPasswords.has(v));
}

function isPasswordBlocked(inputId) {
  const level = checkPasswordStrength(document.getElementById(inputId).value);
  return level === 'weak' || level === 'common';
}

async function generatePassphrase(inputId) {
  const words = await loadWordlist();
  const input = document.getElementById(inputId);
  input.value = randomPassphrase(words);
  if (input.type === 'password') {
    const toggle = document.querySelector('.pw-toggle[data-pw-target="' + inputId + '"]');
    if (toggle) togglePasswordVisibility(inputId, toggle);
  }
  input.dispatchEvent(new Event('input'));
  input.scrollLeft = 0;
}

function isSafePreviewableImage(mime, fileName) {
  const safeMimes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
  if (safeMimes.includes(mime)) return true;
  const lower = (fileName || '').toLowerCase();
  return (
    lower.endsWith('.png') ||
    lower.endsWith('.jpg') ||
    lower.endsWith('.jpeg') ||
    lower.endsWith('.webp') ||
    lower.endsWith('.gif')
  );
}

function isPreviewableVideo(mime, fileName) {
  const safeMimes = ['video/mp4', 'video/webm', 'video/ogg'];
  if (safeMimes.includes(mime)) return true;
  const lower = (fileName || '').toLowerCase();
  return lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.ogg');
}

function isPreviewableText(mime, fileName) {
  if (mime && (mime.startsWith('text/') || mime === 'application/json')) return true;
  const lower = (fileName || '').toLowerCase();
  return (
    lower.endsWith('.txt') ||
    lower.endsWith('.md') ||
    lower.endsWith('.csv') ||
    lower.endsWith('.json') ||
    lower.endsWith('.log')
  );
}

function parseSecretInput(raw) {
  let fragment = raw.trim();
  if (fragment.includes('#')) fragment = fragment.split('#').pop();
  if (!fragment) return { id: '', key: null };
  if (fragment.includes('.')) {
    const firstDot = fragment.indexOf('.');
    return { id: fragment.slice(0, firstDot), key: fragment.slice(firstDot + 1) || null };
  }
  return { id: fragment, key: null };
}

function isValidUUID(str) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

function isValidLinkKey(str) {
  return /^[A-Za-z0-9_-]{43}$/.test(str);
}

function checkPasswordStrength(pw) {
  if (!pw) return null;
  if (isCommonPassword(pw)) return 'common';
  let pool = 0;
  if (/[a-z]/.test(pw)) pool += 26;
  if (/[A-Z]/.test(pw)) pool += 26;
  if (/[0-9]/.test(pw)) pool += 10;
  if (/[^a-zA-Z0-9]/.test(pw)) pool += 33;
  const counts = {};
  for (const ch of pw) counts[ch] = (counts[ch] || 0) + 1;
  const maxFreq = Math.max.apply(null, Object.values(counts));
  let bits = pw.length * Math.log2(pool || 2) * (1 - (maxFreq - 1) / pw.length);
  if (/^(.{1,4})\1+$/.test(pw)) bits = Math.min(bits, 20);
  let seq = 0;
  for (let i = 1; i < pw.length; i++) {
    const diff = pw.charCodeAt(i) - pw.charCodeAt(i - 1);
    if (diff === 1 || diff === -1) seq++;
  }
  if (pw.length >= 4 && seq >= pw.length - 1) bits = Math.min(bits, 18);
  if (bits < 40) return 'weak';
  if (bits < 60) return 'fair';
  if (bits < 80) return 'strong';
  return 'very-strong';
}

function updateStrengthUI(inputId) {
  const input = document.getElementById(inputId);
  const wrap = document.getElementById(inputId + '-strength');
  if (!input || !wrap) return;
  const hint = document.getElementById(inputId + '-hint');
  const val = input.value;
  const level = checkPasswordStrength(val);
  const blocked = level === 'weak' || level === 'common';
  wrap.classList.remove(
    'pw-strength--weak',
    'pw-strength--common',
    'pw-strength--fair',
    'pw-strength--strong',
    'pw-strength--very-strong'
  );
  wrap.classList.toggle('hide', !val);
  if (val) {
    wrap.classList.add('pw-strength--' + level);
    const strengthLabels = {
      weak: t('create.pwd_weak'),
      common: t('create.pwd_weak'),
      fair: t('create.pwd_fair'),
      strong: t('create.pwd_strong'),
      'very-strong': t('create.pwd_very_strong')
    };
    wrap.querySelector('.pw-strength-label').textContent = strengthLabels[level];
  }
  hint.textContent = blocked ? t('create.pwd_blocked') : level === 'fair' ? t('create.pwd_fair_hint') : '';
  hint.classList.toggle('hide', !hint.textContent);
  hint.classList.toggle('pw-hint--block', blocked);
  if (inputId === 'msg-pw') updateMessageUI();
  else updateFileButton();
}

async function solvePoW(challenge, difficulty) {
  const target = '0'.repeat(difficulty);
  let nonce = 0;
  while (true) {
    const input = challenge + nonce;
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
    const hex = Array.from(new Uint8Array(buf))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    if (hex.startsWith(target)) return String(nonce);
    nonce++;
  }
}

async function handleFiles(filesList) {
  if (!filesList || filesList.length === 0) return;
  if (selectedFiles.length + filesList.length > 10) {
    showToast(t('alerts.max_files'));
    return;
  }
  document.getElementById('file-btn').disabled = true;
  let currentTotalSize = selectedFiles.reduce((acc, f) => acc + f.size, 0);
  for (let i = 0; i < filesList.length; i++) {
    const file = filesList[i];
    if (currentTotalSize + file.size > 50 * 1024 * 1024) {
      showToast(t('alerts.file_too_large'));
      continue;
    }
    selectedFiles.push(file);
    currentTotalSize += file.size;
  }
  renderFileList();
}

function removeFile(index) {
  selectedFiles.splice(index, 1);
  renderFileList();
  document.getElementById('file').value = '';
}

function renderFileList() {
  const container = document.getElementById('file-list-container');
  container.innerHTML = '';
  if (selectedFiles.length === 0) {
    document.getElementById('file-btn').disabled = true;
    return;
  }
  selectedFiles.forEach((file, index) => {
    const div = document.createElement('div');
    div.className = 'file-picked file-item';
    const info = document.createElement('div');
    info.className = 'file-item-info';
    const strong = document.createElement('strong');
    strong.textContent = file.name;
    const span = document.createElement('span');
    span.textContent = formatBytes(file.size) + ' \u00b7 ' + (file.type || 'unknown');
    info.appendChild(strong);
    info.appendChild(span);
    const removeBtn = document.createElement('button');
    removeBtn.className = 'file-remove-btn';
    removeBtn.setAttribute('aria-label', t('create.remove_file'));
    const svgNs = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNs, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', '18');
    svg.setAttribute('height', '18');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    const l1 = document.createElementNS(svgNs, 'line');
    l1.setAttribute('x1', '18');
    l1.setAttribute('y1', '6');
    l1.setAttribute('x2', '6');
    l1.setAttribute('y2', '18');
    const l2 = document.createElementNS(svgNs, 'line');
    l2.setAttribute('x1', '6');
    l2.setAttribute('y1', '6');
    l2.setAttribute('x2', '18');
    l2.setAttribute('y2', '18');
    svg.appendChild(l1);
    svg.appendChild(l2);
    removeBtn.appendChild(svg);
    removeBtn.addEventListener('click', () => removeFile(index));
    div.appendChild(info);
    div.appendChild(removeBtn);
    container.appendChild(div);
  });
  updateFileButton();
}

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  for (let k = 0; k < 8; k++) n = n & 1 ? 0xedb88320 ^ (n >>> 1) : n >>> 1;
  return n >>> 0;
});

function pngChunk(type, data) {
  const out = new Uint8Array(data.length + 12);
  const v = new DataView(out.buffer);
  v.setUint32(0, data.length);
  for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
  out.set(data, 8);
  let c = 0xffffffff;
  for (let i = 4; i < data.length + 8; i++) c = CRC_TABLE[(c ^ out[i]) & 0xff] ^ (c >>> 8);
  v.setUint32(data.length + 8, ~c >>> 0);
  return out;
}

async function qrDataUrl(text) {
  const qr = new QRCode(document.createElement('div'), { text, correctLevel: QRCode.CorrectLevel.M })._oQRCode;
  const n = qr.getModuleCount();
  const scale = 8;
  const size = (n + 8) * scale;
  const stride = size + 1;
  const raw = new Uint8Array(stride * size).fill(255);
  for (let y = 0; y < size; y++) raw[y * stride] = 0;
  for (let r = 0; r < n; r++) {
    const row = (r + 4) * scale * stride;
    for (let c = 0; c < n; c++) if (qr.isDark(r, c)) raw.fill(0, row + 1 + (c + 4) * scale, row + 1 + (c + 5) * scale);
    for (let k = 1; k < scale; k++) raw.copyWithin(row + k * stride, row, row + stride);
  }
  const idat = new Uint8Array(
    await new Response(new Blob([raw]).stream().pipeThrough(new CompressionStream('deflate'))).arrayBuffer()
  );
  const ihdr = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0]);
  const hv = new DataView(ihdr.buffer);
  hv.setUint32(0, size);
  hv.setUint32(4, size);
  const png = new Uint8Array(
    await new Blob([
      new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      pngChunk('IHDR', ihdr),
      pngChunk('IDAT', idat),
      pngChunk('IEND', new Uint8Array(0))
    ]).arrayBuffer()
  );
  return 'data:image/png;base64,' + btoa(String.fromCharCode(...png));
}

async function toggleQR(containerId, urlElId, btn) {
  const container = document.getElementById(containerId);
  const url = document.getElementById(urlElId).textContent.trim();
  if (!container.classList.contains('hide')) {
    container.classList.add('hide');
    setI18nText(btn, 'create.btn_qr_show');
    return;
  }
  if (!url) return;
  container.innerHTML = '';
  container.classList.remove('hide');
  setI18nText(btn, 'create.btn_qr_hide');
  const card = document.createElement('div');
  card.className = 'qr-card';
  const img = document.createElement('img');
  img.className = 'qr-img';
  img.alt = 'QR';
  img.src = await qrDataUrl(url);
  card.appendChild(img);
  const dlBtn = document.createElement('button');
  dlBtn.className = 'btn secondary btn--dl';
  dlBtn.setAttribute('data-i18n', 'global.download');
  dlBtn.textContent = t('global.download');
  dlBtn.addEventListener('click', () => {
    const a = document.createElement('a');
    a.href = img.src;
    a.download = 'secretdrop-qr.png';
    a.click();
  });
  card.appendChild(dlBtn);
  container.appendChild(card);
}

function reducedMotion() {
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function fadeOutComposer() {
  const card = document.getElementById('letter');
  if (reducedMotion()) return Promise.resolve(card.offsetHeight);
  document.getElementById('screen-create').classList.add('is-leaving');
  return new Promise(r => setTimeout(() => r(card.offsetHeight), 140));
}

function showCreateResult(from) {
  const screen = document.getElementById('screen-create');
  const card = document.getElementById('letter');
  screen.classList.remove('is-leaving');
  screen.classList.add('is-done');
  const to = card.offsetHeight;
  if (reducedMotion() || from === to || !card.animate) return;
  card.style.overflow = 'hidden';
  card
    .animate([{ height: from + 'px' }, { height: to + 'px' }], { duration: 260, easing: 'cubic-bezier(.2,.7,.2,1)' })
    .finished.then(
      () => {
        card.style.overflow = '';
      },
      () => {
        card.style.overflow = '';
      }
    );
}

const COMPOSER_LOCK =
  '#letter .panel-body > .segment, #msg, #dropzone, #file-list-container, .privacy-options, #letter .ttl-select, #msg-pw, #file-pw, #letter .pw-dice';

function lockComposer(locked) {
  document.querySelectorAll(COMPOSER_LOCK).forEach(el => {
    el.inert = locked;
  });
}

async function storeSecret(mode) {
  const btn = document.getElementById(mode === 'text' ? 'msg-btn' : 'file-btn');
  const originalBtnText = btn.textContent;
  btn.disabled = true;
  const ttl = parseInt(
    document.querySelector('input[name="' + (mode === 'text' ? 'msg-ttl' : 'file-ttl') + '"]:checked').value,
    10
  );
  const passwordInput = document.getElementById(mode === 'text' ? 'msg-pw' : 'file-pw').value;
  if (passwordInput && !commonPasswords) {
    preloadCreateLists();
    await commonPasswordsLoading;
    btn.disabled = true;
    if (!commonPasswords) {
      btn.disabled = false;
      const listError =
        commonPasswordsStatus === 429
          ? 'alerts.rate_limited'
          : commonPasswordsStatus
            ? 'alerts.save_error'
            : 'alerts.server_unreachable';
      showToast(t(listError), listError === 'alerts.rate_limited' ? 8000 : undefined);
      return;
    }
  }
  if (passwordInput && isPasswordBlocked(mode === 'text' ? 'msg-pw' : 'file-pw')) return;
  if (passwordInput && typeof WebAssembly !== 'object') {
    btn.disabled = false;
    showToast(t('alerts.wasm_create'), 8000);
    return;
  }
  let fragmentKey = null;
  let built;
  try {
    lockComposer(true);
    if (!passwordInput) {
      fragmentKey = generateLinkKey();
    }
    if (mode === 'text') {
      const enc = new TextEncoder().encode(document.getElementById('msg').value);
      btn.textContent = t('create.encrypting');
      built = await buildEncryptedFrame('text', [{ data: enc }], passwordInput, fragmentKey);
    } else {
      if (selectedFiles.length === 0) {
        btn.disabled = false;
        return;
      }
      document.getElementById('upload-progress-wrap').classList.remove('hide');
      document.getElementById('upload-progress-bar').style.setProperty('--bar-width', '0%');
      document.getElementById('upload-progress-text').textContent = '0%';
      btn.textContent = t('create.encrypting');
      const entries = [];
      const anonNames = document.getElementById('file-anon-names').checked;
      const stripMeta = document.getElementById('file-strip-meta').checked;
      for (let i = 0; i < selectedFiles.length; i++) {
        let f = selectedFiles[i];
        if (stripMeta) f = await stripImageMetadata(f);
        const arr = new Uint8Array(await f.arrayBuffer());
        const ext = (f.name.match(/\.[A-Za-z0-9]{1,10}$/) || [''])[0];
        const finalName = anonNames ? crypto.randomUUID() + ext : f.name;
        entries.push({ data: arr, name: finalName, mime: f.type || 'application/octet-stream' });
      }
      built = await buildEncryptedFrame('files', entries, passwordInput, fragmentKey);
    }
    btn.textContent = t(mode === 'text' ? 'create.sending' : 'create.uploading');
    const onion = location.hostname === 'secretdimtmcoa7iq2lqkmwmrbze5qknena75f5xlge226jmxfrcg5yd.onion';
    let tsToken = '';
    if (!onion) {
      if (window._tsLoaded) await Promise.race([window._tsReady, new Promise(r => setTimeout(r, 15000))]);
      if (window.turnstile && window._tsId !== undefined) {
        if (window._tsNext && Date.now() - window._tsNextAt < 240000) {
          tsToken = window._tsNext;
          window._tsNext = null;
        } else {
          let tsTimer;
          tsToken = await Promise.race([
            _tsRun(),
            new Promise((_, rej) => {
              tsTimer = setTimeout(() => {
                window._tsPromise = null;
                const err = alertError('alerts.verify_failed');
                err.toastMs = 8000;
                rej(err);
              }, 30000);
            })
          ]).finally(() => clearTimeout(tsTimer));
          window._tsNext = null;
        }
      }
      if (!tsToken) {
        const err = alertError('alerts.verify_failed');
        err.toastMs = 8000;
        throw err;
      }
    }
    const ticketRes = await fetch(
      '/api/pow-challenge',
      onion ? {} : { headers: { 'X-Turnstile-Token': tsToken } }
    ).catch(() => {
      throw alertError('alerts.server_unreachable');
    });
    if (!ticketRes.ok) {
      const alertKey =
        ticketRes.status === 429
          ? 'alerts.rate_limited'
          : ticketRes.status === 403
            ? 'alerts.verify_failed'
            : 'alerts.save_error';
      const err = alertError(alertKey);
      if (alertKey !== 'alerts.save_error') err.toastMs = 8000;
      throw err;
    }
    const { ticket, id, difficulty } = await ticketRes.json();
    const powNonce = onion ? await solvePoW(ticket, difficulty) : '';
    const authTag = await computeAuthTag(built.authKeyRaw, id);
    const authSaltB64 = arrayBufferToBase64(built.masterSalt);
    await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/store');
      xhr.setRequestHeader('Content-Type', 'application/octet-stream');
      xhr.setRequestHeader('X-Ticket', ticket);
      xhr.setRequestHeader('X-Secret-Ttl', String(ttl));
      xhr.setRequestHeader('X-Pow-Nonce', powNonce);
      xhr.setRequestHeader('X-Auth-Salt', authSaltB64);
      xhr.setRequestHeader('X-Auth-Tag', authTag);
      xhr.upload.onprogress = e => {
        if (e.lengthComputable && mode === 'file') {
          const pct = Math.round((e.loaded / e.total) * 100);
          document.getElementById('upload-progress-bar').style.setProperty('--bar-width', pct + '%');
          document.getElementById('upload-progress-text').textContent = pct + '%';
        }
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          _tsWarm();
          resolve();
          return;
        }
        let code = '';
        try {
          code = JSON.parse(xhr.responseText).error;
        } catch (e) {}
        const alertKey =
          xhr.status === 429
            ? 'alerts.rate_limited'
            : code === 'Files paused'
              ? 'alerts.files_paused'
              : code === 'Turnstile failed'
                ? 'alerts.verify_failed'
                : 'alerts.save_error';
        const err = alertError(alertKey);
        if (alertKey !== 'alerts.save_error') err.toastMs = 8000;
        reject(err);
      };
      xhr.onerror = () => reject(alertError('alerts.server_unreachable'));
      xhr.send(built.frame);
    });
    const composerHeight = await fadeOutComposer();
    if (mode === 'file') document.getElementById('upload-progress-wrap').classList.add('hide');
    btn.textContent = originalBtnText;
    const url = LINK_ORIGIN + '/#' + id + (fragmentKey ? '.' + fragmentKey : '');
    if (mode === 'text') {
      document.getElementById('msg-result').classList.add('show');
      showLink(document.getElementById('msg-url'), url);
      document.getElementById('msg').value = '';
      document.getElementById('msg-pw').value = '';
      const _resetMsgTtl = document.getElementById('msg-ttl-86400');
      _resetMsgTtl.checked = true;
      _resetMsgTtl.dispatchEvent(new Event('change'));
      updateMessageUI();
    } else {
      document.getElementById('file-result').classList.add('show');
      showLink(document.getElementById('file-url'), url);
      selectedFiles = [];
      renderFileList();
      document.getElementById('file').value = '';
      document.getElementById('file-pw').value = '';
      const _resetFileTtl = document.getElementById('file-ttl-86400');
      _resetFileTtl.checked = true;
      _resetFileTtl.dispatchEvent(new Event('change'));
    }
    const resultPre = mode === 'text' ? 'msg' : 'file';
    document.getElementById(resultPre + '-valid').dataset.until = String(Date.now() + ttl * 1000);
    document.getElementById(resultPre + '-result').classList.toggle('has-pw', !fragmentKey);
    renderValidity();
    showCreateResult(composerHeight);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (e) {
    document.getElementById('screen-create').classList.remove('is-leaving');
    if (mode === 'file') document.getElementById('upload-progress-wrap').classList.add('hide');
    btn.textContent = originalBtnText;
    btn.disabled = false;
    showToast(e.alertKey ? e.message : t('alerts.general_error'), e.toastMs);
  } finally {
    lockComposer(false);
  }
}

let retrieveBusy = false;
async function retrieveSecret() {
  if (retrieveBusy) return;
  retrieveBusy = true;
  const submitBtn = document.getElementById('btn-retrieve-submit');
  submitBtn.disabled = true;
  setI18nText(submitBtn, 'retrieve.btn_opening');
  try {
    await openSecret();
  } finally {
    retrieveBusy = false;
    submitBtn.disabled = false;
    setI18nText(submitBtn, 'retrieve.btn_submit');
  }
}

async function openSecret() {
  const raw = document.getElementById('rid').value.trim();
  const passwordInput = document.getElementById('rpw').value;
  const status = document.getElementById('status');
  clearRetrieveOutputOnly();
  if (!raw) {
    status.textContent = t('alerts.enter_id');
    status.classList.add('show');
    return;
  }
  const parsed = parseSecretInput(raw);
  const id = parsed.id;
  const key = parsed.key;
  if (!isValidUUID(id)) {
    status.textContent = t('alerts.invalid_id');
    status.classList.add('show');
    return;
  }
  if (key || (raw.includes('#') && raw.split('#').pop().includes('.'))) {
    if (!key || !isValidLinkKey(key)) {
      status.textContent = t('alerts.invalid_format');
      status.classList.add('show');
      return;
    }
  }
  if (!key && typeof WebAssembly !== 'object') {
    status.textContent = t('alerts.wasm_open');
    status.classList.add('show');
    return;
  }
  let downloadStarted = false;
  let progressTimer;
  try {
    const authRes = await fetch('/api/auth/' + encodeURIComponent(id));
    if (authRes.status === 404) {
      document.getElementById('screen-retrieve').classList.add('is-void');
      status.textContent = t('alerts.not_found');
      status.classList.add('show');
      return;
    }
    if (!authRes.ok) {
      status.textContent = t(authRes.status === 429 ? 'alerts.rate_limited' : 'alerts.retrieve_error');
      status.classList.add('show');
      return;
    }
    if (!key && !passwordInput) {
      const fromLink = document.getElementById('screen-retrieve').classList.contains('from-link');
      status.textContent = t(fromLink ? 'alerts.enter_pw' : 'alerts.enter_pw_or_link');
      status.classList.add('show');
      document.getElementById('screen-retrieve').classList.add('needs-pw');
      document.getElementById('rpw').focus();
      return;
    }
    const authMeta = await authRes.json();
    const masterSalt = getUint8Array(authMeta.authSalt);
    const masterRaw = await deriveSecretMaster(key, passwordInput, masterSalt).catch(() => {
      throw alertError('alerts.derive_failed');
    });
    const { aesKey, authKeyRaw } = await deriveSubKeys(masterRaw);
    const authTag = await computeAuthTag(authKeyRaw, id);
    const res = await fetch('/api/retrieve/' + encodeURIComponent(id), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authTag })
    });
    if (res.status === 401) {
      const j = await res.json().catch(() => ({}));
      status.textContent = t('alerts.wrong_password_remaining', { remaining: j.remaining });
      status.classList.add('show');
      return;
    }
    if (res.status === 410) {
      document.getElementById('screen-retrieve').classList.add('is-void');
      status.textContent = t('alerts.too_many_attempts');
      status.classList.add('show');
      return;
    }
    if (res.status === 404) {
      document.getElementById('screen-retrieve').classList.add('is-void');
      status.textContent = t('alerts.not_found');
      status.classList.add('show');
      return;
    }
    if (!res.ok) {
      status.textContent = t(res.status === 429 ? 'alerts.rate_limited' : 'alerts.retrieve_error');
      status.classList.add('show');
      return;
    }
    downloadStarted = true;
    progressTimer = setTimeout(() => {
      document.getElementById('retrieve-inputs').classList.add('hide');
      document.getElementById('retrieve-progress-wrap').classList.remove('hide');
    }, 400);
    const progressText = document.getElementById('retrieve-progress-text');
    const progressBar = document.getElementById('retrieve-progress-bar');
    const progressLabel = document.getElementById('retrieve-progress-label');
    const progressSize = document.getElementById('retrieve-progress-size');
    setI18nText(progressLabel, 'retrieve.phase_download');
    progressSize.classList.add('hide');
    progressText.textContent = '0%';
    progressBar.style.setProperty('--bar-width', '0%');
    const total = parseInt(res.headers.get('content-length') || '0', 10);
    let loaded = 0;
    const reader = res.body.getReader();
    const chunks = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      loaded += value.length;
      const displayPct = total
        ? Math.min(90, Math.round((loaded / total) * 90))
        : Math.min(90, Math.round((loaded / (1024 * 1024)) * 10));
      progressText.textContent = displayPct + '%';
      progressBar.style.setProperty('--bar-width', displayPct + '%');
      if (total >= 1024 * 1024) {
        setI18nText(progressSize, 'retrieve.progress_size', { loaded: formatBytes(loaded), total: formatBytes(total) });
        progressSize.classList.remove('hide');
      }
    }
    let offset = 0;
    const payloadBytes = new Uint8Array(chunks.reduce((a, c) => a + c.length, 0));
    for (const c of chunks) {
      payloadBytes.set(c, offset);
      offset += c.length;
    }
    progressText.textContent = '95%';
    progressBar.style.setProperty('--bar-width', '95%');
    setI18nText(progressLabel, 'retrieve.phase_decrypt');
    document.getElementById('retrieve-inputs').classList.add('hide');
    try {
      hasViewedSecret = true;
      document.body.classList.add('secret-open');
      document.getElementById('output').classList.add('show');
      const secret = await decryptFrame(parseEncryptedFrame(payloadBytes), aesKey);
      if (secret.type === 'text') {
        const data = secret.items[0].data;
        document.getElementById('output-box').textContent = new TextDecoder().decode(data);
        document.getElementById('output-header').classList.remove('hide');
      } else {
        const wrap = document.getElementById('image-preview-wrap');
        const btnWrap = document.getElementById('download-buttons-wrap');
        const fileNames = [];
        for (let i = 0; i < secret.items.length; i++) {
          const unwrapped = secret.items[i];
          const data = unwrapped.data;
          const mime = unwrapped.mime || 'application/octet-stream';
          const fileName = unwrapped.name || 'download.bin';
          fileNames.push(fileName);
          const blob = new Blob([data], { type: mime });
          const blobUrl = URL.createObjectURL(blob);
          currentPreviewUrls.push(blobUrl);
          const dlBtn = document.createElement('button');
          dlBtn.className = 'btn dynamic-dl-btn';
          setI18nText(dlBtn, 'retrieve.save_prefix', { file: fileName });
          dlBtn.addEventListener('click', () => {
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = fileName;
            a.click();
          });
          btnWrap.insertBefore(dlBtn, btnWrap.lastElementChild);
          if (isSafePreviewableImage(mime, fileName)) {
            const img = document.createElement('img');
            img.className = 'image-preview';
            img.src = blobUrl;
            wrap.appendChild(img);
            wrap.classList.add('show');
          } else if (isPreviewableVideo(mime, fileName)) {
            const vid = document.createElement('video');
            vid.className = 'video-preview';
            vid.src = blobUrl;
            vid.controls = true;
            wrap.appendChild(vid);
            wrap.classList.add('show');
          } else if (isPreviewableText(mime, fileName)) {
            const pre = document.createElement('pre');
            pre.className = 'text-preview';
            const textContent = await blob.text();
            pre.textContent = textContent;
            wrap.appendChild(pre);
            wrap.classList.add('show');
          }
        }
        setI18nText(document.getElementById('output-box'), 'retrieve.files_ready', { files: fileNames.join('\n') });
      }
      clearTimeout(progressTimer);
      progressText.textContent = '100%';
      progressBar.style.setProperty('--bar-width', '100%');
      setTimeout(() => document.getElementById('retrieve-progress-wrap').classList.add('hide'), 500);
      stripHash();
      document.getElementById('rid').value = '';
      document.getElementById('rpw').value = '';
    } catch (e) {
      clearTimeout(progressTimer);
      document.getElementById('retrieve-inputs').classList.remove('hide');
      document.getElementById('retrieve-progress-wrap').classList.add('hide');
      document.getElementById('output').classList.remove('show');
      document.getElementById('output-box').textContent = '';
      document.getElementById('output-header').classList.add('hide');
      status.textContent = t('alerts.decrypt_failed');
      status.classList.add('show');
    }
  } catch (e) {
    clearTimeout(progressTimer);
    document.getElementById('retrieve-inputs').classList.remove('hide');
    document.getElementById('retrieve-progress-wrap').classList.add('hide');
    if (downloadStarted) document.getElementById('screen-retrieve').classList.add('is-void');
    status.textContent =
      e && e.alertKey ? e.message : t(downloadStarted ? 'alerts.download_interrupted' : 'alerts.server_unreachable');
    status.classList.add('show');
  }
}

function initTtlSelects() {
  const refreshPanelOverflow = () => {
    document.querySelectorAll('.panel.ttl-open').forEach(p => p.classList.remove('ttl-open'));
    document.querySelectorAll('.ttl-select.open').forEach(sel => {
      const p = sel.closest('.panel');
      if (p) p.classList.add('ttl-open');
    });
  };
  const closeAll = except => {
    document.querySelectorAll('.ttl-select.open').forEach(sel => {
      if (sel !== except) {
        sel.classList.remove('open');
        sel.querySelector('.ttl-trigger').setAttribute('aria-expanded', 'false');
      }
    });
    refreshPanelOverflow();
  };
  document.querySelectorAll('.ttl-select').forEach(sel => {
    const trigger = sel.querySelector('.ttl-trigger');
    const labelEl = sel.querySelector('.ttl-trigger-label');
    const syncLabel = () => {
      const checked = sel.querySelector('input[type="radio"]:checked');
      if (!checked) return;
      const lbl = sel.querySelector('label[for="' + checked.id + '"]');
      if (lbl) labelEl.textContent = lbl.textContent;
    };
    trigger.addEventListener('click', e => {
      e.preventDefault();
      const isOpen = sel.classList.contains('open');
      closeAll(sel);
      if (isOpen) {
        sel.classList.remove('open');
        trigger.setAttribute('aria-expanded', 'false');
      } else {
        sel.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
      }
      refreshPanelOverflow();
    });
    sel.querySelectorAll('input[type="radio"]').forEach(r => {
      r.addEventListener('change', () => {
        syncLabel();
        sel.classList.remove('open');
        trigger.setAttribute('aria-expanded', 'false');
        refreshPanelOverflow();
      });
    });
    syncLabel();
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('.ttl-select')) closeAll(null);
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeAll(null);
  });
}

function bindEvents() {
  initTtlSelects();
  document.getElementById('brand-link').addEventListener('click', e => {
    e.preventDefault();
    leaveScreen();
  });
  document.getElementById('btn-open-retrieve').addEventListener('click', () => {
    if (window._tsLoaded) {
      history.pushState({ sdScreen: 'retrieve' }, '');
      location.reload();
      return;
    }
    openScreen('retrieve');
  });
  ['focusin', 'pointerdown', 'dragenter'].forEach(ev =>
    document.getElementById('letter').addEventListener(ev, () => {
      _tsLoad();
      _tsWarm();
    })
  );
  document.getElementById('back-retrieve').addEventListener('click', e => {
    e.preventDefault();
    leaveScreen();
  });
  document.getElementById('mode-text-btn').addEventListener('click', () => setCreateMode('text'));
  document.getElementById('mode-file-btn').addEventListener('click', () => setCreateMode('file'));
  document.getElementById('msg').addEventListener('input', updateMessageUI);
  document.getElementById('msg-pw').addEventListener('input', () => updateStrengthUI('msg-pw'));
  document.getElementById('file-pw').addEventListener('input', () => updateStrengthUI('file-pw'));
  document.getElementById('msg-btn').addEventListener('click', () => storeSecret('text'));
  document.getElementById('file-btn').addEventListener('click', () => storeSecret('file'));
  document.getElementById('dropzone').addEventListener('click', () => document.getElementById('file').click());
  (function () {
    const dz = document.getElementById('dropzone');
    if (!dz) return;
    function isFileDrag(e) {
      if (!e.dataTransfer) return false;
      const types = e.dataTransfer.types;
      if (!types) return false;
      for (let i = 0; i < types.length; i++) {
        if (types[i] === 'Files') return true;
      }
      return false;
    }
    document.addEventListener('dragover', e => {
      if (isFileDrag(e)) e.preventDefault();
    });
    document.addEventListener('drop', e => {
      if (isFileDrag(e)) e.preventDefault();
    });
    let dragCounter = 0;
    dz.addEventListener('dragenter', e => {
      if (!isFileDrag(e)) return;
      e.preventDefault();
      dragCounter++;
      dz.classList.add('dropzone--dragging');
    });
    dz.addEventListener('dragover', e => {
      if (!isFileDrag(e)) return;
      e.preventDefault();
    });
    dz.addEventListener('dragleave', e => {
      if (!isFileDrag(e)) return;
      dragCounter--;
      if (dragCounter <= 0) {
        dragCounter = 0;
        dz.classList.remove('dropzone--dragging');
      }
    });
    dz.addEventListener('drop', e => {
      if (!isFileDrag(e)) return;
      e.preventDefault();
      dragCounter = 0;
      dz.classList.remove('dropzone--dragging');
      if (e.dataTransfer.files && e.dataTransfer.files.length) {
        handleFiles(e.dataTransfer.files);
      }
    });
  })();
  document.getElementById('file').addEventListener('change', e => handleFiles(e.target.files));
  document.getElementById('msg-copy').addEventListener('click', function () {
    copyUrl('msg-url', this);
  });
  document.getElementById('file-copy').addEventListener('click', function () {
    copyUrl('file-url', this);
  });
  document.querySelectorAll('.result-tabs button').forEach(b =>
    b.addEventListener('click', () => {
      if (!b.classList.contains('active')) setResultView(b.closest('.result'), b.dataset.view);
    })
  );
  document.getElementById('msg-qr-btn').addEventListener('click', function () {
    toggleQR('msg-qr', 'msg-url', this);
  });
  document.getElementById('file-qr-btn').addEventListener('click', function () {
    toggleQR('file-qr', 'file-url', this);
  });
  document.getElementById('btn-retrieve-submit').addEventListener('click', retrieveSecret);
  document
    .getElementById('rid')
    .addEventListener('input', e =>
      document
        .getElementById('screen-retrieve')
        .classList.toggle('needs-pw', isValidUUID(e.target.value.trim().split('#').pop()))
    );
  document.getElementById('output-copy-btn').addEventListener('click', function () {
    copySecretText(this);
  });
  document.getElementById('btn-new-secret').addEventListener('click', goToCreate);
  document.querySelectorAll('.result-new').forEach(b =>
    b.addEventListener('click', () => {
      resetCreateResult();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    })
  );
  document.querySelectorAll('.pw-toggle').forEach(btn => {
    btn.addEventListener('click', function () {
      const targetId = this.getAttribute('data-pw-target');
      if (targetId) togglePasswordVisibility(targetId, this);
    });
  });
  document.querySelectorAll('.pw-dice').forEach(btn => {
    btn.addEventListener('click', function () {
      const targetId = this.getAttribute('data-pw-target');
      if (targetId) generatePassphrase(targetId);
    });
  });
  document.querySelectorAll('.pw-copy').forEach(btn => {
    btn.addEventListener('click', function () {
      const targetId = this.getAttribute('data-pw-target');
      if (targetId) copyPassword(targetId, this);
    });
  });
}

window.addEventListener('hashchange', handleHashRoute);
window.addEventListener('popstate', () => {
  if (window.location.hash) return;
  if (history.state && history.state.sdScreen) showScreen(history.state.sdScreen);
  else goHome();
});
window.addEventListener('pagehide', () => {
  if (hasViewedSecret) {
    cleanupPreview();
    stripHash();
  }
});
window.addEventListener('pageshow', event => {
  if (event.persisted || hasViewedSecret) goHome();
});

document.addEventListener('DOMContentLoaded', async () => {
  const early = window._langEarly;
  await loadLanguage(early ? early.code : 'en', early && early.res);
  initLangSwitcher();
  document.querySelectorAll('input:not([type=radio]), textarea').forEach(el => (el.value = ''));
  updateMessageUI();
  bindEvents();
  handleHashRoute();
});
