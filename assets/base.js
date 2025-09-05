/*
  © 2024 KondaSoft
  https://www.kondasoft.com
*/

console.log('KS BootShop - Free Shopify Theme by KondaSoft.com | Learn more at https://www.kondasoft.com')

// Init Bootstrap tooltips
document.querySelectorAll('[data-bs-toggle="tooltip"]')
  .forEach((el) => new window.bootstrap.Tooltip(el))

// Init Bootstrap popovers
document.querySelectorAll('[data-bs-toggle="popover"]')
  .forEach((el) => new window.bootstrap.Popover(el))

// Debouce
window.theme.debounce = function (callback, wait = 200) {
  let timeout
  return (...args) => {
    const context = this
    clearTimeout(timeout)
    timeout = setTimeout(() => callback.apply(context, args), wait)
  }
}

// Throttle
window.theme.throttle = function (callback, timeFrame = 200) {
  let lastTime = 0
  return function () {
    const now = Date.now()
    if (now - lastTime >= timeFrame) {
      callback()
      lastTime = now
    }
  }
}

// Create cookie
window.theme.createCookie = function (name, value, days) {
  let date, expires
  if (days) {
    date = new Date()
    date.setDate(date.getDate() + days)
    expires = '; expires=' + date.toUTCString()
  } else {
    expires = ''
  }
  document.cookie = name + '=' + value + expires + '; path=/'
}

// Detect scroll
window.addEventListener('scroll', () => {
  if (window.scrollY > 0) {
    document.documentElement.classList.add('has-scrolled')
  } else {
    document.documentElement.classList.remove('has-scrolled')
  }
})

// Calculate "xx time ago"
window.theme.calcTimeAgo = function (timestamp) {
  const now = new Date().getTime()
  const diff = now - timestamp

  let text

  if (diff < 60000) {
    text = window.theme.locales.times.moments
  } else if (diff < 3.6e+6) {
    const min = Math.round((diff) / 60000)
    text = min === 1
      ? `${min} ${window.theme.locales.times.minute}`
      : `${min} ${window.theme.locales.times.minutes}`
  } else if (diff < 8.64e+7) {
    const hours = Math.round((diff) / 3.6e+6)
    text = hours === 1
      ? `${hours} ${window.theme.locales.times.hour}`
      : `${hours} ${window.theme.locales.times.hours}`
  } else {
    const days = Math.round((diff) / 8.64e+7)
    text = days === 1
      ? `${days} ${window.theme.locales.times.day}`
      : `${days} ${window.theme.locales.times.days}`
  }

  return `${text} ${window.theme.locales.times.ago}`
}

// Format money
window.Shopify.formatMoney = function (cents, moneyFormat = window.Shopify.moneyFormat) {
  if (typeof cents === 'string') {
    cents = cents.replace('.', '')
  }

  let value = ''
  const placeholderRegex = /\{\{\s*(\w+)\s*\}\}/

  function defaultOption (opt, def) {
    return (typeof opt === 'undefined' ? def : opt)
  }

  function formatWithDelimiters (number, precision, thousands, decimal) {
    precision = defaultOption(precision, 2)
    thousands = defaultOption(thousands, ',')
    decimal = defaultOption(decimal, '.')

    if (isNaN(number) || number == null) {
      return 0
    }

    number = (number / 100.0).toFixed(precision)

    const parts = number.split('.')
    const dollars = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands)
    const cents = parts[1] ? (decimal + parts[1]) : ''

    return dollars + cents
  }

  switch (moneyFormat.match(placeholderRegex)[1]) {
  case 'amount':
    value = formatWithDelimiters(cents, 2)
    break
  case 'amount_no_decimals':
    value = formatWithDelimiters(cents, 0)
    break
  case 'amount_with_comma_separator':
    value = formatWithDelimiters(cents, 2, '.', ',')
    break
  case 'amount_no_decimals_with_comma_separator':
    value = formatWithDelimiters(cents, 0, '.', ',')
    break
  }

  return moneyFormat.replace(placeholderRegex, value)
}

