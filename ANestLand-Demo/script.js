'use strict';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const header = document.querySelector('.site-header');
const utilityBar = document.createElement('div');
utilityBar.className = 'utility-bar';
utilityBar.innerHTML = '<ul><li><svg aria-hidden="true"><use href="#i-nest"/></svg><span>Yến sào tuyển chọn</span></li><li><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 5h12v12H2Zm12 4h4l4 4v4h-8"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></svg><span>Giao hàng toàn quốc</span></li><li><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 13v-1a8 8 0 0 1 16 0v1M4 12H2v7h4v-7Zm16 0h2v7h-4v-7Zm0 7c0 3-4 3-7 3"/></svg><span>Tư vấn &amp; hỗ trợ</span></li></ul>';
header.before(utilityBar);
const backTop = document.querySelector('.back-top');
const menuToggle = document.querySelector('#menu-toggle');
const mobileNav = document.querySelector('#mobile-nav');
const toast = document.querySelector('.toast');
function positionToastBelowHeader() {
  document.documentElement.style.setProperty('--toast-header-height', Math.max(0, header.getBoundingClientRect().bottom) + 'px');
  utilityBar.style.setProperty('--language-header-height', header.offsetHeight + 'px');
}
positionToastBelowHeader();
if ('ResizeObserver' in window) new ResizeObserver(positionToastBelowHeader).observe(header);
else window.addEventListener('resize', positionToastBelowHeader);
// Demo destinations stay local until official contact URLs are supplied.
const floatingContact = document.createElement('nav');
floatingContact.className = 'floating-contact';
floatingContact.setAttribute('aria-label', 'Liên hệ nhanh ANestLand');
floatingContact.innerHTML = '<a class="floating-contact-link contact-facebook" href="contact.html?channel=facebook" aria-label="Liên hệ qua Messenger"><img src="assets/icons/contact-messenger.svg" width="54" height="54" alt="" aria-hidden="true"><span>Messenger</span></a><a class="floating-contact-link contact-zalo" href="contact.html?channel=zalo" aria-label="Liên hệ qua Zalo"><img src="assets/icons/contact-zalo.svg" width="54" height="54" alt="" aria-hidden="true"><span>Zalo</span></a><a class="floating-contact-link contact-phone" href="contact.html?channel=phone" aria-label="Gọi điện"><img src="assets/icons/contact-phone.svg" width="54" height="54" alt="" aria-hidden="true"><span>Gọi điện</span></a>';
document.body.append(floatingContact);
document.querySelector('.article-end-top')?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'instant' : 'smooth' }));
// Only home waits for a scroll; reveal state belongs to this document visit.
const contactsOnHome = /\/(?:index\.html)?$/.test(window.location.pathname);
let contactsEntered = false;
function revealContacts() {
  if (contactsEntered || (contactsOnHome && window.scrollY < 24)) return;
  contactsEntered = true;
  floatingContact.classList.add('has-entered');
  window.removeEventListener('scroll', revealContacts);
}
function syncContactMotion() {
  floatingContact.classList.toggle('is-page-hidden', document.hidden);
  revealContacts();
}
window.addEventListener('scroll', revealContacts, { passive: true });
window.addEventListener('pageshow', event => {
  if (event.persisted && contactsOnHome) {
    contactsEntered = false;
    floatingContact.classList.remove('has-entered');
    window.addEventListener('scroll', revealContacts, { passive: true });
  } else revealContacts();
});
document.addEventListener('visibilitychange', syncContactMotion);
reducedMotion.addEventListener('change', syncContactMotion);
syncContactMotion();
requestAnimationFrame(revealContacts);

let toastTimer;
function hideToast() {
  toast.classList.remove('visible');
  const link = toast.querySelector('a');
  if (link) {
    link.tabIndex = -1;
    // Keep the toast's width stable until its fade-out finishes.
    setTimeout(() => { if (!toast.classList.contains('visible') && toast.contains(link)) link.remove(); }, reducedMotion.matches ? 0 : 260);
  }
}
function notify(message) {
  positionToastBelowHeader();
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(hideToast, 3800);
}
function updateHeader() {
  // A 30px hysteresis covers the 28px shrink so scroll anchoring cannot toggle it repeatedly.
  header.classList.toggle('scrolled', window.scrollY > (header.classList.contains('scrolled') ? 5 : 35));
  backTop?.classList.toggle('visible', window.scrollY > 600);
}
window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();
// Desktop uses its navbar; narrow layouts use the popover with a separate account button.
const narrowNavigation = window.matchMedia('(max-width: 1023px)');
mobileNav.querySelector('.mobile-account-entry')?.remove();
const menuPopover = document.createElement('div');
menuPopover.className = 'navigation-popover'; menuPopover.hidden = true;
mobileNav.before(menuPopover); menuPopover.append(mobileNav);
const accountAvatar = document.createElement('button');
accountAvatar.type = 'button'; accountAvatar.id = 'account-avatar'; accountAvatar.className = 'account-avatar';
accountAvatar.setAttribute('aria-controls','account-menu');
accountAvatar.setAttribute('aria-haspopup','dialog'); accountAvatar.setAttribute('aria-expanded','false');
accountAvatar.innerHTML = '<span class="account-avatar-surface"><img src="assets/icons/default-avatar.svg" width="38" height="38" alt="" aria-hidden="true"></span>';
menuToggle.after(accountAvatar);
const headerFavorite = document.createElement('button');
headerFavorite.type = 'button'; headerFavorite.id = 'header-favorite'; headerFavorite.className = 'account-menu-item account-wishlist';
headerFavorite.setAttribute('aria-label', 'Sản phẩm yêu thích');
headerFavorite.setAttribute('aria-haspopup', 'dialog'); headerFavorite.setAttribute('aria-controls', 'favorites-dialog');
headerFavorite.setAttribute('aria-expanded', 'false');
headerFavorite.textContent = 'Danh sách yêu thích';
headerFavorite.dataset.i18n = 'Danh sách yêu thích';
headerFavorite.addEventListener('click', openFavorites);
const accountMenu = document.createElement('section');
accountMenu.id = 'account-menu'; accountMenu.className = 'account-menu'; accountMenu.hidden = true;
accountMenu.setAttribute('role', 'dialog'); accountMenu.setAttribute('aria-modal', 'false');
accountMenu.setAttribute('aria-labelledby', 'account-menu-title');
accountMenu.innerHTML = '<h2 id="account-menu-title" class="sr-only" data-i18n="Tài khoản">Tài khoản</h2><button type="button" class="account-menu-item" data-account-action="login" data-i18n="Đăng nhập">Đăng nhập</button><button type="button" class="account-menu-item" data-account-action="register" data-i18n="Đăng ký">Đăng ký</button><button type="button" class="account-menu-item" data-account-action="account" data-i18n="Tài khoản" hidden>Tài khoản</button><button type="button" class="account-menu-item" data-account-action="logout" data-i18n="Đăng xuất" hidden>Đăng xuất</button>';
accountMenu.append(headerFavorite); header.append(accountMenu);
utilityBar.append(document.querySelector('.language-selector'));
const brandNavigation = document.createElement('div'); brandNavigation.className = 'header-brand-nav';
const headerLogo = header.querySelector('.logo'); headerLogo.before(brandNavigation);
brandNavigation.append(headerLogo, menuToggle);
function closeAccountMenu(restoreFocus = false) {
  accountMenu.hidden = true; accountAvatar.setAttribute('aria-expanded', 'false');
  if (restoreFocus) accountAvatar.focus({ preventScroll: true });
}
function openAccountMenu() {
  if (document.querySelector('dialog[open]')) return;
  closeMenu(); closeSearch(); closeMiniCart(); updateAccountAvatar();
  closeHeaderLanguage();
  accountMenu.hidden = false; accountAvatar.setAttribute('aria-expanded', 'true');
  positionAccountMenu();
  accountMenu.querySelector('button:not([hidden])').focus({ preventScroll: true });
}
accountAvatar.addEventListener('click', () => accountMenu.hidden ? openAccountMenu() : closeAccountMenu(true));
accountMenu.addEventListener('click', event => {
  const action = event.target.closest('[data-account-action]')?.dataset.accountAction;
  if (!action) return;
  if (action === 'logout') {
    memoryLoginState = false;
    try { sessionStorage.removeItem(loginStateKey); localStorage.removeItem(loginStateKey); } catch { /* Presentation-only state. */ }
    updateAccountAvatar(); closeAccountMenu(true);
  } else openAccount(event.target.closest('button'), action === 'register' ? 'register' : 'login');
});
document.addEventListener('pointerdown', event => {
  if (!accountMenu.contains(event.target) && !accountAvatar.contains(event.target)) closeAccountMenu();
});
document.addEventListener('focusin', event => {
  if (!accountMenu.contains(event.target) && !accountAvatar.contains(event.target)) closeAccountMenu();
});
accountMenu.addEventListener('keydown', event => {
  if (event.key === 'Escape') { event.preventDefault(); closeAccountMenu(true); }
});
function closeHeaderLanguage() {
  document.querySelector('.language-options')?.setAttribute('hidden', '');
  document.querySelector('.language-trigger')?.setAttribute('aria-expanded', 'false');
}
function positionAccountMenu() {
  if (accountMenu.hidden) return;
  const bounds = header.getBoundingClientRect(), avatar = accountAvatar.getBoundingClientRect();
  const width = accountMenu.offsetWidth;
  const left = Math.max(8, Math.min(avatar.right - width, document.documentElement.clientWidth - width - 8));
  accountMenu.style.left = (left - bounds.left) + 'px';
  accountMenu.style.top = (avatar.bottom - bounds.top - header.clientTop + 8) + 'px';
  accountMenu.style.setProperty('--account-caret-x', ((avatar.left + avatar.right) / 2 - left) + 'px');
}
new ResizeObserver(positionAccountMenu).observe(header);
window.addEventListener('resize', positionAccountMenu);
window.addEventListener('scroll', positionAccountMenu, { passive: true });
document.querySelector('.language-trigger').addEventListener('click', () => {
  closeAccountMenu(); closeMenu(); closeSearch(); closeMiniCart();
});
window.ANestI18n?.refresh(accountMenu);
let menuAnimation;
function positionMenu() {
  if(menuPopover.hidden) return;
  const bounds=header.getBoundingClientRect(),button=menuToggle.getBoundingClientRect();
  const width=menuPopover.offsetWidth;
  const left=Math.max(8,Math.min(button.left,document.documentElement.clientWidth-width-8));
  menuPopover.style.left=(left-bounds.left)+'px';
  menuPopover.style.setProperty('--menu-caret-x',Math.max(18,Math.min(width-18,(button.left+button.right)/2-left))+'px');
}
function closeMenu(immediate = true, restoreFocus = false) {
  menuAnimation?.cancel();
  menuToggle.setAttribute('aria-expanded','false');
  menuToggle.setAttribute('aria-label',window.ANestI18n?.text('Mở menu điều hướng') || 'Mở menu điều hướng');
  menuToggle.setAttribute('aria-controls','mobile-nav');
  const finish=()=>{menuPopover.hidden=true;mobileNav.hidden=true;};
  if(immediate || reducedMotion.matches || menuPopover.hidden) finish();
  else {
    menuAnimation=menuPopover.animate([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(-6px)'}],{duration:180,easing:'ease-in'});
    menuAnimation.finished.then(finish).catch(()=>{});
  }
  if(restoreFocus) menuToggle.focus({preventScroll:true});
}
menuToggle.addEventListener('click', () => {
  if (!narrowNavigation.matches) return;
  closeAccountMenu();
  if(menuToggle.getAttribute('aria-expanded')==='true'){closeMenu(false);return;}
  closeSearch(); closeMiniCart();
  document.querySelector('.language-options')?.setAttribute('hidden','');
  document.querySelector('.language-trigger')?.setAttribute('aria-expanded','false');
  menuAnimation?.cancel(); mobileNav.hidden=false;menuPopover.hidden=false;
  menuToggle.setAttribute('aria-expanded','true');menuToggle.setAttribute('aria-label',window.ANestI18n?.text('Đóng menu điều hướng') || 'Đóng menu điều hướng');
  positionMenu();
  if(!reducedMotion.matches) menuAnimation=menuPopover.animate([{opacity:0,transform:'translateY(-6px)'},{opacity:1,transform:'translateY(0)'}],{duration:220,easing:'ease-out'});
});
new ResizeObserver(positionMenu).observe(header.querySelector('.header-tools'));
new ResizeObserver(positionMenu).observe(menuToggle);
new ResizeObserver(positionMenu).observe(header);
window.addEventListener('resize',positionMenu);
closeMenu();
narrowNavigation.addEventListener('change', event => {
  if (event.matches) return;
  const restoreFocus = menuPopover.contains(document.activeElement) || document.activeElement === menuToggle;
  closeMenu();
  if (restoreFocus) (header.querySelector('.desktop-nav a.active') || header.querySelector('.desktop-nav a'))?.focus({ preventScroll: true });
});
mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('click', event => {
  if (!menuPopover.contains(event.target) && !menuToggle.contains(event.target)) closeMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded')==='true') {event.preventDefault();closeMenu(false,true);}
});
menuToggle.addEventListener('keydown',event=>{
  if(event.key==='ArrowDown'){event.preventDefault();if(menuPopover.hidden)menuToggle.click();mobileNav.querySelector('a').focus();}
});
menuPopover.addEventListener('focusout',event=>{if(!menuPopover.contains(event.relatedTarget) && event.relatedTarget!==menuToggle)closeMenu();});

const currentPage = location.pathname.split('/').pop() || 'index.html';
const backFallbacks = {
  'product-detail.html': 'products.html',
  'blog-detail.html': 'blog.html'
};
if (backFallbacks[currentPage]) {
  const breadcrumb = document.querySelector('.breadcrumbs');
  if (breadcrumb) {
    const backButton = document.createElement('button');
    backButton.type = 'button';
    backButton.className = 'context-back';
    backButton.dataset.backFallback = backFallbacks[currentPage];
    backButton.innerHTML = '<svg class="context-back-arrow return-arrow" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9 4 4 9l5 5M4 9h9a7 7 0 0 1 7 7v4"/></svg><span data-i18n="nav.back">QUAY LẠI</span>';
    breadcrumb.after(backButton);
    window.ANestI18n?.refresh(backButton);
    backButton.addEventListener('click', () => {
      let previous;
      try { previous = document.referrer ? new URL(document.referrer) : null; }
      catch { previous = null; }
      const internalPages = new Set(['index.html','about.html','products.html','product-detail.html','values.html','blog.html','blog-detail.html','contact.html','cart.html','checkout.html']);
      const previousPage = previous?.pathname.split('/').pop() || 'index.html';
      const currentLocation = location.pathname + location.search;
      const previousLocation = previous ? previous.pathname + previous.search : '';
      if (previous?.origin === location.origin && internalPages.has(previousPage) && previousLocation !== currentLocation) {
        history.back();
        return;
      }
      location.href = backButton.dataset.backFallback;
    });
  }
}
// Reuse the same text-free brand transition after the content on every site page.
if (['index.html', 'about.html', 'products.html', 'product-detail.html', 'values.html', 'blog.html', 'blog-detail.html', 'contact.html', 'cart.html', 'checkout.html'].includes(currentPage)) {
  const footer = document.querySelector('#footer');
  if (footer) {
    const brandDecor = document.createElement('div');
    brandDecor.className = 'pre-footer-brand';
    brandDecor.setAttribute('aria-hidden', 'true');
    brandDecor.innerHTML = '<img class="pre-footer-bird bird-left" src="assets/images/decor-swiftlet.png" width="1536" height="1024" alt="" loading="lazy" decoding="async"><img class="pre-footer-nest" src="assets/images/pre-footer-nest.png" width="1774" height="887" alt="" loading="lazy" decoding="async"><img class="pre-footer-bird bird-right" src="assets/images/decor-swiftlet.png" width="1536" height="1024" alt="" loading="lazy" decoding="async">';
    footer.before(brandDecor);
  }
}
const editorialMotionPages = ['index.html', 'about.html', 'values.html', 'contact.html'];
// Preserve the pre-existing lightweight entrances on other pages; no new system there.
if (!editorialMotionPages.includes(currentPage) && 'IntersectionObserver' in window && !reducedMotion.matches) {
  document.body.classList.add('js-motion');
  const reveals = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        reveals.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(element => reveals.observe(element));
}
function setupEditorialMotion() {
  if (!editorialMotionPages.includes(currentPage) || reducedMotion.matches || !('IntersectionObserver' in window) || !Element.prototype.animate) return;
  const targets = new Set();
  const animations = new Set();
  const mobile = window.matchMedia('(max-width: 600px)').matches;
  let observer;
  const show = (element, immediately = false) => {
    if (!element.classList.contains('scroll-reveal-pending')) return;
    observer?.unobserve(element);
    const from = getComputedStyle(element).transform;
    element.classList.remove('scroll-reveal-pending');
    element.classList.add('scroll-reveal-complete');
    element.closest('.reveal')?.classList.add('is-visible');
    if (immediately || reducedMotion.matches) return;
    const animation = element.animate([{ opacity: 0, transform: from }, { opacity: 1, transform: 'none' }], {
      duration: mobile ? 450 : 600, delay: Number(element.dataset.scrollDelay) || 0,
      easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards'
    });
    animations.add(animation);
    animation.finished.catch(() => {}).finally(() => animations.delete(animation));
  };
  const restore = () => {
    observer?.disconnect();
    targets.forEach(element => show(element, true));
    animations.forEach(animation => animation.cancel());
    animations.clear();
  };
  const add = (element, kind = 'text', index = 0) => {
    if (!element || targets.has(element) || element.closest('form,.hero,.product-card,.contact-form')) return;
    targets.add(element);
    element.classList.add('scroll-reveal-pending', 'scroll-reveal-' + kind);
    element.dataset.scrollDelay = String(Math.min(index * (mobile ? 60 : 100), mobile ? 180 : 400));
    observer.observe(element);
  };
  try {
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) show(entry.target); });
    }, { rootMargin: '0px 0px -14% 0px', threshold: 0 });
    document.querySelectorAll('main .editorial-copy,main .section-heading,.philosophy .container,.contact-info,.newsletter-inner>div,.page-cta .container').forEach(group => {
      [...group.children].filter(element => !element.matches('.process,form,.contact-details,.contact-social,.contact-source')).forEach((element, index) => {
        add(element, element.matches('h1,h2,h3') ? 'heading' : 'text', index);
      });
    });
    document.querySelectorAll('main .story-visual,main .craft-visual,main .banner-visual').forEach(element => {
      element.classList.add(element.previousElementSibling?.matches('.editorial-copy') ? 'scroll-image-right' : 'scroll-image-left');
      add(element, 'image');
    });
    document.querySelectorAll('main .benefit-grid,main .process').forEach(grid => [...grid.children].forEach((element, index) => add(element, 'card', index)));
    if (currentPage === 'index.html') document.querySelectorAll('.blog-grid .blog-card').forEach((element, index) => add(element, 'card', index));
    const brand = document.querySelector('.footer-brand');
    [...(brand?.children || [])].forEach((element, index) => add(element, 'text', index));
    document.querySelectorAll('.footer-grid>div:not(.footer-brand)').forEach((element, index) => add(element, 'card', index + 2));
    if (currentPage === 'index.html') {
      [header.querySelector('.logo'),header.querySelector('.desktop-nav'),header.querySelector('.header-search-bar'),header.querySelector('#bag-toggle>svg'),header.querySelector('#menu-toggle>svg')].filter(Boolean).forEach((element, index) => {
        const animation = element.animate([{ opacity: 0, transform: 'translateY(-10px)' }, { opacity: 1, transform: 'none' }], { duration: 320, delay: index * 45, easing: 'ease-out', fill: 'backwards' });
        animations.add(animation);
        animation.finished.catch(() => {}).finally(() => animations.delete(animation));
      });
      const makeHeaderImmediate = () => { animations.forEach(animation => { if (header.contains(animation.effect?.target)) animation.cancel(); }); };
      header.addEventListener('pointerdown', makeHeaderImmediate, { once: true });
      header.addEventListener('focusin', makeHeaderImmediate, { once: true });
    }
    document.addEventListener('focusin', event => {
      const pending = event.target.closest('.scroll-reveal-pending');
      if (pending) show(pending, true);
    });
    // A fast scroll can skip a short element between observer samples.
    // Anything already passed is readable immediately and never replays.
    let scrollFrame = 0;
    window.addEventListener('scroll', () => {
      if (scrollFrame) return;
      scrollFrame = requestAnimationFrame(() => {
        scrollFrame = 0;
        targets.forEach(element => {
          if (element.classList.contains('scroll-reveal-pending') && element.getBoundingClientRect().bottom < 0) show(element, true);
        });
      });
    }, { passive: true });
    reducedMotion.addEventListener('change', event => { if (event.matches) restore(); });
  } catch { restore(); }
}
setupEditorialMotion();

