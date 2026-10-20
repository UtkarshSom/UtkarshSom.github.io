(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const root = document.documentElement;
  const store = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };

  $('#theme-toggle').addEventListener('click', () => {
    const t = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = t;
    store('theme', t);
  });

  const bar = $('.progress');
  const onScroll = () => {
    const h = document.documentElement;
    bar.style.transform = `scaleX(${h.scrollTop / (h.scrollHeight - h.clientHeight || 1)})`;
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  document.querySelectorAll('pre').forEach(pre => {
    const wrap = document.createElement('div'); wrap.className = 'codewrap reveal';
    pre.classList.remove('reveal');
    pre.replaceWith(wrap); wrap.append(pre);
    const b = document.createElement('button'); b.className = 'copycode'; b.type = 'button'; b.textContent = 'Copy';
    b.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(pre.innerText); b.textContent = 'Copied'; }
      catch (e) { b.textContent = 'Select + copy'; }
      setTimeout(() => b.textContent = 'Copy', 1800);
    });
    wrap.append(b);
  });

  const els = [...document.querySelectorAll('.reveal')];
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { threshold: .12 });
    els.forEach(el => io.observe(el));
  } else {
    els.forEach(el => el.classList.add('in'));
  }

  const copy = $('#copy-link');
  if (copy) copy.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(location.href); copy.textContent = 'Link copied'; }
    catch (e) { copy.textContent = location.href; }
  });

  const demo = $('#imgdemo'), sw = $('#img-switch');
  if (demo && sw) sw.addEventListener('click', () => {
    const on = sw.getAttribute('aria-checked') !== 'true';
    sw.setAttribute('aria-checked', on);
    demo.dataset.state = on ? 'on' : 'off';
  });

  const pers = $('#pers');
  if (pers) {
    const R = [
      { name: 'Sarah', lang: 'en', cur: '£', seg: 'Cart abandoner', item: 'Ember Vale', price: '34.99', was: '49.99', left: 3, branch: 'cart', art: 'img/cover-ember-vale.jpg', rule: 'cart.item exists, so show the basket reminder.' },
      { name: 'Omar', lang: 'en', cur: '$', seg: 'Browser, empty basket', item: 'Hollow Pines', price: '19.99', was: '29.99', branch: 'browse', art: 'img/cover-hollow-pines.jpg', rule: 'No basket, so show what is new instead.' },
      { name: 'Lena', lang: 'de', cur: '€', seg: 'Pre-order interest', item: 'Skyward Crew', price: '29,99', was: '', branch: 'pre', art: 'img/cover-skyward-crew.jpg', rule: 'language is de and they want a pre-order, so send the German pre-order email.' },
      { name: '', lang: 'en', cur: '£', seg: 'New subscriber', item: 'Last Light Station', price: '29.99', was: '44.99', branch: 'browse', art: 'img/cover-last-light-station.jpg', rule: 'first_name is empty, so the fallback "there" is used. No basket, so show what is new.' }
    ];
    const T = {
      en: { hi: 'Hi', fb: 'there',
        cart: r => ['You left something behind', r.item + ' is still in your basket. Only ' + r.left + ' left at this price.', 'Complete my order'],
        browse: () => ['New this week', "Picked for you, based on what you've been looking at.", "See what's new"] },
      de: { hi: 'Hallo', fb: 'du',
        pre: r => ['Vorbestellen und sparen', r.item + ' erscheint bald. Sichere dir jetzt den Vorbestellpreis.', 'Jetzt vorbestellen'] }
    };
    const set = (id, t) => { $('#' + id).textContent = t; };
    const G = { name: '', lang: 'en', cur: '£', seg: '-', item: 'Last Light Station', price: '29.99', was: '44.99', branch: 'browse', art: 'img/cover-last-light-station.jpg' };
    let on = true, cur = 0;
    const render = i => {
      cur = i;
      const r = on ? R[i] : G, t = T[r.lang];
      let [head, body, cta] = t[r.branch](r);
      if (!on) { head = "This week's deals"; body = 'The same email for every subscriber.'; cta = 'Shop now'; }
      set('f-hi', t.hi); set('f-name', r.name || t.fb);
      set('f-head', head); set('f-body', body); set('f-item', r.item);
      set('f-price', r.cur + r.price); set('f-was', r.was ? r.cur + r.was : ''); set('f-cta', cta);
      $('#f-art').style.backgroundImage = 'url(' + r.art + ')';
      pers.classList.toggle('generic', !on);
      $('#prule').textContent = on ? r.rule : 'Personalisation is off, so every reader gets this one email.';
      const rows = [['first_name', r.name || 'empty'], ['language', r.lang], ['currency', r.cur], ['segment', r.seg],
        [r.branch === 'cart' ? 'cart.item' : r.branch === 'pre' ? 'wishlist.item' : 'recommended', r.item]];
      const dl = $('#pdl'); dl.textContent = '';
      rows.forEach(([k, v]) => {
        const d = document.createElement('div'), dt = document.createElement('dt'), dd = document.createElement('dd');
        dt.textContent = k; dd.textContent = v; if (v === 'empty') dd.className = 'empty';
        d.append(dt, dd); dl.append(d);
        const map = { first_name: ['f-name'], language: ['f-hi', 'f-head', 'f-cta'], currency: ['f-price', 'f-was'], segment: ['f-head', 'f-body'],
          'cart.item': ['f-item', 'f-body'], 'wishlist.item': ['f-item', 'f-body'], recommended: ['f-item'] };
        const ids = map[k] || [];
        const mark = on => { if (!pers.classList.contains('generic')) ids.forEach(id => $('#' + id).classList.toggle('hl', on)); };
        d.addEventListener('mouseenter', () => mark(true)); d.addEventListener('mouseleave', () => mark(false));
      });
      pers.querySelectorAll('.reader').forEach((b, n) => { b.classList.toggle('on', n === i); b.setAttribute('aria-pressed', n === i); });
    };
    pers.querySelectorAll('.reader').forEach(b => b.addEventListener('click', () => render(+b.dataset.i)));
    const psw = $('#pers-switch');
    psw.addEventListener('click', () => { on = psw.getAttribute('aria-checked') !== 'true'; psw.setAttribute('aria-checked', on); render(cur); });
    render(0);
  }

  const rng = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const svgEl = (n, at) => { const e = document.createElementNS('http://www.w3.org/2000/svg', n); Object.entries(at).forEach(([k, v]) => e.setAttribute(k, v)); return e; };

  const aid = $('#aidemo');
  if (aid) {
    const A = [
      { ask: 'Shoppers who added something to their basket twice this month but never checked out.',
        act: "Skip the usual basket reminder. They've seen it. Try a different angle like stock or a price change on that item, and leave out anyone already in the reminder journey.",
        steps: [['Added to basket 2+ times this month', .4], ['No order in that time', .55], ['Has agreed to emails', .92], ['Not already in the reminder journey', .8]] },
      { ask: 'Customers who only ever buy when something is discounted.',
        act: "Stop discounting everyone. Hold the offer back until they go quiet, and keep full-price messages for people who pay full price.",
        steps: [['3+ orders in the last 12 months', .5], ['80%+ of those orders were discounted', .38], ['Still subscribed', .95]] },
      { ask: 'People whose spend has dropped by half compared with their usual.',
        act: "Reach them before they leave. A light check-in or a recommendation tied to what they used to buy works better than a blunt discount.",
        steps: [['2+ orders in the earlier 90 days', .55], ['Spend down by half or more since', .32], ['Still subscribed', .93]] }
    ];
    const N = 150, svg = $('#crowd');
    const rnd = rng(11);
    const dots = Array.from({ length: N }, (_, n) => {
      const c = svgEl('circle', { cx: 10 + (n % 10) * 20, cy: 10 + Math.floor(n / 10) * 20, r: 7.2 });
      svg.append(c); return c;
    });
    let timers = [], cur = 0, on = [];
    const flags = A.map(a => a.steps.map(([, pr]) => Array.from({ length: N }, () => rnd() < pr)));
    const draw = () => {
      const a = A[cur], f = flags[cur];
      const keep = Array.from({ length: N }, (_, n) => on.every((v, k) => !v || f[k][n]));
      dots.forEach((d, n) => d.setAttribute('class', keep[n] ? 'dk' : 'dd'));
      $('#cn').textContent = keep.filter(Boolean).length;
      const ul = $('#steps'); ul.textContent = '';
      let run = Array(N).fill(true);
      a.steps.forEach(([t], k) => {
        if (on[k]) run = run.map((v, n) => v && f[k][n]);
        const li = document.createElement('li'), b = document.createElement('button');
        b.type = 'button'; b.className = 'step' + (on[k] ? ' on' : '');
        b.innerHTML = '<i></i><span></span><em></em>';
        b.querySelector('span').textContent = t;
        b.querySelector('em').textContent = on[k] ? run.filter(Boolean).length + ' left' : 'off';
        b.addEventListener('click', () => { timers.forEach(clearTimeout); on[k] = !on[k]; draw(); });
        li.append(b); ul.append(li);
      });
    };
    const show = i => {
      timers.forEach(clearTimeout); timers = []; cur = i;
      aid.querySelectorAll('.reader').forEach((b, n) => { b.classList.toggle('on', n === i); b.setAttribute('aria-pressed', n === i); });
      $('#ask').textContent = A[i].ask; $('#aact').textContent = A[i].act;
      const len = A[i].steps.length;
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) { on = Array(len).fill(true); draw(); return; }
      on = Array(len).fill(false); draw();
      for (let k = 0; k < len; k++) timers.push(setTimeout(() => { on[k] = true; draw(); }, 500 + k * 750));
    };
    aid.querySelectorAll('.reader').forEach(b => b.addEventListener('click', () => show(+b.dataset.i)));
    show(0);
  }

  /* ML demos */

  const rfm = $('#rfmdemo');
  if (rfm) {
    const r = rng(7), pts = Array.from({ length: 60 }, () => {
      const loyal = r() < .45;
      return { d: Math.round(loyal ? r() * 90 : 20 + r() * 150), o: Math.max(0, Math.round(loyal ? 2 + r() * 7 : r() * 4)) };
    });
    const svg = $('#rfm-svg'), W = 520, H = 320, px = d => 30 + (d / 180) * (W - 50), py = o => H - 30 - (o / 10) * (H - 50);
    const T = [
      { n: 'Champions', c: 'var(--accent)', a: 'Early access and VIP perks' },
      { n: 'New or occasional', c: '#7aa2ff', a: 'Welcome and second-purchase journey' },
      { n: 'At risk', c: '#ffb454', a: 'Win them back before they go' },
      { n: 'Lapsed', c: '#8d8c86', a: 'Cheap reactivation or sunset' }
    ];
    const dots = pts.map(p => { const c = svgEl('circle', { cx: px(p.d), cy: py(p.o) + (Math.random() - .5) * 6, r: 5.5, 'fill-opacity': .9 }); svg.append(c); return c; });
    const vl = svgEl('line', { y1: 14, y2: H - 30, stroke: 'currentColor', 'stroke-dasharray': '4 4', opacity: .45 });
    const hl = svgEl('line', { x1: 30, x2: W - 20, stroke: 'currentColor', 'stroke-dasharray': '4 4', opacity: .45 });
    svg.append(vl, hl);
    const ax = (x, y, t, a) => { const e = svgEl('text', { x, y, 'font-size': 11, fill: 'currentColor', opacity: .6, 'text-anchor': a || 'start', 'font-family': 'monospace' }); e.textContent = t; svg.append(e); };
    ax(30, H - 10, 'recent'); ax(W - 20, H - 10, 'days since last order →', 'end'); ax(8, 18, 'orders ↑');
    const leg = $('#rfm-leg');
    const upd = () => {
      const rv = +$('#rfm-r').value, fv = +$('#rfm-f').value, n = [0, 0, 0, 0];
      $('#rfm-rv').textContent = rv; $('#rfm-fv').textContent = fv;
      vl.setAttribute('x1', px(rv)); vl.setAttribute('x2', px(rv)); hl.setAttribute('y1', py(fv - .5)); hl.setAttribute('y2', py(fv - .5));
      pts.forEach((p, i) => { const rec = p.d <= rv, fr = p.o >= fv, t = rec && fr ? 0 : rec ? 1 : fr ? 2 : 3; n[t]++; dots[i].setAttribute('fill', T[t].c); });
      leg.textContent = '';
      T.forEach((t, i) => {
        const li = document.createElement('li'), d = document.createElement('i'), b = document.createElement('div'), e = document.createElement('em');
        d.style.background = t.c; b.innerHTML = '<b></b><span></span>'; b.firstChild.textContent = t.n; b.lastChild.textContent = t.a; e.textContent = n[i];
        li.append(d, b, e); leg.append(li);
      });
    };
    ['#rfm-r', '#rfm-f'].forEach(id => $(id).addEventListener('input', upd)); upd();
  }

  const reco = $('#recodemo');
  if (reco) {
    const G = [
      { n: 'Ember Vale', img: 'img/cover-ember-vale.jpg', s: [.95, .1, .5], p: .8 },
      { n: 'Hollow Pines', img: 'img/cover-hollow-pines.jpg', s: [.6, .95, 0], p: .5 },
      { n: 'Skyward Crew', img: 'img/cover-skyward-crew.jpg', s: [.3, .1, .95], p: .7 },
      { n: 'Last Light Station', img: 'img/cover-last-light-station.jpg', s: [.15, .9, .4], p: .9 }
    ];
    const on = new Set([0]), list = $('#reco-list');
    const draw = () => {
      const w = +$('#reco-w').value / 100; $('#reco-wv').textContent = Math.round(w * 100) + '%';
      const rows = G.map(g => { const sel = [...on], sim = sel.length ? sel.reduce((a, t) => a + g.s[t], 0) / sel.length : 0; return { g, sim, sc: (1 - w) * sim + w * g.p }; }).sort((a, b) => b.sc - a.sc);
      list.textContent = '';
      rows.forEach(({ g, sim, sc }) => {
        const li = document.createElement('li'), im = document.createElement('img'), d = document.createElement('div');
        im.src = g.img; im.alt = ''; im.width = 60; im.height = 60;
        d.innerHTML = '<div class="nm"></div><div class="bar"><i></i></div><div class="sc"></div>';
        d.querySelector('.nm').textContent = g.n; d.querySelector('i').style.width = Math.round(sc * 100) + '%';
        d.querySelector('.sc').textContent = 'blend ' + sc.toFixed(2) + '  =  similarity ' + sim.toFixed(2) + ' and popularity ' + g.p.toFixed(2);
        li.append(im, d); list.append(li);
      });
    };
    reco.querySelectorAll('#reco-tastes .reader').forEach(b => b.addEventListener('click', () => {
      const t = +b.dataset.t; on.has(t) ? on.delete(t) : on.add(t);
      b.classList.toggle('on', on.has(t)); b.setAttribute('aria-pressed', on.has(t)); draw();
    }));
    $('#reco-w').addEventListener('input', draw); draw();
  }

  const ch = $('#churndemo');
  if (ch) {
    const run = () => {
      const d = +$('#ch-d').value, o = +$('#ch-o').value, c = +$('#ch-c').value;
      $('#ch-dv').textContent = d; $('#ch-ov').textContent = o; $('#ch-cv').textContent = c;
      const parts = [['Time since last order', .03 * d], ['Recent orders', -.5 * o], ['Email clicks', -.25 * c]];
      const z = -1.2 + parts.reduce((a, [, v]) => a + v, 0), p = 1 / (1 + Math.exp(-z)), pc = Math.round(p * 100);
      $('#ch-p').textContent = pc;
      const n = $('#ch-p').parentElement; n.className = 'gauge-n ' + (p >= .6 ? 'hot' : p >= .3 ? 'mid' : 'low');
      const ul = $('#ch-drv'); ul.textContent = '';
      parts.sort((a, b) => Math.abs(b[1]) - Math.abs(a[1])).forEach(([k, v]) => {
        const li = document.createElement('li'), db = document.createElement('div'), i = document.createElement('i');
        const m = Math.min(50, Math.abs(v) / 5.4 * 50); db.className = 'db';
        i.style.cssText = 'left:' + (v >= 0 ? 50 : 50 - m) + '%;width:' + m + '%;background:' + (v >= 0 ? '#ff7a59' : 'var(--accent)');
        db.append(i); li.append(document.createTextNode(k), db); ul.append(li);
      });
      $('#ch-act').textContent = p >= .6 ? 'Start the win-back journey now.' : p >= .3 ? 'Send a gentle nudge and watch what they do.' : 'Leave them alone. They are fine.';
    };
    ['#ch-d', '#ch-o', '#ch-c'].forEach(id => $(id).addEventListener('input', run)); run();
  }

  const yr = $('#yr'); if (yr) yr.textContent = new Date().getFullYear();
})();