// Resize images
window.Shopify.resizeImage = function (src, size, crop = '') {
  return src.replace(/_(pico|icon|thumb|small|compact|medium|large|grande|original|1024x1024|2048x2048|master)+\./g, '.')
    .replace(/\.jpg|\.png|\.gif|\.jpeg/g, (match) => {
      if (crop.length) {
        crop = `_crop_${crop}`
      }
      return `_${size}${crop}${match}`
    })
}

// Shopify's callenge page
document.querySelector('.btn.shopify-challenge__button')
  ?.classList.add('btn-primary')

// Shopify's errors messages
const errors = document.querySelector('.errors')
if (errors) {
  errors.classList.add('alert', 'alert-danger')
}

// Wrap Shopify's section apps within a container
document.querySelectorAll('.shopify-section > .shopify-app-block').forEach(elem => {
  elem.classList.add('container')
})

// Detect viewport with the Intersection Observer API
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('viewport-entered')
    } else {
      entry.target.classList.remove('viewport-entered')
    }
  })
}, { threshold: 0.4 })

document.querySelectorAll('.viewport-detect').forEach((el) => {
  observer.observe(el)
})

// Swiper Slider
class SwiperSlider extends HTMLElement {
  constructor () {
    super()

    this.init()

    document.addEventListener('shopify:section:load', (event) => {
      if (event.detail.sectionId === this.dataset.sectionId) {
        this.init()
      }
    })
  }

  init () {
    this.slider = new window.Swiper(this.querySelector('.swiper'), {
      speed: this.speed,
      autoplay: this.autoplay,
      navigation: this.navigation,
      pagination: this.pagination,
      scrollbar: this.scrollbar,
      breakpoints: this.breakpoints,
      rewind: true
    })
  }

  speed = Number(this.dataset.sliderSpeed)

  autoplay = this.dataset.sliderAutoplay === '0'
    ? undefined
    : { delay: Number(this.dataset.sliderAutoplay) * 1000 }

  navigation = {
    enabled: this.dataset.sliderNavigation === 'true',
    prevEl: '.swiper-button-prev',
    nextEl: '.swiper-button-next'
  }

  pagination = {
    enabled: this.dataset.sliderPagination === 'true',
    el: '.swiper-pagination',
    type: 'bullets',
    dynamicBullets: true,
    dynamicMainBullets: 2,
    renderFraction: function (currentClass, totalClass) {
      return `<span class="${currentClass}"></span>/<span class="${totalClass}"></span>`
    }
  }

  scrollbar = {
    enabled: this.dataset.sliderScrollbar === 'true',
    el: this.querySelector('.swiper-scrollbar'),
    draggable: true
  }

  breakpoints = {
    0: { slidesPerView: Number(this.dataset.breakpointMobile) },
    600: { slidesPerView: Number(this.dataset.breakpointTablet) },
    1200: { slidesPerView: Number(this.dataset.breakpointDesktop) }
  }
}
customElements.define('swiper-slider', SwiperSlider)

/*
  Localization form
*/
document.querySelectorAll('.shopify-localization-form button').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.closest('form').querySelector('[name="country_code"]').value = btn.dataset.isoCode
    btn.closest('form').submit()
  })
})

