(() => {
  const bag = [];
  const toast = document.querySelector('.toast');
  const cart = document.querySelector('.cart-drawer');
  const scrim = document.querySelector('.scrim');
  const search = document.querySelector('.search-overlay');
  const menu = document.querySelector('.menu-toggle');
  let toastTimer;

  const say = (message) => {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2300);
  };

  const bagCount = () => {
    document.querySelector('.bag-count').textContent = bag.length;
    document.querySelector('.bag-button').setAttribute('aria-label', `Shopping bag, ${bag.length} items`);
    document.querySelector('.drawer-count').textContent = `(${bag.length})`;
    document.querySelector('.cart-subtotal strong').textContent = `$${bag.reduce((sum, item) => sum + item.price, 0)}`;
  };

  function renderCart() {
    const list = document.querySelector('.cart-items');
    document.querySelector('.cart-empty').hidden = bag.length > 0;
    list.innerHTML = bag.map((item, index) => `
      <div class="cart-item">
        <img src="${item.image}" alt="">
        <div><h3>${item.name}</h3><p>Noor Qalb collection · $${item.price}</p>
          <button class="remove-item" data-index="${index}">Remove</button>
        </div>
        <span>$${item.price}</span>
      </div>`).join('');
    list.querySelectorAll('.remove-item').forEach((button) => button.addEventListener('click', () => {
      bag.splice(Number(button.dataset.index), 1);
      bagCount();
      renderCart();
    }));
  }

  function openCart() {
    cart.classList.add('open');
    scrim.classList.add('open');
    cart.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closePanels() {
    cart.classList.remove('open');
    scrim.classList.remove('open');
    cart.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.quick-add').forEach((button) => button.addEventListener('click', (event) => {
    event.preventDefault();
    const card = button.closest('.product-card');
    bag.push({ name: button.dataset.name, price: Number(button.dataset.price), image: card.querySelector('img').src });
    bagCount();
    renderCart();
    say(`${button.dataset.name} added to your bag`);
    if (window.gsap) gsap.fromTo('.bag-count', { scale: 1.45 }, { scale: 1, duration: 0.45, ease: 'back.out(2)' });
  }));

  document.querySelector('.bag-button').addEventListener('click', openCart);
  document.querySelector('.drawer-close').addEventListener('click', closePanels);
  scrim.addEventListener('click', closePanels);
  document.querySelector('.checkout-button').addEventListener('click', () => say(bag.length ? 'Checkout is coming soon — your bag is saved here.' : 'Your bag is empty for now.'));

  const closeSearch = () => {
    search.classList.remove('open');
    search.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };
  document.querySelector('.search-toggle').addEventListener('click', () => {
    search.classList.add('open');
    search.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(() => document.querySelector('#site-search').focus(), 80);
  });
  document.querySelector('.overlay-close').addEventListener('click', closeSearch);
  search.addEventListener('click', (event) => { if (event.target === search) closeSearch(); });
  document.querySelector('#site-search').addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    const term = event.target.value.toLowerCase();
    document.querySelectorAll('.product-card').forEach((card) => { card.hidden = !card.textContent.toLowerCase().includes(term); });
    closeSearch();
    document.querySelector('#shop').scrollIntoView({ behavior: 'smooth' });
  });

  document.querySelectorAll('.category-tab').forEach((tab) => tab.addEventListener('click', () => {
    document.querySelectorAll('.category-tab').forEach((item) => {
      item.classList.remove('is-active');
      item.setAttribute('aria-selected', 'false');
    });
    tab.classList.add('is-active');
    tab.setAttribute('aria-selected', 'true');
    document.querySelectorAll('.product-card').forEach((card) => {
      card.hidden = tab.dataset.filter !== 'all' && card.dataset.category !== tab.dataset.filter;
    });
    if (window.gsap && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.fromTo('.product-card:not([hidden])', { y: 12, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.42, stagger: 0.06, ease: 'power2.out', clearProps: 'opacity,visibility,transform' });
    }
  }));

  document.querySelector('.newsletter-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const email = document.querySelector('#email');
    if (email.checkValidity()) {
      document.querySelector('.form-message').textContent = 'Thanks — this demo form is ready to connect to your email platform.';
      email.value = '';
    }
  });

  menu.addEventListener('click', () => {
    const nav = document.querySelector('.nav-left');
    const open = nav.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  document.querySelectorAll('.nav-left a').forEach((link) => link.addEventListener('click', () => {
    document.querySelector('.nav-left').classList.remove('open');
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-label', 'Open menu');
  }));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closePanels();
      closeSearch();
      document.querySelector('.nav-left').classList.remove('open');
      menu.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });

  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  const motion = gsap.matchMedia();

  motion.add({
    desktop: '(min-width: 760px)',
    reduce: '(prefers-reduced-motion: reduce)'
  }, ({ conditions }) => {
    if (conditions.reduce) return;
    const { desktop } = conditions;
    const hero = gsap.timeline({ defaults: { ease: 'power3.out' } });
    hero.from('.site-header > *', { y: -10, autoAlpha: 0, duration: 0.55, stagger: 0.055 }, 0)
      .from('.hero-image', { scale: desktop ? 1.12 : 1.06, autoAlpha: 0.72, duration: 1.45, ease: 'power2.out' }, 0)
      .from('.hero-copy .eyebrow', { y: 14, autoAlpha: 0, duration: 0.5 }, 0.28)
      .from('.hero h1', { y: 30, autoAlpha: 0, duration: 0.78 }, 0.42)
      .from('.hero-intro', { y: 14, autoAlpha: 0, duration: 0.55 }, 0.78)
      .from('.hero-copy .button', { y: 12, autoAlpha: 0, duration: 0.5 }, 0.92)
      .from('.hero-note, .hero-index', { autoAlpha: 0, duration: 0.5, stagger: 0.08 }, 1.08);

    gsap.from('.intro > *:not(.intro-ornament)', {
      y: 22, autoAlpha: 0, duration: 0.72, stagger: 0.08, ease: 'power2.out',
      scrollTrigger: { trigger: '.intro', start: 'top 82%', once: true }
    });
    gsap.from('.section-heading > *, .category-tabs', {
      y: 18, autoAlpha: 0, duration: 0.62, stagger: 0.08, ease: 'power2.out',
      scrollTrigger: { trigger: '.shop-section', start: 'top 82%', once: true }
    });
    gsap.from('.product-card', {
      y: 28, autoAlpha: 0, duration: 0.68, stagger: { each: 0.11, from: 'start' }, ease: 'power2.out',
      scrollTrigger: { trigger: '.product-grid', start: 'top 86%', once: true }
    });
    gsap.from('.quote-image', {
      x: desktop ? -26 : 0, autoAlpha: 0, duration: 0.9, ease: 'power2.out',
      scrollTrigger: { trigger: '.quote-section', start: 'top 78%', once: true }
    });
    gsap.from('.quote-copy > *', {
      x: desktop ? 22 : 0, y: desktop ? 0 : 14, autoAlpha: 0, duration: 0.64, stagger: 0.1, ease: 'power2.out',
      scrollTrigger: { trigger: '.quote-section', start: 'top 72%', once: true }
    });
    gsap.from('.values-heading > *', {
      y: 18, autoAlpha: 0, duration: 0.6, stagger: 0.08, ease: 'power2.out',
      scrollTrigger: { trigger: '.values', start: 'top 78%', once: true }
    });
    gsap.from('.value-item', {
      x: desktop ? 24 : 0, y: desktop ? 0 : 12, autoAlpha: 0, duration: 0.58, stagger: 0.12, ease: 'power2.out',
      scrollTrigger: { trigger: '.value-list', start: 'top 80%', once: true }
    });
    gsap.from('.community-copy > *', {
      y: 18, autoAlpha: 0, duration: 0.62, stagger: 0.09, ease: 'power2.out',
      scrollTrigger: { trigger: '.community', start: 'top 78%', once: true }
    });
    gsap.from('.community-tile', {
      y: 24, autoAlpha: 0, duration: 0.62, stagger: 0.1, ease: 'power2.out',
      scrollTrigger: { trigger: '.community-tiles', start: 'top 82%', once: true }
    });
    gsap.from('.newsletter > *', {
      y: 16, autoAlpha: 0, duration: 0.58, stagger: 0.08, ease: 'power2.out',
      scrollTrigger: { trigger: '.newsletter', start: 'top 83%', once: true }
    });
    gsap.to('.hero-image', {
      yPercent: desktop ? 8 : 3, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.7 }
    });

    if (desktop) {
      const cards = gsap.utils.toArray('.product-card');
      const hoverListeners = [];
      cards.forEach((card) => {
        const image = card.querySelector('img');
        const enter = () => gsap.to(image, { scale: 1.055, duration: 0.65, ease: 'power2.out', overwrite: 'auto' });
        const leave = () => gsap.to(image, { scale: 1, duration: 0.5, ease: 'power2.out', overwrite: 'auto' });
        card.addEventListener('pointerenter', enter);
        card.addEventListener('pointerleave', leave);
        hoverListeners.push(() => { card.removeEventListener('pointerenter', enter); card.removeEventListener('pointerleave', leave); });
      });
      return () => hoverListeners.forEach((cleanup) => cleanup());
    }
  });
})();
