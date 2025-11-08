// American Skin Art — main.js (asa-v1)
(function(){
  // Guard double-insert
  if (document.getElementById('ig-fab')) return;

  const href = 'https://instagram.com/ffogekaj';
  const pfp = '/assets/img/ui/creator-pfp.png'; // keep this path stable across pages

  const a = document.createElement('a');
  a.href = href;
  a.target = '_blank';
  a.rel = 'noopener';
  a.className = 'ig-fab';
  a.setAttribute('aria-label', 'Visit @ffogekaj on Instagram');
  a.id = 'ig-fab';

  const wrap = document.createElement('div');
  wrap.className = 'wrap';

  const img = document.createElement('img');
  img.src = pfp;
  img.alt = '';

  wrap.appendChild(img);
  a.appendChild(wrap);
  document.body.appendChild(a);
})();