// Animate decorative birds independently without replacing their mirrored transforms.
function setupBirdEntrance() {
  if (reducedMotion.matches || !('IntersectionObserver' in window)) return;
  const birds = document.querySelectorAll('.benefits .section-heading,.philosophy h2,.contact-info>h2,.pre-footer-bird');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('bird-entrance-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0, rootMargin: '0px 0px -8% 0px' });
  birds.forEach(bird => {
    bird.classList.add('bird-entrance');
    observer.observe(bird);
  });
  reducedMotion.addEventListener('change', event => {
    if (!event.matches) return;
    observer.disconnect();
    birds.forEach(bird => bird.classList.add('bird-entrance-visible'));
  });
}
setupBirdEntrance();
function updateNavigation() {
  const page = currentPage === 'product-detail.html' ? 'products.html' : currentPage === 'blog-detail.html' ? 'blog.html' : currentPage;
  document.querySelectorAll('.desktop-nav a, .mobile-nav a').forEach(link => {
    const target = link.getAttribute('href');
    const active = target === page;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', target.includes('#') ? 'location' : 'page');
    else link.removeAttribute('aria-current');
  });
}
updateNavigation();
window.addEventListener('hashchange', updateNavigation);

const hero = document.querySelector('.hero');
if (hero) {
const slides = [...document.querySelectorAll('.hero-slide')];
const slideButtons = [...document.querySelectorAll('.slide-dot')];
const heroProduct = document.querySelector('.hero-product');
const heroArt = document.querySelector('.hero-art');
const pauseButton = document.querySelector('.slider-pause');
let currentSlide = 0;
let slideTimer;
let userPaused = reducedMotion.matches;
let imageTimer;
// Artwork-space coordinates; product information awaits confirmed label copy.
const heroHotspots = [
  { size:1280, points:[[430,520]], paths:['M430 520 C650 550 770 180 1030 180'], target:[1030,180], label:'Xem thông tin sản phẩm', productId:'tao-do', details:[['Dung tích','70 ml'],['Hàm lượng yến','Liên hệ để biết thêm'],['Bảo quản','Liên hệ để biết thêm']] },
  { size:800, points:[[180,450],[360,430],[570,400]], paths:['M180 450 C140 280 260 140 400 120','M360 430 C340 280 360 190 400 120','M570 400 C600 250 530 130 400 120','M400 120 C480 60 570 65 650 90'], target:[650,90], label:'Xem thông tin hộp quà', productId:'hop-qua', details:[['Táo đỏ','Yến Chưng Táo Đỏ'],['Hạt sen','Yến Chưng Hạt Sen'],['Nguyên vị','Liên hệ để biết thêm']] }
];
let hotspotCardOpen = false;
let hotspotVersion = 0;
const hotspotLayer = document.createElement('div');
hotspotLayer.className = 'hero-hotspot-layer';
hotspotLayer.hidden = true;
// Keep existing decorative children silent, but expose the new button to AT.
heroArt.removeAttribute('aria-hidden');
[...heroArt.children].forEach(child => child.setAttribute('aria-hidden', 'true'));
heroArt.append(hotspotLayer);
let heroHintVisible = false;
function updateHotspotPointer() {
  hotspotLayer.classList.toggle('has-pointer-hint', heroHintVisible && !document.hidden && !reducedMotion.matches && !hotspotCardOpen && !hotspotLayer.hidden);
}
new IntersectionObserver(entries => {
  heroHintVisible = entries[0].isIntersecting;
  updateHotspotPointer();
}, { threshold: 0 }).observe(hero);
document.addEventListener('visibilitychange', updateHotspotPointer);
reducedMotion.addEventListener('change', updateHotspotPointer);
const hotspotCard = document.createElement('section');
hotspotCard.className = 'hero-hotspot-info';
hotspotCard.id = 'hero-hotspot-info';
hotspotCard.hidden = true;
hotspotCard.setAttribute('role', 'dialog');
hotspotCard.setAttribute('aria-modal', 'false');
hotspotCard.setAttribute('aria-labelledby', 'hero-hotspot-title');
hero.insertBefore(hotspotCard, document.querySelector('.hero-copy'));
const popupConnector = document.createElementNS('http://www.w3.org/2000/svg','svg');
popupConnector.classList.add('hero-popup-connector');
popupConnector.setAttribute('aria-hidden','true');
popupConnector.innerHTML = '<path pathLength="1"/><circle r="3"/>';
popupConnector.style.display = 'none';
hero.insertBefore(popupConnector,hotspotCard);
function updatePopupConnector() {
  const endpoint = hotspotLayer.querySelector('button');
  if (!hotspotCardOpen || !endpoint || matchMedia('(max-width:850px)').matches) {
    popupConnector.style.display = 'none'; return;
  }
  const dot = endpoint.getBoundingClientRect(), card = hotspotCard.getBoundingClientRect(), bounds = hero.getBoundingClientRect();
  const sx = (dot.left+dot.right)/2, sy = (dot.top+dot.bottom)/2;
  const clamp = (value,min,max)=>Math.max(min,Math.min(value,max));
  // Test all four edges, inset from rounded corners; choose the actual nearest.
  const candidates = [
    {x:card.left,y:clamp(sy,card.top+14,card.bottom-14),nx:-1,ny:0},
    {x:card.right,y:clamp(sy,card.top+14,card.bottom-14),nx:1,ny:0},
    {x:clamp(sx,card.left+14,card.right-14),y:card.top,nx:0,ny:-1},
    {x:clamp(sx,card.left+14,card.right-14),y:card.bottom,nx:0,ny:1}
  ].sort((a,b)=>Math.hypot(a.x-sx,a.y-sy)-Math.hypot(b.x-sx,b.y-sy));
  const edge=candidates[0], distance=Math.hypot(edge.x-sx,edge.y-sy);
  if ((sx>=card.left && sx<=card.right && sy>=card.top && sy<=card.bottom) || distance>Math.min(300,bounds.width*.35)) {
    popupConnector.style.display='none';return;
  }
  popupConnector.style.display='block';
  popupConnector.setAttribute('viewBox',`0 0 ${bounds.width} ${bounds.height}`);
  const x=sx-bounds.left,y=sy-bounds.top,ex=edge.x-bounds.left,ey=edge.y-bounds.top;
  const bend=Math.min(70,Math.max(16,distance*.4));
  const arc=Math.min(12,distance*.15);
  popupConnector.querySelector('path').setAttribute('d',`M${x} ${y} C${x+(ex-x)*.4+(edge.ny?arc:0)} ${y+(ey-y)*.4-(edge.nx?arc:0)} ${ex+edge.nx*bend} ${ey+edge.ny*bend} ${ex} ${ey}`);
  popupConnector.querySelector('circle').setAttribute('cx',ex);
  popupConnector.querySelector('circle').setAttribute('cy',ey);
}
function placeHotspots() {
  const style = getComputedStyle(heroProduct);
  Object.assign(hotspotLayer.style, {left:heroProduct.offsetLeft+'px',top:heroProduct.offsetTop+'px',width:heroProduct.offsetWidth+'px',height:heroProduct.offsetHeight+'px',transform:style.transform,translate:style.translate,transformOrigin:style.transformOrigin});
  const config = heroHotspots[currentSlide];
  const width = heroProduct.offsetWidth, height = heroProduct.offsetHeight;
  const scale = Math.min(width, height) / config.size;
  const endpoint = hotspotLayer.querySelector('button');
  if (endpoint) {
    endpoint.style.left = ((width-config.size*scale)/2+config.target[0]*scale)+'px';
    endpoint.style.top = ((height-config.size*scale)/2+config.target[1]*scale)+'px';
  }
  positionHotspotCard();
}
function positionHotspotCard() {
  if (!hotspotCardOpen) return;
  if (matchMedia('(max-width:850px)').matches) {
    hotspotCard.style.removeProperty('left');
    hotspotCard.style.removeProperty('top');
    hotspotCard.style.removeProperty('max-height');
    updatePopupConnector();
    return;
  }
  const dot = hotspotLayer.querySelector('button').getBoundingClientRect();
  const bounds = hero.getBoundingClientRect();
  const copy = hero.querySelector('.hero-copy').getBoundingClientRect();
  const gap = 16;
  const area = {left:Math.max(16,bounds.left+16),right:Math.min(innerWidth-16,copy.left-12),top:Math.max(header.getBoundingClientRect().bottom+12,bounds.top+12),bottom:Math.min(innerHeight-16,bounds.bottom-12)};
  hotspotCard.style.maxHeight = Math.max(100,area.bottom-area.top)+'px';
  const width = hotspotCard.offsetWidth, height = hotspotCard.offsetHeight;
  const clamp = (v,min,max) => Math.max(min,Math.min(v,Math.max(min,max)));
  const sources = [...hotspotLayer.querySelectorAll('.hero-hotspot-source')].map(el=>el.getBoundingClientRect());
  if (currentSlide===0) {
    // Protect the jar's central label/body as well as its source dot.
    const matrix=hotspotLayer.querySelector('svg').getScreenCTM();
    if (matrix) {
      const center=new DOMPoint(680,760).matrixTransform(matrix);
      sources.push({left:center.x-25,right:center.x+25,top:center.y-25,bottom:center.y+25});
    }
  }
  const overlaps = (a,b) => a.left<b.right && a.right>b.left && a.top<b.bottom && a.bottom>b.top;
  const candidates = [];
  [dot.top,dot.bottom-height,(dot.top+dot.bottom-height)/2].forEach(y=>{
    candidates.push([dot.left-gap-width,y],[dot.right+gap,y]);
  });
  [dot.left,dot.right-width,(dot.left+dot.right-width)/2].forEach(x=>{
    candidates.push([x,dot.top-gap-height],[x,dot.bottom+gap]);
  });
  const placements = candidates.map(([x,y])=>{
    const left=clamp(x,area.left,area.right-width), top=clamp(y,area.top,area.bottom-height);
    const rect={left,top,right:left+width,bottom:top+height};
    const collision = sources.filter(source=>overlaps(rect,source)).length;
    return {left,top,score:(overlaps(rect,dot)?1e6:0)+collision*1e4+Math.abs(left-x)+Math.abs(top-y)};
  }).sort((a,b)=>a.score-b.score);
  const best=placements[0];
  hotspotCard.style.left = (best.left-bounds.left)+'px';
  hotspotCard.style.top = (best.top-bounds.top)+'px';
  updatePopupConnector();
}
function closeHotspot(restoreFocus = false) {
  if (!hotspotCardOpen) return;
  hotspotCardOpen = false;
  hotspotCard.hidden = true;
  updateHotspotPointer();
  popupConnector.style.display = 'none';
  popupConnector.querySelector('path').removeAttribute('d');
  const endpoint = hotspotLayer.querySelector('button');
  endpoint?.setAttribute('aria-expanded', 'false');
  if (restoreFocus) endpoint?.focus({preventScroll:true});
  startSlider();
}
function openHotspot() {
  const config = heroHotspots[currentSlide];
  const product = catalog.find(item=>item.id===config.productId);
  hotspotCard.innerHTML = '<button type="button" class="hero-hotspot-close" aria-label="Đóng">×</button><h3 id="hero-hotspot-title"></h3><p></p><dl></dl><strong class="hero-hotspot-price"></strong><div class="hero-hotspot-actions"><button type="button" class="button hero-hotspot-add"></button><a class="button button-secondary"></a></div>';
  hotspotCard.querySelector('h3').textContent = product.name;
  hotspotCard.querySelector('p').textContent = product.description;
  config.details.forEach(([label,value]) => {
    const dt = document.createElement('dt'), dd = document.createElement('dd');
    dt.textContent = label;
    dd.textContent = value;
    hotspotCard.querySelector('dl').append(dt, dd);
  });
  displayPrice(hotspotCard.querySelector('.hero-hotspot-price'), product.price);
  const add = hotspotCard.querySelector('.hero-hotspot-add');
  add.textContent = currentSlide===1 ? 'THÊM HỘP QUÀ VÀO GIỎ' : 'THÊM VÀO GIỎ';
  add.addEventListener('click',()=>addToCart(product.id,1,add));
  const details = hotspotCard.querySelector('a');
  details.href = 'product-detail.html?product='+product.id;
  details.textContent = 'XEM CHI TIẾT';
  window.ANestI18n?.refresh(hotspotCard);
  hotspotCardOpen = true;
  updateHotspotPointer();
  hotspotCard.hidden = false;
  positionHotspotCard();
  if (!reducedMotion.matches && popupConnector.style.display !== 'none') {
    popupConnector.querySelector('path').getAnimations().forEach(animation=>animation.cancel());
    popupConnector.querySelector('path').animate([{strokeDashoffset:1},{strokeDashoffset:0}],{duration:400,easing:'ease-out'});
  }
  hotspotLayer.querySelector('button').setAttribute('aria-expanded','true');
  stopSlider();
  hotspotCard.querySelector('button').addEventListener('click', () => closeHotspot(true));
  hotspotCard.querySelector('button').focus({preventScroll:true});
}
async function activateHotspots() {
  const version = ++hotspotVersion;
  hotspotLayer.hidden = true;
  updateHotspotPointer();
  try { await heroProduct.decode(); } catch { return; }
  // Let the EXISTING image entrance/transform finish; never animate the image here.
  await Promise.allSettled(heroProduct.getAnimations().map(animation => animation.finished));
  if (version !== hotspotVersion) return;
  const config = heroHotspots[currentSlide];
  hotspotLayer.innerHTML = `<svg viewBox="0 0 ${config.size} ${config.size}" aria-hidden="true">${config.paths.map((path,i) => `<path d="${path}" pathLength="1" style="--draw-delay:${i===3?'.65s':'.15s'}"/>`).join('')}${config.points.map(([x,y]) => `<g class="hero-hotspot-source"><circle class="hero-hotspot-ring" cx="${x}" cy="${y}" r="16"/><circle cx="${x}" cy="${y}" r="8"/></g>`).join('')}</svg><button type="button" class="hero-hotspot-endpoint" aria-label="${config.label}" aria-controls="hero-hotspot-info" aria-expanded="false" style="--endpoint-delay:${currentSlide===1?'1.1s':'.75s'}"><span aria-hidden="true"></span><img class="hero-hotspot-pointer" src="assets/icons/hotspot-finger.svg" width="26" height="32" alt="" aria-hidden="true"></button>`;
  placeHotspots();
  hotspotLayer.hidden = false;
  updateHotspotPointer();
  window.ANestI18n?.refresh(hotspotLayer);
  hotspotLayer.querySelector('button').addEventListener('click', openHotspot);
}
new ResizeObserver(placeHotspots).observe(heroProduct);
new ResizeObserver(placeHotspots).observe(hero);
new ResizeObserver(positionHotspotCard).observe(hotspotCard);
window.addEventListener('resize',positionHotspotCard);
window.addEventListener('scroll',positionHotspotCard,{passive:true});
document.addEventListener('pointerdown', event => {
  if (hotspotCardOpen && !hotspotCard.contains(event.target) && !hotspotLayer.contains(event.target)) closeHotspot();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && hotspotCardOpen) { event.preventDefault(); closeHotspot(true); }
});
function setSlide(index) {
  if (index === currentSlide) return;
  closeHotspot();
  ++hotspotVersion;
  hotspotLayer.hidden = true;
  updateHotspotPointer();
  currentSlide = index;
  slides.forEach((slide, i) => {
    const active = i === index;
    slide.classList.toggle('is-active', active);
    slide.setAttribute('aria-hidden', String(!active));
    slide.inert = !active;
    slideButtons[i].classList.toggle('is-active', active);
    slideButtons[i].setAttribute('aria-pressed', String(active));
  });
  heroProduct.style.opacity = '0';
  clearTimeout(imageTimer);
  imageTimer = setTimeout(() => {
    heroProduct.src = index === 0 ? 'assets/images/hero-jar.png' : 'assets/images/gift-box.jpg';
    heroArt.classList.toggle('gift-slide', index === 1);
    heroProduct.style.opacity = '1';
    activateHotspots();
  }, reducedMotion.matches ? 0 : 400);
}
function stopSlider() { clearInterval(slideTimer); }
function startSlider() {
  stopSlider();
  if (!userPaused && !hotspotCardOpen && !document.hidden && !hero.matches(':focus-within')) {
    slideTimer = setInterval(() => setSlide((currentSlide + 1) % slides.length), 6000);
  }
}
slideButtons.forEach(button => button.addEventListener('click', () => {
  setSlide(Number(button.dataset.to));
  startSlider();
}));
function updatePauseButton() {
  pauseButton.textContent = userPaused ? '▷' : 'Ⅱ';
  pauseButton.setAttribute('aria-pressed', String(userPaused));
  pauseButton.setAttribute('aria-label', userPaused ? 'Tiếp tục trình chiếu' : 'Tạm dừng trình chiếu');
}
pauseButton.addEventListener('click', () => {
  userPaused = !userPaused;
  updatePauseButton();
  startSlider();
});
hero.addEventListener('mouseenter', stopSlider);
hero.addEventListener('mouseleave', startSlider);
hero.addEventListener('focusin', stopSlider);
hero.addEventListener('focusout', () => setTimeout(startSlider, 0));
document.addEventListener('visibilitychange', startSlider);
updatePauseButton();
startSlider();
activateHotspots();
}

// Process and Brand Showcases: 10s autoplay with manual reset, offscreen pause, and multilingual sync.
function setupCraftShowcase(sectionSelector, stages, customOptions = {}) {
  const section = document.querySelector(sectionSelector);
  const visual = section?.querySelector('.craft-visual, .about-journey-visual, .values-showcase-media');
  if (!section || !visual) return;
  const image = visual.querySelector('img');
  const caption = visual.querySelector('.craft-note');
  const controls = [...section.querySelectorAll('[data-process-step]')];
  if (!image || !controls.length) return;

  const prepared = stages.map(stage => {
    const preload = new Image();
    preload.src = stage.src;
    return preload.decode().then(() => true, () => false);
  });
  let selected = 0;
  let requested = 0;
  let revision = 0;
  let transition;
  let autoplayTimer = null;
  let isSectionVisible = false;

  function stopAutoplay() {
    if (autoplayTimer !== null) {
      clearTimeout(autoplayTimer);
      autoplayTimer = null;
    }
  }

  function scheduleAutoplay() {
    stopAutoplay();
    if (reducedMotion.matches || !isSectionVisible || document.hidden) return;
    autoplayTimer = setTimeout(() => {
      const nextIndex = (selected + 1) % stages.length;
      selectStage(nextIndex);
    }, 10000);
  }

  async function selectStage(index) {
    if (index === selected && index === requested) {
      scheduleAutoplay();
      return;
    }
    requested = index;
    const current = ++revision;
    transition?.cancel();
    visual.setAttribute('aria-busy', 'true');
    const ready = await prepared[index];
    if (current !== revision) return;
    if (!ready) {
      requested = selected;
      visual.removeAttribute('aria-busy');
      scheduleAutoplay();
      return;
    }
    try {
      if (!reducedMotion.matches) {
        transition = image.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, easing: 'ease-in-out', fill: 'forwards' });
        await transition.finished;
      }
      if (current !== revision) return;
      const stage = stages[index];
      image.src = stage.src;
      image.alt = window.ANestI18n?.text(stage.alt) || stage.alt;
      if (caption) caption.textContent = window.ANestI18n?.text(stage.caption) || stage.caption;
      controls.forEach((control, i) => {
        const isMatch = i === index;
        if (control.hasAttribute('aria-pressed')) control.setAttribute('aria-pressed', String(isMatch));
        if (control.hasAttribute('aria-selected')) control.setAttribute('aria-selected', String(isMatch));
      });
      selected = index;
      transition?.cancel();
      if (!reducedMotion.matches) {
        transition = image.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 180, easing: 'ease-in-out' });
        await transition.finished;
      }
    } catch (error) {
      if (error.name !== 'AbortError') throw error;
    } finally {
      if (current === revision) {
        visual.removeAttribute('aria-busy');
        scheduleAutoplay();
      }
    }
  }

  controls.forEach((control, index) => {
    control.addEventListener('click', () => {
      selectStage(index);
    });
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        isSectionVisible = entry.isIntersecting;
        if (isSectionVisible) {
          scheduleAutoplay();
        } else {
          stopAutoplay();
        }
      });
    }, { threshold: 0.2 });
    observer.observe(section);
  } else {
    isSectionVisible = true;
    scheduleAutoplay();
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAutoplay();
    } else if (isSectionVisible) {
      scheduleAutoplay();
    }
  });

  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) {
      stopAutoplay();
      if (transition?.playState === 'running') transition.finish();
    } else if (isSectionVisible && !document.hidden) {
      scheduleAutoplay();
    }
  });

  window.addEventListener('anestland:languagechange', () => {
    const stage = stages[selected];
    if (stage) {
      image.alt = window.ANestI18n?.text(stage.alt) || stage.alt;
      if (caption) caption.textContent = window.ANestI18n?.text(stage.caption) || stage.caption;
    }
  });
}

// 1. Homepage Craft Showcase
if (currentPage === 'index.html') {
  setupCraftShowcase('#craft', [
    { src: 'assets/images/process-selection.png', alt: 'Đôi bàn tay kiểm tra tổ yến thô trên khay tre', caption: 'Chọn những tổ yến nguyên vẹn.' },
    { src: 'assets/images/craftsmanship.jpg', alt: 'Đôi bàn tay tỉ mỉ làm sạch tổ yến bằng nhíp trên khay tre', caption: 'Tỉ mỉ từ những điều nhỏ nhất.' },
    { src: 'assets/images/gift-box.jpg', alt: 'Hộp quà yến sào được trình bày trang nhã', caption: 'Chăm chút đến khi trao tay.' }
  ]);
}

if (currentPage === 'about.html') {
  setupCraftShowcase('#craft', [
    { src: 'assets/images/refined-nest.jpg', alt: 'Những tổ yến tinh chế màu ngà', caption: 'Khởi đầu từ sự trân trọng.' },
    { src: 'assets/images/wellness-bowl.jpg', alt: 'Chén yến chưng táo đỏ bên khăn linen', caption: 'Chăm chút một khoảnh khắc mỗi ngày.' },
    { src: 'assets/images/value-family-ai.jpg', alt: 'Chén yến cho khoảnh khắc chăm sóc gia đình', caption: 'Món quà nối những yêu thương.' }
  ]);
}
if (currentPage === 'values.html') {
  setupCraftShowcase('#craft', [
    { src: 'assets/images/value-selection-ai.jpg', alt: 'Tổ yến thô được tuyển chọn', caption: 'Chọn kỹ để an tâm.' },
    { src: 'assets/images/lotus-jar.jpg', alt: 'Hũ yến chưng hạt sen', caption: 'Giữ nét thanh nhẹ tự nhiên.' },
    { src: 'assets/images/value-gift-ai.jpg', alt: 'Hộp quà yến sào trình bày trang nhã', caption: 'Tinh tế trong cách trao tặng.' }
  ]);
}

