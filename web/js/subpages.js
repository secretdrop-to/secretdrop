'use strict';

function initCopyButtons() {
  document.querySelectorAll('[data-copy-target]').forEach(btn => {
    btn.addEventListener('click', function () {
      const targetId = this.getAttribute('data-copy-target');
      const target = document.getElementById(targetId);
      if (!target) return;
      navigator.clipboard.writeText(target.textContent).then(() => {
        const orig = this.textContent;
        this.textContent = 'Copied!';
        setTimeout(() => {
          this.textContent = orig;
        }, 2000);
      });
    });
  });
}

function initDownloadButtons() {
  document.querySelectorAll('[data-download-target]').forEach(btn => {
    btn.addEventListener('click', function () {
      const targetId = this.getAttribute('data-download-target');
      const target = document.getElementById(targetId);
      if (!target) return;
      const filename = this.getAttribute('data-download-name') || 'download.txt';
      const mime = this.getAttribute('data-download-mime') || 'text/plain';
      const blob = new Blob([target.textContent], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 100);
    });
  });
}

function initDonateQR() {
  const container = document.getElementById('donate-qr');
  if (!container) return;
  const addressEl = document.getElementById('donate-address');
  if (!addressEl) return;
  const address = addressEl.textContent.trim();
  if (!address) return;
  if (typeof QRCode === 'undefined') {
    container.classList.add('donate-qr--unavailable');
    container.textContent = 'QR code unavailable. Use the address below.';
    return;
  }
  try {
    container.innerHTML = '';
    new QRCode(container, {
      text: 'monero:' + address,
      width: 220,
      height: 220,
      colorDark: '#06090d',
      colorLight: '#ffffff',
      correctLevel: 2
    });
  } catch (e) {
    container.classList.add('donate-qr--unavailable');
    container.textContent = 'QR code unavailable. Use the address below.';
  }
}

function initFaq() {
  const questions = document.querySelectorAll('.faq-question');
  if (!questions.length) return;

  questions.forEach(btn => {
    btn.addEventListener('click', function () {
      const open = !this.classList.contains('active');
      const answer = this.nextElementSibling;
      this.classList.toggle('active', open);
      if (answer) answer.classList.toggle('show', open);
      this.setAttribute('aria-expanded', open ? 'true' : 'false');
      const item = this.closest('.faq-item');
      if (item) item.classList.toggle('open', open);
    });
  });
  const target = location.hash && document.getElementById(location.hash.slice(1));
  const question = target && target.classList.contains('faq-item') && target.querySelector('.faq-question');
  if (question) {
    question.click();
    target.scrollIntoView();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initCopyButtons();
  initDownloadButtons();
  initDonateQR();
  initFaq();
});
