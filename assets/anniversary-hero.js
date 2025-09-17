// Anniversary Hero Countdown Timer
(function(){
  var root = document.currentScript.closest('section');
  var el = root.querySelector('.countdown');
  if(!el) return;
  var endRaw = el.getAttribute('data-end');
  // 支持 2 种输入格式：
  // 1) 2025-08-31 23:59:59
  // 2) 2025-08-31T23:59:59+08:00
  var endTime = isNaN(Date.parse(endRaw)) ? new Date(endRaw.replace(/ /g,'T')).getTime() : new Date(endRaw).getTime();

  function pad(n){ return n < 10 ? '0' + n : '' + n }
  function tick(){
    var now = new Date().getTime();
    var diff = Math.max(0, endTime - now);
    var d = Math.floor(diff / (1000*60*60*24));
    var h = Math.floor((diff % (1000*60*60*24)) / (1000*60*60));
    var m = Math.floor((diff % (1000*60*60)) / (1000*60));
    var s = Math.floor((diff % (1000*60)) / 1000);
    el.querySelector('.js-days').textContent = pad(d);
    el.querySelector('.js-hours').textContent = pad(h);
    el.querySelector('.js-mins').textContent = pad(m);
    el.querySelector('.js-secs').textContent = pad(s);
    if(diff <= 0) clearInterval(t);
  }
  tick();
  var t = setInterval(tick, 1000);
})();