// This client-side flag controls presentation only, not server authentication.
const loginStateKey = 'anestland.isLoggedIn';
let memoryLoginState = false;
function hasLoginState() {
  try {
    return memoryLoginState || sessionStorage.getItem(loginStateKey) === 'true' || localStorage.getItem(loginStateKey) === 'true';
  } catch { return memoryLoginState; }
}
function rememberLogin(persistent) {
  memoryLoginState = true;
  try {
    // Never persist identity, password, or form data.
    sessionStorage.removeItem(loginStateKey);
    localStorage.removeItem(loginStateKey);
    (persistent ? localStorage : sessionStorage).setItem(loginStateKey, 'true');
  } catch { /* Restricted storage: keep the state for this page only. */ }
  updateAccountAvatar();
}
function updateAccountAvatar() {
  // No display name/photo is retained by the current account flow: keep the neutral avatar.
  accountAvatar.setAttribute('aria-label', window.ANestI18n?.text('Mở tài khoản') || 'Mở tài khoản');
  const loggedIn = hasLoginState();
  accountMenu.querySelectorAll('[data-account-action]').forEach(button => {
    button.hidden = ['login', 'register'].includes(button.dataset.accountAction) ? loggedIn : !loggedIn;
  });
}
updateAccountAvatar();
window.addEventListener('storage',updateAccountAvatar);
window.addEventListener('pageshow',updateAccountAvatar);
window.addEventListener('anestland:languagechange',()=>{updateAccountAvatar();positionMenu();});
function toggleWishlist(button) {
  const id = wishlistProductId(button);
  if (!id) return;
  const liked = !favoriteIds.has(id);
  if (liked) favoriteIds.add(id); else favoriteIds.delete(id);
  try { localStorage.setItem(favoriteStorageKey, JSON.stringify([...favoriteIds])); } catch { /* Keep this page's state when storage is unavailable. */ }
  syncFavorites();
  notify(liked ? 'Đã đánh dấu sản phẩm yêu thích.' : 'Đã bỏ đánh dấu yêu thích.');
}
const favoriteStorageKey = 'anestland.favoriteProducts';
function readFavoriteIds(fallback = new Set()) {
  try {
    const saved = JSON.parse(localStorage.getItem(favoriteStorageKey) || '[]');
    return new Set(Array.isArray(saved) ? saved.filter(id => typeof id === 'string') : []);
  } catch { return fallback; }
}
let favoriteIds = readFavoriteIds();
function wishlistProductId(button) {
  if (button.dataset.favoriteId) return button.dataset.favoriteId;
  const link = button.closest('.product-card')?.querySelector('.product-photo-link');
  return link ? new URL(link.href).searchParams.get('product') : currentPage === 'product-detail.html' ? new URLSearchParams(location.search).get('product') || 'tao-do' : null;
}
function syncFavorites() {
  document.querySelectorAll('.wishlist,#detail-wishlist').forEach(button => button.setAttribute('aria-pressed', String(favoriteIds.has(wishlistProductId(button)))));
  headerFavorite.classList.toggle('has-favorites', catalog.some(product => favoriteIds.has(product.id)));
  if (favoritesDialog.open) renderFavorites();
}
document.querySelectorAll('.wishlist').forEach(button => button.addEventListener('click', () => toggleWishlist(button)));

const filterButtons = [...document.querySelectorAll('[data-filter]')];
const products = [...document.querySelectorAll('.product-card')];
const collectionProducts = [...document.querySelectorAll('.collection-section .product-card')];
// Move the existing filter controls, rather than introducing another filter state.
if (currentPage === 'products.html') {
  const section = document.querySelector('.collection-section');
  const main = document.createElement('div');
  main.className = 'collection-main';
  main.append(...section.childNodes);
  const sidebar = document.createElement('aside');
  sidebar.className = 'category-sidebar';
  sidebar.innerHTML = '<details class="category-disclosure" open><summary>DANH MỤC SẢN PHẨM</summary></details>';
  sidebar.querySelector('details').append(main.querySelector('.product-filters'));
  section.append(sidebar,main);
  const labels = {all:'Tất cả sản phẩm',jar:'Yến chưng',nest:'Tổ yến',gift:'Quà tặng'};
  filterButtons.forEach(button=>{button.textContent=labels[button.dataset.filter];});
  ['all','jar','nest','gift'].forEach(category=>sidebar.querySelector('.product-filters').append(filterButtons.find(button=>button.dataset.filter===category)));
  const compact = matchMedia('(max-width:850px)');
  const setDisclosure = () => {sidebar.querySelector('details').open=!compact.matches;};
  compact.addEventListener('change',setDisclosure);
  setDisclosure();
  filterButtons.forEach(button=>button.addEventListener('click',()=>{
    if (compact.matches) sidebar.querySelector('details').open=false;
  }));
}
let searchQuery = '';
const translate = text => window.ANestI18n?.text(text) ?? text;
const normalize = text => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
function filterProducts(category = 'all', query = '') {
  let visibleCount = 0;
  products.forEach(product => {
    const matches = (category === 'all' || product.dataset.category === category) && normalize(product.dataset.name + ' ' + translate(product.dataset.name)).includes(normalize(query));
    product.hidden = !matches;
    if (matches) { visibleCount++; product.classList.add('is-visible'); }
  });
  const emptyState = document.querySelector('.no-results');
  if (emptyState) emptyState.hidden = visibleCount > 0;
  const count = document.querySelector('#product-count');
  if (count) count.textContent = visibleCount + ' sản phẩm';
  filterButtons.forEach(button => {
    const selected = button.dataset.filter === category;
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
}
filterButtons.forEach(button => button.addEventListener('click', () => filterProducts(button.dataset.filter, searchQuery)));
const headerSearch = document.querySelector('.header-search');
const searchPanel = document.querySelector('#search-panel');
const searchInput = document.querySelector('#search-input');
const searchToggle = document.querySelector('#search-toggle');
let placeholderTimer;
let placeholderIndex = 0;
let placeholderLength = 0;
let placeholderDeleting = false;
const placeholderQueries = ['Yến chưng táo đỏ', 'Tổ yến tinh chế', 'Hộp quà ANestLand', 'Yến chưng hạt sen'];
function pausePlaceholder() {
  clearTimeout(placeholderTimer);
  searchInput.placeholder = translate('Tìm sản phẩm...');
}
function startPlaceholder() {
  pausePlaceholder();
  placeholderLength = 0;
  placeholderDeleting = false;
  if (headerSearch.classList.contains('is-open') && !searchInput.value && !document.hidden && !reducedMotion.matches) {
    placeholderTimer = setTimeout(cyclePlaceholder, 500);
  }
}
function cyclePlaceholder() {
  clearTimeout(placeholderTimer);
  if (reducedMotion.matches || document.hidden || searchInput.value || !headerSearch.classList.contains('is-open') || !searchInput.getBoundingClientRect().width) {
    searchInput.placeholder = translate('Tìm sản phẩm...');
    return;
  }
  const query = translate(placeholderQueries[placeholderIndex]);
  placeholderLength += placeholderDeleting ? -1 : 1;
  searchInput.placeholder = query.slice(0, placeholderLength) || translate('Tìm sản phẩm...');
  let delay = placeholderDeleting ? 45 : 110;
  if (placeholderLength === query.length) { placeholderDeleting = true; delay = 1900; }
  if (placeholderLength <= 0) {
    placeholderDeleting = false;
    placeholderIndex = (placeholderIndex + 1) % placeholderQueries.length;
    delay = 500;
  }
  placeholderTimer = setTimeout(cyclePlaceholder, delay);
}
function openSearch(focusInput = true) {
  closeAccountMenu();
  closeHeaderLanguage();
  closeMenu(); closeMiniCart();
  pausePlaceholder();
  headerSearch.classList.add('is-open');
  positionSearch();
  searchPanel.hidden = false;
  searchInput.setAttribute('aria-expanded', 'true');
  searchToggle.setAttribute('aria-expanded', 'true');
  renderSearch();
  startPlaceholder();
  if (focusInput) requestAnimationFrame(() => {
    // Let the opening visibility state apply before focusing the animated field.
    if (headerSearch.classList.contains('is-open')) searchInput.focus({ preventScroll: true });
  });
}
function closeSearch(restoreFocus = false) {
  searchPanel.hidden = true;
  headerSearch.classList.remove('is-open');
  searchInput.setAttribute('aria-expanded', 'false');
  searchToggle.setAttribute('aria-expanded', 'false');
  if (restoreFocus) {
    searchToggle.focus({ preventScroll: true });
  }
  pausePlaceholder();
}
searchToggle.addEventListener('click', () => searchPanel.hidden ? openSearch() : closeSearch(true));
// Expand into genuine desktop whitespace; use an anchored panel when that space is too small.
function positionSearch() {
  const nav = header.querySelector('.desktop-nav');
  const available = searchToggle.getBoundingClientRect().right - nav.getBoundingClientRect().right - 20;
  const inline = !narrowNavigation.matches && available >= 200;
  headerSearch.classList.toggle('is-inline', inline);
  headerSearch.style.setProperty('--search-width', (inline ? Math.min(340, available) : 360) + 'px');
}
new ResizeObserver(positionSearch).observe(header);
window.addEventListener('resize', positionSearch);
searchInput.addEventListener('focus', () => openSearch(false));
searchInput.addEventListener('click', () => { if (searchPanel.hidden) openSearch(false); });
searchInput.addEventListener('input', () => { startPlaceholder(); renderSearch(); });
headerSearch.querySelector('.search-close').addEventListener('click', () => closeSearch(true));
headerSearch.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !searchPanel.hidden) {
    event.preventDefault();
    closeSearch(true);
  }
  if (!searchPanel.hidden && ['ArrowDown', 'ArrowUp'].includes(event.key)) {
    const results = [...searchPanel.querySelectorAll('.search-result')];
    if (!results.length) return;
    event.preventDefault();
    const current = results.indexOf(document.activeElement);
    const next = current < 0 ? (event.key === 'ArrowDown' ? 0 : results.length - 1)
      : (current + (event.key === 'ArrowDown' ? 1 : -1) + results.length) % results.length;
    results[next].focus({ preventScroll: true });
    const row = results[next], list = document.querySelector('#search-results');
    // Scroll only the result list, never the document containing the sticky header.
    const rowBounds = row.getBoundingClientRect(), listBounds = list.getBoundingClientRect();
    if (rowBounds.top < listBounds.top) list.scrollTop -= listBounds.top - rowBounds.top;
    else if (rowBounds.bottom > listBounds.bottom) list.scrollTop += rowBounds.bottom - listBounds.bottom;
  }
});
document.addEventListener('pointerdown', event => {
  if (!headerSearch.contains(event.target) && !searchPanel.hidden) closeSearch();
});
document.addEventListener('focusin', event => {
  if (!headerSearch.contains(event.target) && !searchPanel.hidden) closeSearch();
});
document.addEventListener('visibilitychange', () => document.hidden ? pausePlaceholder() : cyclePlaceholder());
reducedMotion.addEventListener('change', () => reducedMotion.matches ? pausePlaceholder() : cyclePlaceholder());
window.addEventListener('resize', startPlaceholder);
document.querySelector('#search-form').addEventListener('submit', event => {
  event.preventDefault();
  const query = document.querySelector('#search-input').value.trim();
  if (searchPanel.hidden) { openSearch(); return; }
  closeSearch();
  if (currentPage === 'products.html') {
    searchQuery = query;
    filterProducts('all', query);
    updateSearchSummary();
    const url = new URL(location.href);
    if (query) url.searchParams.set('q', query); else url.searchParams.delete('q');
    history.replaceState(null, '', url);
    document.querySelector('#products').scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth' });
  } else {
    location.href = 'products.html' + (query ? '?q=' + encodeURIComponent(query) : '');
  }
});
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) {
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  }});
});
const contentDialog = document.querySelector('#content-dialog');
function showContent(label, title, body) {
  document.querySelector('#dialog-label').textContent = label;
  document.querySelector('#dialog-title').textContent = title;
  document.querySelector('#dialog-body').textContent = body;
  contentDialog.showModal();
}
const articles = [
  ['SỐNG KHỎE · 12.09.2026', 'Yến sào nên dùng vào thời điểm nào?', 'Một buổi sáng chậm rãi hay một khoảng nghỉ trong ngày đều có thể trở thành khoảnh khắc chăm sóc bản thân. Chuẩn bị một khẩu phần vừa đủ, đọc hướng dẫn sử dụng trên bao bì và thưởng thức theo thói quen của bạn.'],
  ['KIẾN THỨC VỀ YẾN · 08.09.2026', 'Cách nhận biết tổ yến chất lượng', 'Bắt đầu từ nguồn gốc rõ ràng, thông tin thành phần và hướng dẫn bảo quản. Hãy quan sát cấu trúc sợi yến, lựa chọn đơn vị cung cấp đáng tin cậy và tìm hiểu quy trình làm sạch trước khi mua.'],
  ['QUÀ TẶNG · 02.09.2026', 'Gợi ý quà sức khỏe cho gia đình', 'Một món quà được chọn bằng sự quan tâm luôn mang ý nghĩa riêng. Hộp quà yến sào với sự trình bày trang nhã, những hũ yến nhỏ và một lời nhắn viết tay là gợi ý cho những dịp sum họp. Hãy chọn thành phần phù hợp với sở thích của người nhận.']
];
document.querySelectorAll('[data-article]').forEach(button => button.addEventListener('click', () => showContent(...articles[Number(button.dataset.article)])));
const information = {
  contact: ['LIÊN HỆ', 'Kết nối với ANestLand', 'Liên hệ ANestLand qua trang Liên hệ để trao đổi về sản phẩm và những lựa chọn phù hợp với bạn.'],
  policy: ['CHÍNH SÁCH', 'Thông tin chính sách', 'Vui lòng liên hệ ANestLand để được hướng dẫn về chính sách mua hàng, bảo quản và đổi trả sản phẩm.'],
  shipping: ['GIAO HÀNG', 'Trao gửi sự chăm sóc', 'Vui lòng trao đổi trực tiếp với ANestLand về địa chỉ nhận hàng, thời gian vận chuyển và điều kiện đổi trả.'],
  social: ['THEO DÕI', 'Hẹn gặp bạn ở những câu chuyện mới', 'Các kênh mạng xã hội sẽ được liên kết khi ANestLand có tài khoản chính thức. Bạn có thể khám phá thêm những câu chuyện về yến ngay trên trang này.']
};
document.querySelectorAll('[data-info]').forEach(button => button.addEventListener('click', () => showContent(...information[button.dataset.info])));
document.querySelector('#newsletter-form')?.addEventListener('submit', event => {
  event.preventDefault();
  document.querySelector('#newsletter-message').textContent = 'Cảm ơn bạn đã quan tâm đến ANestLand.';
  event.target.reset();
});

 
// Catalog and article selections share one static detail file each.
const catalog = [
  {
    "id": "tao-do",
    "name": "Yến Chưng Táo Đỏ",
    "price": 89000,
    "category": "jar",
    "label": "YẾN CHƯNG · 70 ML",
    "image": "red-date-jar.jpg",
    "description": "Sợi yến thanh nhẹ cùng táo đỏ, tiện thưởng thức hoặc trao tặng.",
    "ingredients": "Yến sào, táo đỏ, nước tinh khiết và đường phèn."
  },
  {
    "id": "hat-sen",
    "name": "Yến Chưng Hạt Sen",
    "price": 95000,
    "category": "jar",
    "label": "YẾN CHƯNG · 70 ML",
    "image": "lotus-jar.jpg",
    "description": "Sợi yến cùng hạt sen, thanh nhẹ và tiện dùng.",
    "ingredients": "Yến sào, hạt sen, nước tinh khiết và đường phèn."
  },
  {
    "id": "tinh-che",
    "name": "Tổ Yến Tinh Chế",
    "price": 590000,
    "category": "nest",
    "label": "TỔ YẾN · 50 G",
    "image": "refined-nest.jpg",
    "description": "Tổ yến làm sạch tỉ mỉ để bạn tự tay chế biến.",
    "ingredients": "Tổ yến tinh chế. Xem thông tin thành phần và khối lượng trên bao bì sản phẩm."
  },
  {
    "id": "hop-qua",
    "name": "Hộp Quà ANestLand",
    "price": 790000,
    "category": "gift",
    "label": "BỘ SƯU TẬP QUÀ TẶNG",
    "image": "gift-box.jpg",
    "description": "Hộp quà trang nhã với yến tuyển chọn, dành cho dịp sum họp.",
    "ingredients": "Bộ quà gồm các hũ yến chưng táo đỏ và hạt sen. Xem quy cách trên bao bì sản phẩm."
  },
  {
    "id": "tinh-che-100",
    "name": "Tổ Yến Tinh Chế 100 g",
    "price": 1150000,
    "category": "nest",
    "label": "TỔ YẾN · 100 G",
    "image": "refined-nest.jpg",
    "description": "Lựa chọn tổ yến tinh chế cho gia đình, thuận tiện chia thành từng khẩu phần khi chế biến tại nhà.",
    "ingredients": "Tổ yến tinh chế. Khối lượng: 100 g."
  },
  {
    "id": "combo-yen",
    "name": "Combo Yến Chưng 6 Hũ",
    "price": 520000,
    "category": "jar",
    "label": "YẾN CHƯNG · BỘ 6 HŨ",
    "image": "lotus-jar.jpg",
    "description": "Sáu hũ yến nhỏ để chia sẻ cùng người thân, phù hợp với những khoảng nghỉ nhẹ nhàng trong ngày.",
    "ingredients": "Bộ 6 hũ yến chưng. Lựa chọn táo đỏ hoặc hạt sen."
  },
  {
    "id": "qua-gia-dinh",
    "name": "Hộp Quà Sum Vầy",
    "price": 990000,
    "category": "gift",
    "label": "QUÀ TẶNG · GIA ĐÌNH",
    "image": "gift-box.jpg",
    "description": "Một gợi ý quà tặng dành cho những dịp đoàn viên, được trình bày trong hộp xanh thanh lịch.",
    "ingredients": "Hũ yến chưng và hộp quà. Lựa chọn tinh tế cho những dịp sum họp."
  },
  {
    "id": "yen-tuyen-chon",
    "name": "Tổ Yến Tuyển Chọn",
    "price": 890000,
    "category": "nest",
    "label": "TỔ YẾN · TUYỂN CHỌN",
    "image": "refined-nest.jpg",
    "description": "Tổ yến với cấu trúc sợi rõ ràng, dành cho người yêu cách chế biến chậm rãi và chăm chút từng nguyên liệu.",
    "ingredients": "Tổ yến tuyển chọn. Xem thông tin chi tiết trên bao bì sản phẩm."
  }
];
const articleCatalog = [
  {
    "id": "thoi-diem",
    "category": "SỐNG KHỎE",
    "title": "Yến sào nên dùng vào thời điểm nào?",
    "date": "12.09.2026",
    "image": "wellness-bowl.jpg",
    "summary": "Tìm một khoảng nghỉ phù hợp để việc chăm sóc bản thân trở thành một thói quen nhẹ nhàng."
  },
  {
    "id": "mua-yen-lan-dau",
    "category": "KIẾN THỨC VỀ YẾN",
    "title": "Mua yến sào lần đầu: chọn tổ yến hay yến chưng?",
    "date": "07.10.2026",
    "image": "refined-nest.jpg",
    "imageAlt": "Ảnh minh họa tổ yến khô màu ngà trong đĩa sứ, dùng cho bài hướng dẫn chọn yến lần đầu",
    "caption": "Tổ yến tinh chế để tự chế biến. Ảnh minh họa trong bộ ảnh ANestLand.",
    "summary": "Bạn muốn tự tay chưng một chén yến, hay cần một hũ đã chuẩn bị sẵn? Với lần mua đầu tiên, hãy chọn theo thời gian bạn có và cách bạn định dùng, rồi đối chiếu thành phần, quy cách. Giá và chiếc hộp đẹp có thể xem sau.",
    "content": `
      <p>Trong danh mục ANestLand, tổ yến tinh chế và yến chưng táo đỏ, hạt sen là những lựa chọn khác nhau về cách chuẩn bị. Hộp quà lại đặt thêm câu hỏi về người nhận. Hiểu sự khác biệt này giúp bạn chọn có lý do, thay vì mua một bộ lớn rồi mới tìm cách dùng.</p>
      <h2>Chọn theo một lần dùng cụ thể</h2>
      <p>Trước khi xem sản phẩm, thử hình dung lần đầu bạn sẽ dùng yến. Đó là cuối tuần ở nhà, khi bạn muốn tự chuẩn bị một món ăn? Hay một khoảng nghỉ trong ngày làm việc, khi bạn không định dành thời gian cho việc chưng? Câu trả lời có thể rất bình thường, nhưng nó quyết định phần lớn sự thuận tiện của món bạn mua.</p>
      <p>Nếu đã có dụng cụ và thích vào bếp, tổ yến tinh chế cho bạn chủ động chọn nguyên liệu đi cùng. Bạn cần dành thời gian đọc hướng dẫn, chuẩn bị và dọn rửa. Nếu muốn giảm phần việc ấy, hãy xem yến chưng sẵn cùng hướng dẫn sử dụng của từng loại. Nhớ kiểm tra điều kiện bảo quản: bạn sẽ cất hũ ở đâu trước lúc dùng?</p>
      <p>Đừng lấy một lịch sinh hoạt lý tưởng làm căn cứ. Một người thích nấu ăn vẫn có thể cần hũ chưng sẵn trong tuần bận rộn; người thường chọn đồ tiện dùng cũng có thể muốn tự chưng vào ngày nghỉ. Lần mua đầu chỉ cần giải quyết nhu cầu gần nhất.</p>
      <h2>Tổ yến tinh chế dành cho người muốn tự chuẩn bị</h2>
      <p>Tổ Yến Tinh Chế trong danh mục được giới thiệu là tổ yến đã làm sạch để người dùng tự chế biến. Sản phẩm này phù hợp để cân nhắc khi bạn muốn tự chọn nguyên liệu đi cùng, hoặc đã quen với việc chuẩn bị món ăn tại nhà. Cần phân biệt nguyên liệu đã làm sạch với món đã chưng xong: bạn vẫn có công đoạn chế biến phía sau.</p>
      <h3>Tính cả phần việc trước và sau khi chưng</h3>
      <p>Hãy đọc hướng dẫn của đúng sản phẩm trước khi lên kế hoạch. Các bước chuẩn bị, dụng cụ cần dùng và cách chia nguyên liệu nên dựa vào thông tin đó. Đừng ghép thời gian ngâm của một nơi với cách chưng của nơi khác rồi xem đó là công thức chung. Nếu nhãn chưa giải thích đủ, hỏi người bán trước khi bắt đầu.</p>
      <p>Khoảng thời gian bạn cần dành cho món ăn còn có việc lấy dụng cụ, chuẩn bị nguyên liệu kèm theo và rửa dọn. Đây là phần dễ quên khi chỉ nhìn một đĩa tổ yến đẹp. Nếu việc tự chưng khiến bạn hứng thú, những công đoạn ấy có thể là một phần dễ chịu của buổi nấu. Nếu chúng trở thành việc phải cố thu xếp, chọn dạng chưng sẵn sẽ hợp lý hơn.</p>
      <h3>Lần đầu, chọn quy cách vừa sức</h3>
      <p>Danh mục hiện có Tổ Yến Tinh Chế 50 g và Tổ Yến Tinh Chế 100 g. Hai con số cho biết khối lượng của hai quy cách, chưa cho biết gia đình bạn sẽ dùng hết trong bao lâu. Việc đó còn phụ thuộc hướng dẫn chia phần của sản phẩm và số lần bạn thực sự chế biến.</p>
      <p>Với người chưa từng tự chưng, quy cách nhỏ hơn giúp bạn có ít nguyên liệu cần bảo quản hơn trong lần thử đầu. Ghi lại phần việc nào thuận tiện, phần nào mất công rồi hãy cân nhắc lần mua tiếp theo.</p>
      <figure><img src="assets/images/craftsmanship.jpg" alt="Ảnh minh họa thao tác làm sạch tổ yến bằng nhíp trên mặt bàn sáng" width="800" height="800" loading="lazy"><figcaption>Tổ yến tinh chế là nguyên liệu để tự chế biến. Ảnh minh họa, không phải tư liệu quy trình sản xuất thực tế.</figcaption></figure>
      <h2>Yến chưng sẵn: đọc kỹ những gì có trong hũ</h2>
      <p>Trong hai lựa chọn hũ 70 ml đang được giới thiệu, Yến Chưng Táo Đỏ có yến sào, táo đỏ, nước tinh khiết và đường phèn; Yến Chưng Hạt Sen thay táo đỏ bằng hạt sen. Tên vị giúp bạn chọn hướng hương vị quen thuộc. Danh sách thành phần mới giúp bạn biết món đó được kết hợp từ những gì.</p>
      <p>Nếu mua cho mình, hãy nghĩ đến món bạn thường thích ăn thay vì chọn theo màu sắc trên ảnh. Nếu mua cho người thân, hỏi họ có thích táo đỏ hay hạt sen không. Những tên gọi như “thanh nhẹ” trong phần giới thiệu không thay thế thông tin về lượng đường hoặc tỷ lệ nguyên liệu. Khi cần biết một con số cụ thể, tìm trên nhãn hoặc hỏi đơn vị bán hàng.</p>
      <p>Bạn có thể xem <a href="product-detail.html?product=tao-do">thông tin Yến Chưng Táo Đỏ</a> để làm quen với cách trình bày thành phần và quy cách. Trước khi sử dụng, vẫn cần đối chiếu với bao bì của sản phẩm nhận được. Hướng dẫn bảo quản, hạn dùng và hướng dẫn sau khi mở nắp là những thông tin cần kiểm tra riêng, không nên suy ra từ kích thước hũ.</p>
      <h3>70 ml không phải là 70 g tổ yến</h3>
      <p>Một hũ ghi 70 ml mô tả thể tích sản phẩm trong hũ. Một hộp tổ yến ghi 50 g mô tả khối lượng nguyên liệu của hộp. Hai đơn vị này không thể thay thế nhau khi so lượng yến. Phần chất lỏng và nguyên liệu đi kèm trong hũ cũng cần được tính đến.</p>
      <p>Vì vậy, đừng dùng số 70 và số 50 để kết luận lựa chọn nào “nhiều yến hơn”. Muốn so lượng yến, bạn cần thông tin về lượng hoặc tỷ lệ yến theo cách công bố của từng sản phẩm. Nếu chưa có thông tin tương ứng ở cả hai bên, nên để câu hỏi đó chưa kết luận.</p>
      <h2>So giá theo đúng quy cách</h2>
      <p>Giá của một hũ dùng riêng và giá của một hộp nguyên liệu phục vụ nhiều lần chế biến đang trả lời hai câu hỏi khác nhau. Đặt chúng cạnh nhau mà bỏ qua quy cách sẽ khiến lựa chọn lệch ngay từ đầu. Bạn có thể bắt đầu bằng số tiền sẵn sàng chi cho lần thử, sau đó kiểm tra mình nhận được sản phẩm nào với số tiền ấy.</p>
      <p>Với yến chưng, ghi lại số hũ, thể tích mỗi hũ và thành phần của lựa chọn đang xem. Nếu cân nhắc một combo, kiểm tra các hũ trong bộ có cùng loại và cùng quy cách với hũ bán riêng hay không. Chỉ khi thông tin tương ứng, phép chia giá bộ cho số hũ mới giúp so giá mỗi hũ có ý nghĩa.</p>
      <p>Với tổ yến cùng dạng, có thành phần và cách công bố khối lượng tương ứng, bạn có thể đưa giá về cùng đơn vị khối lượng để so sánh. Phép tính này cho biết chi phí mua nguyên liệu, chưa cho biết giá của mỗi chén đã chế biến. Muốn ước tính giá mỗi chén, bạn còn cần cách chia nguyên liệu theo hướng dẫn và chi phí của những nguyên liệu dùng kèm.</p>
      <p>Đừng tự quy đổi một hộp tổ yến thành số hũ chưng sẵn khi chưa biết lượng yến của từng hũ. Nếu còn thiếu dữ liệu để tính giá mỗi lần dùng, bạn vẫn có thể chọn theo ngân sách của lần thử. Kiểm tra xem số tiền ấy mua được bao nhiêu sản phẩm và bạn có kế hoạch dùng hết lượng đã chọn chưa.</p>
      <h2>Nếu mua tặng, hỏi cả chuyện sử dụng</h2>
      <p>Hộp quà có thể là lựa chọn bạn nghĩ đến đầu tiên khi ghé thăm gia đình. Nhưng chiếc hộp sẽ được mở ra, và người nhận sẽ phải quyết định dùng những gì bên trong. Nếu họ không tự chế biến, tặng nguyên liệu có thể khiến họ cần nhờ thêm người chuẩn bị. Nếu họ thích vào bếp, một lựa chọn để tự chưng lại có thể hợp với sở thích ấy.</p>
      <p>Ở ANestLand, Hộp Quà ANestLand được giới thiệu gồm các hũ yến chưng táo đỏ và hạt sen. Khi xem một bộ quà cụ thể, cần kiểm tra lại số hũ, từng vị và quy cách thực tế; đừng mặc định mọi hộp dùng chung một cấu hình chỉ vì có ảnh giống nhau.</p>
      <p>Bạn cũng nên hỏi người nhận có chỗ bảo quản theo yêu cầu của sản phẩm không và khi nào họ thuận tiện nhận quà. Một lời nhắn ngắn kèm thông tin sản phẩm sẽ hữu ích hơn lời hứa về tác dụng sức khỏe. Phần lựa chọn hình thức và dịp tặng đã có trong bài <a href="blog-detail.html?article=qua-tang">gợi ý quà cho gia đình</a>; ở lần mua đầu, ưu tiên để người nhận biết cách dùng món quà của mình.</p>
      <h2>Những điều nên hỏi trước khi chốt đơn</h2>
      <p>Sau khi chọn được dạng sản phẩm, dành một lượt kiểm tra cho các thông tin còn thiếu. Có thể gửi người bán một nhóm câu hỏi ngắn, dựa trên đúng sản phẩm bạn đang cân nhắc:</p>
      <ul>
        <li>Quy cách nhận được gồm bao nhiêu hũ hoặc bao nhiêu gam tổ yến? Có những vị nào?</li>
        <li>Thành phần và lượng hoặc tỷ lệ yến được công bố ra sao trên nhãn?</li>
        <li>Hạn dùng, điều kiện bảo quản và hướng dẫn sau khi mở bao bì là gì?</li>
        <li>Với tổ yến tinh chế, cần chuẩn bị thế nào theo hướng dẫn của sản phẩm?</li>
        <li>Khi nhận hàng, nên đối chiếu những thông tin nào với đơn đặt?</li>
      </ul>
      <p>Câu trả lời nên giúp bạn hiểu món mình sắp mua. Những lời như “ai cũng dùng được” hoặc “loại nào cũng như nhau” không giải quyết được câu hỏi về thành phần và cách dùng. Bạn có thể yêu cầu thông tin cụ thể hơn, hoặc chưa chốt đơn nếu phần quan trọng vẫn chưa rõ.</p>
      <p>Bộ ảnh sản phẩm đang dùng trên website là ảnh minh họa, giúp bạn nhận ra kiểu tổ yến, hũ chưng hoặc hộp quà. Ảnh không cho biết nhãn, lô hàng hay tình trạng sản phẩm được giao. Khi quyết định mua, hãy kiểm tra thông tin sản phẩm thực tế; màu tổ yến hay vẻ ngoài của hũ trong ảnh không đủ để xác nhận chất lượng.</p>
      <h2>Thử một lựa chọn nhỏ, rồi quyết định lần sau</h2>
      <p>Lần dùng đầu là lúc kiểm tra những điều trang giới thiệu khó trả lời thay bạn: vị đó có hợp khẩu vị không, phần chuẩn bị có vừa với lịch của mình không, quy cách đã chọn có thuận tiện không. Nếu mua nhiều loại cùng lúc, bạn sẽ khó biết lý do mình thích hay không thích từng lựa chọn.</p>
      <p>Với yến chưng, có thể bắt đầu từ một vị bạn đã quen với nguyên liệu đi kèm. Với tổ yến tinh chế, hãy chọn một cách chuẩn bị theo hướng dẫn rồi ghi lại trải nghiệm. Chưa cần thêm nhiều nguyên liệu hoặc đổi cách làm liên tục trong lần đầu. Mục đích là hiểu lựa chọn mình vừa mua, không phải làm một món thật cầu kỳ.</p>
      <p>Sau đó, bạn có thể quay lại <a href="products.html">danh mục sản phẩm</a> để xem một quy cách khác, hoặc chuyển sang dạng thuận tiện hơn. Nếu món chưa hợp, thử xác định mình không thích vị đó, mua quá nhiều hay thấy khâu chuẩn bị mất công. Mỗi lý do sẽ dẫn đến một lựa chọn khác cho lần sau.</p>
      <h2>Chọn loại bạn sẽ thực sự dùng</h2>
      <p>Tổ yến tinh chế đáng cân nhắc khi bạn muốn tự chuẩn bị và có thời gian cho việc đó. Yến chưng sẵn đáng cân nhắc khi bạn cần giảm công đoạn chế biến. Cả hai đều cần thông tin rõ ràng về sản phẩm; tên gọi và hình thức không đủ để chọn thay bạn.</p>
      <p>Trước khi đặt hàng, thử nói gọn lựa chọn của mình: mua cho ai, định dùng trong hoàn cảnh nào, đã kiểm tra quy cách và hướng dẫn chưa. Nếu còn vướng một thông tin cụ thể, bạn có thể <a href="contact.html">hỏi ANestLand</a> về sản phẩm đang xem. Còn nếu đã rõ, hãy chọn lượng vừa với lần dùng đầu và để trải nghiệm ấy làm căn cứ cho lần mua sau.</p>
    `
  },
  {
    "id": "chat-luong",
    "category": "KIẾN THỨC VỀ YẾN",
    "title": "Cách nhận biết tổ yến chất lượng",
    "date": "08.09.2026",
    "image": "refined-nest.jpg",
    "summary": "Bắt đầu từ nguồn gốc rõ ràng, thông tin thành phần và sự minh bạch của đơn vị cung cấp."
  },
  {
    "id": "doi-tuong",
    "category": "SỐNG KHỎE",
    "title": "Ai nên sử dụng yến sào?",
    "date": "06.09.2026",
    "image": "lotus-jar.jpg",
    "summary": "Lựa chọn thực phẩm bắt đầu từ sở thích, nhu cầu và sự phù hợp với từng người trong gia đình."
  },
  {
    "id": "bao-quan",
    "category": "KIẾN THỨC VỀ YẾN",
    "title": "Cách bảo quản tổ yến đúng cách",
    "date": "04.09.2026",
    "image": "craftsmanship.jpg",
    "summary": "Giữ nguyên liệu gọn gàng và đọc kỹ hướng dẫn bảo quản trước khi sử dụng."
  },
  {
    "id": "qua-tang",
    "category": "QUÀ TẶNG",
    "title": "Gợi ý quà sức khỏe cho gia đình",
    "date": "02.09.2026",
    "image": "gift-box.jpg",
    "summary": "Một hộp quà trang nhã, một lời nhắn viết tay và một sự quan tâm được trao đúng lúc."
  },
  {
    "id": "tao-do",
    "category": "KIẾN THỨC VỀ YẾN",
    "title": "Yến chưng táo đỏ có gì đặc biệt?",
    "date": "28.08.2026",
    "image": "red-date-jar.jpg",
    "summary": "Câu chuyện về sự kết hợp giữa sợi yến thanh nhẹ và sắc đỏ ấm áp của táo đỏ."
  }
];
const pageParams = new URLSearchParams(location.search);
const formatPrice = price => window.ANestI18n?.formatPrice(price) ?? new Intl.NumberFormat('vi-VN').format(price) + '₫';
function displayPrice(node, value, label = '') {
  node.dataset.displayPrice = String(value);
  node.dataset.priceLabel = label;
  node.textContent = (label ? translate(label) + ': ' : '') + formatPrice(value);
}
function refreshPrices() {
  document.querySelectorAll('[data-display-price]').forEach(node => {
    displayPrice(node, Number(node.dataset.displayPrice), node.dataset.priceLabel);
  });
}
window.addEventListener('anestland:priceschange', refreshPrices);
document.querySelectorAll('.product-card .price').forEach(node => {
  const card = node.closest('.product-card');
  const link = card.querySelector('a[href*="product-detail.html"]');
  const product = link && catalog.find(item => item.id === new URL(link.href).searchParams.get('product'));
  if (product) card.querySelector('h3 a')?.setAttribute('data-i18n', 'product.name.' + product.id);
  const value = product?.price ?? Number(card.dataset.price);
  if (Number.isFinite(value)) displayPrice(node, value);
});

