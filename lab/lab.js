(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const root = document.documentElement;
  const store = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  const tg = $('#theme-toggle');
  if (tg) tg.addEventListener('click', () => { const t = root.dataset.theme === 'dark' ? 'light' : 'dark'; root.dataset.theme = t; store('theme', t); });

  const cur = $('.cursor');
  if (cur && matchMedia('(hover:hover) and (pointer:fine)').matches) {
    let x = 0, y = 0, cx = 0, cy = 0;
    addEventListener('mousemove', e => { x = e.clientX; y = e.clientY; cur.classList.add('live'); });
    (function loop() {
      cx += (x - cx) * .2; cy += (y - cy) * .2;
      cur.style.transform = `translate(${cx}px,${cy}px)`;
      requestAnimationFrame(loop);
    })();
    document.addEventListener('mouseover', e => cur.classList.toggle('hover', !!e.target.closest('a,button,.post-row,.reader,.step,.switch')));
  }

  /* moving network background, adapted from the homepage hero */
  const cvs = $('.jbg');
  if (cvs) {
    const g = cvs.getContext('2d'), reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
    let w, h, dpr, pts = [], mx = -999, my = -999, accent = css('--accent'), line = css('--mute'), running = true;
    const init = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = cvs.clientWidth; h = cvs.clientHeight;
      cvs.width = w * dpr; cvs.height = h * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.min(120, Math.floor(w * h / 7000));
      pts = Array.from({ length: n }, () => ({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - .5) * .25, vy: (Math.random() - .5) * .25 }));
    };
    const draw = () => {
      if (running) requestAnimationFrame(draw);
      g.clearRect(0, 0, w, h);
      for (const p of pts) {
        if (!reduce) {
          p.x += p.vx; p.y += p.vy;
          if (p.x < 0 || p.x > w) p.vx *= -1;
          if (p.y < 0 || p.y > h) p.vy *= -1;
          const dx = p.x - mx, dy = p.y - my, d = Math.hypot(dx, dy);
          if (d < 140) { p.x += dx / d * 1.6; p.y += dy / d * 1.6; }
        }
      }
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i];
        for (let j = i + 1; j < pts.length; j++) {
          const b = pts[j], d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 130) { g.globalAlpha = (1 - d / 130) * .22; g.strokeStyle = line; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); }
        }
        const m = Math.hypot(a.x - mx, a.y - my);
        g.globalAlpha = m < 180 ? .95 : .6; g.fillStyle = m < 180 ? accent : line;
        g.beginPath(); g.arc(a.x, a.y, m < 180 ? 2.6 : 1.7, 0, 7); g.fill();
      }
      g.globalAlpha = 1;
    };
    cvs.parentElement.addEventListener('mousemove', e => { const r = cvs.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    cvs.parentElement.addEventListener('mouseleave', () => { mx = my = -999; });
    new MutationObserver(() => { accent = css('--accent'); line = css('--mute'); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    new IntersectionObserver(([e]) => { const was = running; running = e.isIntersecting; if (running && !was) draw(); }).observe(cvs);
    addEventListener('resize', init);
    init(); draw();
  }

  const bar0 = $('.progress');
  if (bar0) { const on = () => { const h = document.documentElement; bar0.style.transform = `scaleX(${h.scrollTop / (h.scrollHeight - h.clientHeight || 1)})`; }; addEventListener('scroll', on, { passive: true }); on(); }

  const els = [...document.querySelectorAll('.reveal')];
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
    els.forEach(el => io.observe(el));
  } else els.forEach(el => el.classList.add('in'));

  /* email size checker */
  const ta = $('#html');
  if (ta) {
    const bar = $('#bar'), verdict = $('#verdict');
    const run = () => {
      const t = ta.value, kb = new Blob([t]).size / 1024;
      $('#kb').textContent = kb.toFixed(1);
      $('#cm').textContent = (t.match(/<!--(?!\[if)[\s\S]*?-->/g) || []).length;
      $('#im').textContent = (t.match(/<img\b(?![^>]*\balt=)[^>]*>/gi) || []).length;
      bar.style.width = Math.min(100, kb / 102 * 100) + '%';
      bar.style.background = kb > 102 ? '#ff7a59' : kb > 80 ? '#ffb454' : 'var(--accent)';
      verdict.textContent = !t.trim() ? 'Paste some HTML to start.' : kb > 102 ? 'Over 102 KB. Gmail will clip this email.' : kb > 80 ? 'Close. Tracking links add size, so aim lower.' : 'Safe. Plenty of room.';
    };
    ta.addEventListener('input', run); run();
  }

  /* UTM builder */
  const u0 = $('#u0');
  if (u0) {
    const ids = ['u0', 'u1', 'u2', 'u3'].map(i => $('#' + i));
    const norm = s => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
    const build = () => {
      const [u, s, m, c] = ids.map(x => x.value), out = $('#uout');
      let base = u.trim();
      try { new URL(base); } catch (e) { out.textContent = 'Enter a full URL starting with https://'; $('#uwarn').textContent = ''; return; }
      const link = base + (base.includes('?') ? '&' : '?') + 'utm_source=' + norm(s) + '&utm_medium=' + norm(m) + '&utm_campaign=' + norm(c);
      out.textContent = link;
      const w = []; [s, m, c].forEach((v, i) => { if (v.trim() && v !== norm(v)) w.push(['Source', 'Medium', 'Campaign'][i] + ' was tidied (lowercase, underscores)'); });
      $('#uwarn').textContent = w.join('. ');
    };
    ids.forEach(i => i.addEventListener('input', build)); build();
    $('#ucopy').addEventListener('click', async e => {
      try { await navigator.clipboard.writeText($('#uout').textContent); e.target.textContent = 'Copied'; } catch (x) { e.target.textContent = 'Select and copy'; }
      setTimeout(() => e.target.textContent = 'Copy link', 1500);
    });
  }

  /* A/B size */
  const s0 = $('#s0');
  if (s0) {
    const s1 = $('#s1'), out = $('#sout');
    const calc = () => {
      const p = parseFloat(s0.value) / 100, d = parseFloat(s1.value) / 100;
      if (!(p > 0 && p < 1 && d > 0)) { out.textContent = 'Enter two positive numbers.'; return; }
      const n = Math.ceil(16 * p * (1 - p) / (d * d));
      out.innerHTML = 'About <b></b> people per group<br><span class="l-note small"></span>';
      out.querySelector('b').textContent = n.toLocaleString('en-US');
      out.querySelector('span').textContent = (2 * n).toLocaleString('en-US') + ' in total, to spot a ' + (d * 100).toFixed(1) + ' point change from ' + (p * 100).toFixed(1) + '%';
    };
    [s0, s1].forEach(x => x.addEventListener('input', calc)); calc();
  }

  /* be the customer */
  const acts = $('#acts');
  if (acts) {
    const A = [
      { id: 'signup', t: 'Sign up', ev: 'You signed up', mail: ['Welcome to the shop', 'Sent straight away', 'Rule: new subscriber, send the welcome email now'] },
      { id: 'browse', t: 'Browse a product', need: 'signup', ev: 'You looked at the Trail Runner' },
      { id: 'browse2', t: 'Look at it again', need: 'browse', ev: 'You looked at the Trail Runner again', mail: ['Still thinking about the Trail Runner?', 'Sent 1 hour later', 'Rule: viewed the same product twice, no purchase yet'] },
      { id: 'basket', t: 'Add to basket', need: 'browse', ev: 'You added it to your basket' },
      { id: 'leave', t: 'Leave without buying', need: 'basket', not: 'buy', ev: 'You left without buying', mail: ['You left something behind', 'Sent 2 hours later', 'Rule: basket not empty, no order, 2 hours passed'] },
      { id: 'buy', t: 'Buy', need: 'basket', ev: 'You bought it', mail: ['Thanks for your order', 'Sent straight away', 'Rule: order placed, send the confirmation. A basket reminder is cancelled'] },
      { id: 'quiet', t: 'Go quiet for 60 days', need: 'signup', ev: '60 days passed with no visits', mail: ['We miss you. Here is something new', 'Sent on day 60', 'Rule: no activity for 60 days, start the win-back journey'] }
    ];
    const done = new Set(), tl = $('#tl'), inbox = $('#inbox');
    const draw = () => {
      acts.textContent = '';
      A.forEach(a => {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'act'; b.textContent = a.t;
        b.disabled = done.has(a.id) || (a.need && !done.has(a.need)) || (a.not && done.has(a.not)) || (a.id === 'buy' && done.has('leave'));
        b.addEventListener('click', () => play(a)); acts.append(b);
      });
    };
    const play = a => {
      done.add(a.id);
      if (tl.querySelector('.empty')) tl.textContent = '';
      const e = document.createElement('div'); e.className = 'ev'; const bb = document.createElement('b'); bb.textContent = a.ev; e.append(bb); tl.append(e);
      if (a.mail) {
        if (inbox.querySelector('.empty')) inbox.textContent = '';
        const m = document.createElement('div'); m.className = 'mail';
        ['b', 'span', 'em'].forEach((tag, i) => { const x = document.createElement(tag); x.textContent = a.mail[i]; m.append(x); });
        inbox.prepend(m);
      }
      draw();
    };
    $('#reset').addEventListener('click', () => { done.clear(); tl.innerHTML = '<div class="empty">Nothing yet. Start with “Sign up”.</div>'; inbox.innerHTML = '<div class="empty">No emails yet.</div>'; draw(); });
    draw();
  }

  const yr = $('#yr'); if (yr) yr.textContent = new Date().getFullYear();
})();
