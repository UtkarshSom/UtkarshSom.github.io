(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const store = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  const fmt = n => Math.round(n).toLocaleString('en-US');
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const seeded = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const gauss = r => (r() + r() + r() - 1.5) / 1.5;

  /* ---------- theme / toast ---------- */
  const root = document.documentElement;
  const setTheme = t => { root.dataset.theme = t; store('theme', t); document.dispatchEvent(new Event('themechange')); };
  const toggleTheme = () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
  $('#theme-toggle').addEventListener('click', toggleTheme);
  let toastT;
  const toast = msg => {
    const t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2000);
  };
  const copyEmail = async () => {
    try { await navigator.clipboard.writeText('utksom27@gmail.com'); toast('Email copied'); }
    catch (e) { toast('utksom27@gmail.com'); }
  };
  $('#copy-email').addEventListener('click', copyEmail);

  /* ---------- scroll ---------- */
  const bar = $('.progress');
  const onScroll = () => {
    const h = document.documentElement;
    bar.style.transform = `scaleX(${h.scrollTop / (h.scrollHeight - h.clientHeight || 1)})`;
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: .12 });
  $$('.reveal').forEach((el, i) => { el.style.transitionDelay = `${(i % 4) * 70}ms`; io.observe(el); });
  const navLinks = $$('.nav nav a');
  const secObs = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) navLinks.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(s => secObs.observe(s));

  /* ---------- counters ---------- */
  if (!reduce) {
    const countObs = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      countObs.unobserve(e.target);
      const el = e.target, end = +el.dataset.count, dec = +(el.dataset.dec || 0), suf = el.dataset.suffix || '', t0 = performance.now();
      const tick = t => {
        const p = Math.min((t - t0) / 1600, 1);
        el.textContent = (end * (1 - Math.pow(1 - p, 4))).toFixed(dec) + suf;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }), { threshold: .6 });
    $$('[data-count]').forEach(el => countObs.observe(el));
  }

  /* ---------- cursor + spotlight ---------- */
  const cur = $('.cursor');
  if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
    let x = 0, y = 0, cx = 0, cy = 0;
    addEventListener('mousemove', e => { x = e.clientX; y = e.clientY; cur.classList.add('live'); });
    (function loop() {
      cx += (x - cx) * .2; cy += (y - cy) * .2;
      cur.style.transform = `translate(${cx}px,${cy}px)`;
      requestAnimationFrame(loop);
    })();
    document.addEventListener('mouseover', e => cur.classList.toggle('hover', !!e.target.closest('a,button,.group li,.pcard,.d-chip')));
  }
  $$('.group,.pcard').forEach(el => el.addEventListener('mousemove', e => {
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', e.clientX - r.left + 'px');
    el.style.setProperty('--my', e.clientY - r.top + 'px');
  }));

  /* ---------- experience tabs ---------- */
  const tabs = $$('.xp-tabs [role=tab]'), panels = $$('.panel');
  const moveBar = () => {
    const a = $('.xp-tabs .active'), b = $('.xp-bar');
    if (a && b) { b.style.setProperty('--y', a.offsetTop + 'px'); b.style.setProperty('--h', a.offsetHeight + 'px'); }
  };
  const selectTab = i => {
    tabs.forEach((t, j) => {
      const on = i === j;
      t.classList.toggle('active', on); t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1;
      panels[j].hidden = !on;
    });
    moveBar();
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => selectTab(i));
    t.addEventListener('keydown', e => {
      const k = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
      if (!k) return;
      e.preventDefault();
      const n = (i + k + tabs.length) % tabs.length; selectTab(n); tabs[n].focus();
    });
  });
  addEventListener('resize', moveBar);
  document.fonts && document.fonts.ready.then(moveBar);
  moveBar();

  /* ---------- hero background ---------- */
  (() => {
    const c = $('#hero-bg'), g = c.getContext('2d');
    let w, h, dpr, pts = [], mx = -999, my = -999, accent = css('--accent'), line = css('--mute'), running = true;
    const init = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = c.clientWidth; h = c.clientHeight;
      c.width = w * dpr; c.height = h * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.min(110, Math.floor(w * h / 14000));
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
        g.globalAlpha = m < 180 ? .95 : .45; g.fillStyle = m < 180 ? accent : line;
        g.beginPath(); g.arc(a.x, a.y, m < 180 ? 2.4 : 1.4, 0, 7); g.fill();
      }
      g.globalAlpha = 1;
    };
    c.parentElement.addEventListener('mousemove', e => { const r = c.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    c.parentElement.addEventListener('mouseleave', () => { mx = my = -999; });
    document.addEventListener('themechange', () => { accent = css('--accent'); line = css('--mute'); });
    new IntersectionObserver(([e]) => { const was = running; running = e.isIntersecting; if (running && !was) draw(); }).observe(c);
    addEventListener('resize', init);
    init(); draw();
  })();


  /* ---------- hero segmentation card ---------- */
  (() => {
    const c = $('#viz'), g = c.getContext('2d'), cap = $('#viz-cap');
    const SEG = [['Champions', '#d4ff5a', .16, .82, 'buy often and recently'], ['Loyal', '#5af0c4', .36, .62, 'steady repeat buyers'], ['New', '#6ab7ff', .12, .2, 'one recent purchase'],
      ['Promising', '#c59bff', .38, .32, 'could become loyal'], ['At Risk', '#ffb454', .7, .64, 'going quiet'], ['Hibernating', '#ff6b6b', .86, .14, 'long inactive']];
    let w, h, dpr, pts = [], mouse = null, hov = null, running = true;
    const init = () => {
      dpr = Math.min(devicePixelRatio || 1, 2); w = c.clientWidth; h = c.clientHeight;
      c.width = w * dpr; c.height = h * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0);
      pts = [];
      SEG.forEach((s, k) => { for (let i = 0; i < 28; i++) pts.push({ k, tx: Math.min(.97, Math.max(.03, s[2] + gauss(Math.random) * .1)), ty: Math.min(.95, Math.max(.05, s[3] + gauss(Math.random) * .1)), x: Math.random(), y: Math.random(), ph: Math.random() * 6.28 }); });
    };
    const draw = t => {
      if (running) requestAnimationFrame(draw);
      g.clearRect(0, 0, w, h); hov = null; let best = 20;
      for (const p of pts) {
        p.x += (p.tx - p.x) * .035; p.y += (p.ty - p.y) * .035;
        p.px = 20 + p.x * (w - 40) + (reduce ? 0 : Math.sin(t / 900 + p.ph) * 2.5);
        p.py = h - 20 - p.y * (h - 40) + (reduce ? 0 : Math.cos(t / 1100 + p.ph) * 2.5);
        if (mouse) { const d = Math.hypot(p.px - mouse.x, p.py - mouse.y); if (d < best) { best = d; hov = p; } }
      }
      for (const p of pts) {
        const on = !hov || p.k === hov.k;
        g.globalAlpha = on ? .9 : .15; g.fillStyle = SEG[p.k][1];
        g.beginPath(); g.arc(p.px, p.py, 3.6, 0, 7); g.fill();
      }
      g.globalAlpha = 1;
      cap.innerHTML = hov ? `<b style="color:${SEG[hov.k][1]}">${SEG[hov.k][0]}</b> · ${SEG[hov.k][4]}` : 'Hover to explore the cloud';
    };
    c.addEventListener('mousemove', e => { const r = c.getBoundingClientRect(); mouse = { x: e.clientX - r.left, y: e.clientY - r.top }; });
    c.addEventListener('mouseleave', () => { mouse = null; });
    new ResizeObserver(init).observe(c);
    new IntersectionObserver(([e]) => { const was = running; running = e.isIntersecting; if (running && !was) requestAnimationFrame(draw); }).observe(c);
    init(); requestAnimationFrame(draw);
  })();

  /* ---------- project filters ---------- */
  const fbtns = $$('.fbtn'), cards = $$('.pcard');
  fbtns.forEach(b => b.addEventListener('click', () => {
    fbtns.forEach(x => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); });
    cards.forEach(c => { c.hidden = b.dataset.f !== 'all' && c.dataset.cat !== b.dataset.f; });
  }));

  /* =====================================================
     DEMOS
     ===================================================== */
  const mkCanvas = (box, h) => {
    const c = document.createElement('canvas');
    c.style.height = h + 'px'; box.appendChild(c);
    const dpr = Math.min(devicePixelRatio || 1, 2), w = box.clientWidth;
    c.width = w * dpr; c.height = h * dpr;
    const g = c.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { c, g, w, h };
  };
  const mousePos = (c, e) => { const r = c.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  const grid = (g, w, h, pad, n = 8) => {
    g.strokeStyle = 'rgba(128,128,128,.14)'; g.lineWidth = 1;
    for (let i = 0; i <= n; i++) {
      const x = pad + i * (w - pad * 2) / n, y = pad + i * (h - pad * 2) / n;
      g.beginPath(); g.moveTo(x, pad); g.lineTo(x, h - pad); g.moveTo(pad, y); g.lineTo(w - pad, y); g.stroke();
    }
  };
  const ctl = (id, label, min, max, val, step = 1, unit = '') =>
    `<div class="d-ctl"><label for="${id}">${label}<output id="${id}-o">${val}${unit}</output></label><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${val}"></div>`;
  const bindRange = (box, id, cb, unit = '', f = v => v) => {
    const el = $('#' + id, box), o = $('#' + id + '-o', box);
    const run = () => { o.textContent = f(+el.value) + unit; cb(+el.value); };
    el.addEventListener('input', run); return run;
  };
  const chipRow = (items, on) => items.map((t, i) => `<button class="d-chip${on.includes(i) ? ' on' : ''}" data-i="${i}" type="button">${t}</button>`).join('');

  const DEMOS = {};

  /* 1 recommender */
  DEMOS.recommender = {
    tag: 'Loaded.com · Machine Learning', title: 'Hybrid Recommendation Engine',
    blurb: 'Pick what a shopper likes. Content similarity (cosine) is blended with popularity, which is the idea behind a hybrid recommender.',
    run(box) {
      const G = ['Action', 'Strategy', 'RPG', 'Sports', 'Indie'];
      const items = [
        ['Galactic Fleet Command', [0, 1, .2, 0, 0], .9], ['Dragon Reach', [.3, 0, 1, 0, 0], .85], ['Pitch Legends 26', [0, 0, 0, 1, 0], .95],
        ['Neon Strike', [1, 0, .2, 0, 0], .8], ['Tiny Kingdoms', [0, .8, .2, 0, .6], .5], ['Paper Lanterns', [0, 0, .3, 0, 1], .35],
        ['Iron Tactics', [.3, 1, 0, 0, 0], .6], ['Echoes of Elder', [.4, 0, 1, 0, .3], .7], ['Street Racer GP', [.6, 0, 0, .7, 0], .75], ['Pixel Drifter', [.4, 0, 0, 0, 1], .4]
      ];
      let liked = [1, 2], alpha = 70;
      box.innerHTML = `<div class="d-grid"><div class="d-box"><h4>Top 5 for this shopper</h4><div id="recs"></div></div>
        <div class="d-stack"><div class="d-box"><h4>Shopper likes</h4><div class="d-chips">${chipRow(G, liked)}</div></div>
        <div class="d-box"><h4>Blend</h4>${ctl('alpha', 'Content ← → Popularity', 0, 100, alpha, 5, '%')}<p>0% is all popularity, 100% is all personal taste.</p></div></div></div>`;
      const cos = (a, b) => { let d = 0, x = 0, y = 0; a.forEach((v, i) => { d += v * b[i]; x += v * v; y += b[i] * b[i]; }); return x && y ? d / Math.sqrt(x * y) : 0; };
      const draw = () => {
        const u = G.map((_, i) => liked.includes(i) ? 1 : 0);
        const r = items.map(([n, v, p]) => ({ n, s: alpha / 100 * cos(u, v) + (1 - alpha / 100) * p, c: cos(u, v), p }))
          .sort((a, b) => b.s - a.s).slice(0, 5);
        $('#recs', box).innerHTML = r.map((x, i) => `<div class="d-rec"><span class="rk">${i + 1}</span><span class="nm">${x.n}<small>taste ${(x.c * 100).toFixed(0)}% · popularity ${(x.p * 100).toFixed(0)}%</small></span><span class="bar"><i style="width:${x.s * 100}%"></i></span></div>`).join('');
      };
      $$('.d-chip', box).forEach(b => b.addEventListener('click', () => {
        const i = +b.dataset.i; liked = liked.includes(i) ? liked.filter(x => x !== i) : [...liked, i];
        b.classList.toggle('on'); draw();
      }));
      bindRange(box, 'alpha', v => { alpha = v; draw(); }, '%'); draw();
    }
  };

  /* 2 RFM */
  DEMOS.rfm = {
    tag: 'Loaded.com · Segmentation', title: 'Multi-Market RFM Segmentation',
    blurb: 'Each point is a customer placed by recency and frequency. Select a segment to see the lifecycle approach.',
    run(box) {
      const SEG = [
        { n: 'Champions', c: '#d4ff5a', rx: .14, ry: .84, sh: 9, d: 'Bought recently, buy often and spend the most.', p: 'Early access, VIP tier and referral asks. No discounts, they would buy anyway.' },
        { n: 'Loyal', c: '#5af0c4', rx: .34, ry: .66, sh: 17, d: 'Steady repeat buyers who respond to timing more than deals.', p: 'Cross-sell with the recommender, replenishment reminders, loyalty nudges.' },
        { n: 'New', c: '#6ab7ff', rx: .1, ry: .2, sh: 20, d: 'One recent purchase. The next 30 days decide if they return.', p: 'Welcome series and a second-purchase trigger inside a week.' },
        { n: 'Promising', c: '#c59bff', rx: .36, ry: .32, sh: 18, d: 'Mid recency, mid frequency. Could tip toward loyal.', p: 'Intent-based retargeting and light bundle offers.' },
        { n: 'At Risk', c: '#ffb454', rx: .7, ry: .66, sh: 14, d: 'Used to buy often and have gone quiet. High value, fading.', p: 'Churn-model trigger with a personalised win-back before they lapse.' },
        { n: 'Hibernating', c: '#ff6b6b', rx: .86, ry: .14, sh: 22, d: 'Low frequency and long gone. Costly to wake.', p: 'One low-cost reactivation attempt, then sunset to protect deliverability.' }
      ];
      box.innerHTML = `<div class="d-grid"><div class="d-cv" id="cvb"></div><div class="d-stack"><div class="d-chips" id="seg"></div>
        <div class="d-box"><h4 id="sn">All segments</h4><p id="sd">Hover the chart or choose a segment.</p><p style="margin-top:10px"><b>Approach.</b> <span id="sp">Each segment gets its own journey.</span></p></div>
        <button class="d-btn" id="sh" type="button">↻ Re-simulate</button></div></div>`;
      const { c, g, w, h } = mkCanvas($('#cvb', box), 380);
      const pad = 30; let pts = [], active = null, hov = null, mouse = null;
      const gen = () => { const r = Math.random; pts = []; SEG.forEach(s => { for (let i = 0, n = Math.round(s.sh * 2.6); i < n; i++) { const rx = clamp(s.rx + gauss(r) * .11, .03, .97), ry = clamp(s.ry + gauss(r) * .11, .05, .95); pts.push({ s, rx, ry, rec: Math.round(rx * 365), f: Math.max(1, Math.round(ry * 24)) }); } }); };
      const tip = document.createElement('div'); tip.className = 'd-tip'; tip.hidden = true; $('#cvb', box).appendChild(tip);
      const draw = () => {
        g.clearRect(0, 0, w, h); grid(g, w, h, pad); hov = null; let best = 14;
        pts.forEach(p => { p.x = pad + p.rx * (w - pad * 2); p.y = h - pad - p.ry * (h - pad * 2); if (mouse && (!active || p.s === active)) { const d = Math.hypot(p.x - mouse.x, p.y - mouse.y); if (d < best) { best = d; hov = p; } } });
        pts.forEach(p => { g.globalAlpha = !active || p.s === active ? .9 : .12; g.fillStyle = p.s.c; g.beginPath(); g.arc(p.x, p.y, p === hov ? 6 : 4, 0, 7); g.fill(); });
        g.globalAlpha = 1; g.fillStyle = 'rgba(128,128,128,.9)'; g.font = '11px JetBrains Mono, monospace';
        g.fillText('recent → lapsed', w - 118, h - 10); g.save(); g.translate(12, h / 2 + 30); g.rotate(-Math.PI / 2); g.fillText('frequency →', 0, 0); g.restore();
        if (hov) { tip.hidden = false; tip.innerHTML = `<b style="color:${hov.s.c}">${hov.s.n}</b>${hov.rec}d since last order<br>${hov.f} orders / yr`; tip.style.transform = `translate(${Math.min(hov.x + 14, w - tip.offsetWidth - 6)}px,${Math.max(hov.y - 56, 6)}px)`; } else tip.hidden = true;
      };
      const select = s => {
        active = s; $$('.d-chip', box).forEach((b, i) => b.classList.toggle('on', SEG[i] === s));
        $('#sn', box).textContent = s ? `${s.n} · ~${s.sh}%` : 'All segments';
        $('#sd', box).textContent = s ? s.d : 'Hover the chart or choose a segment.';
        $('#sp', box).textContent = s ? s.p : 'Each segment gets its own journey.'; draw();
      };
      $('#seg', box).innerHTML = SEG.map(s => `<button class="d-chip" style="--c:${s.c}" type="button"><i></i>${s.n}</button>`).join('');
      $$('.d-chip', box).forEach((b, i) => b.addEventListener('click', () => select(active === SEG[i] ? null : SEG[i])));
      c.addEventListener('mousemove', e => { mouse = mousePos(c, e); draw(); });
      c.addEventListener('mouseleave', () => { mouse = null; draw(); });
      c.addEventListener('click', () => { if (hov) select(hov.s === active ? null : hov.s); });
      $('#sh', box).addEventListener('click', () => { gen(); draw(); });
      gen(); draw();
    }
  };

  /* 3 journeys */
  DEMOS.journeys = {
    tag: 'Loaded.com · MoEngage', title: 'Lifecycle Journey Program',
    blurb: 'Choose a journey, then scale the send volume. The funnel uses the program averages from my work: 99.5% delivery, 27.9% open rate and 13.5% CTOR.',
    run(box) {
      const J = [
        { n: 'Welcome', s: [['Day 0', 'Signup event', 'Segment event enters the journey'], ['Day 0', 'Welcome email', 'Brand intro and first-order incentive'], ['Day 3', 'Product education', 'Picks from declared interests'], ['Day 7', 'Second-purchase nudge', 'If no order yet, send a reminder']] },
        { n: 'Browse abandon', s: [['Hour 0', 'Product view', 'Viewed but did not add to cart'], ['Hour 2', 'Reminder', 'Same product, social proof'], ['Day 1', 'Alternatives', 'Recommender picks similar items'], ['Day 3', 'Last call', 'Price or stock urgency, then exit']] },
        { n: 'Win-back', s: [['Day 60', 'Lapse trigger', 'No order in 60 days'], ['Day 60', 'We miss you', 'Personalised by past category'], ['Day 75', 'Incentive', 'Only for high-value lapsed customers'], ['Day 90', 'Sunset check', 'No response, suppress to protect deliverability']] }
      ];
      let ji = 0, sends = 100000;
      box.innerHTML = `<div class="d-chips" id="jt" style="margin-bottom:14px">${chipRow(J.map(j => j.n), [0])}</div><div class="d-steps" id="st"></div>
        <div class="d-grid"><div class="d-box"><h4>Delivery funnel</h4><div id="fn"></div></div><div class="d-box"><h4>Volume</h4>${ctl('vol', 'Sends per month', 10000, 1000000, sends, 10000)}<p>Move the slider to see how rates translate into people.</p></div></div>`;
      const draw = () => {
        $('#st', box).innerHTML = J[ji].s.map(s => `<div class="d-step"><b>${s[0]}</b><strong>${s[1]}</strong>${s[2]}</div>`).join('');
        const del = sends * .995, op = del * .279, cl = op * .135;
        const row = (l, v, p) => `<div class="d-row"><span class="lbl">${l}</span><span class="bar"><i style="width:${p}%"></i></span><span class="val">${fmt(v)}</span></div>`;
        $('#fn', box).innerHTML = row('Sent', sends, 100) + row('Delivered', del, 99.5) + row('Opened', op, 27.9 * .995) + row('Clicked', cl, 27.9 * .995 * .135);
      };
      $$('#jt .d-chip', box).forEach(b => b.addEventListener('click', () => { ji = +b.dataset.i; $$('#jt .d-chip', box).forEach(x => x.classList.toggle('on', x === b)); draw(); }));
      bindRange(box, 'vol', v => { sends = v; draw(); }, '', fmt)(); draw();
    }
  };

  /* 4 migration */
  DEMOS.migration = {
    tag: 'Loaded.com · REST APIs · Segment', title: 'CleverTap to MoEngage Migration',
    blurb: 'Step through a zero-downtime cutover. Events keep flowing through Segment while the new platform is proven before the old one is retired.',
    run(box) {
      const P = [
        ['1 · Audit', 'List every tracked event, attribute and journey in CleverTap and map each to a Segment event.', 'live', 'off'],
        ['2 · Mirror', 'Segment sends every event to both platforms. Users only receive messages from CleverTap.', 'live', 'live'],
        ['3 · Validate', 'Compare event counts, user attributes and journey entries between the two. Fix gaps via the APIs.', 'live', 'live'],
        ['4 · Cutover', 'Switch sending to MoEngage market by market. CleverTap stays on standby as a fallback.', 'standby', 'live'],
        ['5 · Retire', 'Once metrics hold, switch CleverTap off. No gap in sending happened at any point.', 'off', 'live']
      ];
      let i = 0;
      box.innerHTML = `<div class="d-flow"><div class="d-node live">Web &amp; app events<small>tracking plan</small></div><div class="d-node live">Segment<small>single event stream</small></div>
        <div class="d-stack"><div class="d-node" id="ct">CleverTap<small></small></div><div class="d-node" id="mo">MoEngage<small></small></div></div></div>
        <div class="d-box"><h4 id="pt"></h4><p id="pd"></p><div class="d-row" style="margin-top:12px"><span class="lbl">Parity checks</span><span class="bar"><i id="pb"></i></span><span class="val" id="pv"></span></div></div>
        <div class="d-nav"><button class="d-btn" id="bk" type="button">← Back</button><button class="d-btn solid" id="nx" type="button">Next step →</button></div>`;
      const st = { live: ['live', 'sending'], standby: ['', 'standby'], off: ['off', 'off'] };
      const draw = () => {
        const [t, d, c, m] = P[i];
        $('#pt', box).textContent = t; $('#pd', box).textContent = d;
        [['ct', c], ['mo', m]].forEach(([id, s]) => {
          const el = $('#' + id, box); el.className = 'd-node ' + st[s][0];
          el.querySelector('small').textContent = id === 'mo' && i === 1 || id === 'mo' && i === 2 ? 'receiving events' : st[s][1];
        });
        const pct = [0, 20, 100, 100, 100][i];
        $('#pb', box).style.width = pct + '%'; $('#pv', box).textContent = i < 1 ? '—' : pct + '%';
        $('#bk', box).disabled = i === 0; $('#nx', box).disabled = i === P.length - 1;
      };
      $('#bk', box).addEventListener('click', () => { i--; draw(); });
      $('#nx', box).addEventListener('click', () => { i++; draw(); });
      draw();
    }
  };

  /* 5 portal */
  DEMOS.portal = {
    tag: 'Loaded.com · First-party data', title: 'portal.loaded.com Game Review Portal',
    blurb: 'Customers review a game and pick tags that describe it. Each tag is a first-party signal that triggers a cross-sell or an up-sell.',
    run(box) {
      const GM = ['Open-world RPG', 'Competitive shooter', 'Cozy farming sim'];
      const T = [
        ['Great story', 'Story-driven games in the same genre', 'Deluxe edition with bonus story content'],
        ['Stunning visuals', 'Other visually rich titles', 'Ultimate edition with extras'],
        ['Great multiplayer', 'Co-op and party games', 'Season pass or DLC'],
        ['Too short', 'Longer games in the same genre', 'Expansion pack'],
        ['Worth the price', 'Bundles with similar titles', 'Premium edition upgrade'],
        ['Performance issues', 'Lighter, well-optimised titles', '']
      ];
      let game = 0, tags = [0, 2];
      box.innerHTML = `<div class="d-grid"><div class="d-stack"><div class="d-box"><h4>1 · Game reviewed</h4><div class="d-chips" id="gm">${chipRow(GM, [0])}</div></div>
        <div class="d-box"><h4>2 · Review tags the customer picks</h4><div class="d-chips" id="tg">${chipRow(T.map(t => t[0]), tags)}</div></div>
        <div class="d-box"><h4>Profile written to CRM</h4><pre class="d-code" id="js"></pre></div></div>
        <div class="d-stack"><div class="d-box"><h4>Cross-sell</h4><div id="cs"></div></div><div class="d-box"><h4>Up-sell</h4><div id="us"></div></div></div></div>`;
      const list = (items, empty) => items.length ? items.map(x => `<div class="d-rec"><span class="rk">→</span><span class="nm">${x[0]}<small>from “${x[1]}”</small></span></div>`).join('') : `<p>${empty}</p>`;
      const draw = () => {
        $('#js', box).textContent = JSON.stringify({ source: 'review_portal', reviewed_game: GM[game], review_tags: tags.map(i => T[i][0]) }, null, 2);
        $('#cs', box).innerHTML = list(tags.map(i => [T[i][1], T[i][0]]), 'Pick at least one review tag.');
        $('#us', box).innerHTML = list(tags.filter(i => T[i][2]).map(i => [T[i][2], T[i][0]]), 'No up-sell signal from the selected tags.');
      };
      $$('#tg .d-chip', box).forEach(b => b.addEventListener('click', () => { const i = +b.dataset.i; tags = tags.includes(i) ? tags.filter(x => x !== i) : [...tags, i]; b.classList.toggle('on'); draw(); }));
      $$('#gm .d-chip', box).forEach(b => b.addEventListener('click', () => { game = +b.dataset.i; $$('#gm .d-chip', box).forEach(x => x.classList.toggle('on', x === b)); draw(); }));
      draw();
    }
  };

  /* 6 restock + paypal */
  DEMOS.restock = {
    tag: 'Loaded.com · Analytics', title: 'Restock Intent & PayPal Fee Analysis',
    blurb: 'Two sizing exercises. The log counts and the fee exposure are the real figures from the analysis. The sliders are what-if assumptions.',
    run(box) {
      const logs = 361000, non = Math.round(logs * .848);
      box.innerHTML = `<div class="d-two"><div class="d-box"><h4>Restock intent</h4><div class="d-big">${fmt(non)}<small>of ${fmt(logs)} logs (84.8%) never converted</small></div><div style="margin-top:16px">${ctl('rec', 'Recovered by an automated trigger', 0, 20, 5, 1, '%')}</div><div class="d-big" id="r1"></div><p>extra customers (what-if)</p></div>
        <div class="d-box"><h4>PayPal fee exposure</h4><div class="d-big">~$7.0M<small>annual fees across 6 EU markets</small></div><div style="margin-top:16px">${ctl('shift', 'Volume shifted to a cheaper method', 0, 30, 10, 1, '%')}${ctl('save', 'Fee saving on shifted volume', 10, 100, 50, 5, '%')}</div><div class="d-big" id="r2"></div><p>potential annual saving (what-if)</p></div></div>`;
      const a = () => { const v = +$('#rec', box).value; $('#r1', box).textContent = fmt(non * v / 100); };
      const b = () => { const s = +$('#shift', box).value, f = +$('#save', box).value; $('#r2', box).textContent = '$' + (7e6 * s / 100 * f / 100 / 1e6).toFixed(2) + 'M'; };
      bindRange(box, 'rec', a, '%')(); bindRange(box, 'shift', b, '%')(); bindRange(box, 'save', b, '%')();
    }
  };

  /* 7 territory */
  DEMOS.territory = {
    tag: 'Merck · Veeva · IQVIA', title: 'Hospital Territory Coverage Models',
    blurb: 'Hospitals are grouped into territories with k-means clustering so each rep covers a compact, balanced area.',
    run(box) {
      box.innerHTML = `<div class="d-grid"><div class="d-cv" id="cvb"></div><div class="d-stack"><div class="d-box">${ctl('reps', 'Sales reps', 3, 12, 6)}<div id="stats"></div></div><button class="d-btn" id="rr" type="button">↻ New hospital map</button></div></div>`;
      const { g, w, h } = mkCanvas($('#cvb', box), 380);
      let H = [], k = 6;
      const gen = () => { const r = Math.random, cs = Array.from({ length: 5 }, () => [.15 + r() * .7, .15 + r() * .7]); H = Array.from({ length: 80 }, () => { const c = cs[Math.floor(r() * 5)]; return [clamp(c[0] + gauss(r) * .12, .03, .97), clamp(c[1] + gauss(r) * .12, .03, .97)]; }); };
      const draw = () => {
        g.clearRect(0, 0, w, h); grid(g, w, h, 20, 10);
        let C = H.slice(0, k).map(p => [...p]), A = new Array(H.length).fill(0);
        for (let it = 0; it < 15; it++) {
          A = H.map(p => { let b = 0, bd = 9; C.forEach((c, i) => { const d = (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2; if (d < bd) { bd = d; b = i; } }); return b; });
          C = C.map((c, i) => { const m = H.filter((_, j) => A[j] === i); return m.length ? [m.reduce((s, p) => s + p[0], 0) / m.length, m.reduce((s, p) => s + p[1], 0) / m.length] : c; });
        }
        const X = p => 20 + p[0] * (w - 40), Y = p => 20 + p[1] * (h - 40), col = i => `hsl(${i * 360 / k},70%,62%)`;
        H.forEach((p, j) => { g.fillStyle = col(A[j]); g.beginPath(); g.arc(X(p), Y(p), 4.5, 0, 7); g.fill(); });
        C.forEach((c, i) => { g.strokeStyle = col(i); g.lineWidth = 3; g.beginPath(); g.arc(X(c), Y(c), 11, 0, 7); g.stroke(); });
        const n = C.map((_, i) => A.filter(a => a === i).length);
        $('#stats', box).innerHTML = `<p><b>${(H.length / k).toFixed(1)}</b> hospitals per rep on average</p><p><b>${Math.max(...n)}</b> in the busiest territory, <b>${Math.min(...n)}</b> in the lightest</p>`;
      };
      bindRange(box, 'reps', v => { k = v; draw(); });
      $('#rr', box).addEventListener('click', () => { gen(); draw(); });
      gen(); draw();
    }
  };

  /* 8 automation */
  DEMOS.automation = {
    tag: 'Merck · Excel VBA', title: 'Commercial Forecasting Automation',
    blurb: 'Automating the weekly forecast with Excel VBA cut report turnaround by 15%. Set your own starting point to see what that means over a year.',
    run(box) {
      box.innerHTML = `<div class="d-grid"><div class="d-box"><h4>Turnaround per weekly report</h4><div id="bars"></div><div class="d-big" id="sv" style="margin-top:18px"></div><p id="sv2"></p></div>
        <div class="d-box">${ctl('days', 'Manual turnaround (days)', 1, 10, 5, .5)}<p>The 15% reduction is the figure from the project. The starting turnaround here is a what-if.</p></div></div>`;
      const draw = d => {
        const a = d * .85;
        $('#bars', box).innerHTML = `<div class="d-row"><span class="lbl">Manual</span><span class="bar"><i style="width:${d * 10}%;background:var(--mute)"></i></span><span class="val">${d.toFixed(1)} d</span></div><div class="d-row"><span class="lbl">Automated</span><span class="bar"><i style="width:${a * 10}%"></i></span><span class="val">${a.toFixed(2)} d</span></div>`;
        $('#sv', box).textContent = (d * .15 * 52).toFixed(1) + ' days';
        $('#sv2', box).textContent = 'of waiting removed across 52 weekly reports';
      };
      bindRange(box, 'days', draw)();
    }
  };

  /* 9 dashboard */
  DEMOS.dashboard = {
    tag: 'HashGate · Power BI · Tableau', title: 'Bossini MENA Relaunch Dashboards',
    blurb: 'A small version of the channel view in those dashboards. Switch channels and metrics to compare acquisition and return on spend.',
    run(box) {
      const CH = [['Paid social', 42, 180, 5.4, 28], ['Search', 36, 140, 6.2, 31], ['Email', 9, 60, 4.8, 36], ['Retail', 20, 90, 5.0, 25], ['Marketplace', 24, 110, 4.5, 30]];
      /* name, spend $k, visits k, orders k*? (units below), revenue multiplier */
      const D = CH.map(([n, sp, vi, od, rv]) => ({ n, sp, vi, od: od * 100, rev: sp * rv / 10 }));
      let on = [0, 1, 2, 3, 4], metric = 0;
      const M = [['Visits (k)', d => d.vi], ['Orders', d => d.od], ['ROI (x)', d => d.rev / d.sp * 10]];
      box.innerHTML = `<div class="d-chips" style="margin-bottom:12px" id="ch">${chipRow(CH.map(c => c[0]), on)}</div><div class="d-chips" style="margin-bottom:16px" id="mt">${chipRow(M.map(m => m[0]), [0])}</div>
        <div class="d-two"><div class="d-box"><h4 id="mh"></h4><div id="mb"></div></div><div class="d-box"><h4>Selected channels</h4><div class="d-big" id="k1"></div><p>total visits</p><div class="d-big" id="k2" style="margin-top:14px"></div><p>blended ROI on spend</p></div></div>`;
      const draw = () => {
        const f = M[metric][1], max = Math.max(...D.map(f));
        $('#mh', box).textContent = M[metric][0];
        $('#mb', box).innerHTML = D.map((d, i) => `<div class="d-row" style="opacity:${on.includes(i) ? 1 : .25}"><span class="lbl">${d.n}</span><span class="bar"><i style="width:${f(d) / max * 100}%"></i></span><span class="val">${f(d).toFixed(metric === 2 ? 1 : 0)}</span></div>`).join('');
        const s = D.filter((_, i) => on.includes(i)), sp = s.reduce((a, d) => a + d.sp, 0), rv = s.reduce((a, d) => a + d.rev, 0);
        $('#k1', box).textContent = fmt(s.reduce((a, d) => a + d.vi, 0)) + 'k';
        $('#k2', box).textContent = sp ? (rv / sp * 10).toFixed(1) + 'x' : '—';
      };
      $$('#ch .d-chip', box).forEach(b => b.addEventListener('click', () => { const i = +b.dataset.i; on = on.includes(i) ? on.filter(x => x !== i) : [...on, i]; b.classList.toggle('on'); draw(); }));
      $$('#mt .d-chip', box).forEach(b => b.addEventListener('click', () => { metric = +b.dataset.i; $$('#mt .d-chip', box).forEach(x => x.classList.toggle('on', x === b)); draw(); }));
      draw();
    }
  };

  /* 10 churn */
  DEMOS.churn = {
    tag: 'Personal · LightGBM · Scikit-learn', title: 'Customer Churn Prediction',
    blurb: 'Move the customer signals and watch the churn risk and its drivers change. This is a hand-weighted logistic score that mimics how a trained model explains itself.',
    run(box) {
      box.innerHTML = `<div class="d-grid"><div class="d-box">${ctl('tn', 'Tenure (months)', 1, 48, 12)}${ctl('od', 'Orders in last 90 days', 0, 12, 2)}${ctl('ds', 'Days since last order', 0, 180, 60)}${ctl('tk', 'Support tickets', 0, 6, 1)}${ctl('op', 'Emails opened (%)', 0, 100, 30)}</div>
        <div class="d-stack"><div class="d-box"><h4>Churn risk</h4><div class="d-big" id="pr"></div><p id="ac" style="margin-top:10px"></p></div><div class="d-box"><h4>What drives it</h4><div id="dr"></div></div></div></div>`;
      const v = id => +$('#' + id, box).value;
      const draw = () => {
        const f = [['Days since order', .022 * (v('ds') - 45)], ['Recent orders', -.38 * (v('od') - 2)], ['Tenure', -.03 * (v('tn') - 12)], ['Support tickets', .3 * (v('tk') - 1)], ['Email engagement', -.014 * (v('op') - 30)]];
        const z = -.4 + f.reduce((a, x) => a + x[1], 0), p = 1 / (1 + Math.exp(-z));
        $('#pr', box).textContent = (p * 100).toFixed(0) + '%';
        $('#ac', box).textContent = p > .6 ? 'High risk: trigger a personalised win-back journey now.' : p > .3 ? 'Medium risk: add to a retention nudge with a relevant recommendation.' : 'Low risk: keep in the regular lifecycle flow.';
        $('#dr', box).innerHTML = f.map(([n, c]) => `<div class="d-row"><span class="lbl">${n}</span><span class="bar"><i style="width:${clamp(Math.abs(c) / 2.5 * 100, 2, 100)}%;background:${c > 0 ? '#ff6b6b' : '#5af0c4'}"></i></span><span class="val">${c > 0 ? '+' : ''}${c.toFixed(2)}</span></div>`).join('');
      };
      ['tn', 'od', 'ds', 'tk', 'op'].forEach(id => bindRange(box, id, draw));
      draw();
    }
  };

  /* 11 demand */
  DEMOS.demand = {
    tag: 'Personal · Regression', title: 'Demand Forecasting Model',
    blurb: 'A least-squares line is fitted live to synthetic bike-rental data. Drag the temperature to get a forecast.',
    run(box) {
      box.innerHTML = `<div class="d-grid"><div class="d-cv" id="cvb"></div><div class="d-stack"><div class="d-box">${ctl('tp', 'Temperature (°C)', 0, 35, 22)}<div class="d-big" id="pd"></div><p>forecast rentals per day</p></div><div class="d-box"><p id="fit"></p></div><button class="d-btn" id="rr" type="button">↻ New sample</button></div></div>`;
      const { g, w, h } = mkCanvas($('#cvb', box), 360);
      let P = [], t = 22;
      const gen = () => { const r = Math.random; P = Array.from({ length: 90 }, () => { const x = r() * 35; return [x, Math.max(0, 40 + 11 * x + gauss(r) * 120)]; }); };
      const draw = () => {
        const n = P.length, mx = P.reduce((a, p) => a + p[0], 0) / n, my = P.reduce((a, p) => a + p[1], 0) / n;
        const sxy = P.reduce((a, p) => a + (p[0] - mx) * (p[1] - my), 0), sxx = P.reduce((a, p) => a + (p[0] - mx) ** 2, 0), syy = P.reduce((a, p) => a + (p[1] - my) ** 2, 0);
        const b = sxy / sxx, a = my - b * mx, r2 = sxy * sxy / (sxx * syy);
        const X = x => 36 + x / 35 * (w - 56), Y = y => h - 30 - y / 600 * (h - 50);
        g.clearRect(0, 0, w, h); grid(g, w, h, 0, 1);
        g.fillStyle = 'rgba(212,255,90,.75)'; P.forEach(p => { g.beginPath(); g.arc(X(p[0]), Y(p[1]), 3.5, 0, 7); g.fill(); });
        g.strokeStyle = '#ffb454'; g.lineWidth = 2; g.beginPath(); g.moveTo(X(0), Y(a)); g.lineTo(X(35), Y(a + b * 35)); g.stroke();
        const pr = a + b * t; g.fillStyle = '#fff'; g.beginPath(); g.arc(X(t), Y(pr), 6, 0, 7); g.fill();
        g.fillStyle = 'rgba(128,128,128,.9)'; g.font = '11px JetBrains Mono, monospace'; g.fillText('temperature →', w - 110, h - 8); g.fillText('rentals', 6, 14);
        $('#pd', box).textContent = fmt(Math.max(0, pr));
        $('#fit', box).innerHTML = `<b>Fit:</b> rentals = ${a.toFixed(0)} + ${b.toFixed(1)} × temp<br><b>R²:</b> ${r2.toFixed(2)}`;
      };
      bindRange(box, 'tp', v => { t = v; draw(); });
      $('#rr', box).addEventListener('click', () => { gen(); draw(); });
      gen(); draw();
    }
  };

  /* 12 crime */
  DEMOS.crime = {
    tag: 'Personal · XGBoost · Decision Trees · Logistic Regression', title: 'Crime Classification System',
    blurb: 'The project compared models across 30 categories. This shows 3 of them on synthetic data so you can see how a linear model and a decision tree draw different boundaries.',
    run(box) {
      const COL = ['#d4ff5a', '#6ab7ff', '#ff6b6b'];
      box.innerHTML = `<div class="d-grid"><div class="d-cv" id="cvb"></div><div class="d-stack"><div class="d-box"><h4>Model</h4><div class="d-chips" id="md">${chipRow(['Logistic regression', 'Decision tree'], [1])}</div><div style="margin-top:14px" id="dp">${ctl('dep', 'Tree depth', 1, 6, 3)}</div></div>
        <div class="d-box"><h4>Training accuracy</h4><div class="d-big" id="ac"></div><p id="tx"></p></div><button class="d-btn" id="rr" type="button">↻ New sample</button></div></div>`;
      const { g, w, h } = mkCanvas($('#cvb', box), 360);
      let D = [], model = 1, depth = 3, predict = () => 0;
      const gen = () => { const r = Math.random, C = [[.25, .3], [.7, .35], [.5, .75]]; D = []; C.forEach((c, k) => { for (let i = 0; i < 45; i++) D.push({ x: clamp(c[0] + gauss(r) * .13, .02, .98), y: clamp(c[1] + gauss(r) * .13, .02, .98), k }); }); };
      const gini = s => { const n = s.length; if (!n) return 0; const c = [0, 0, 0]; s.forEach(p => c[p.k]++); return 1 - c.reduce((a, v) => a + (v / n) ** 2, 0); };
      const maj = s => { const c = [0, 0, 0]; s.forEach(p => c[p.k]++); return c.indexOf(Math.max(...c)); };
      const build = (s, d) => {
        if (d === 0 || gini(s) === 0) return { leaf: maj(s) };
        let best = null;
        for (const ax of ['x', 'y']) for (let t = .05; t < 1; t += .05) {
          const l = s.filter(p => p[ax] < t), r = s.filter(p => p[ax] >= t); if (!l.length || !r.length) continue;
          const sc = (l.length * gini(l) + r.length * gini(r)) / s.length; if (!best || sc < best.sc) best = { sc, ax, t, l, r };
        }
        return best ? { ax: best.ax, t: best.t, a: build(best.l, d - 1), b: build(best.r, d - 1) } : { leaf: maj(s) };
      };
      const walk = (n, p) => n.leaf !== undefined ? n.leaf : walk(p[n.ax] < n.t ? n.a : n.b, p);
      const fit = () => {
        if (model === 1) { const T = build(D, depth); predict = p => walk(T, p); return; }
        const W = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
        for (let it = 0; it < 400; it++) {
          const G = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
          D.forEach(p => { const z = W.map(w => w[0] * (p.x - .5) * 4 + w[1] * (p.y - .5) * 4 + w[2]), m = Math.max(...z), e = z.map(v => Math.exp(v - m)), s = e.reduce((a, b) => a + b);
            e.forEach((v, k) => { const d = v / s - (p.k === k ? 1 : 0); G[k][0] += d * (p.x - .5) * 4; G[k][1] += d * (p.y - .5) * 4; G[k][2] += d; }); });
          W.forEach((w, k) => w.forEach((_, j) => { w[j] -= .5 * G[k][j] / D.length; }));
        }
        predict = p => { const z = W.map(w => w[0] * (p.x - .5) * 4 + w[1] * (p.y - .5) * 4 + w[2]); return z.indexOf(Math.max(...z)); };
      };
      const draw = () => {
        fit(); g.clearRect(0, 0, w, h);
        const nx = 60, ny = 40;
        for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) { g.fillStyle = COL[predict({ x: (i + .5) / nx, y: 1 - (j + .5) / ny })]; g.globalAlpha = .16; g.fillRect(i * w / nx, j * h / ny, w / nx + 1, h / ny + 1); }
        g.globalAlpha = 1;
        D.forEach(p => { g.fillStyle = COL[p.k]; g.strokeStyle = 'rgba(0,0,0,.5)'; g.beginPath(); g.arc(p.x * w, (1 - p.y) * h, 4.5, 0, 7); g.fill(); g.stroke(); });
        const acc = D.filter(p => predict({ x: p.x, y: p.y }) === p.k).length / D.length;
        $('#ac', box).textContent = (acc * 100).toFixed(0) + '%';
        $('#tx', box).textContent = model === 1 ? 'Deeper trees fit the training data more tightly, which can mean overfitting on new data.' : 'A linear model draws straight boundaries, so overlapping classes cost some accuracy.';
        $('#dp', box).style.display = model === 1 ? '' : 'none';
      };
      $$('#md .d-chip', box).forEach(b => b.addEventListener('click', () => { model = +b.dataset.i; $$('#md .d-chip', box).forEach(x => x.classList.toggle('on', x === b)); draw(); }));
      bindRange(box, 'dep', v => { depth = v; draw(); });
      $('#rr', box).addEventListener('click', () => { gen(); draw(); });
      gen(); draw();
    }
  };

  /* ---------- modal ---------- */
  const dlg = $('#demo'), body = $('#demo-body');
  const openDemo = id => {
    const d = DEMOS[id]; if (!d) return;
    $('#demo-tag').textContent = d.tag; $('#demo-title').textContent = d.title; $('#demo-blurb').textContent = d.blurb;
    body.innerHTML = '';
    dlg.showModal(); dlg.scrollTop = 0;
    d.run(body);
  };
  const closeDemo = () => { dlg.close(); body.innerHTML = ''; };
  $$('.demo-btn').forEach(b => b.addEventListener('click', () => openDemo(b.dataset.demo)));
  $('#demo-close').addEventListener('click', closeDemo);
  dlg.addEventListener('click', e => { if (e.target === dlg) closeDemo(); });
  dlg.addEventListener('cancel', () => { body.innerHTML = ''; });

  /* ---------- command palette ---------- */
  (() => {
    const pal = $('#palette'), input = $('#pal-input'), list = $('#pal-list');
    const go = id => () => { const el = $(id); el && el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); };
    const cmds = [
      { t: 'Home', k: 'Go', f: go('#top') },
      { t: 'Experience', k: 'Go', f: go('#work') },
      { t: 'Projects', k: 'Go', f: go('#projects') },
      { t: 'Tools & techniques', k: 'Go', f: go('#stack') },
      { t: 'Contact', k: 'Go', f: go('#contact') },
      ...Object.keys(DEMOS).map(id => ({ t: 'Demo: ' + DEMOS[id].title, k: 'Demo', f: () => openDemo(id) })),
      { t: 'Copy email address', k: 'Action', f: copyEmail },
      { t: 'Open LinkedIn', k: 'Link', f: () => open('https://www.linkedin.com/in/utkarshsom', '_blank', 'noopener') },
      { t: 'Toggle light / dark theme', k: 'Action', f: toggleTheme }
    ];
    let sel = 0, shown = cmds, lastFocus;
    const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const render = () => {
      list.innerHTML = '';
      shown.forEach((c, i) => {
        const li = document.createElement('li');
        li.setAttribute('role', 'option'); li.className = i === sel ? 'sel' : '';
        li.innerHTML = `<span>${esc(c.t)}</span><small>${c.k}</small>`;
        li.addEventListener('click', () => run(i));
        li.addEventListener('mousemove', () => { if (sel !== i) { sel = i; render(); } });
        list.appendChild(li);
      });
    };
    const run = i => { const c = shown[i]; if (!c) return; close(); setTimeout(c.f, 30); };
    const openP = () => { lastFocus = document.activeElement; pal.hidden = false; input.value = ''; shown = cmds; sel = 0; render(); input.focus(); };
    const close = () => { pal.hidden = true; lastFocus && lastFocus.focus && lastFocus.focus(); };
    input.addEventListener('input', () => { const q = input.value.toLowerCase().trim(); shown = cmds.filter(c => (c.t + ' ' + c.k).toLowerCase().includes(q)); sel = 0; render(); });
    input.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(sel + 1, shown.length - 1); render(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(sel - 1, 0); render(); }
      else if (e.key === 'Enter') run(sel);
    });
    pal.addEventListener('mousedown', e => { if (e.target === pal) close(); });
    addEventListener('keydown', e => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); pal.hidden ? openP() : close(); }
      else if (e.key === 'Escape' && !pal.hidden) close();
    });
    $('#open-palette').addEventListener('click', openP);
    if (!/Mac|iPhone|iPad/.test(navigator.platform)) $('#open-palette kbd').textContent = 'Ctrl';
  })();

  /* ---------- footer ---------- */
  $('#yr').textContent = new Date().getFullYear();
  const clock = $('#clock');
  const tickClock = () => { clock.textContent = new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Dubai', hour: '2-digit', minute: '2-digit' }); };
  tickClock(); setInterval(tickClock, 30000);
})();