// Local catalog results; user-entered text is never interpreted as HTML.
function renderSearch() {
  const query = normalize(document.querySelector('#search-input').value.trim());
  const products = query ? catalog.filter(item => normalize(item.name + ' ' + item.label + ' ' + translate(item.name) + ' ' + translate(item.label)).includes(query)) : catalog;
  const articles = query ? articleCatalog.filter(item => normalize(item.title + ' ' + item.category + ' ' + translate(item.title) + ' ' + translate(item.category)).includes(query)) : [];
  const results = document.querySelector('#search-results');
  results.replaceChildren();
  document.querySelector('#search-status').textContent = query
    ? products.length + ' sản phẩm · ' + articles.length + ' bài viết'
    : catalog.length + ' sản phẩm · ANestLand';
  function group(title, items, isArticle) {
    if (!items.length) return;
    const section = document.createElement('section');
    const heading = document.createElement('h3');
    heading.textContent = title;
    section.append(heading);
    items.forEach(item => {
      const link = document.createElement('a');
      link.className = 'search-result';
      link.href = isArticle ? 'blog-detail.html?article=' + item.id : 'product-detail.html?product=' + item.id;
      const image = document.createElement('img');
      image.src = 'assets/images/' + item.image;
      image.alt = '';
      image.width = image.height = 72;
      const copy = document.createElement('span');
      const name = document.createElement('strong');
      name.dataset.i18n = (isArticle ? 'article.title.' : 'product.name.') + item.id;
      name.textContent = isArticle ? item.title : item.name;
      const meta = document.createElement('small');
      if (isArticle) meta.textContent = item.category;
      else displayPrice(meta, item.price);
      copy.append(name, meta);
      link.append(image, copy);
      section.append(link);
    });
    results.append(section);
  }
  group(query ? 'SẢN PHẨM' : 'SẢN PHẨM GỢI Ý', products, false);
  group('BÀI VIẾT', articles, true);
  if (query && !products.length && !articles.length) {
    const empty = document.createElement('p');
    empty.className = 'search-empty';
    empty.textContent = 'Chưa tìm thấy kết quả phù hợp. Hãy thử “yến”, “quà” hoặc “táo”.';
    results.append(empty);
  }
}

const addButtonFeedback = new WeakMap();
function animateCartAddition(button) {
  if (button) {
    let state = addButtonFeedback.get(button);
    if (!state) {
      state = { nodes: [...button.childNodes].map(node => node.cloneNode(true)) };
      addButtonFeedback.set(button, state);
    }
    clearTimeout(state.timer);
    button.replaceChildren(document.createTextNode('ĐÃ THÊM ✓'));
    state.timer = setTimeout(() => button.replaceChildren(...state.nodes.map(node => node.cloneNode(true))), 1500);
  }
  if (reducedMotion.matches) return Promise.resolve();
  const target = document.querySelector('#bag-toggle > svg');
  const source = button?.closest('.product-card')?.querySelector('.product-photo-link img')
    || (button?.classList.contains('hero-hotspot-add') ? document.querySelector('.hero-product') : null)
    || (button?.id === 'detail-add' ? document.querySelector('#detail-main-image') : null);
  if (!source || !target || !source.complete || !source.naturalWidth) return Promise.resolve();
  const start = source.getBoundingClientRect();
  const end = target.getBoundingClientRect();
  if (!start.width || !end.width) return Promise.resolve();
  // If the photo has scrolled behind the sticky header, launch its thumbnail
  // from the clicked action instead; both origins are measured at click time.
  const sourceCenterY = start.top + start.height / 2;
  const origin = button && (sourceCenterY < header.getBoundingClientRect().bottom || sourceCenterY > innerHeight)
    ? button.getBoundingClientRect() : start;
  const clone = document.createElement('img');
  clone.src = source.currentSrc || source.src;
  clone.alt = '';
  clone.setAttribute('aria-hidden', 'true');
  clone.className = 'cart-fly-image';
  const diameter = Math.min(start.width, start.height, 112);
  Object.assign(clone.style, { left: (origin.left + (origin.width - diameter) / 2) + 'px', top: (origin.top + (origin.height - diameter) / 2) + 'px', width: diameter + 'px', height: diameter + 'px' });
  document.body.append(clone);
  const dx = end.left + end.width / 2 - (origin.left + origin.width / 2);
  const dy = end.top + end.height / 2 - (origin.top + origin.height / 2);
  const flight = clone.animate([
    { transform: 'translate(0, 0) scale(1)', opacity: 1 },
    { transform: 'translate(' + dx * .48 + 'px, ' + (dy * .6 - Math.min(start.height * .12, Math.abs(dy) * .12)) + 'px) scale(.55)', opacity: .9, offset: .55 },
    { transform: 'translate(' + dx + 'px, ' + dy + 'px) scale(.15)', opacity: .15 }
  ], { duration: 700, easing: 'cubic-bezier(.3,.05,.35,1)', fill: 'forwards' });
  const cancelOnReducedMotion = () => { if (reducedMotion.matches) flight.cancel(); };
  reducedMotion.addEventListener('change', cancelOnReducedMotion);
  return flight.finished.catch(() => {}).then(() => {
    clone.remove();
    reducedMotion.removeEventListener('change', cancelOnReducedMotion);
  });
}
function popCartBadge() {
  if (!reducedMotion.matches) return document.querySelector('.bag-count')?.animate(
    [{ transform: 'scale(1)' }, { transform: 'scale(1.3)', offset: .5 }, { transform: 'scale(1)' }],
    { duration: 300, easing: 'ease-out' }
  ).finished.catch(() => {});
  return Promise.resolve();
}