// Hover Dropdown Menu Enhancement
document.addEventListener('DOMContentLoaded', function() {
  const dropdowns = document.querySelectorAll('.nav-desktop-menu .dropdown');
  
  dropdowns.forEach(dropdown => {
    const dropdownMenu = dropdown.querySelector('.dropdown-menu');
    let timeout;
    
    // 鼠标进入主菜单项
    dropdown.addEventListener('mouseenter', function() {
      clearTimeout(timeout);
      dropdownMenu.style.display = 'block';
      setTimeout(() => {
        dropdownMenu.style.opacity = '1';
        dropdownMenu.style.visibility = 'visible';
      }, 10);
    });
    
    // 鼠标离开主菜单项
    dropdown.addEventListener('mouseleave', function() {
      timeout = setTimeout(() => {
        dropdownMenu.style.opacity = '0';
        dropdownMenu.style.visibility = 'hidden';
        setTimeout(() => {
          dropdownMenu.style.display = 'none';
        }, 300);
      }, 200); // 增加延迟时间，给用户更多时间移动到mega menu
    });
    
    // 鼠标进入子菜单
    dropdownMenu.addEventListener('mouseenter', function() {
      clearTimeout(timeout);
    });
    
    // 鼠标离开子菜单
    dropdownMenu.addEventListener('mouseleave', function() {
      timeout = setTimeout(() => {
        dropdownMenu.style.opacity = '0';
        dropdownMenu.style.visibility = 'hidden';
        setTimeout(() => {
          dropdownMenu.style.display = 'none';
        }, 150);
      }, 150);
    });
  });
  
  // 为产品卡片添加点击事件
  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', function(e) {
      // 这里可以添加跳转到产品页面的逻辑
      console.log('Product card clicked:', this.querySelector('.product-name').textContent);
    });
  });
});

(function () {
  const cards = document.querySelectorAll('.product-card__media-wrapper.has-hover-video');

  cards.forEach(card => {
    const videoWrap = card.querySelector('.product-card__video-wrap');
    const video = videoWrap ? videoWrap.querySelector('video') : null;
    if (!video) return;

    // 懒加载视频源：首次悬浮再加载资源
    // 如果 Shopify 已直接输出 <source src="..."> 就不需要这段。
    // 若你想更极致，可在 Liquid 里去掉 src，改成 data-src，然后这里赋值。
    const ensureLoaded = () => {
      // 例：把 <source data-src="xxx.mp4"> 转成 src
      const sources = video.querySelectorAll('source[data-src]');
      sources.forEach(s => {
        s.setAttribute('src', s.getAttribute('data-src'));
        s.removeAttribute('data-src');
      });
      // 若没有 <source> 而是 video[src]，可以类似处理
      if (video.hasAttribute('data-src') && !video.getAttribute('src')) {
        video.setAttribute('src', video.getAttribute('data-src'));
        video.removeAttribute('data-src');
      }
      // 让浏览器开始加载
      try { video.load(); } catch (e) {}
    };

    // 桌面：hover 播放、离开暂停
    const onEnter = () => {
      ensureLoaded();
      card.classList.add('hovering');
      // 静音才能自动播放，已在 Liquid 指定 muted/playsinline
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {/* 忽略自动播放被阻止的情况 */});
      }
      videoWrap.hidden = false;
    };

    const onLeave = () => {
      card.classList.remove('hovering');
      video.pause();
      video.currentTime = 0; // 回到开头
      videoWrap.hidden = true;
    };

    // 仅在支持 hover 的设备上启用悬浮交互
    const mql = window.matchMedia('(hover:hover) and (pointer:fine)');
    if (mql.matches) {
      card.addEventListener('mouseenter', onEnter);
      card.addEventListener('mouseleave', onLeave);
      card.addEventListener('focusin', onEnter);   // 键盘可达
      card.addEventListener('focusout', onLeave);
    }

    // 触屏设备：点按一次切换播放（可选）
    card.addEventListener('click', (e) => {
      if (mql.matches) return; // 桌面已处理
      if (video.paused) {
        ensureLoaded();
        videoWrap.hidden = false;
        card.classList.add('hovering');
        video.play();
      } else {
        video.pause();
        video.currentTime = 0;
        card.classList.remove('hovering');
        videoWrap.hidden = true;
      }
      // 不阻止默认，保证点击仍可进商品页；如果你希望点击只预览，可以 e.preventDefault()
    }, { passive: true });
  });
})();
