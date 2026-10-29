(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function cosine(a, b) {
    if (!a.length || !b.length) return 0;
    var set = new Set(b), n = 0;
    a.forEach(function (x) { if (set.has(x)) n++; });
    return n / Math.sqrt(a.length * b.length);
  }

  /* toast + copy */
  var toast = $('#toast'), toastTimer;
  function say(msg) {
    toast.textContent = msg;
    toast.hidden = false;
    toast.classList.remove('in'); void toast.offsetWidth; toast.classList.add('in');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.hidden = true; }, 2400);
  }
  $$('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var label = b.getAttribute('data-label') || 'Text';
      var fallback = function () {
        var t = document.getElementById(b.getAttribute('data-target'));
        if (t) { var r = document.createRange(); r.selectNodeContents(t); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); }
        say(label + ' selected. Press Ctrl+C to copy.');
      };
      try { navigator.clipboard.writeText(b.getAttribute('data-copy')).then(function () { say(label + ' copied'); }, fallback); }
      catch (e) { fallback(); }
    });
  });

  /* name letters */
  $$('.name .ln').forEach(function (ln) {
    var text = ln.textContent; ln.textContent = '';
    Array.prototype.forEach.call(text, function (ch) {
      var s = document.createElement('span'); s.className = 'l'; s.textContent = ch; ln.appendChild(s);
    });
  });

  /* typed phrases */
  var typed = $('#typed');
  var phrases = ['full-stack web platforms', 'recommendation systems', 'data-driven applications', 'REST APIs with PHP and MySQL'];
  if (!reduce && typed) {
    var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
    (async function () {
      var i = 0;
      while (true) {
        await wait(2400);
        var cur = phrases[i];
        for (var n = cur.length; n >= 0; n--) { typed.textContent = cur.slice(0, n); await wait(26); }
        i = (i + 1) % phrases.length;
        var nx = phrases[i];
        for (var m = 1; m <= nx.length; m++) { typed.textContent = nx.slice(0, m); await wait(52); }
      }
    })();
  }

  /* nav: progress + active section */
  var prog = $('.progress'), navList = $('.nav ul'), links = $$('.lnk');
  function onScroll() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    prog.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, window.scrollY / max) : 0) + ')';
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  var byId = {}; links.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
  var secObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var a = byId[e.target.id]; if (!a) return;
      links.forEach(function (l) { l.removeAttribute('aria-current'); });
      a.setAttribute('aria-current', 'true');
      var li = a.parentElement;
      navList.scrollTo({ left: li.offsetLeft - navList.offsetLeft - 24, behavior: reduce ? 'auto' : 'smooth' });
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  $$('main section[id]').forEach(function (s) { secObs.observe(s); });

  /* spotlight cards */
  $$('.spot').forEach(function (el) {
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect();
      el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      el.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* role fit */
  var PROJECTS = {
    tourism: { name: 'Tourism Management System', tags: ['html', 'css', 'javascript', 'php', 'mysql', 'frontend', 'backend', 'database', 'crud', 'responsive'] },
    movie: { name: 'Movie Recommender System', tags: ['python', 'pandas', 'sklearn', 'nlp', 'ml', 'recsys', 'data', 'streamlit', 'deployment'] }
  };
  var ROLES = {
    swe: {
      name: 'Software Engineer',
      tags: ['python', 'javascript', 'cpp', 'git', 'frontend', 'backend', 'database', 'crud', 'ml', 'deployment'],
      skills: ['python', 'javascript', 'cpp', 'git', 'github', 'rest', 'php', 'mysql', 'vscode', 'html', 'css'],
      pitch: "I write clean, efficient code in Python, JavaScript and C++. I've built two complete applications end to end: a full-stack tourism platform and a machine learning recommender."
    },
    fullstack: {
      name: 'Full-Stack Developer',
      tags: ['html', 'css', 'javascript', 'php', 'mysql', 'rest', 'frontend', 'backend', 'database', 'crud', 'responsive', 'git'],
      skills: ['html', 'css', 'javascript', 'php', 'mysql', 'rest', 'git', 'github', 'vscode'],
      pitch: 'I built a tourism platform from a responsive HTML, CSS and JavaScript frontend to secure PHP backend logic and a MySQL database, with full CRUD for destinations, packages and users.'
    },
    ml: {
      name: 'ML Engineer',
      tags: ['python', 'pandas', 'numpy', 'sklearn', 'tensorflow', 'nlp', 'ml', 'recsys', 'data', 'deployment', 'streamlit'],
      skills: ['python', 'pandas', 'numpy', 'sklearn', 'tensorflow', 'nlp', 'jupyter', 'colab', 'streamlit'],
      pitch: "I built a content-based movie recommender using NLP features and cosine similarity, then deployed it with Streamlit. I've also completed the DeepLearning.AI / Stanford Machine Learning course on Coursera."
    },
    data: {
      name: 'Data Analyst',
      tags: ['python', 'pandas', 'numpy', 'matplotlib', 'seaborn', 'powerbi', 'data', 'mysql', 'database', 'ml'],
      skills: ['python', 'pandas', 'numpy', 'matplotlib', 'seaborn', 'powerbi', 'jupyter', 'mysql', 'colab'],
      pitch: "I work with data in Pandas and NumPy and visualize it with Matplotlib, Seaborn and Power BI. I've completed IBM's What Is Data Science? course on Coursera."
    }
  };
  function skillName(id) { var el = $('.sk[data-skill="' + id + '"] .nm'); return el ? el.textContent : id; }
  var rankList = $('#fit-projects');

  function setRole(key, animate) {
    var r = ROLES[key]; if (!r) return;
    $$('.role').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-role') === key)); });
    $('#fit-role').textContent = r.name;
    $('#fit-pitch').textContent = r.pitch;
    $('#fit-count').textContent = r.skills.length;
    var ul = $('#fit-skills'); ul.textContent = '';
    r.skills.forEach(function (id, i) {
      var li = document.createElement('li');
      li.className = 'chip hot' + (animate && !reduce ? ' show' : '');
      li.style.setProperty('--i', i);
      li.textContent = skillName(id);
      ul.appendChild(li);
    });
    var ranked = Object.keys(PROJECTS).map(function (k) {
      return { k: k, s: cosine(r.tags, PROJECTS[k].tags) };
    }).sort(function (a, b) { return b.s - a.s; });
    ranked.forEach(function (p, idx) {
      var li = rankList.querySelector('[data-p="' + p.k + '"]');
      rankList.appendChild(li);
      li.querySelector('.score').textContent = p.s.toFixed(2);
      li.querySelector('.bar i').style.setProperty('--w', (p.s * 100).toFixed(1) + '%');
      var card = document.getElementById('proj-' + p.k);
      card.style.order = idx;
      var badge = card.querySelector('.fitbadge');
      badge.textContent = 'fit ' + p.s.toFixed(2) + ' · ' + r.name;
      badge.classList.toggle('top', idx === 0 && p.s > 0);
    });
    var hits = new Set(r.skills);
    $$('.sk').forEach(function (t) { t.classList.toggle('hit', hits.has(t.getAttribute('data-skill'))); });
    $$('.role-name').forEach(function (e) { e.textContent = r.name; });
    try { localStorage.setItem('ni-role', key); } catch (e) {}
  }
  $$('.role').forEach(function (b) { b.addEventListener('click', function () { setRole(b.getAttribute('data-role'), true); }); });
  var savedRole = 'swe';
  try { savedRole = localStorage.getItem('ni-role') || 'swe'; } catch (e) {}
  setRole(ROLES[savedRole] ? savedRole : 'swe', false);

  /* skills filter */
  $$('.filter').forEach(function (b) {
    b.addEventListener('click', function () {
      var cat = b.getAttribute('data-cat');
      $$('.filter').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      $$('.sk').forEach(function (t) {
        var show = cat === 'all' || t.getAttribute('data-cat').split(' ').indexOf(cat) !== -1;
        t.hidden = !show;
        t.classList.remove('show');
        if (show && !reduce) { void t.offsetWidth; t.classList.add('show'); }
      });
    });
  });

  /* movie recommender demo */
  var FILMS = [
    ['Inception', ['sci-fi', 'thriller', 'heist', 'dreams', 'mind-bending', 'nolan']],
    ['Interstellar', ['sci-fi', 'drama', 'space', 'time-travel', 'nolan']],
    ['The Dark Knight', ['action', 'crime', 'thriller', 'superhero', 'nolan']],
    ['The Matrix', ['sci-fi', 'action', 'simulation', 'mind-bending', 'dystopia']],
    ['Gravity', ['sci-fi', 'thriller', 'space', 'survival', 'drama']],
    ['The Martian', ['sci-fi', 'space', 'survival', 'drama', 'comedy']],
    ['Avatar', ['sci-fi', 'action', 'adventure', 'alien-world', 'cameron']],
    ['Titanic', ['romance', 'drama', 'disaster', 'cameron']],
    ['La La Land', ['romance', 'musical', 'drama', 'music']],
    ['The Notebook', ['romance', 'drama']],
    ['Whiplash', ['drama', 'music']],
    ['Iron Man', ['action', 'sci-fi', 'superhero']],
    ['The Avengers', ['action', 'sci-fi', 'superhero', 'team']],
    ['Toy Story', ['animation', 'family', 'comedy', 'adventure']],
    ['Finding Nemo', ['animation', 'family', 'adventure', 'ocean']],
    ['Up', ['animation', 'family', 'adventure', 'drama']]
  ];
  var pick = $('#movie-pick'), recs = $('#movie-recs'), qtags = $('#movie-tags');
  FILMS.forEach(function (f, i) { var o = document.createElement('option'); o.value = i; o.textContent = f[0]; pick.appendChild(o); });
  function recommend(i, animate) {
    var q = FILMS[i];
    qtags.textContent = '';
    q[1].forEach(function (t) { var s = document.createElement('span'); s.textContent = t; qtags.appendChild(s); });
    var res = FILMS.map(function (f, j) {
      return { j: j, s: j === i ? -1 : cosine(q[1], f[1]), shared: f[1].filter(function (t) { return q[1].indexOf(t) !== -1; }) };
    }).sort(function (a, b) { return b.s - a.s; }).slice(0, 3);
    recs.textContent = '';
    recs.classList.remove('show');
    res.forEach(function (r, k) {
      var li = document.createElement('li');
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'rec'; b.style.setProperty('--i', k);
      b.setAttribute('aria-label', 'Recommend from ' + FILMS[r.j][0]);
      b.innerHTML = '<span class="rk"></span><span class="t"></span><span class="s"></span><span class="shared"></span><span class="bar"><i></i></span>';
      b.querySelector('.rk').textContent = '#' + (k + 1);
      b.querySelector('.t').textContent = FILMS[r.j][0];
      b.querySelector('.s').textContent = r.s.toFixed(2);
      b.querySelector('.shared').textContent = r.shared.length ? 'shares: ' + r.shared.join(', ') : 'no shared tags';
      b.querySelector('.bar i').style.setProperty('--w', (r.s * 100).toFixed(1) + '%');
      b.addEventListener('click', function () { pick.value = r.j; recommend(r.j, true); });
      li.appendChild(b); recs.appendChild(li);
    });
    if (animate && !reduce) { void recs.offsetWidth; recs.classList.add('show'); }
  }
  pick.addEventListener('change', function () { recommend(Number(pick.value), true); });
  recommend(0, false);

  /* tourism CRUD demo */
  var pkgs = [
    { id: 1, dest: "Cox's Bazar beach", days: 3, price: 12500 },
    { id: 2, dest: 'Sylhet tea gardens', days: 2, price: 8000 },
    { id: 3, dest: 'Sundarbans mangrove cruise', days: 4, price: 18500 },
    { id: 4, dest: 'Bandarban hills', days: 3, price: 11000 }
  ];
  var nextId = 5, editing = null;
  var tbody = $('#pkg-body'), form = $('#pkg-form'), fDest = $('#pkg-dest'), fDays = $('#pkg-days'), fPrice = $('#pkg-price');
  var submitBtn = $('#pkg-submit'), cancelBtn = $('#pkg-cancel'), sqlLine = $('#pkg-sql');
  var taka = function (n) { return '৳' + Number(n).toLocaleString('en-IN'); };
  var quote = function (s) { return "'" + s.replace(/'/g, "''") + "'"; };
  function renderPkgs(flashId) {
    tbody.textContent = '';
    if (!pkgs.length) {
      var tr0 = document.createElement('tr'), td0 = document.createElement('td');
      td0.colSpan = 4; td0.textContent = 'No packages yet. Add one below.'; td0.style.color = 'var(--muted)';
      tr0.appendChild(td0); tbody.appendChild(tr0); return;
    }
    pkgs.forEach(function (p) {
      var tr = document.createElement('tr'); if (p.id === flashId) tr.className = 'flash';
      var a = document.createElement('td'); a.textContent = p.dest;
      var b = document.createElement('td'); b.className = 'num'; b.textContent = p.days;
      var c = document.createElement('td'); c.className = 'num'; c.textContent = taka(p.price);
      var d = document.createElement('td'); d.className = 'act';
      var e = document.createElement('button'); e.type = 'button'; e.className = 'mini'; e.textContent = 'Edit'; e.setAttribute('data-act', 'edit'); e.setAttribute('data-id', p.id); e.setAttribute('aria-label', 'Edit ' + p.dest);
      var x = document.createElement('button'); x.type = 'button'; x.className = 'mini del'; x.textContent = 'Delete'; x.setAttribute('data-act', 'del'); x.setAttribute('data-id', p.id); x.setAttribute('aria-label', 'Delete ' + p.dest);
      d.appendChild(e); d.appendChild(x);
      tr.appendChild(a); tr.appendChild(b); tr.appendChild(c); tr.appendChild(d);
      tbody.appendChild(tr);
    });
  }
  function stopEditing() { editing = null; submitBtn.textContent = 'Add'; cancelBtn.hidden = true; form.reset(); }
  tbody.addEventListener('click', function (ev) {
    var btn = ev.target.closest('button[data-act]'); if (!btn) return;
    var id = Number(btn.getAttribute('data-id'));
    var p = pkgs.filter(function (x) { return x.id === id; })[0]; if (!p) return;
    if (btn.getAttribute('data-act') === 'edit') {
      editing = id; fDest.value = p.dest; fDays.value = p.days; fPrice.value = p.price;
      submitBtn.textContent = 'Save'; cancelBtn.hidden = false; fDest.focus();
      sqlLine.textContent = 'SELECT * FROM packages WHERE id = ' + id + ';';
    } else {
      pkgs = pkgs.filter(function (x) { return x.id !== id; });
      if (editing === id) stopEditing();
      sqlLine.textContent = 'DELETE FROM packages WHERE id = ' + id + ';';
      renderPkgs(); say('Deleted ' + p.dest);
    }
  });
  cancelBtn.addEventListener('click', function () { stopEditing(); sqlLine.textContent = 'SELECT * FROM packages;'; });
  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var dest = fDest.value.trim(), days = parseInt(fDays.value, 10), price = parseInt(fPrice.value, 10);
    if (!dest) { say('Enter a destination name.'); fDest.focus(); return; }
    if (!(days >= 1 && days <= 30)) { say('Days must be a number from 1 to 30.'); fDays.focus(); return; }
    if (!(price >= 0)) { say('Enter a price in taka, 0 or more.'); fPrice.focus(); return; }
    var flashId;
    if (editing) {
      var p = pkgs.filter(function (x) { return x.id === editing; })[0];
      p.dest = dest; p.days = days; p.price = price; flashId = p.id;
      sqlLine.textContent = 'UPDATE packages SET destination = ' + quote(dest) + ', days = ' + days + ', price = ' + price + ' WHERE id = ' + p.id + ';';
      say('Updated ' + dest);
      stopEditing();
    } else {
      var np = { id: nextId++, dest: dest, days: days, price: price };
      pkgs.push(np); flashId = np.id;
      sqlLine.textContent = 'INSERT INTO packages (destination, days, price) VALUES (' + quote(dest) + ', ' + days + ', ' + price + ');';
      say('Added ' + dest);
      form.reset();
    }
    renderPkgs(flashId);
  });
  renderPkgs();

  /* hero skill-space canvas */
  var hero = $('.hero'), cv = $('#space'), ctx = cv.getContext('2d');
  var LABELS = ['Python', 'JavaScript', 'C++', 'PHP', 'MySQL', 'Pandas', 'NumPy', 'Scikit-Learn', 'TensorFlow', 'Streamlit', 'REST APIs', 'Git', 'HTML5', 'CSS3'];
  var W = 0, H = 0, wide = false, pts = [], ptr = null, colors = { ink: '#fff', pop: '#ffc93c' }, running = false, raf = 0, visible = true;
  function readColors() {
    var cs = getComputedStyle(document.documentElement);
    colors.ink = cs.getPropertyValue('--brand-ink').trim() || '#fff';
    colors.pop = cs.getPropertyValue('--pop').trim() || '#ffc93c';
  }
  function rng(seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
  function build() {
    var r = hero.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
    W = r.width; H = r.height; wide = W > 820;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var rand = rng(11), n = Math.round(Math.min(110, Math.max(36, W * H / 7000)));
    pts = [];
    for (var i = 0; i < n; i++) {
      var labeled = i < LABELS.length;
      var right = wide && (labeled || rand() < 0.7);
      pts.push({
        x: right ? W * (0.52 + 0.44 * rand()) : W * rand(),
        y: H * (0.08 + 0.84 * rand()),
        vx: (rand() - 0.5) * 0.3, vy: (rand() - 0.5) * 0.3,
        label: labeled ? LABELS[i] : null
      });
    }
  }
  function frame(t) {
    ctx.clearRect(0, 0, W, H);
    var c = ptr || {
      x: W * (wide ? 0.74 : 0.5) + Math.sin(t / 2300) * W * (wide ? 0.17 : 0.34),
      y: H * 0.5 + Math.sin(t / 1700 + 1) * H * 0.34
    };
    if (running) pts.forEach(function (p) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
    });
    var R = 100, i, j;
    ctx.lineWidth = 1; ctx.strokeStyle = colors.ink;
    for (i = 0; i < pts.length; i++) {
      for (j = i + 1; j < pts.length; j++) {
        var dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y, d2 = dx * dx + dy * dy;
        if (d2 < R * R) {
          ctx.globalAlpha = (1 - Math.sqrt(d2) / R) * 0.2;
          ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke();
        }
      }
    }
    var near = pts.map(function (p, k) { return { k: k, d: Math.hypot(p.x - c.x, p.y - c.y) }; })
      .sort(function (a, b) { return a.d - b.d; }).slice(0, 4);
    var hot = {}; near.forEach(function (n) { hot[n.k] = true; });
    ctx.strokeStyle = colors.pop; ctx.lineWidth = 1.5; ctx.globalAlpha = wide ? 0.9 : 0.6;
    near.forEach(function (n) { ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.lineTo(pts[n.k].x, pts[n.k].y); ctx.stroke(); });
    pts.forEach(function (p, k) {
      var h = hot[k];
      ctx.globalAlpha = h ? 1 : (p.label ? 0.8 : 0.45);
      ctx.fillStyle = h ? colors.pop : colors.ink;
      ctx.beginPath(); ctx.arc(p.x, p.y, h ? 4.5 : (p.label ? 2.6 : 1.8), 0, Math.PI * 2); ctx.fill();
    });
    ctx.font = '500 11px "JetBrains Mono", Consolas, monospace'; ctx.textBaseline = 'middle';
    pts.forEach(function (p, k) {
      if (!p.label) return;
      var h = hot[k]; if (!h && !wide) return;
      ctx.globalAlpha = h ? 1 : 0.55; ctx.fillStyle = h ? colors.pop : colors.ink;
      var w = ctx.measureText(p.label).width;
      ctx.fillText(p.label, p.x + 8 + w > W - 6 ? p.x - 8 - w : p.x + 8, p.y);
    });
    ctx.globalAlpha = 1; ctx.strokeStyle = colors.pop; ctx.fillStyle = colors.pop; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(c.x, c.y, 12, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(c.x, c.y, 2.5, 0, Math.PI * 2); ctx.fill();
  }
  function loop(t) { frame(t); raf = requestAnimationFrame(loop); }
  function start() { if (running || reduce || !visible) return; running = true; raf = requestAnimationFrame(loop); }
  function stop() { running = false; cancelAnimationFrame(raf); }
  hero.addEventListener('pointermove', function (e) {
    var r = cv.getBoundingClientRect(); ptr = { x: e.clientX - r.left, y: e.clientY - r.top };
    if (!running) frame(performance.now());
  });
  hero.addEventListener('pointerleave', function () { ptr = null; if (!running) frame(performance.now()); });
  new ResizeObserver(function () { build(); frame(performance.now()); }).observe(hero);
  new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) start(); else stop(); }).observe(hero);
  var refresh = function () { readColors(); if (!running) frame(performance.now()); };
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', refresh);
  new MutationObserver(refresh).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { build(); frame(performance.now()); });
  readColors(); build(); frame(1200); start();
})();