// Cart data is non-sensitive. Resolve catalog fields locally; never trust stored markup or prices.
const cartStorageKey = 'anestland.cart';
const maxCartQuantity = 999;
const cartList = document.querySelector('#cart-items');
let cart = readCart();
// Persist immediately, but subtract each in-flight addition from the visual badge.
const pendingCartAdditions = new Map();
let cartArrivalVersion = 0;
function readCart() {
  try {
    const stored = JSON.parse(localStorage.getItem(cartStorageKey) || '[]');
    if (!Array.isArray(stored)) return [];
    const quantities = new Map();
    stored.slice(0, 100).forEach(item => {
      if (!item || !catalog.some(product => product.id === item.id)) return;
      const quantity = Number(item.quantity);
      if (!Number.isSafeInteger(quantity) || quantity < 1) return;
      quantities.set(item.id, Math.min(maxCartQuantity, (quantities.get(item.id) || 0) + quantity));
    });
    return [...quantities].map(([id, quantity]) => {
      const product = catalog.find(product => product.id === id);
      return { id, name: product.name, image: 'assets/images/' + product.image, price: product.price, quantity };
    });
  } catch { return []; }
}
// A non-modal header flyout shares the full cart's catalog and storage contract.
const miniCartTrigger = document.querySelector('#bag-toggle');
const miniCart = document.createElement('section');
miniCart.id = 'mini-cart';
miniCart.className = 'mini-cart';
miniCart.hidden = true;
miniCart.setAttribute('role', 'dialog');
miniCart.setAttribute('aria-modal', 'false');
miniCart.setAttribute('aria-labelledby', 'mini-cart-title');
miniCart.innerHTML = '<div class="mini-cart-heading"><h2 id="mini-cart-title">Giỏ hàng</h2><button type="button" class="mini-cart-close" aria-label="Đóng giỏ hàng">×</button></div><p class="mini-cart-empty">Chưa có sản phẩm nào trong giỏ hàng.</p><div class="mini-cart-items"></div><div class="mini-cart-summary"><p><span>TỔNG SỐ PHỤ</span><strong data-mini-cart-total></strong></p><div class="mini-cart-actions"><a class="mini-cart-view" href="cart.html">XEM GIỎ HÀNG</a><button type="button" class="mini-cart-checkout">THANH TOÁN</button></div><p class="mini-cart-checkout-message" role="status" hidden></p></div>';
document.body.append(miniCart);
const miniCartStatus = document.createElement('p');
miniCartStatus.className = 'sr-only';
miniCartStatus.setAttribute('role', 'status');
document.body.append(miniCartStatus);
miniCartTrigger.setAttribute('aria-controls', miniCart.id);
miniCartTrigger.setAttribute('aria-expanded', 'false');
miniCartTrigger.setAttribute('aria-haspopup', 'dialog');
function positionMiniCart() {
  const viewportWidth = document.documentElement.clientWidth;
  const popupWidth = Math.min(390, viewportWidth - 24);
  const trigger = miniCartTrigger.getBoundingClientRect();
  const left = Math.max(12, Math.min(viewportWidth - popupWidth - 12, trigger.right - popupWidth + 12));
  miniCart.style.left = left + 'px';
  miniCart.style.right = 'auto';
  miniCart.style.setProperty('--mini-cart-top', Math.max(8, trigger.bottom + 10) + 'px');
  miniCart.style.setProperty('--mini-cart-caret', Math.max(16, Math.min(popupWidth - 16, trigger.left + trigger.width / 2 - left)) + 'px');
  if (!miniCart.hidden && innerWidth <= 600 && document.querySelector('.cart-undo-toast')) {
    const reserve = document.body.classList.contains('news-detail-page') ? 252 : 192;
    const available = innerHeight - trigger.bottom - 10 - reserve;
    const minimum = miniCart.querySelector('.mini-cart-heading').scrollHeight + miniCart.querySelector('.mini-cart-summary').scrollHeight + 112;
    if (available < minimum) closeMiniCart(true);
  }
}
function closeMiniCart(restoreFocus = false) {
  miniCart.hidden = true;
  miniCartTrigger.setAttribute('aria-expanded', 'false');
  if (restoreFocus) miniCartTrigger.focus({ preventScroll: true });
}
function openMiniCart(focus = false) {
  if (document.querySelector('dialog[open]')) return;
  closeAccountMenu();
  closeHeaderLanguage();
  closeMenu();
  closeSearch();
  renderMiniCart();
  miniCart.hidden = false;
  positionMiniCart();
  if (miniCart.hidden) return;
  miniCartTrigger.setAttribute('aria-expanded', 'true');
  if (focus) miniCart.querySelector('.mini-cart-close').focus({ preventScroll: true });
}
function renderMiniCart() {
  const list = miniCart.querySelector('.mini-cart-items');
  const scrollTop = list.scrollTop;
  list.replaceChildren();
  miniCart.querySelector('.mini-cart-empty').hidden = cart.length > 0;
  miniCart.querySelector('.mini-cart-checkout').disabled = cart.length === 0;
  miniCart.querySelector('.mini-cart-checkout-message').hidden = true;
  cart.forEach(item => {
    const row = document.createElement('article');
    row.className = 'mini-cart-item';
    row.dataset.cartId = item.id;
    row.innerHTML = '<a class="mini-cart-image"><img width="56" height="56" alt=""></a><div class="mini-cart-copy"><a class="mini-cart-name"></a><p class="mini-cart-unit-label"></p><p class="mini-cart-prices"><span class="mini-cart-factor"><span class="mini-cart-unit"></span> × <span class="mini-cart-formula-quantity"></span></span><span class="mini-cart-result">= <strong class="mini-cart-item-total" title="Thành tiền"></strong></span></p><div class="mini-cart-quantity-controls"><button type="button" class="mini-cart-decrement">−</button><span class="mini-cart-quantity"></span><button type="button" class="mini-cart-increment">+</button><button type="button" class="mini-cart-remove">×</button></div></div>';
    row.querySelectorAll('a').forEach(link => { link.href = 'product-detail.html?product=' + item.id; });
    row.querySelector('.mini-cart-image').setAttribute('aria-label', 'Xem chi tiết ' + item.name);
    row.querySelector('img').src = item.image;
    const name = row.querySelector('.mini-cart-name');
    name.dataset.i18n = 'product.name.' + item.id;
    name.textContent = item.name;
    const quantity = row.querySelector('.mini-cart-quantity');
    quantity.dataset.quantity = item.quantity;
    quantity.textContent = new Intl.NumberFormat(document.documentElement.lang).format(item.quantity);
    row.querySelector('.mini-cart-formula-quantity').textContent = quantity.textContent;
    row.querySelector('.mini-cart-formula-quantity').dataset.quantity = item.quantity;
    displayPrice(row.querySelector('.mini-cart-unit-label'), item.price, 'Đơn giá');
    displayPrice(row.querySelector('.mini-cart-unit'), item.price);
    displayPrice(row.querySelector('.mini-cart-item-total'), item.price * item.quantity);
    const decrement = row.querySelector('.mini-cart-decrement');
    decrement.setAttribute('aria-label', 'Giảm số lượng ' + item.name);
    decrement.disabled = item.quantity <= 1;
    const increment = row.querySelector('.mini-cart-increment');
    increment.setAttribute('aria-label', 'Tăng số lượng ' + item.name);
    increment.disabled = item.quantity >= maxCartQuantity;
    row.querySelector('.mini-cart-remove').setAttribute('aria-label', 'Xóa ' + item.name);
    list.append(row);
  });
  displayPrice(miniCart.querySelector('[data-mini-cart-total]'), cart.reduce((sum, item) => sum + item.quantity * item.price, 0));
  window.ANestI18n?.refresh(miniCart);
  list.scrollTop = scrollTop;
  syncPendingCartRemoval();
}
miniCartTrigger.addEventListener('click', event => {
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  if (miniCart.hidden) { cart = readCart(); updateCartBadge(); openMiniCart(event.detail === 0); }
  else closeMiniCart(miniCart.contains(document.activeElement));
});
miniCart.querySelector('.mini-cart-close').addEventListener('click', () => closeMiniCart(true));
miniCart.querySelector('.mini-cart-view').addEventListener('click', () => closeMiniCart());
miniCart.querySelector('.mini-cart-checkout').addEventListener('click', () => {
  if (!pendingCartRemovals.size && readCart().length) location.href = 'checkout.html';
});
miniCart.addEventListener('click', event => {
  const button = event.target.closest('.mini-cart-remove,.mini-cart-decrement,.mini-cart-increment');
  if (!button) return;
  const row = button.closest('[data-cart-id]');
  const index = [...row.parentElement.children].indexOf(row);
  const next = readCart();
  const item = next.find(item => item.id === row.dataset.cartId);
  if (!item || pendingCartRemovals.has(item.id)) return;
  if (!button.classList.contains('mini-cart-remove')) {
    const decreasing = button.classList.contains('mini-cart-decrement');
    if (decreasing ? item.quantity <= 1 : item.quantity >= maxCartQuantity) return;
    item.quantity += decreasing ? -1 : 1;
    if (!saveCart(next)) return;
    miniCartStatus.textContent = translate('Đã cập nhật số lượng ' + item.name + '.');
    const updatedRow = miniCart.querySelectorAll('[data-cart-id]')[index];
    (updatedRow.querySelector(decreasing ? '.mini-cart-decrement:not(:disabled)' : '.mini-cart-increment:not(:disabled)') || updatedRow.querySelector('.mini-cart-name')).focus({ preventScroll: true });
    return;
  }
  const removalOrigin = row.querySelector('img').getBoundingClientRect();
  if (!removeCartWithFlight(item, next, removalOrigin)) return;
  const buttons = miniCart.querySelectorAll('[data-cart-id]:not([inert]) .mini-cart-remove');
  (buttons[Math.min(index, buttons.length - 1)] || miniCart.querySelector('.mini-cart-close')).focus({ preventScroll: true });
});
document.addEventListener('pointerdown', event => {
  if (!miniCart.hidden && !miniCart.contains(event.target) && !miniCartTrigger.contains(event.target)) closeMiniCart();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !miniCart.hidden) {
    event.preventDefault();
    closeMiniCart(miniCart.contains(document.activeElement));
  }
});
document.addEventListener('focusin', event => {
  if (!miniCart.hidden && !miniCart.contains(event.target) && !miniCartTrigger.contains(event.target)) closeMiniCart();
});
window.addEventListener('resize', () => { if (!miniCart.hidden) positionMiniCart(); });
window.addEventListener('scroll', () => { if (!miniCart.hidden) positionMiniCart(); }, { passive: true });
if ('ResizeObserver' in window) new ResizeObserver(() => { if (!miniCart.hidden) positionMiniCart(); }).observe(header);
// Transient removals share the existing cart store; each deadline is independent.
const cartUndoOperations = new Map();
const pendingCartRemovals = new Map();
const cartFlightCompletions = new Set();
window.addEventListener('pagehide', () => { [...cartFlightCompletions].forEach(finish => finish()); });
let cartUndoSequence = 0;
let cartUndoTimer;
let cartUndoOrder = [];
const cartUndoRegion = document.createElement('section');
cartUndoRegion.className = 'cart-undo-region';
cartUndoRegion.setAttribute('aria-label', 'Hoàn tác xóa sản phẩm');
document.body.append(cartUndoRegion);
function finishCartUndo(operation) {
  const focused = operation.toast.contains(document.activeElement);
  operation.toast.remove();
  cartUndoOperations.delete(operation.id);
  if (!cartUndoOperations.size) {
    clearInterval(cartUndoTimer);
    cartUndoTimer = undefined;
    cartUndoOrder = [];
  }
  if (focused) miniCartTrigger.focus({ preventScroll: true });
}
function tickCartUndo() {
  const now = Date.now();
  cartUndoOperations.forEach(operation => {
    if (operation.state !== 'ready') return;
    if (now >= operation.expiresAt) { finishCartUndo(operation); return; }
    const label = translate(Math.ceil((operation.expiresAt - now) / 1000) + 's');
    if (operation.countdown.textContent !== label) operation.countdown.textContent = label;
  });
}
function animateCartTransfer(item, from, to, restoring, complete) {
  if (reducedMotion.matches || document.hidden || !from?.width || !to?.width) { complete(); return; }
  const ghost = document.createElement('img');
  ghost.src = item.image;
  ghost.alt = '';
  ghost.setAttribute('aria-hidden', 'true');
  ghost.className = 'cart-fly-image cart-transfer-image';
  const size = Math.min(64, Math.max(40, from.width));
  const left = Math.max(0, Math.min(innerWidth - size, from.left + (from.width - size) / 2));
  const top = from.top + (from.height - size) / 2;
  Object.assign(ghost.style, { left: left + 'px', top: top + 'px', width: size + 'px', height: size + 'px' });
  document.body.append(ghost);
  const dx = to.left + to.width / 2 - left - size / 2;
  const dy = to.top + to.height / 2 - top - size / 2;
  const animation = ghost.animate([
    { transform: 'translate(0,0) scale(' + (restoring ? '.55' : '1') + ')', opacity: 1 },
    { transform: `translate(${dx * .5}px,${dy * .5 - 60}px) scale(.8)`, opacity: 1, offset: .5 },
    { transform: `translate(${dx}px,${dy}px) scale(.25)`, opacity: .2 }
  ], { duration: 800, easing: 'cubic-bezier(.3,.05,.35,1)', fill: 'forwards' });
  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    clearTimeout(fallback);
    cartFlightCompletions.delete(finish);
    window.removeEventListener('resize', finish);
    window.removeEventListener('scroll', finish);
    reducedMotion.removeEventListener('change', motionChange);
    document.removeEventListener('visibilitychange', visibilityChange);
    animation.cancel();
    ghost.remove();
    complete();
  };
  const motionChange = () => { if (reducedMotion.matches) finish(); };
  const visibilityChange = () => { if (document.hidden) finish(); };
  const fallback = setTimeout(finish, 1200);
  cartFlightCompletions.add(finish);
  window.addEventListener('resize', finish, { once: true });
  window.addEventListener('scroll', finish, { once: true, passive: true });
  reducedMotion.addEventListener('change', motionChange);
  document.addEventListener('visibilitychange', visibilityChange);
  animation.finished.then(finish, finish);
}
function syncPendingCartRemoval() {
  document.querySelectorAll('[data-cart-id]').forEach(row => {
    const pending = pendingCartRemovals.has(row.dataset.cartId);
    row.toggleAttribute('inert', pending);
    row.toggleAttribute('data-removing', pending);
    row.setAttribute('aria-busy', String(pending));
  });
  document.querySelectorAll('.mini-cart-checkout,#cart-checkout,.checkout-submit').forEach(button => { button.disabled = !!pendingCartRemovals.size || !cart.length; });
}
function removeCartWithFlight(item, originalCart, origin) {
  if (pendingCartRemovals.has(item.id)) return false;
  pendingCartRemovals.set(item.id, item);
  syncPendingCartRemoval();
  offerCartUndo(item, originalCart, origin);
  return true;
}
function offerCartUndo(item, originalCart, removalOrigin) {
  originalCart.forEach(product => { if (!cartUndoOrder.includes(product.id)) cartUndoOrder.push(product.id); });
  const operation = { id: ++cartUndoSequence, item: { ...item }, state: 'removing' };
  const toast = document.createElement('div');
  toast.className = 'cart-undo-toast';
  toast.style.visibility = 'hidden';
  toast.dataset.undoId = operation.id;
  const message = document.createElement('p');
  message.id = 'cart-undo-message-' + operation.id;
  message.setAttribute('role', 'status');
  message.textContent = 'Đã xóa ' + item.name;
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = 'HOÀN TÁC';
  button.disabled = true;
  button.setAttribute('aria-describedby', message.id);
  const countdown = document.createElement('span');
  countdown.className = 'cart-undo-countdown';
  countdown.setAttribute('aria-hidden', 'true');
  countdown.textContent = translate('5s');
  toast.append(message, button, countdown);
  operation.toast = toast;
  operation.countdown = countdown;
  cartUndoOperations.set(operation.id, operation);
  cartUndoRegion.append(toast);
  window.ANestI18n?.refresh(toast);
  cartUndoRegion.scrollTop = cartUndoRegion.scrollHeight;
  const destination = toast.getBoundingClientRect();
  animateCartTransfer(item, removalOrigin, destination, false, () => {
    const focusInRow = !!document.activeElement?.closest('[data-cart-id]');
    pendingCartRemovals.delete(item.id);
    const next = readCart();
    const current = next.find(product => product.id === item.id);
    if (current) current.quantity -= item.quantity;
    if (!saveCart(next.filter(product => product.quantity > 0))) {
      syncPendingCartRemoval();
      finishCartUndo(operation);
      return;
    }
    operation.state = 'ready';
    miniCartStatus.textContent = translate(item.name + ' đã được xóa khỏi giỏ hàng.');
    operation.expiresAt = Date.now() + 5000;
    toast.style.visibility = '';
    button.disabled = false;
    if (focusInRow) {
      const target = !miniCart.hidden ? miniCart.querySelector('[data-cart-id]:not([inert]) .mini-cart-remove') || miniCart.querySelector('.mini-cart-close')
        : cartList?.querySelector('[data-cart-id]:not([inert]) .cart-remove') || document.querySelector('#cart-empty .button') || miniCartTrigger;
      target.focus({ preventScroll: true });
    }
    tickCartUndo();
    if (!cartUndoTimer) cartUndoTimer = setInterval(tickCartUndo, 200);
    requestAnimationFrame(positionMiniCart);
  });
  button.addEventListener('click', () => {
    if (operation.state !== 'ready' || !cartUndoOperations.has(operation.id)) return;
    if (Date.now() >= operation.expiresAt) { finishCartUndo(operation); return; }
    operation.state = 'restoring';
    button.disabled = true;
    countdown.textContent = '';
    const origin = toast.getBoundingClientRect();
    animateCartTransfer(item, origin, miniCartTrigger.getBoundingClientRect(), true, () => {
      const next = readCart();
      const existing = next.find(product => product.id === operation.item.id);
      if (existing) existing.quantity = Math.min(maxCartQuantity, existing.quantity + operation.item.quantity);
      else {
        const rank = cartUndoOrder.indexOf(operation.item.id);
        const after = next.findIndex(product => cartUndoOrder.indexOf(product.id) < 0 || cartUndoOrder.indexOf(product.id) > rank);
        next.splice(after < 0 ? next.length : after, 0, { ...operation.item });
      }
      if (saveCart(next)) { popCartBadge(); finishCartUndo(operation); }
      else {
        operation.state = 'ready';
        operation.expiresAt = Date.now() + 5000;
        button.disabled = false;
        tickCartUndo();
      }
    });
  });
}
window.addEventListener('anestland:languagechange', () => {
  tickCartUndo();
  if (!miniCart.hidden) positionMiniCart();
});
document.addEventListener('visibilitychange', tickCartUndo);
function updateCartBadge() {
  const pending = [...pendingCartAdditions.values()].reduce((sum, amount) => sum + amount, 0);
  const count = Math.max(0, cart.reduce((sum, item) => sum + item.quantity, 0) - pending);
  document.querySelectorAll('.bag-count').forEach(badge => { badge.textContent = String(count); });
  document.querySelector('#bag-toggle')?.setAttribute('aria-label', 'Giỏ hàng, ' + count + ' sản phẩm');
}
function saveCart(next) {
  try { localStorage.setItem(cartStorageKey, JSON.stringify(next)); }
  catch {
    notify('Không thể lưu giỏ hàng. Vui lòng cho phép lưu trữ trong trình duyệt và thử lại.');
    return false;
  }
  cart = next;
  updateCartBadge();
  renderCart();
  renderMiniCart();
  renderCheckout();
  syncPendingCartRemoval();
  return true;
}
function addToCart(id, quantity = 1, button) {
  if (pendingCartRemovals.has(id)) return;
  const product = catalog.find(product => product.id === id);
  if (!product) return;
  const amount = Math.max(1, Math.min(maxCartQuantity, Math.trunc(Number(quantity)) || 1));
  const next = readCart();
  const existing = next.find(item => item.id === id);
  if (existing && existing.quantity + amount > maxCartQuantity) {
    notify('Bạn có thể chọn tối đa ' + maxCartQuantity + ' sản phẩm cho mỗi loại.');
    return;
  }
  if (existing) existing.quantity += amount;
  else next.push({ id, name: product.name, image: 'assets/images/' + product.image, price: product.price, quantity: amount });
  const arrival = {};
  pendingCartAdditions.set(arrival, amount);
  if (!saveCart(next)) { pendingCartAdditions.delete(arrival); return; }
  closeMiniCart();
  animateCartAddition(button).then(() => {
    pendingCartAdditions.delete(arrival);
    cart = readCart();
    updateCartBadge();
    const confirmationVersion = ++cartArrivalVersion;
    Promise.resolve(popCartBadge()).then(() => {
      if (pendingCartAdditions.size || confirmationVersion !== cartArrivalVersion) return;
      hideToast();
      openMiniCart();
      miniCart.querySelector('[data-cart-id="' + id + '"]')?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
      miniCartStatus.textContent = translate(product.name + ' đã được thêm vào giỏ hàng.');
    });
  });
}
let activeRevealCard;
function activateReveal(card) {
  if (activeRevealCard === card) return;
  activeRevealCard?.classList.remove('is-reveal-active');
  activeRevealCard = card;
  card?.classList.add('is-reveal-active');
}
// Reuse each card's existing cart button and the shared local catalog.
document.querySelectorAll('.product-card').forEach(card => {
  const photoLink = card.querySelector('.product-photo-link');
  const button = card.querySelector('button.add-product');
  if (!photoLink || !button) return;
  const id = new URL(photoLink.href).searchParams.get('product');
  const product = catalog.find(item => item.id === id);
  if (!product) return;
  card.classList.add('product-reveal-card');
  card.addEventListener('pointerenter', event => { if (event.pointerType !== 'touch') activateReveal(card); });
  card.addEventListener('pointerleave', () => {
    if (activeRevealCard === card && !card.querySelector(':focus-visible')) activateReveal(null);
  });
  card.addEventListener('focusin', () => activateReveal(card));
  card.addEventListener('focusout', event => {
    if (activeRevealCard === card && !card.contains(event.relatedTarget) && !card.matches(':hover')) activateReveal(null);
  });
  // The photo and reveal detail link remain keyboard routes to this product.
  // Avoid a redundant focus stop on the original title underneath the panel.
  const titleLink = card.querySelector('h3 a');
  if (titleLink) titleLink.tabIndex = -1;
  const panel = document.createElement('div');
  panel.className = 'product-reveal-panel';
  const name = document.createElement('strong');
  name.className = 'product-reveal-name';
  name.dataset.i18n = 'product.name.' + product.id;
  name.textContent = product.name;
  const price = document.createElement('p');
  price.className = 'product-reveal-price';
  displayPrice(price, product.price);
  const actions = document.createElement('div');
  actions.className = 'product-reveal-actions';
  button.type = 'button';
  button.dataset.cartAdd = id;
  button.innerHTML = 'THÊM VÀO GIỎ <span aria-hidden="true">+</span>';
  button.setAttribute('aria-label', 'Thêm ' + product.name + ' vào giỏ hàng');
  const details = document.createElement('a');
  details.className = 'product-reveal-details';
  details.href = photoLink.getAttribute('href');
  details.textContent = 'XEM CHI TIẾT';
  details.setAttribute('aria-label', 'Xem chi tiết ' + product.name);
  actions.append(button, details);
  panel.append(name, price, actions);
  card.append(panel);
});
document.querySelectorAll('button.add-product').forEach(button => {
  button.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();
    const id = button.dataset.cartAdd || new URL(button.closest('.product-card').querySelector('.product-photo-link').href).searchParams.get('product');
    addToCart(id, 1, button);
  });
});
function renderCart() {
  if (!cartList) return;
  cartList.replaceChildren();
  document.querySelector('#cart-empty').hidden = cart.length > 0;
  document.querySelector('#cart-layout').hidden = cart.length === 0;
  cart.forEach(item => {
    const row = document.createElement('article');
    row.className = 'cart-item';
    row.dataset.cartId = item.id;
    // Fixed template only: all product data is assigned via textContent/properties.
    row.innerHTML = '<a class="cart-item-image"><img width="120" height="120"></a><div class="cart-item-copy"><h2><a></a></h2><p class="cart-unit-price"></p></div><div class="cart-item-controls"><div class="cart-quantity-heading"><label>Số lượng</label><button type="button" class="cart-remove" data-cart-action="remove" aria-label="Xóa sản phẩm"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/></svg></button></div><div class="quantity-control"><button type="button" data-cart-action="minus">−</button><input type="number" min="1" max="999" inputmode="numeric"><button type="button" data-cart-action="plus">+</button></div></div><div class="cart-item-subtotal"><span>Thành tiền</span><strong></strong></div>';
    row.querySelectorAll('a').forEach(link => { link.href = 'product-detail.html?product=' + item.id; });
    const image = row.querySelector('img');
    image.src = item.image;
    image.alt = item.name;
    row.querySelector('h2 a').textContent = item.name;
    displayPrice(row.querySelector('.cart-unit-price'), item.price, 'Đơn giá');
    const input = row.querySelector('input');
    input.id = 'cart-quantity-' + item.id;
    input.value = item.quantity;
    input.setAttribute('aria-label', 'Số lượng ' + item.name);
    row.querySelector('label').htmlFor = input.id;
    row.querySelector('[data-cart-action="minus"]').disabled = item.quantity <= 1;
    row.querySelector('[data-cart-action="plus"]').disabled = item.quantity >= maxCartQuantity;
    row.querySelector('[data-cart-action="minus"]').setAttribute('aria-label', 'Giảm số lượng ' + item.name);
    row.querySelector('[data-cart-action="plus"]').setAttribute('aria-label', 'Tăng số lượng ' + item.name);
    row.querySelector('.cart-remove').setAttribute('aria-label', 'Xóa ' + item.name);
    displayPrice(row.querySelector('.cart-item-subtotal strong'), item.price * item.quantity);
    cartList.append(row);
  });
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  displayPrice(document.querySelector('#cart-subtotal'), total);
  displayPrice(document.querySelector('#cart-total'), total);
}
function renderCheckout() {
  const list = document.querySelector('#checkout-items');
  if (!list) return;
  document.querySelector('#checkout-empty').hidden = cart.length > 0;
  document.querySelector('#checkout-layout').hidden = cart.length === 0;
  document.querySelector('.checkout-submit').disabled = cart.length === 0;
  document.querySelector('#checkout-confirmation').hidden = true;
  list.replaceChildren();
  cart.forEach(item=>{
    const row = document.createElement('article');
    row.className = 'checkout-item';
    row.dataset.cartId = item.id;
    row.innerHTML = '<img width="56" height="56" alt=""><div><a></a><p class="checkout-unit"></p><p><span>Số lượng</span>: <span class="checkout-item-quantity"></span></p><strong class="checkout-line-total"></strong></div>';
    row.querySelector('img').src = item.image;
    row.querySelector('a').textContent = item.name;
    row.querySelector('a').href = 'product-detail.html?product='+item.id;
    const quantity = row.querySelector('.checkout-item-quantity');
    quantity.dataset.quantity = item.quantity;
    quantity.textContent = new Intl.NumberFormat(document.documentElement.lang).format(item.quantity);
    displayPrice(row.querySelector('.checkout-unit'),item.price,'Đơn giá');
    displayPrice(row.querySelector('.checkout-line-total'),item.price*item.quantity);
    list.append(row);
  });
  const total=cart.reduce((sum,item)=>sum+item.price*item.quantity,0);
  displayPrice(document.querySelector('#checkout-subtotal'),total);
  displayPrice(document.querySelector('#checkout-total'),total);
  window.ANestI18n?.refresh(list);
}
const checkoutForm = document.querySelector('#checkout-form');
if (checkoutForm) {
  const fields = [...checkoutForm.querySelectorAll('input[required]')];
  const confirmation = document.querySelector('#checkout-confirmation');
  const summary = document.querySelector('#checkout-errors');
  const requiredMessages = {
    name:'Vui lòng nhập họ và tên người nhận.', phone:'Vui lòng nhập số điện thoại người nhận.',
    email:'Vui lòng nhập email.', address:'Vui lòng nhập địa chỉ nhận hàng.',
    city:'Vui lòng nhập tỉnh hoặc thành phố.', ward:'Vui lòng nhập phường hoặc xã.'
  };
  function validateField(field) {
    const value = field.value.trim();
    let error = !value ? requiredMessages[field.name] : '';
    if (value && field.name==='email' && field.validity.typeMismatch) error='Vui lòng nhập email hợp lệ.';
    if (value && field.name==='phone' && (!/^\+?[\d\s().-]+$/.test(value) || value.replace(/\D/g,'').length<8 || value.replace(/\D/g,'').length>15)) error='Vui lòng nhập số điện thoại hợp lệ (8–15 chữ số).';
    const message=document.getElementById(field.id+'-error');
    message.textContent=error;
    message.hidden=!error;
    field.setAttribute('aria-invalid',String(!!error));
    window.ANestI18n?.refresh(message);
    return error;
  }
  fields.forEach(field=>{
    field.addEventListener('blur',()=>validateField(field));
    field.addEventListener('input',()=>{
      confirmation.hidden=true;
      if (field.getAttribute('aria-invalid')==='true') validateField(field);
    });
  });
  checkoutForm.addEventListener('submit',event=>{
    event.preventDefault();
    if (pendingCartRemovals.size) return;
    confirmation.hidden=true;
    cart=readCart();
    if (!cart.length) { renderCheckout(); return; }
    const invalid=fields.map(field=>({field,error:validateField(field)})).filter(item=>item.error);
    summary.replaceChildren();
    summary.hidden=!invalid.length;
    if (invalid.length) {
      const heading=document.createElement('h3');
      heading.textContent='Vui lòng kiểm tra các thông tin sau.';
      summary.append(heading);
      const links=document.createElement('ul');
      invalid.forEach(({field,error})=>{
        const li=document.createElement('li'), link=document.createElement('a');
        link.href='#'+field.id;
        link.textContent=error;
        link.addEventListener('click',event=>{event.preventDefault();field.focus();});
        li.append(link); links.append(li);
      });
      summary.append(links);
      window.ANestI18n?.refresh(summary);
      summary.focus();
      return;
    }
    // Local validation only: no request, order creation, payment or PII persistence.
    confirmation.hidden=false;
    confirmation.focus();
  });
}
function changeCartItem(id, action, value) {
  if (pendingCartRemovals.has(id)) return false;
  const next = readCart();
  const originalCart = next.map(product => ({ ...product }));
  const removalOrigin = [...cartList.children].find(row => row.dataset.cartId === id)?.querySelector('img')?.getBoundingClientRect();
  const item = next.find(item => item.id === id);
  if (!item) return;
  if (action === 'remove') return removeCartWithFlight(item, originalCart, removalOrigin);
  else item.quantity = Math.max(1, Math.min(maxCartQuantity, action === 'plus' ? item.quantity + 1 : action === 'minus' ? item.quantity - 1 : Math.trunc(Number(value)) || 1));
  if (!saveCart(next)) return;
  document.querySelector('#cart-status').textContent = action === 'remove' ? '' : 'Đã cập nhật số lượng ' + item.name + '.';
  const row = [...cartList.children].find(row => row.dataset.cartId === id);
  const focusTarget = action === 'set' ? row?.querySelector('input') : row?.querySelector('[data-cart-action="' + action + '"]:not(:disabled)');
  (focusTarget || row?.querySelector('input') || cartList.querySelector('.cart-remove') || document.querySelector('#cart-empty .button'))?.focus({ preventScroll: true });
  return true;
}
// Confirmation keeps cart/storage unchanged until the explicit destructive action.
let deleteDialog;
let pendingDeleteId;
let deleteTrigger;
let deleteConfirmed = false;
if (cartList) {
  deleteDialog = document.createElement('dialog');
  deleteDialog.id = 'cart-delete-dialog';
  deleteDialog.className = 'cart-delete-dialog';
  deleteDialog.setAttribute('aria-labelledby', 'cart-delete-title');
  deleteDialog.setAttribute('aria-describedby', 'cart-delete-description');
  deleteDialog.innerHTML = '<h2 id="cart-delete-title" data-i18n="cart.removeConfirmTitle">XÓA SẢN PHẨM KHỎI GIỎ HÀNG?</h2><p id="cart-delete-description"></p><div class="cart-delete-actions"><button type="button" class="cart-delete-cancel" autofocus>HỦY</button><button type="button" class="button cart-delete-confirm">XÓA</button></div>';
  document.body.append(deleteDialog);
  deleteDialog.querySelector('.cart-delete-cancel').addEventListener('click', () => deleteDialog.close());
  deleteDialog.addEventListener('cancel', event => { event.preventDefault(); deleteDialog.close(); });
  deleteDialog.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const cancel = deleteDialog.querySelector('.cart-delete-cancel');
    const confirm = deleteDialog.querySelector('.cart-delete-confirm');
    if (event.shiftKey && document.activeElement === cancel) { event.preventDefault(); confirm.focus(); }
    else if (!event.shiftKey && document.activeElement === confirm) { event.preventDefault(); cancel.focus(); }
  });
  deleteDialog.addEventListener('click', event => {
    if (event.target !== deleteDialog) return;
    const rect = deleteDialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) deleteDialog.close();
  });
  deleteDialog.querySelector('.cart-delete-confirm').addEventListener('click', () => {
    // Read current storage again; do not delete a stale or different item.
    if (!readCart().some(item => item.id === pendingDeleteId)) { deleteDialog.close(); return; }
    const id = pendingDeleteId;
    deleteConfirmed = true;
    deleteDialog.close();
    changeCartItem(id, 'remove');
  });
  deleteDialog.addEventListener('close', () => {
    const target = !deleteConfirmed && deleteTrigger?.isConnected ? deleteTrigger
      : cartList.querySelector('[data-cart-id]:not([inert]) .cart-remove') || miniCartTrigger;
    target?.focus({ preventScroll: true });
    pendingDeleteId = null;
    deleteTrigger = null;
    deleteConfirmed = false;
  });
}
function confirmCartRemoval(id, trigger) {
  const item = readCart().find(item => item.id === id);
  if (!item || pendingCartRemovals.has(id) || !deleteDialog || deleteDialog.open) return;
  pendingDeleteId = id;
  deleteTrigger = trigger;
  deleteConfirmed = false;
  deleteDialog.querySelector('#cart-delete-description').textContent = 'Bạn có chắc muốn xóa “' + item.name + '” khỏi giỏ hàng không?';
  window.ANestI18n?.refresh(deleteDialog);
  deleteDialog.showModal();
  deleteDialog.querySelector('.cart-delete-cancel').focus({ preventScroll: true });
}
cartList?.addEventListener('click', event => {
  const button = event.target.closest('[data-cart-action]');
  if (!button) return;
  const id = button.closest('[data-cart-id]').dataset.cartId;
  if (button.dataset.cartAction === 'remove') confirmCartRemoval(id, button);
  else changeCartItem(id, button.dataset.cartAction);
});
cartList?.addEventListener('change', event => {
  if (event.target.matches('input')) changeCartItem(event.target.closest('[data-cart-id]').dataset.cartId, 'set', event.target.value);
});
document.querySelector('#cart-checkout')?.addEventListener('click', () => {
  if (!pendingCartRemovals.size && readCart().length) location.href = 'checkout.html';
});
window.addEventListener('storage', event => {
  if (event.key === cartStorageKey || event.key === null) { cart = readCart(); updateCartBadge(); renderCart(); renderMiniCart(); renderCheckout(); syncPendingCartRemoval(); }
});
updateCartBadge();
renderCart();
renderMiniCart();
renderCheckout();


