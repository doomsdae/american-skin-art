// assets/js/slider.js — JSON-driven showcase slider (instagram-first, fallback to inline)
(function(){
  const Slider = function(opts){
    const conf = Object.assign({
      mount: '#recent-showcase',
      json: '/data/instagram-feed.json',
      interval: 4200,
      limit: 18
    }, opts || {});

    const mount = document.querySelector(conf.mount);
    if (!mount) return;

    // Helper: shuffle (Fisher–Yates)
    function shuffle(arr){
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    }

    // Try instagram feed first (data-json attr or default conf.json)
    const attrJson = mount.getAttribute('data-json');
    const jsonUrl = attrJson || conf.json;

    function tryInstagram(){
      return fetch(jsonUrl, {cache: 'no-store'})
        .then(r => { if(!r.ok) throw new Error('HTTP '+r.status); return r.json(); })
        .then(list => Array.isArray(list) ? list : []);
    }

    // Fallback: merge inline datasets (#devin-works, #danny-works, #dale-works)
    function fallbackInline(){
      const ids = ['devin-works','danny-works','dale-works'];
      let all = [];
      ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          try {
            const arr = JSON.parse(el.textContent || '[]');
            if (Array.isArray(arr)) all = all.concat(arr);
          } catch(e){}
        }
      });
      return shuffle(all).slice(0, conf.limit);
    }

    function initWith(items){
      if (!items || !items.length) items = fallbackInline();
      mount.innerHTML = [
        '<div class="slider" aria-roledescription="carousel">',
        '  <div class="slides" role="list"></div>',
        '  <button class="nav prev" aria-label="Previous slide" type="button">&#10094;</button>',
        '  <button class="nav next" aria-label="Next slide" type="button">&#10095;</button>',
        '  <div class="dots" role="tablist" aria-label="Slides"></div>',
        '</div>'
      ].join('');

      const el = {
        slider: mount.querySelector('.slider'),
        track: mount.querySelector('.slides'),
        prev:  mount.querySelector('.prev'),
        next:  mount.querySelector('.next'),
        dots:  mount.querySelector('.dots')
      };

      let slides = [], idx = 0, timer = null, hovering = false, touching = false, touchX = 0;

      function render(items){
        el.track.innerHTML = '';
        el.dots.innerHTML = '';

        items.forEach((it, i) => {
          const li = document.createElement('figure');
          li.className = 'slide';
          li.setAttribute('role','group');
          li.setAttribute('aria-roledescription','slide');
          li.setAttribute('aria-label', (i+1) + ' of ' + items.length);

          const a = document.createElement('a');
          a.href = it.href || '#';
          a.target = it.href ? '_blank' : '';
          a.rel = it.href ? 'noopener' : '';

          const img = document.createElement('img');
          img.decoding = 'async';
          img.loading = 'lazy';
          img.src = it.src;
          img.alt = it.alt || '';

          const cap = document.createElement('figcaption');
          cap.textContent = it.alt || '';
          cap.className = 'caption';

          a.appendChild(img);
          li.appendChild(a);
          li.appendChild(cap);
          el.track.appendChild(li);

          const dot = document.createElement('button');
          dot.className = 'dot';
          dot.setAttribute('role','tab');
          dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
          dot.setAttribute('aria-controls', 'slide-' + i);
          dot.type = 'button';
          dot.addEventListener('click', () => go(i));
          el.dots.appendChild(dot);
        });

        slides = Array.from(el.track.children);
        go(0, true);
      }

      function go(n, instant){
        if (!slides.length) return;
        idx = (n + slides.length) % slides.length;
        const offset = -idx * 100;
        el.track.style.transition = instant ? 'none' : '';
        el.track.style.transform = 'translateX(' + offset + '%)';
        Array.from(el.dots.children).forEach((d,i)=>d.setAttribute('aria-selected', i===idx?'true':'false'));
      }

      function next(){ go(idx + 1); }
      function prev(){ go(idx - 1); }

      function start(){
        stop();
        timer = setInterval(()=>{ if(!hovering && !touching) next(); }, conf.interval);
      }
      function stop(){ if (timer) { clearInterval(timer); timer = null; } }

      // Events
      el.next.addEventListener('click', next);
      el.prev.addEventListener('click', prev);
      el.slider.addEventListener('mouseenter', ()=>{ hovering = true; stop(); });
      el.slider.addEventListener('mouseleave', ()=>{ hovering = false; start(); });
      // Keyboard
      el.slider.tabIndex = 0;
      el.slider.addEventListener('keydown', (e)=>{
        if (e.key === 'ArrowRight') next();
        if (e.key === 'ArrowLeft') prev();
      });
      // Touch
      el.slider.addEventListener('touchstart', (e)=>{ touching = true; touchX = e.touches[0].clientX; stop(); }, {passive:true});
      el.slider.addEventListener('touchmove', (e)=>{
        const dx = e.touches[0].clientX - touchX;
        if (Math.abs(dx) > 40) {
          if (dx < 0) next(); else prev();
          touchX = e.touches[0].clientX;
        }
      }, {passive:true});
      el.slider.addEventListener('touchend', ()=>{ touching = false; start(); });

      render(items && items.length ? items.slice(0, conf.limit) : fallbackInline());
      start();
    }

    // Boot: IG-first, fallback to inline
    tryInstagram().then(items => initWith(items)).catch(() => initWith([]));
  };

  window.ASA_Slider = Slider;
  if (document.querySelector('#recent-showcase')) new Slider();
})();
