// Minimal interactivity for the Edition Hugo port.
// (Ghost's main.min.js was dropped — it depends on Ghost Portal/members/search APIs.)
(function () {
  // Mobile menu toggle — Edition reveals the menu via `.is-head-open` on <html>.
  var burger = document.querySelector('.gh-burger');
  if (burger) {
    burger.addEventListener('click', function () {
      document.documentElement.classList.toggle('is-head-open');
    });
  }

  // Subscribe form — POST to the SWA function, show inline success (no page nav).
  document.querySelectorAll('form[data-subscribe]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = form.querySelector('input[name="email"]').value.trim();
      if (!email) return;
      form.classList.add('is-loading');
      fetch(form.getAttribute('action'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email })
      }).then(function (r) {
        form.classList.remove('is-loading');
        if (!r.ok) throw new Error('subscribe failed');
        form.hidden = true;
        var note = form.parentNode.querySelector('[data-subscribe-note]');
        if (note) note.hidden = false;
      }).catch(function () {
        form.classList.remove('is-loading');
        var input = form.querySelector('input[name="email"]');
        input.setCustomValidity('Something went wrong — try again.');
        input.reportValidity();
        setTimeout(function () { input.setCustomValidity(''); }, 2500);
      });
    });
  });

  // Subscribe popover — the header "Subscribe" button reveals a small intake
  // form anchored beneath it instead of navigating to /subscribe/. Falls back to
  // the /subscribe/ page when JS is unavailable (the toggle is a real link).
  document.querySelectorAll('[data-subscribe-popover]').forEach(function (wrap) {
    var toggle = wrap.querySelector('[data-subscribe-toggle]');
    var panel = wrap.querySelector('[data-subscribe-panel]');
    if (!toggle || !panel) return;
    function setOpen(open) {
      panel.hidden = !open;
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) {
        var input = panel.querySelector('input[type="email"]');
        if (input) input.focus();
      }
    }
    toggle.addEventListener('click', function (e) {
      e.preventDefault();
      setOpen(panel.hidden);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !panel.hidden) { setOpen(false); toggle.focus(); }
    });
    document.addEventListener('click', function (e) {
      if (!panel.hidden && !wrap.contains(e.target)) setOpen(false);
    });
  });

  // Search — Pagefind modal. The /pagefind/ bundle is generated post-build;
  // PagefindUI (CSS + JS) is loaded lazily the first time the modal is opened.
  var searchModal = document.getElementById('search-modal');
  if (searchModal) {
    var pagefindLoaded = false;
    var loadPagefind = function () {
      if (pagefindLoaded) return Promise.resolve();
      pagefindLoaded = true;
      var css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = '/pagefind/pagefind-ui.css';
      document.head.appendChild(css);
      return new Promise(function (resolve) {
        var js = document.createElement('script');
        js.src = '/pagefind/pagefind-ui.js';
        js.onload = function () {
          new window.PagefindUI({ element: '#pagefind-search', showSubResults: true, showImages: false });
          resolve();
        };
        document.head.appendChild(js);
      });
    };
    var openSearch = function () {
      // Open the modal immediately so it never depends on Pagefind loading;
      // then load PagefindUI into it and focus the input once ready.
      if (typeof searchModal.showModal === 'function') {
        if (!searchModal.open) searchModal.showModal();
      } else {
        searchModal.setAttribute('open', '');
      }
      loadPagefind().then(function () {
        var input = searchModal.querySelector('input');
        if (input) input.focus();
      });
    };
    var closeSearch = function () {
      if (typeof searchModal.close === 'function') searchModal.close();
      else searchModal.removeAttribute('open');
    };
    document.querySelectorAll('[data-search-open]').forEach(function (btn) {
      btn.addEventListener('click', openSearch);
    });
    document.querySelectorAll('[data-search-close]').forEach(function (btn) {
      btn.addEventListener('click', closeSearch);
    });
    // Click on the dialog backdrop (the dialog element itself) closes it.
    searchModal.addEventListener('click', function (e) {
      if (e.target === searchModal) closeSearch();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === '/' && !/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) {
        e.preventDefault();
        openSearch();
      }
    });
  }

  // Report a typo — reveal the form, capture any highlighted text, POST to /api/typo.
  document.querySelectorAll('[data-typo]').forEach(function (box) {
    var toggle = box.querySelector('[data-typo-open]');
    var form = box.querySelector('[data-typo-form]');
    var status = box.querySelector('[data-typo-status]');
    if (!toggle || !form) return;
    var selection = '';
    function setOpen(open) {
      form.hidden = !open;
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) { var ta = form.querySelector('textarea'); if (ta) ta.focus(); }
    }
    toggle.addEventListener('click', function () {
      if (form.hidden) selection = (window.getSelection && window.getSelection().toString()) || '';
      setOpen(form.hidden);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !form.hidden) { setOpen(false); toggle.focus(); }
    });
    document.addEventListener('click', function (e) {
      if (!form.hidden && !box.contains(e.target)) setOpen(false);
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var note = form.querySelector('[name="note"]').value.trim();
      if (!note) return;
      var btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      status.hidden = false; status.textContent = 'Sending…'; status.style.color = 'var(--color-secondary-text)';
      fetch('/api/typo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: location.href,
          title: (form.querySelector('[name="title"]') || {}).value || document.title,
          selection: selection,
          note: note,
          email: (form.querySelector('[name="email"]') || {}).value || ''
        })
      }).then(function (r) {
        btn.disabled = false;
        if (!r.ok) throw new Error('failed');
        form.reset();
        status.textContent = '✓ Thanks — sent. I’ll take a look.';
        status.style.color = 'var(--ghost-accent-color)';
      }).catch(function () {
        btn.disabled = false;
        status.textContent = '✗ Could not send — try again later.';
        status.style.color = '#b91c1c';
      });
    });
  });

  // Tabs shortcode — toggle panel matching the clicked tab within each .sc-tabs.
  document.querySelectorAll('.sc-tabs').forEach(function (tabs) {
    var toggles = tabs.querySelectorAll('.sc-tab-toggle');
    var panels = tabs.querySelectorAll('.sc-tab-panel');
    toggles.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var idx = btn.getAttribute('data-tab-index');
        toggles.forEach(function (b) { b.classList.toggle('is-selected', b.getAttribute('data-tab-index') === idx); });
        panels.forEach(function (p) { p.classList.toggle('is-selected', p.getAttribute('data-tab-index') === idx); });
      });
    });
  });
  // Copy button on every code block. The <pre> scrolls sideways, so the button
  // sits on a wrapper around it rather than inside it.
  if (navigator.clipboard) {
    document.querySelectorAll('.gh-content pre').forEach(function (pre) {
      var wrap = document.createElement('div');
      wrap.className = 'code-block';
      pre.parentNode.insertBefore(wrap, pre);
      wrap.appendChild(pre);

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'code-copy';
      btn.textContent = 'Copy';
      btn.setAttribute('aria-label', 'Copy code to clipboard');
      btn.addEventListener('click', function () {
        var code = pre.querySelector('code') || pre;
        navigator.clipboard.writeText(code.innerText.replace(/\n$/, '')).then(function () {
          btn.textContent = 'Copied';
          btn.classList.add('is-copied');
        }, function () {
          btn.textContent = 'Failed';
        }).then(function () {
          setTimeout(function () {
            btn.textContent = 'Copy';
            btn.classList.remove('is-copied');
          }, 1600);
        });
      });
      wrap.appendChild(btn);
    });
  }
})();