function updateSearchSummary() {
  const summary = document.querySelector('#search-summary');
  if (!summary) return;
  summary.hidden = !searchQuery;
  summary.textContent = searchQuery ? 'Kết quả tìm kiếm cho “' + searchQuery + '”' : '';
}
if (currentPage === 'products.html') {
  searchQuery = pageParams.get('q') || '';
  filterProducts('all', searchQuery);
  updateSearchSummary();
}
document.querySelector('#clear-search')?.addEventListener('click', () => {
  searchQuery = '';
  filterProducts();
  updateSearchSummary();
  const url = new URL(location.href);
  url.searchParams.delete('q');
  history.replaceState(null, '', url);
});
document.querySelector('#product-sort')?.addEventListener('change', event => {
  const order = event.target.value;
  const sorted = [...collectionProducts];
  if (order === 'price-asc') sorted.sort((a, b) => Number(a.dataset.price) - Number(b.dataset.price));
  if (order === 'price-desc') sorted.sort((a, b) => Number(b.dataset.price) - Number(a.dataset.price));
  if (order === 'name') sorted.sort((a, b) => a.dataset.name.localeCompare(b.dataset.name, 'vi'));
  const grid = document.querySelector('.collection-section .product-grid');
  sorted.forEach(card => grid.append(card));
});

// Keep the existing select/change sorting contract as the no-JS fallback.
const sortSelect = document.querySelector('#product-sort');
if (sortSelect) {
  const sort = document.createElement('div');
  sort.className = 'custom-sort';
  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.id = 'sort-trigger';
  trigger.setAttribute('aria-haspopup', 'listbox');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.setAttribute('aria-controls', 'sort-options');
  trigger.dataset.sortIcon = sortSelect.value;
  sortSelect.addEventListener('change', () => { trigger.dataset.sortIcon = sortSelect.value; });
  const list = document.createElement('div');
  list.id = 'sort-options';
  list.className = 'sort-options';
  list.role = 'listbox';
  list.setAttribute('aria-label', 'Sắp xếp');
  list.hidden = true;
  const options = [...sortSelect.options].map(option => {
    const button = document.createElement('button');
    button.type = 'button';
    button.role = 'option';
    button.textContent = option.textContent;
    button.dataset.value = option.value;
    button.setAttribute('aria-selected', String(option.selected));
    button.addEventListener('click', () => {
      sortSelect.value = option.value;
      trigger.textContent = option.textContent;
      options.forEach(item => item.setAttribute('aria-selected', String(item === button)));
      sortSelect.dispatchEvent(new Event('change', { bubbles: true }));
      close(true);
    });
    list.append(button);
    return button;
  });
  function close(focus = false) {
    list.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    if (focus) trigger.focus({ preventScroll: true });
  }
  function open(last = false) {
    list.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    (last ? options.at(-1) : options.find(item => item.dataset.value === sortSelect.value)).focus();
  }
  trigger.textContent = sortSelect.selectedOptions[0].textContent;
  trigger.addEventListener('click', () => list.hidden ? open() : close());
  sort.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); close(true); }
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    if (list.hidden) { open(event.key === 'ArrowUp'); return; }
    const index = options.indexOf(document.activeElement);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1
      : (index + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length;
    options[next].focus();
  });
  sort.addEventListener('focusout', event => { if (!sort.contains(event.relatedTarget)) close(); });
  document.addEventListener('pointerdown', event => { if (!sort.contains(event.target)) close(); });
  sort.append(trigger, list);
  sortSelect.after(sort);
  sortSelect.hidden = true;
  document.querySelector('label[for="product-sort"]').htmlFor = trigger.id;
}

let selectedProduct = catalog[0];
if (currentPage === 'product-detail.html') {
  selectedProduct = catalog.find(product => product.id === pageParams.get('product')) || catalog[0];
  document.title = selectedProduct.name + ' — ANestLand';
  document.querySelector('#detail-name').dataset.i18n = 'product.name.' + selectedProduct.id;
  document.querySelector('#detail-name').textContent = selectedProduct.name;
  document.querySelector('#detail-category').textContent = selectedProduct.label;
  displayPrice(document.querySelector('#detail-price'), selectedProduct.price);
  document.querySelector('#detail-description').textContent = selectedProduct.description;
  document.querySelector('#detail-ingredients').textContent = selectedProduct.ingredients;
  document.querySelector('#detail-sku').textContent = 'ANL-' + String(catalog.indexOf(selectedProduct) + 1).padStart(2, '0');
  document.querySelector('#detail-meta-category').textContent = { jar: 'Yến chưng', nest: 'Tổ yến', gift: 'Quà tặng' }[selectedProduct.category];
  document.querySelector('.breadcrumb-row [aria-current]').textContent = selectedProduct.name;
  if (selectedProduct.id !== 'tao-do') document.querySelector('#detail-story').textContent = selectedProduct.description;
  const main = document.querySelector('#detail-main-image');
  main.src = 'assets/images/' + selectedProduct.image;
  main.alt = selectedProduct.name + '';
  const firstThumbnail = document.querySelector('[data-gallery]');
  firstThumbnail.dataset.gallery = main.getAttribute('src');
  firstThumbnail.querySelector('img').src = main.src;
  firstThumbnail.setAttribute('aria-label', 'Ảnh chính: ' + selectedProduct.name);
}
document.querySelectorAll('[data-gallery]').forEach(button => button.addEventListener('click', () => {
  const main = document.querySelector('#detail-main-image');
  main.src = button.dataset.gallery;
  main.alt = button.getAttribute('aria-label') + '';
  document.querySelectorAll('[data-gallery]').forEach(thumbnail => {
    const active = thumbnail === button;
    thumbnail.classList.toggle('selected', active);
    thumbnail.setAttribute('aria-pressed', String(active));
  });
}));
const quantity = document.querySelector('#quantity');
function normalizeQuantity() {
  const value = Number(quantity.value);
  quantity.value = String(Math.max(1, Math.min(99, Number.isFinite(value) ? Math.trunc(value) : 1)));
  document.querySelector('#quantity-minus').disabled = Number(quantity.value) === 1;
  document.querySelector('#quantity-plus').disabled = Number(quantity.value) === 99;
}
if (quantity) {
  normalizeQuantity();
  quantity.addEventListener('change', normalizeQuantity);
  document.querySelector('#quantity-minus').addEventListener('click', () => {
    quantity.value = String(Number(quantity.value) - 1);
    normalizeQuantity();
  });
  document.querySelector('#quantity-plus').addEventListener('click', () => {
    quantity.value = String(Number(quantity.value) + 1);
    normalizeQuantity();
  });
}
document.querySelector('#detail-add')?.addEventListener('click', event => {
  normalizeQuantity();
  addToCart(selectedProduct.id, Number(quantity.value), event.currentTarget);
});
document.querySelector('#detail-wishlist')?.addEventListener('click', event => toggleWishlist(event.currentTarget));
if (currentPage === 'blog.html') {
  document.body.classList.add('news-list-page');
  const categories = document.querySelector('.blog-filter-row');
  const featured = document.querySelector('.featured-article');
  if (categories && featured) {
    featured.before(categories);
    // The same post already exists in the archive; keep a single entry per ID.
    featured.remove();
  }
  document.querySelectorAll('.blog-grid .blog-card').forEach(card => {
    const id = new URL(card.querySelector('.article-image').href).searchParams.get('article');
    const article = articleCatalog.find(item => item.id === id);
    if (!article) return;
    const copy = document.createElement('div');
    copy.className = 'archive-copy';
    const metadata = card.querySelector('.article-meta');
    const category = document.createElement('p');
    category.className = 'archive-category';
    category.textContent = article.category;
    const date = metadata.querySelector('time');
    metadata.replaceChildren(date);
    const title = card.querySelector('h3');
    const excerpt = document.createElement('p');
    excerpt.className = 'archive-excerpt';
    excerpt.textContent = article.summary;
    copy.append(category, title, metadata, excerpt, card.querySelector('.text-link'));
    card.append(copy);
  });
  // Keep the established controls and only categories represented by real articles.
  document.querySelectorAll('[data-blog-filter]').forEach(button => {
    if (button.dataset.blogFilter === 'all') button.textContent = translate('TẤT CẢ');
    else if (!articleCatalog.some(article => article.category === button.dataset.blogFilter)) button.remove();
  });
}
document.querySelectorAll('[data-blog-filter]').forEach(button => button.addEventListener('click', () => {
  const category = button.dataset.blogFilter;
  document.querySelectorAll('[data-blog-category]').forEach(card => {
    card.hidden = category !== 'all' && card.dataset.blogCategory !== category;
    if (!card.hidden) card.classList.add('is-visible');
  });
  document.querySelectorAll('[data-blog-filter]').forEach(item => {
    const selected = item === button;
    item.classList.toggle('selected', selected);
    item.setAttribute('aria-pressed', String(selected));
  });
}));

function buildArticleContents(body) {
  const headings = [...body.querySelectorAll('h2,h3')].filter(heading => heading.textContent.trim());
  if (!headings.length) return;
  const existingIds = [...document.querySelectorAll('[id]')].map(node => node.id);
  const used = new Set(existingIds);
  headings.forEach(heading => {
    if (heading.id && !/\s/.test(heading.id) && existingIds.filter(id => id === heading.id).length === 1) return;
    const slug = heading.textContent.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/gi,'d').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') || 'section';
    let id = slug, suffix = 2;
    while (used.has(id)) id = slug + '-' + suffix++;
    heading.id = id;
    used.add(id);
  });
  const layout = document.createElement('div');
  layout.className = 'article-reading-layout container';
  const toc = document.createElement('aside');
  toc.className = 'article-contents';
  toc.innerHTML = '<button type="button" class="contents-toggle" aria-expanded="true" aria-controls="article-contents-nav"><span data-i18n="news.contents">NỘI DUNG</span><span class="contents-chevron" aria-hidden="true">⌄</span></button><nav id="article-contents-nav" aria-label="Nội dung bài viết"><ol></ol></nav>';
  const nav = toc.querySelector('nav'), list = nav.querySelector('ol');
  let parentItem, sectionIndex = 0;
  const roman = number => {
    let result = '';
    for (const [value, symbol] of [[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']]) {
      while (number >= value) { result += symbol; number -= value; }
    }
    return result + '.';
  };
  const links = headings.map(heading => {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = '#' + heading.id;
    link.textContent = heading.textContent;
    if (heading.tagName === 'H2') {
      sectionIndex++;
      if (!/^\s*(?:[IVXLCDM]+|\d+)[.)、:]\s*/i.test(heading.textContent)) {
        heading.dataset.sectionNumber = link.dataset.sectionNumber = roman(sectionIndex);
      }
    }
    link.lang = 'vi';
    link.dataset.i18nIgnore = '';
    item.append(link);
    if (heading.tagName === 'H3' && parentItem) {
      let children = parentItem.querySelector('ol');
      if (!children) { children = document.createElement('ol'); parentItem.append(children); }
      children.append(item);
    } else { list.append(item); parentItem = heading.tagName === 'H2' ? item : undefined; }
    return link;
  });
  body.before(layout);
  const column = document.createElement('div'); column.className = 'article-content-column';
  column.append(document.querySelector('.article-hero-image'), body);
  layout.append(toc,column);
  const compact = matchMedia('(max-width:1100px)');
  const trigger = toc.querySelector('button');
  const sheetHeading = document.createElement('div'); sheetHeading.className = 'contents-sheet-heading';
  sheetHeading.innerHTML = '<strong data-i18n="news.contents">NỘI DUNG</strong><button type="button" class="contents-close" aria-label="Đóng nội dung">×</button>';
  nav.prepend(sheetHeading);
  function setExpanded(expanded) {
    nav.hidden = !expanded; trigger.setAttribute('aria-expanded',String(expanded));
    toc.classList.toggle('is-expanded',expanded);
  }
  const syncMode = () => setExpanded(!compact.matches);
  syncMode(); compact.addEventListener('change',syncMode);
  trigger.addEventListener('click',()=>{
    const expanded = trigger.getAttribute('aria-expanded') !== 'true';
    setExpanded(expanded);
    if (expanded && compact.matches) links[0].focus({preventScroll:true});
  });
  const closeSheet = (restoreFocus = false) => {
    if (!compact.matches) return;
    setExpanded(false);
    if (restoreFocus) trigger.focus({preventScroll:true});
  };
  sheetHeading.querySelector('button').addEventListener('click',()=>closeSheet(true));
  document.addEventListener('keydown',event=>{
    if (event.key === 'Escape' && compact.matches && !nav.hidden) { event.preventDefault(); closeSheet(true); }
  });
  document.addEventListener('pointerdown',event=>{if (!toc.contains(event.target)) closeSheet();});
  document.addEventListener('focusin',event=>{if (!toc.contains(event.target)) closeSheet();});
  function updateActive() {
    // Include the heading gap and the header/utility-strip shrink during anchor scrolling.
    const offset = Math.max(header.getBoundingClientRect().bottom + 64,
      parseFloat(getComputedStyle(headings[0]).scrollMarginTop) + 64);
    let active = 0;
    headings.forEach((heading,index) => { if (heading.getBoundingClientRect().top <= offset) active = index; });
    links.forEach((link,index) => {
      link.classList.toggle('is-active',index===active);
      if(index===active) link.setAttribute('aria-current','location');
      else link.removeAttribute('aria-current');
    });
  }
  let queued = false;
  // One short heading scan per scroll frame, only on the article page; no running loop.
  const scheduleActive = () => {
    if(queued) return;
    queued = true;
    requestAnimationFrame(()=>{queued=false;updateActive();});
  };
  window.addEventListener('scroll',scheduleActive,{passive:true});
  window.addEventListener('resize',scheduleActive);
  links.forEach((link,index)=>link.addEventListener('click',event=>{
    event.preventDefault();
    if(compact.matches) setExpanded(false);
    history.replaceState(history.state,'',location.pathname+location.search+'#'+headings[index].id);
    headings[index].scrollIntoView({behavior:reducedMotion.matches?'instant':'smooth',block:'start'});
    headings[index].tabIndex = -1;
    headings[index].focus({preventScroll:true});
    scheduleActive();
  }));
  const followHash = () => {
    let id;
    try { id=decodeURIComponent(location.hash.slice(1)); } catch { return; }
    const target=headings.find(heading=>heading.id===id);
    if(target) target.scrollIntoView({behavior:'instant',block:'start'});
    scheduleActive();
  };
  window.addEventListener('hashchange',followHash);
  requestAnimationFrame(followHash);
  window.ANestI18n?.refresh(toc);
}

const additionalArticleContent = {
  'chat-luong': [
    ['Bắt đầu từ nguồn gốc rõ ràng', 'Một lựa chọn tốt bắt đầu từ những thông tin có thể kiểm tra: đơn vị cung cấp, tên sản phẩm, thành phần và cách bảo quản. Hãy dành thời gian đọc nhãn và hỏi khi có thông tin chưa rõ.'],
    ['Quan sát và đặt câu hỏi', 'Hình ảnh trên website giúp bạn làm quen với sản phẩm nhưng không đủ để xác nhận chất lượng. Cấu trúc sợi, cách làm sạch và quy cách đóng gói nên được giải thích rõ ràng bởi đơn vị cung cấp.'],
    ['Sự minh bạch tạo nên niềm tin', 'ANestLand trân trọng sự chỉn chu trong từng lựa chọn. Khi mua một sản phẩm thực tế, ưu tiên thông tin nguồn gốc và hướng dẫn đầy đủ thay vì chỉ dựa vào lời quảng cáo.']
  ],
  'doi-tuong': [
    ['Lựa chọn bắt đầu từ từng người', 'Mỗi thành viên trong gia đình có sở thích và nhu cầu ăn uống riêng. Trước khi chọn yến sào, hãy đọc thành phần và nghĩ đến cách sử dụng phù hợp với người nhận.'],
    ['Dành sự quan tâm cho thông tin sản phẩm', 'Thông tin trên bao bì thực tế là điểm khởi đầu: thành phần, khẩu phần, hạn dùng và hướng dẫn bảo quản. Một sản phẩm tiện dùng vẫn cần được lựa chọn cẩn thận.'],
    ['Hỏi khi cần hướng dẫn riêng', 'Nếu có yêu cầu dinh dưỡng đặc biệt hoặc chưa biết sản phẩm có phù hợp hay không, hãy trao đổi với người có chuyên môn. Lựa chọn sản phẩm và cách dùng phù hợp với từng độ tuổi, nhu cầu và tình trạng sức khỏe.']
  ],
  'bao-quan': [
    ['Đọc hướng dẫn trước khi cất giữ', 'Tổ yến khô và yến chưng sẵn là những dạng sản phẩm khác nhau. Đừng áp dụng cùng một cách bảo quản cho mọi loại; hãy làm theo hướng dẫn của nhà sản xuất trên bao bì thực tế.'],
    ['Sắp xếp để dễ theo dõi', 'Giữ nhãn và thông tin hạn dùng cùng sản phẩm. Sắp xếp nguyên liệu gọn gàng để nhận biết những sản phẩm cần sử dụng trước, tránh để hộp đã mở lẫn với hộp chưa mở.'],
    ['Chuẩn bị vừa đủ cho từng lần', 'Khi tự chế biến, lên kế hoạch cho khẩu phần phù hợp và đọc hướng dẫn của nguyên liệu. Nếu có dấu hiệu bất thường hoặc thông tin không rõ, hỏi đơn vị cung cấp trước khi sử dụng.']
  ],
  'qua-tang': [
    ['Một món quà được chọn bằng sự quan tâm', 'Điều đáng nhớ không chỉ là chiếc hộp đẹp, mà còn là việc người tặng đã dành thời gian nghĩ đến người nhận. Chọn hương vị, quy cách và cách dùng theo sở thích của người thân.'],
    ['Giữ cách trình bày giản dị', 'Sắc xanh tự nhiên, một chiếc hộp gọn gàng và một lời nhắn viết tay tạo nên món quà tinh tế. Bạn không cần quá nhiều trang trí để sự quan tâm được cảm nhận.'],
    ['Trao quà cùng một câu chuyện', 'Một dịp đoàn viên, một lời cảm ơn hay một cuộc ghé thăm đều là cơ hội để chia sẻ. ANestLand gợi ý những bộ quà như một cách bắt đầu câu chuyện ấy, với thông tin sản phẩm rõ ràng và sự chăm chút trong từng chi tiết.']
  ],
  'tao-do': [
    ['Sắc đỏ trong một món ăn thanh nhẹ', 'Trong bộ ảnh ANestLand, táo đỏ tạo điểm nhấn ấm áp giữa sắc ngà của sợi yến. Sự kết hợp này gợi nhớ những món ăn được chuẩn bị chậm rãi trong căn bếp gia đình.'],
    ['Một hũ nhỏ, một trải nghiệm gọn gàng', 'Quy cách hũ nhỏ giúp cách trình bày trở nên thuận tiện và dễ trao tặng. Khi lựa chọn sản phẩm thực tế, đọc thông tin thành phần và hướng dẫn sử dụng thay vì suy đoán từ hình ảnh.'],
    ['Chăm chút cả cách thưởng thức', 'Một chiếc chén sứ, một muỗng vừa tay và vài phút dành cho bản thân là những chi tiết giản dị. Không gian thưởng thức có thể làm cho món ăn quen thuộc trở thành một khoảnh khắc đáng nhớ.']
  ]
};
if (currentPage === 'blog-detail.html') {
  document.body.classList.add('news-detail-page');
  const article = articleCatalog.find(item => item.id === pageParams.get('article')) || articleCatalog[0];
  if (article.id !== 'thoi-diem') {
    document.title = article.title + ' — ANestLand';
    document.querySelector('#article-title').dataset.i18n = 'article.title.' + article.id;
    document.querySelector('#article-title').textContent = article.title;
    document.querySelector('#article-category').textContent = article.category;
    document.querySelector('#article-date').textContent = article.date;
    document.querySelector('.breadcrumb-row [aria-current]').textContent = article.title;
    document.querySelector('#article-hero').src = 'assets/images/' + article.image;
    document.querySelector('#article-hero').alt = article.imageAlt || article.title;
    document.querySelector('.article-hero-image figcaption').textContent = article.caption || article.summary;
    const body = document.querySelector('#article-body');
    body.replaceChildren();
    const lead = document.createElement('p');
    lead.className = 'article-lead';
    lead.textContent = article.summary;
    body.append(lead);
    if (article.content) {
      // Only trusted editorial HTML authored in the static catalog is inserted here.
      body.insertAdjacentHTML('beforeend', article.content);
      document.querySelector('meta[name="description"]')?.setAttribute('content', article.summary);
      document.querySelector('.article-end > span').textContent = article.category;
    } else {
      additionalArticleContent[article.id].forEach(([heading, text], index) => {
        const h2 = document.createElement('h2');
        h2.textContent = heading;
        const paragraph = document.createElement('p');
        paragraph.textContent = text;
        body.append(h2, paragraph);
        if (index === 1) {
          const figure = document.createElement('figure');
          const image = document.createElement('img');
          image.src = 'assets/images/' + article.image;
          image.alt = article.title + '';
          image.loading = 'lazy';
          image.width = 800;
          image.height = 800;
          figure.append(image);
          body.append(figure);
        }
      });
      const callout = document.createElement('aside');
      callout.className = 'article-callout';
      const note = document.createElement('p');
      note.textContent = 'Hãy kiểm tra thông tin trên sản phẩm thực tế và hỏi người có chuyên môn khi cần tư vấn cá nhân.';
      callout.append(note);
      body.append(callout);
    }
  }
  // Reading duration is derived from the rendered editorial copy, never a fixed claim.
  const body = document.querySelector('#article-body');
  // Emphasize only curated existing phrases in paragraph text nodes; leave copy,
  // anchors, nested emphasis, headings and TOC identifiers untouched.
  const editorialPhrases = {
    'thoi-diem': ['thực phẩm trong chế độ ăn', 'đọc hướng dẫn trên nhãn', 'thành phần, khẩu phần, hạn dùng'],
    'mua-yen-lan-dau': ['tổ yến tinh chế', 'yến chưng sẵn', 'đọc hướng dẫn'],
    'chat-luong': ['thành phần và cách bảo quản', 'đọc nhãn', 'thông tin nguồn gốc'],
    'doi-tuong': ['đọc thành phần', 'hướng dẫn bảo quản', 'người có chuyên môn'],
    'bao-quan': ['hướng dẫn của nhà sản xuất', 'thông tin hạn dùng', 'khẩu phần phù hợp'],
    'qua-tang': ['nghĩ đến người nhận', 'lời nhắn viết tay', 'thông tin sản phẩm rõ ràng'],
    'tao-do': ['táo đỏ', 'thông tin thành phần', 'không gian thưởng thức']
  };
  (editorialPhrases[article.id] || []).forEach(phrase => {
    for (const paragraph of body.querySelectorAll('p:not(.article-lead)')) {
      const walker = document.createTreeWalker(paragraph, NodeFilter.SHOW_TEXT, {
        acceptNode: node => node.parentElement.closest('a,strong,em,mark,code') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
      });
      let node, highlighted = false;
      while ((node = walker.nextNode())) {
        const index = node.textContent.toLocaleLowerCase('vi').indexOf(phrase);
        if (index < 0) continue;
        const selected = node.splitText(index);
        selected.splitText(phrase.length);
        const emphasis = document.createElement('strong');
        emphasis.className = 'article-keyword';
        selected.replaceWith(emphasis);
        emphasis.append(selected);
        highlighted = true;
        break;
      }
      if (highlighted) break;
    }
  });
  const minutes = Math.max(1,Math.ceil(body.textContent.trim().split(/\s+/).length/220));
  document.querySelector('.article-reading-meta > span:last-child').textContent = minutes + ' phút đọc';
  const related = document.querySelector('.article-page + section .blog-grid');
  if (related) {
    const template = related.querySelector('.blog-card');
    const recommendations = articleCatalog.filter(item=>item.id!==article.id).slice(0,3);
    const cards = recommendations.map(item=>{
      const card=template.cloneNode(true);
      card.dataset.blogCategory=item.category;
      card.classList.add('is-visible');
      card.querySelectorAll('a').forEach(link=>{link.href='blog-detail.html?article='+item.id;link.removeAttribute('aria-label');});
      const image=card.querySelector('img');
      image.src='assets/images/'+item.image;image.alt=item.title;
      const meta=card.querySelector('.article-meta');
      meta.replaceChildren(document.createTextNode(item.category));
      const time=document.createElement('time');time.textContent=item.date;time.dateTime=item.date.split('.').reverse().join('-');meta.append(time);
      const title=card.querySelector('h3 a');title.textContent=item.title;title.dataset.i18n='article.title.'+item.id;
      return card;
    });
    related.replaceChildren(...cards);
    window.ANestI18n?.refresh(related);
  }
  buildArticleContents(body);
  setupArticleEngagement(article, minutes);
  setupArticleColumns(article, related?.closest('section'));
}

function setupArticleColumns(article, recommendations) {
  const layout = document.querySelector('.article-reading-layout');
  const column = layout.querySelector('.article-content-column');
  const toc = layout.querySelector('.article-contents');
  const heading = document.querySelector('.article-heading');
  column.prepend(heading);
  const library = document.createElement('details');
  library.className = 'article-library';
  const summary = document.createElement('summary');
  summary.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg><span class="sr-only" data-i18n="news.otherArticles">Bài viết khác</span>';
  const links = document.createElement('nav');
  articleCatalog.forEach(item => {
    const link = document.createElement('a');
    link.href = 'blog-detail.html?article=' + item.id;
    if (item.id === article.id) link.setAttribute('aria-current', 'page');
    link.setAttribute('aria-label', item.title);
    link.dataset.i18nAria = 'article.title.' + item.id;
    link.title = item.title;
    link.dataset.i18nTitle = 'article.title.' + item.id;
    const thumbnail = document.createElement('img');
    thumbnail.src = 'assets/images/' + item.image;
    thumbnail.alt = item.title;
    thumbnail.dataset.i18nAlt = 'article.title.' + item.id;
    thumbnail.width = 88;
    thumbnail.height = 60;
    thumbnail.loading = 'lazy';
    link.append(thumbnail);
    links.append(link);
  });
  library.append(summary, links);
  const right = document.createElement('div');
  right.className = 'article-right-sidebar';
  right.append(toc);
  layout.append(right);
  // Sidebars stop with the reading content, before the engagement/ending flow.
  const closing = document.createElement('div');
  closing.className = 'article-closing container';
  const closingContent = document.createElement('div');
  closingContent.className = 'article-closing-content';
  column.querySelectorAll(':scope > .article-meta-wrap, :scope > .article-engagement, :scope > .article-end').forEach(element => closingContent.append(element));
  closing.append(closingContent);
  layout.after(closing);
  const home = document.createComment('Related articles return here on compact layouts.');
  recommendations?.before(home);
  recommendations?.classList.add('article-recommendations');
  const wide = matchMedia('(min-width:1360px)');
  const desktop = matchMedia('(min-width:1101px)');
  function syncColumns() {
    if (wide.matches) { layout.prepend(library); library.open = true; }
    else { heading.after(library); library.open = false; }
    if (desktop.matches) { if (recommendations) right.append(recommendations); }
    else if (recommendations) home.after(recommendations);
  }
  wide.addEventListener('change', syncColumns);
  desktop.addEventListener('change', syncColumns);
  syncColumns();
  window.ANestI18n?.refresh(library);
}

// This demo has only a login flag, not named accounts. One local reader per browser.
// All user-entered text is rendered with textContent, never interpolated into HTML.
function setupArticleEngagement(article, minutes) {
  const storageKey = 'anestland.articleEngagement';
  function readStore() {
    try {
      const value = JSON.parse(localStorage.getItem(storageKey) || '{}');
      return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    } catch { return {}; }
  }
  function readArticle() {
    const raw = readStore()[article.id] || {};
    return {
      rating: Number.isInteger(raw.rating) && raw.rating >= 1 && raw.rating <= 5 ? raw.rating : 0,
      liked: raw.liked === true,
      comments: Array.isArray(raw.comments) ? raw.comments.filter(c => c && typeof c.text === 'string' && c.text.trim() && c.text.length <= 1000 && Number.isFinite(c.time) && c.time > 0 && c.time <= 8640000000000000).map(c => ({text:c.text,time:c.time})) : []
    };
  }
  let state = readArticle();
  const metaWrap = document.createElement('div');
  metaWrap.className = 'article-meta-wrap container';
  metaWrap.innerHTML = `<section class="article-author-meta" aria-label="Thông tin bài viết">
    <div class="article-author"><span class="editorial-avatar"><img src="assets/images/editorial-avatar-ai.png" width="72" height="72" alt="Chân dung AI minh họa ban biên tập ANestLand" decoding="async"></span><div><p class="article-meta-label">Tác giả</p><strong>Ban biên tập ANestLand</strong><p>Nội dung từ ANestLand</p></div></div>
    <dl class="article-meta-facts"><div><dt>Ngày đăng</dt><dd><time></time></dd></div><div><dt>Thời gian đọc</dt><dd><span>${minutes}</span> <span>phút đọc</span></dd></div><div><dt>Đánh giá</dt><dd class="article-rating-summary" aria-live="polite"></dd></div><div class="article-editorial-status"><dt class="sr-only">Nhãn biên tập</dt><dd><span class="editorial-badge" title="Nhãn do ban biên tập lựa chọn"><svg aria-hidden="true"><use href="${article.id === 'thoi-diem' ? '#i-leaf' : '#i-heart'}"/></svg><span>${article.id === 'thoi-diem' ? 'Xu hướng' : 'Yêu thích'}</span></span></dd></div></dl>
    <div class="article-brand-actions"><a href="https://anestland.vn/" target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/></svg><span>website ANestLand</span></a><a href="mailto:anestland@gmail.com"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/></svg><span>Email ANestLand</span></a><a href="tel:0853793535"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 3 3 5-3 3a14 14 0 0 0 6 6l3-3 5 3-1 4C10 22 2 14 3 4Z"/></svg><span>085 379 3535</span></a></div>
  </section>`;
  const date = metaWrap.querySelector('time');
  date.textContent = article.date; date.dateTime = article.date.split('.').reverse().join('-');
  const engagement = document.createElement('section');
  engagement.className = 'article-engagement';
  engagement.setAttribute('aria-labelledby','article-engagement-title');
  engagement.innerHTML = `<h2 id="article-engagement-title">Bài viết này hữu ích với bạn?</h2>
    <p class="article-local-note">Đánh giá, lượt thích và bình luận chỉ lưu trên trình duyệt này, không phải dữ liệu cộng đồng. Không chia sẻ thông tin nhạy cảm.</p>
    <div class="article-rating-stars" role="group" aria-label="Đánh giá bài viết"></div><p class="article-rating-summary" aria-live="polite"></p>
    <div class="article-engagement-actions"><button type="button" class="article-like"><svg aria-hidden="true"><use href="#i-heart"/></svg><span>Thích bài viết</span></button><button type="button" class="article-copy">Sao chép liên kết</button></div>
    <p class="article-action-status" role="status"></p>
    <form class="article-comment-form" novalidate><h2><label for="article-comment">BÌNH LUẬN</label></h2><textarea id="article-comment" rows="4" maxlength="1000" placeholder="Chia sẻ suy nghĩ của bạn..." aria-describedby="article-comment-hint article-comment-status"></textarea><p id="article-comment-hint">Tối đa 1000 ký tự. Bình luận chỉ hiển thị trên trình duyệt này.</p><button type="submit" class="button">GỬI BÌNH LUẬN</button><p id="article-comment-status" role="status"></p></form>
    <div class="article-comments" aria-label="Bình luận đã lưu"></div>`;
  const column = document.querySelector('.article-content-column');
  if (column) column.append(metaWrap, engagement, document.querySelector('.article-end'));
  else document.querySelector('.article-end').before(metaWrap, engagement);
  const starGroup = engagement.querySelector('.article-rating-stars');
  const stars = Array.from({length:5},(_,index)=>{
    const button = document.createElement('button'); button.type = 'button';
    button.setAttribute('aria-label',(index+1)+' sao'); button.title = (index+1)+' sao';
    button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.8 5.7 6.3.9-4.6 4.5 1.1 6.3-5.6-3-5.6 3 1.1-6.3L3 9.6l6.2-.9Z"/></svg>';
    starGroup.append(button);return button;
  });
  const actionStatus = engagement.querySelector('.article-action-status');
  const commentStatus = engagement.querySelector('#article-comment-status');
  const textarea = engagement.querySelector('textarea');
  function gate(trigger, status) {
    if (hasLoginState()) return true;
    status.textContent = translate('Đăng nhập để thực hiện hành động này.');
    openAccount(trigger); return false;
  }
  function save(next, status) {
    try {
      const store = readStore(); store[article.id] = next;
      localStorage.setItem(storageKey,JSON.stringify(store)); state = next; render(); return true;
    } catch { status.textContent = translate('Không thể lưu trên trình duyệt này. Vui lòng kiểm tra quyền lưu trữ.'); return false; }
  }
  function preview(value) { stars.forEach((button,index)=>button.classList.toggle('is-filled',index<value)); }
  stars.forEach((button,index)=>{
    button.addEventListener('mouseenter',()=>preview(index+1));
    button.addEventListener('focus',()=>preview(index+1));
    button.addEventListener('click',()=>{
      if (!gate(button,actionStatus)) return;
      if(save({...readArticle(),rating:index+1},actionStatus)) actionStatus.textContent = translate('Đã lưu đánh giá của bạn trên trình duyệt này.');
    });
  });
  starGroup.addEventListener('mouseleave',()=>preview(state.rating));
  starGroup.addEventListener('focusout',event=>{if(!starGroup.contains(event.relatedTarget))preview(state.rating);});
  engagement.querySelector('.article-like').addEventListener('click',event=>{
    const button=event.currentTarget;
    if(!gate(button,actionStatus))return;
    const current=readArticle();
    if(save({...current,liked:!current.liked},actionStatus)) actionStatus.textContent=translate(state.liked?'Đã thích bài viết trên trình duyệt này.':'Đã bỏ thích bài viết.');
  });
  engagement.querySelector('form').addEventListener('submit',event=>{
    event.preventDefault();
    if(!gate(event.submitter || textarea,commentStatus))return;
    const text=textarea.value.trim();
    if(!text || text.length>1000){
      textarea.setAttribute('aria-invalid','true');commentStatus.textContent=translate('Vui lòng nhập bình luận từ 1 đến 1000 ký tự.');textarea.focus();return;
    }
    const current=readArticle();
    if(save({...current,comments:[...current.comments,{text,time:Date.now()}]},commentStatus)){
      textarea.value='';textarea.removeAttribute('aria-invalid');commentStatus.textContent=translate('Đã lưu bình luận trên trình duyệt này.');
    }
  });
  textarea.addEventListener('input',()=>{textarea.removeAttribute('aria-invalid');commentStatus.textContent='';});
  engagement.querySelector('.article-copy').addEventListener('click',async()=>{
    const url=new URL(location.href);url.search='?article='+article.id;url.hash='';
    try { await navigator.clipboard.writeText(url.href); actionStatus.textContent=translate('Đã sao chép liên kết bài viết.'); }
    catch { actionStatus.textContent=translate('Không thể sao chép tự động. Hãy sao chép địa chỉ trên thanh trình duyệt.'); }
  });
  function render() {
    preview(state.rating);
    stars.forEach((button,index)=>button.setAttribute('aria-pressed',String(state.rating===index+1)));
    document.querySelectorAll('.article-rating-summary').forEach(node=>{
      node.textContent=state.rating ? state.rating+' / 5 · '+translate('1 đánh giá trên trình duyệt này') : translate('Chưa có đánh giá');
    });
    const like=engagement.querySelector('.article-like');like.setAttribute('aria-pressed',String(state.liked));
    like.querySelector('span').textContent=translate(state.liked?'Đã thích bài viết':'Thích bài viết');
    const comments=engagement.querySelector('.article-comments');comments.replaceChildren();
    if(!state.comments.length){const empty=document.createElement('p');empty.textContent=translate('Chưa có bình luận. Hãy là người đầu tiên chia sẻ.');comments.append(empty);}
    [...state.comments].reverse().forEach(comment=>{
      const card=document.createElement('article');card.className='article-comment-card';
      const avatar=document.createElement('span');avatar.className='comment-avatar';avatar.textContent='A';avatar.setAttribute('aria-hidden','true');
      const content=document.createElement('div'),name=document.createElement('strong'),time=document.createElement('time'),text=document.createElement('p');
      name.textContent=translate('Người đọc ANestLand');time.dateTime=new Date(comment.time).toISOString();
      time.textContent=new Intl.DateTimeFormat(document.documentElement.lang,{dateStyle:'medium',timeStyle:'short'}).format(comment.time);
      text.textContent=comment.text;text.dataset.i18nIgnore='';content.append(name,time,text);card.append(avatar,content);comments.append(card);
    });
    window.ANestI18n?.refresh(metaWrap);window.ANestI18n?.refresh(engagement);
  }
  window.addEventListener('anestland:languagechange',render);
  window.addEventListener('storage',event=>{if(event.key===storageKey){state=readArticle();render();}});
  render();
}
document.querySelector('#contact-form')?.addEventListener('submit', event => {
  event.preventDefault();
  document.querySelector('#contact-status').textContent = 'Cảm ơn bạn đã chia sẻ. Vui lòng liên hệ 0853 793 535 để trao đổi trực tiếp.';
  event.target.reset();
});

// One shared, native modal drawer. All form data remains transient; no authentication is performed.
const accountDrawer = document.createElement('dialog');
accountDrawer.id = 'account-drawer';
accountDrawer.className = 'account-drawer';
accountDrawer.setAttribute('aria-labelledby', 'account-title');

accountDrawer.innerHTML = `
  <div class="account-shell">
    <div class="account-heading"><h2 id="account-title">Tài khoản ANestLand</h2><button type="button" class="icon-button account-close" aria-label="Đóng tài khoản"><svg><use href="#i-close"/></svg></button></div>
    <div class="account-tabs" role="tablist" aria-label="Chế độ tài khoản">
      <button type="button" id="account-login-tab" role="tab" aria-controls="account-login-panel" aria-selected="true" data-account-mode="login">ĐĂNG NHẬP</button>
      <button type="button" id="account-register-tab" role="tab" aria-controls="account-register-panel" aria-selected="false" tabindex="-1" data-account-mode="register">ĐĂNG KÝ</button>
    </div>
    <div class="account-viewport"><div class="account-track">
      <section id="account-login-panel" class="account-panel" role="tabpanel" aria-labelledby="account-login-tab">
        <h3>Đăng nhập</h3><p class="account-intro">Tiếp tục những lựa chọn của bạn.</p>
        <form id="account-login-form" novalidate autocomplete="off">
          <div class="account-field"><label for="login-identity">Email hoặc tên đăng nhập</label><input id="login-identity" type="text" required maxlength="120" autocomplete="off" aria-describedby="login-identity-error"><small class="account-error" id="login-identity-error"></small></div>
          <div class="account-field"><label for="login-password">Mật khẩu</label><div class="account-password"><input id="login-password" type="password" required minlength="6" maxlength="128" autocomplete="off" aria-describedby="login-password-error"><button type="button" class="password-toggle" data-password-for="login-password" aria-label="Hiện mật khẩu" aria-pressed="false">HIỆN</button></div><small class="account-error" id="login-password-error"></small></div>
          <div class="account-options"><label class="account-remember"><input type="checkbox" id="account-remember">Ghi nhớ đăng nhập</label><button type="button" id="account-forgot">Quên mật khẩu?</button></div>
          <button class="button account-submit" type="submit">ĐĂNG NHẬP</button>
        </form>
        <p class="account-switch">Chưa có tài khoản? <button type="button" data-account-mode="register">ĐĂNG KÝ</button></p>
      </section>
      <section id="account-register-panel" class="account-panel" role="tabpanel" aria-labelledby="account-register-tab" aria-hidden="true" inert>
        <h3>Đăng ký</h3><p class="account-intro">Bắt đầu trải nghiệm ANestLand.</p>
        <form id="account-register-form" novalidate autocomplete="off">
          <div class="account-field"><label for="register-name">Họ và tên</label><input id="register-name" type="text" required maxlength="120" autocomplete="off" aria-describedby="register-name-error"><small class="account-error" id="register-name-error"></small></div>
          <div class="account-field"><label for="register-email">Email</label><input id="register-email" type="email" required maxlength="254" autocomplete="off" aria-describedby="register-email-error"><small class="account-error" id="register-email-error"></small></div>
          <div class="account-field"><label for="register-password">Mật khẩu</label><div class="account-password"><input id="register-password" type="password" required minlength="6" maxlength="128" autocomplete="off" aria-describedby="register-password-error"><button type="button" class="password-toggle" data-password-for="register-password" aria-label="Hiện mật khẩu" aria-pressed="false">HIỆN</button></div><small class="account-error" id="register-password-error"></small></div>
          <div class="account-field"><label for="register-confirm">Xác nhận mật khẩu</label><div class="account-password"><input id="register-confirm" type="password" required minlength="6" maxlength="128" autocomplete="off" aria-describedby="register-confirm-error"><button type="button" class="password-toggle" data-password-for="register-confirm" aria-label="Hiện mật khẩu xác nhận" aria-pressed="false">HIỆN</button></div><small class="account-error" id="register-confirm-error"></small></div>
          <button class="button account-submit" type="submit">TẠO TÀI KHOẢN</button>
        </form>
        <p class="account-switch">Đã có tài khoản? <button type="button" data-account-mode="login">ĐĂNG NHẬP</button></p>
      </section>
    </div></div>
    <div class="account-quick-login">
      <p class="account-quick-separator">HOẶC TIẾP TỤC VỚI</p>
      <div class="account-quick-options" aria-label="Đăng nhập nhanh">
        <button type="button" data-quick-login="Google" aria-pressed="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285f4" d="M22 12.2c0-.7-.1-1.4-.2-2.1H12v4h5.6a4.8 4.8 0 0 1-2.1 3.2v2.6h3.4c2-1.8 3.1-4.5 3.1-7.7Z"/><path fill="#34a853" d="M12 22c2.8 0 5.2-.9 6.9-2.5l-3.4-2.6c-.9.6-2.1 1-3.5 1-2.7 0-5-1.8-5.8-4.3H2.7v2.7A10.4 10.4 0 0 0 12 22Z"/><path fill="#fbbc05" d="M6.2 13.6a6.4 6.4 0 0 1 0-3.2V7.7H2.7a10.4 10.4 0 0 0 0 8.6Z"/><path fill="#ea4335" d="M12 6.1c1.5 0 2.8.5 3.9 1.5l2.9-2.9A10 10 0 0 0 12 2a10.4 10.4 0 0 0-9.3 5.7l3.5 2.7C7 7.9 9.3 6.1 12 6.1Z"/></svg><span>Google</span></button>
        <button type="button" data-quick-login="Số điện thoại" aria-pressed="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m7 2 3 5-2 3a17 17 0 0 0 6 6l3-2 5 3c0 3-2 5-5 5C9 20 4 15 2 7c0-3 2-5 5-5Z"/></svg><span>Số điện thoại</span></button>
        <button type="button" data-quick-login="Facebook" aria-pressed="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#1877f2" d="M14 22v-9h3l.5-4H14V7c0-1 .4-2 2-2h2V1.4C17.3 1.2 16.2 1 15 1c-3.3 0-5 2-5 5v3H7v4h3v9Z"/></svg><span>Facebook</span></button>
      </div>
    </div>
    <p class="account-status" id="account-status" role="status" aria-live="polite"></p>
  </div>`;
document.body.append(accountDrawer);
const accountStatus = accountDrawer.querySelector('#account-status');
let accountMode = 'login';
let accountTrigger;
let accountCloseTimer;
let accountFocusTimer;
let accountTransitions = [];
let accountTransitionVersion = 0;
function finishAccountTransition() {
  accountTransitionVersion++;
  accountTransitions.forEach(animation => animation.cancel());
  accountTransitions = [];
  accountDrawer.querySelectorAll('.is-leaving').forEach(panel => panel.classList.remove('is-leaving'));
}
let previousHtmlOverflow;
let previousBodyOverflow;
function sizeAccountPanel() {
  if (!accountDrawer.open) return;
  const panel = accountDrawer.querySelector('#account-' + accountMode + '-panel');
  accountDrawer.querySelector('.account-viewport').style.height = panel.scrollHeight + 'px';
}
window.addEventListener('resize', sizeAccountPanel);

function resetAccountForms() {
  accountDrawer.querySelectorAll('[data-quick-login]').forEach(button => button.setAttribute('aria-pressed', 'false'));
  accountDrawer.querySelectorAll('form').forEach(form => form.reset());
  accountDrawer.querySelectorAll('input').forEach(input => input.removeAttribute('aria-invalid'));
  accountDrawer.querySelectorAll('.account-error').forEach(error => { error.textContent = ''; });
  accountDrawer.querySelectorAll('[data-password-for]').forEach(button => {
    document.getElementById(button.dataset.passwordFor).type = 'password';
    button.textContent = 'HIỆN';
    button.setAttribute('aria-pressed', 'false');
    button.setAttribute('aria-label', button.dataset.passwordFor === 'register-confirm' ? 'Hiện mật khẩu xác nhận' : 'Hiện mật khẩu');
  });
}
function setAccountMode(mode, focus = true) {
  if (!['login', 'register'].includes(mode)) return;
  const previous = accountDrawer.querySelector('#account-' + accountMode + '-panel');
  const animate = mode !== accountMode && accountDrawer.open && !reducedMotion.matches;
  finishAccountTransition();
  const version = accountTransitionVersion;
  accountMode = mode;
  accountDrawer.classList.toggle('is-register', mode === 'register');
  accountStatus.textContent = '';
  accountDrawer.querySelectorAll('[role="tab"]').forEach(tab => {
    const selected = tab.dataset.accountMode === mode;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });
  accountDrawer.querySelectorAll('.account-panel').forEach(panel => {
    const selected = panel.id === 'account-' + mode + '-panel';
    panel.inert = !selected;
    panel.setAttribute('aria-hidden', String(!selected));
  });
  if (animate && typeof previous.animate === 'function') {
    const incoming = accountDrawer.querySelector('#account-' + mode + '-panel');
    const direction = mode === 'register' ? 1 : -1;
    previous.classList.add('is-leaving');
    const timing = { duration: 450, easing: 'cubic-bezier(.22,.7,.25,1)' };
    accountTransitions = [
      previous.animate([{ opacity: 1, transform: 'translateX(0)' }, { opacity: 0, transform: 'translateX(' + (-40 * direction) + 'px)' }], { ...timing, fill: 'forwards' }),
      incoming.animate([{ opacity: 0, transform: 'translateX(' + (40 * direction) + 'px)' }, { opacity: 1, transform: 'translateX(0)' }], timing)
    ];
    Promise.all(accountTransitions.map(animation => animation.finished.catch(() => {}))).then(() => {
      if (version === accountTransitionVersion) finishAccountTransition();
    });
  }
  sizeAccountPanel();
  clearTimeout(accountFocusTimer);
  if (focus) accountFocusTimer = setTimeout(() => {
    if (accountDrawer.open && accountMode === mode && accountDrawer.classList.contains('is-open')) {
      accountDrawer.querySelector('#account-' + mode + '-panel input').focus({ preventScroll: true });
    }
  }, reducedMotion.matches ? 0 : 450);
}
function openAccount(trigger, mode = 'login') {
  if (accountDrawer.open) return;
  closeAccountMenu();
  closeMenu();
  closeSearch(); closeMiniCart();
  document.querySelectorAll('dialog[open]').forEach(dialog => dialog.close());
  clearTimeout(accountCloseTimer);
  accountTrigger = trigger;
  resetAccountForms();
  setAccountMode(mode, false);
  previousHtmlOverflow = document.documentElement.style.overflow;
  previousBodyOverflow = document.body.style.overflow;
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
  accountDrawer.showModal();
  sizeAccountPanel();
  accountDrawer.scrollTop = 0;
  accountDrawer.getBoundingClientRect();
  accountDrawer.classList.add('is-open');
  accountDrawer.querySelector('#account-' + mode + '-panel input').focus({ preventScroll: true });
}
function closeAccount() {
  if (!accountDrawer.open) return;
  clearTimeout(accountFocusTimer);
  clearTimeout(accountCloseTimer);
  finishAccountTransition();
  accountDrawer.classList.remove('is-open');
  accountAvatar.setAttribute('aria-expanded','false');
  accountCloseTimer = setTimeout(() => accountDrawer.close(), reducedMotion.matches ? 0 : 450);
}
accountDrawer.querySelector('.account-close').addEventListener('click', closeAccount);
accountDrawer.addEventListener('cancel', event => {
  event.preventDefault();
  closeAccount();
});
accountDrawer.addEventListener('keydown', event => {
  if (event.key !== 'Tab') return;
  const focusable = [...accountDrawer.querySelectorAll('button, input, a[href], [tabindex]')].filter(element =>
    !element.disabled && element.tabIndex >= 0 && !element.closest('[inert]') && getComputedStyle(element).visibility !== 'hidden'
  );
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && (document.activeElement === first || document.activeElement === accountDrawer)) {
    event.preventDefault();
    last?.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first?.focus();
  }
});
accountDrawer.addEventListener('click', event => {
  if (event.target !== accountDrawer) return;
  const rect = accountDrawer.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeAccount();
});
accountDrawer.addEventListener('close', () => {
  accountAvatar.setAttribute('aria-expanded', 'false');
  clearTimeout(accountFocusTimer);
  finishAccountTransition();
  resetAccountForms();
  accountStatus.textContent = '';
  accountDrawer.classList.remove('is-open');
  document.documentElement.style.overflow = previousHtmlOverflow;
  document.body.style.overflow = previousBodyOverflow;
  menuToggle.setAttribute('aria-controls', 'mobile-nav');
  closeMenu();
  const returnTarget = accountTrigger?.closest('#account-menu') ? accountAvatar : accountTrigger?.closest('#mobile-nav') ? menuToggle : accountTrigger;
  returnTarget?.focus({ preventScroll: true });
});
document.querySelectorAll('[data-account-open]').forEach(button => button.addEventListener('click', () => openAccount(button)));
reducedMotion.addEventListener('change', event => { if (event.matches) finishAccountTransition(); });
accountDrawer.querySelectorAll('[data-quick-login]').forEach(button => button.addEventListener('click', () => {
  accountDrawer.querySelectorAll('[data-quick-login]').forEach(option => option.setAttribute('aria-pressed', String(option === button)));
  accountStatus.textContent = button.dataset.quickLogin + ' đã được chọn.';
}));
accountDrawer.querySelectorAll('[data-account-mode]').forEach(button => button.addEventListener('click', () => setAccountMode(button.dataset.accountMode)));
accountDrawer.querySelector('.account-tabs').addEventListener('keydown', event => {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  setAccountMode(event.key === 'Home' ? 'login' : event.key === 'End' ? 'register' : accountMode === 'login' ? 'register' : 'login', false);
  accountDrawer.querySelector('[role="tab"][aria-selected="true"]').focus();
});
accountDrawer.querySelectorAll('[data-password-for]').forEach(button => button.addEventListener('click', () => {
  const input = document.getElementById(button.dataset.passwordFor);
  const visible = input.type === 'password';
  input.type = visible ? 'text' : 'password';
  button.textContent = visible ? 'ẨN' : 'HIỆN';
  button.setAttribute('aria-pressed', String(visible));
  const confirmation = button.dataset.passwordFor === 'register-confirm';
  button.setAttribute('aria-label', confirmation
    ? (visible ? 'Ẩn mật khẩu xác nhận' : 'Hiện mật khẩu xác nhận')
    : (visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'));
}));
accountDrawer.querySelector('#account-forgot').addEventListener('click', () => {
  accountStatus.textContent = 'Vui lòng liên hệ ANestLand để được hỗ trợ khôi phục mật khẩu.';
});
accountDrawer.querySelectorAll('form').forEach(form => {
  form.addEventListener('input', event => {
    const input = event.target;
    input.removeAttribute('aria-invalid');
    const error = document.getElementById(input.id + '-error');
    if (error) error.textContent = '';
    accountStatus.textContent = '';
    sizeAccountPanel();
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    let firstInvalid;
    form.querySelectorAll('input:not([type="checkbox"])').forEach(input => {
      let message = '';
      const isPassword = /password|confirm/.test(input.id);
      const value = isPassword ? input.value : input.value.trim();
      if (!value) message = 'Vui lòng điền trường này.';
      else if (input.type === 'email' && input.validity.typeMismatch) message = 'Vui lòng nhập địa chỉ email hợp lệ.';
      else if (isPassword && value.length < 6) message = 'Mật khẩu cần ít nhất 6 ký tự.';
      else if (input.id === 'register-confirm' && value !== document.getElementById('register-password').value) message = 'Mật khẩu xác nhận chưa khớp.';
      const error = document.getElementById(input.id + '-error');
      error.textContent = message;
      input.setAttribute('aria-invalid', String(Boolean(message)));
      if (message && !firstInvalid) firstInvalid = input;
    });
    if (firstInvalid) {
      accountStatus.textContent = 'Vui lòng kiểm tra các trường được đánh dấu.';
      sizeAccountPanel();
      firstInvalid.focus();
      return;
    }
    if (form.id === 'account-login-form') {
      rememberLogin(document.getElementById('account-remember').checked);
    }
    resetAccountForms();
    sizeAccountPanel();
    accountStatus.textContent = form.id === 'account-login-form' ? 'Đăng nhập thành công.' : 'Tạo tài khoản thành công.';
    // Form values are cleared; only the login-state flag may be persisted.
  });
});

window.addEventListener('anestland:languagechange', () => {
  refreshPrices();
  document.querySelectorAll('.mini-cart-quantity,.mini-cart-formula-quantity,.checkout-item-quantity').forEach(node => {
    node.textContent = new Intl.NumberFormat(document.documentElement.lang).format(Number(node.dataset.quantity));
  });
  placeholderIndex = placeholderLength = 0;
  placeholderDeleting = false;
  pausePlaceholder();
  if (!searchPanel.hidden) renderSearch();
  startPlaceholder();
  if (accountDrawer.open) requestAnimationFrame(sizeAccountPanel);
});

// Product favorites are a local product-ID list, independent of the demo login flag.
const favoritesDialog = document.createElement('dialog');
favoritesDialog.id = 'favorites-dialog'; favoritesDialog.className = 'favorites-dialog';
favoritesDialog.setAttribute('aria-labelledby', 'favorites-title');
favoritesDialog.innerHTML = '<button type="button" class="favorites-close dialog-close" aria-label="Đóng danh sách yêu thích">×</button><h2 id="favorites-title">Sản phẩm yêu thích</h2><div class="favorites-list"></div><p class="favorites-empty">Bạn chưa lưu sản phẩm yêu thích nào.</p><a class="favorites-browse" href="products.html">Khám phá sản phẩm</a>';
document.body.append(favoritesDialog);
function renderFavorites() {
  const list = favoritesDialog.querySelector('.favorites-list'); list.replaceChildren();
  const saved = catalog.filter(product => favoriteIds.has(product.id));
  favoritesDialog.querySelector('.favorites-empty').hidden = saved.length > 0;
  saved.forEach(product => {
    const link = document.createElement('a'); link.className = 'favorite-product'; link.href = 'product-detail.html?product=' + product.id;
    const img = document.createElement('img'); img.src = 'assets/images/' + product.image; img.alt = ''; img.width = img.height = 56;
    const copy = document.createElement('span'), name = document.createElement('strong'), price = document.createElement('span');
    name.textContent = translate(product.name); price.className = 'favorite-price'; displayPrice(price, product.price);
    const row = document.createElement('div'); row.className = 'favorite-product-row';
    const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'favorite-remove';
    remove.dataset.favoriteId = product.id; remove.textContent = '×';
    remove.setAttribute('aria-label', translate('Xóa') + ' ' + translate(product.name));
    copy.append(name, price); link.append(img, copy); row.append(link, remove); list.append(row);
  });
  window.ANestI18n?.refresh(favoritesDialog);
}
function openFavorites() {
  closeAccountMenu();
  closeMenu(); closeSearch(); closeMiniCart();
  document.querySelector('.language-options')?.setAttribute('hidden', '');
  document.querySelector('.language-trigger')?.setAttribute('aria-expanded', 'false');
  renderFavorites(); favoritesDialog.showModal(); headerFavorite.setAttribute('aria-expanded', 'true');
  favoritesDialog.querySelector('.favorites-close').focus();
}
favoritesDialog.querySelector('.favorites-close').addEventListener('click', () => favoritesDialog.close());
favoritesDialog.addEventListener('click', event => {
  if (event.target !== favoritesDialog) return;
  const r = favoritesDialog.getBoundingClientRect();
  if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) favoritesDialog.close();
});
favoritesDialog.addEventListener('close', () => { headerFavorite.setAttribute('aria-expanded', 'false'); accountAvatar.focus({preventScroll:true}); });
favoritesDialog.addEventListener('click', event => {
  const remove = event.target.closest('.favorite-remove');
  if (!remove) return;
  const index = [...favoritesDialog.querySelectorAll('.favorite-remove')].indexOf(remove);
  toggleWishlist(remove);
  (favoritesDialog.querySelectorAll('.favorite-remove')[index] || favoritesDialog.querySelector('.favorites-close')).focus({preventScroll:true});
});
window.addEventListener('anestland:languagechange', () => { if (favoritesDialog.open) renderFavorites(); });
window.addEventListener('pageshow', () => { favoriteIds = readFavoriteIds(favoriteIds); syncFavorites(); });
window.addEventListener('storage', event => {
  if (event.key === favoriteStorageKey || event.key === null) { favoriteIds = readFavoriteIds(favoriteIds); syncFavorites(); }
});
syncFavorites();

// Shared static refraction map: only selection-panel background layers reference it.
if (!document.getElementById('anestland-selection-refraction')) {
  const glassDefinitions = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  glassDefinitions.setAttribute('aria-hidden', 'true');
  glassDefinitions.setAttribute('width', '0');
  glassDefinitions.setAttribute('height', '0');
  glassDefinitions.style.position = 'absolute';
  glassDefinitions.style.pointerEvents = 'none';
  glassDefinitions.innerHTML = '<defs><filter id="anestland-selection-refraction" x="-15%" y="-15%" width="130%" height="130%"><feTurbulence type="fractalNoise" baseFrequency="0.001 0.005" numOctaves="1" seed="17" result="noise"/><feGaussianBlur in="noise" stdDeviation="3" result="softMap"/><feDisplacementMap in="SourceGraphic" in2="softMap" scale="28" xChannelSelector="R" yChannelSelector="G"/></filter></defs>';
  document.body.append(glassDefinitions);
}
