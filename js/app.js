(() => {
  'use strict';

  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const prefersReducedMotion = () => reducedMotionQuery.matches;

  const header = document.querySelector('.site-header');
  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.primary-nav');

  const closeNavigation = () => {
    if (!navToggle || !nav) return;
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open navigation');
    nav.classList.remove('is-open');
  };

  if (header) {
    const syncHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 20);
    syncHeader();
    window.addEventListener('scroll', syncHeader, { passive: true });
  }

  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const willOpen = navToggle.getAttribute('aria-expanded') !== 'true';
      navToggle.setAttribute('aria-expanded', String(willOpen));
      navToggle.setAttribute('aria-label', willOpen ? 'Close navigation' : 'Open navigation');
      nav.classList.toggle('is-open', willOpen);
    });

    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeNavigation));

    window.addEventListener('resize', () => {
      if (window.innerWidth > 860) closeNavigation();
    });
  }

  const revealElements = document.querySelectorAll('.reveal');
  if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
    revealElements.forEach(element => element.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    revealElements.forEach(element => revealObserver.observe(element));
  }

  const modules = {
    vision: {
      kicker: 'Computer Vision',
      title: 'Recognizing every item — not just the plate.',
      description: 'Three fine-tuned YOLO instance-segmentation models run together. A custom Mask-IoU ensemble removes duplicates, protects nested toppings, resolves conflicts, and fills missed regions.',
      points: ['Approximately 40,000 images across 220 food classes', '46 Egyptian food classes added for regional coverage', 'Pixel-level masks for multiple foods in the same meal'],
      tags: ['YOLOv8', 'YOLOv11', 'Instance Segmentation', 'Mask-IoU Ensemble'],
      image: 'assets/images/Food-Recognition.webp',
      fallbackImage: 'assets/images/Food-Recognition.png',
      alt: 'CALY food recognition ensemble workflow',
      label: 'Open food recognition diagram'
    },
    portion: {
      kicker: 'Geometry + Depth',
      title: 'Turning pixels into estimated grams.',
      description: 'CALY detects a physical reference card, converts image scale into centimeters, creates a relative 3D depth map, and combines area, height, and food density to estimate mass.',
      points: ['CALY Reference Card: 8.9 × 5.4 cm', 'Depth Anything V2 for monocular height estimation', 'Class-specific density priors and Soft Clamping'],
      tags: ['Reference Calibration', 'Depth Anything V2', 'Volume', 'Food Density'],
      image: 'assets/images/Portion-Estimation.webp',
      fallbackImage: 'assets/images/Portion-Estimation.png',
      alt: 'CALY full meal image processing workflow',
      label: 'Open portion estimation diagram'
    },
    language: {
      kicker: 'Natural Food Understanding',
      title: 'Understanding how people really describe food.',
      description: 'A four-layer pipeline cleans messy input, extracts food entities with Qwen2.5-7B, canonicalizes names, and estimates grams through deterministic logic — keeping language intelligence separate from nutritional mathematics.',
      points: ['Supports Arabic, Egyptian dialect, Franco-Arabic, English, and mixed input', 'Handles vague portions, modifiers, additions, exclusions, and informal food names', 'Prevents numerical hallucinations by design'],
      tags: ['Qwen2.5-7B', 'Entity Extraction', 'Canonicalization', 'Deterministic Grams'],
      image: 'assets/images/Food-Description.webp',
      fallbackImage: 'assets/images/Food-Description.png',
      alt: 'CALY natural language food understanding architecture',
      label: 'Open food description diagram'
    },
    recommendation: {
      kicker: 'Personalized Guidance',
      title: 'Recommendations grounded in real calculations.',
      description: 'CALY compares consumed nutrition with personalized daily targets, classifies each macro state, identifies the food contributing most to the imbalance, then asks Gemini to format concise guidance.',
      points: ['Targets based on profile, activity, and goal', 'Deterministic status and top-contributor analysis', 'Two-sentence, mobile-friendly personalized response'],
      tags: ['Daily Targets', 'Top Contributor', 'Gemini', 'Guardrailed Output'],
      image: 'assets/images/Recomendation.webp',
      fallbackImage: 'assets/images/Recomendation.png',
      alt: 'CALY personalized recommendation workflow',
      label: 'Open recommendation diagram'
    },
    platform: {
      kicker: 'End-to-End Product',
      title: 'One ecosystem from onboarding to insight.',
      description: 'A Flutter application connects to a FastAPI service layer that manages authentication, user profiles, meals, images, nutritional calculations, AI inference, and recommendation delivery.',
      points: ['Feature-oriented Flutter application architecture', 'Service-oriented FastAPI backend with a relational data model', 'Cloud image storage and hosted AI services'],
      tags: ['Flutter', 'FastAPI', 'Supabase', 'Cloudinary', 'Docker'],
      image: 'assets/images/Integrated-platform.webp',
      fallbackImage: 'assets/images/Integrated-platform.png',
      alt: 'Complete CALY backend architecture',
      label: 'Open integrated platform diagram'
    }
  };

  const moduleTabs = [...document.querySelectorAll('.module-tab')];
  const modulePanel = document.querySelector('.module-panel');
  const moduleImage = document.querySelector('#module-image');
  const moduleVisual = document.querySelector('.module-panel__visual');
  const moduleKicker = document.querySelector('#module-kicker');
  const moduleTitle = document.querySelector('#module-title');
  const moduleDescription = document.querySelector('#module-description');
  const modulePoints = document.querySelector('#module-points');
  const moduleTags = document.querySelector('#module-tags');
  const technologySection = document.querySelector('#technology');
  const moduleTabsScroll = document.querySelector('.module-tabs-scroll');
  const moduleTabsList = document.querySelector('.module-tabs');
  const moduleTabsHint = document.querySelector('.module-tabs-hint');
  const imagePreloadCache = new Map();
  let moduleSwitchToken = 0;
  let moduleLoadingTimer = 0;
  let tabScrollFrame = 0;
  let tabHintDismissed = false;

  const loadDecodedImage = source => new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = async () => {
      try {
        if (typeof image.decode === 'function') await image.decode();
        resolve(source);
      } catch (error) {
        reject(error);
      }
    };
    image.onerror = () => reject(new Error(`Unable to load image: ${source}`));
    image.src = source;
  });

  const preloadImage = (source, fallbackSource = '') => {
    if (!source) return Promise.resolve(null);
    const cached = imagePreloadCache.get(source);
    if (cached) return cached;

    const promise = loadDecodedImage(source)
      .catch(() => fallbackSource && fallbackSource !== source ? loadDecodedImage(fallbackSource) : null)
      .then(finalSource => {
        if (!finalSource) return null;
        const ready = Promise.resolve(finalSource);
        imagePreloadCache.set(source, ready);
        imagePreloadCache.set(finalSource, ready);
        return finalSource;
      })
      .catch(() => null);

    imagePreloadCache.set(source, promise);
    return promise;
  };

  const registerInitialModuleImage = () => {
    if (!moduleImage || !moduleVisual) return;
    const initialModule = modules.vision;

    const initialPromise = new Promise(resolve => {
      let settled = false;

      const cleanup = () => {
        moduleImage.removeEventListener('load', handleLoad);
        moduleImage.removeEventListener('error', handleError);
      };

      const finish = source => {
        if (settled) return;
        settled = true;
        cleanup();
        if (source) {
          const ready = Promise.resolve(source);
          imagePreloadCache.set(initialModule.image, ready);
          imagePreloadCache.set(source, ready);
          moduleVisual.dataset.full = source;
        }
        resolve(source || null);
      };

      const useFallback = () => {
        if (moduleImage.getAttribute('src') === initialModule.fallbackImage) {
          finish(null);
          return;
        }
        moduleImage.src = initialModule.fallbackImage;
        moduleVisual.dataset.full = initialModule.fallbackImage;
      };

      async function handleLoad() {
        try {
          if (typeof moduleImage.decode === 'function') await moduleImage.decode();
          finish(moduleImage.getAttribute('src'));
        } catch (error) {
          useFallback();
        }
      }

      function handleError() {
        useFallback();
      }

      moduleImage.addEventListener('load', handleLoad);
      moduleImage.addEventListener('error', handleError);

      if (moduleImage.complete) {
        queueMicrotask(() => {
          if (moduleImage.naturalWidth > 0) handleLoad();
          else handleError();
        });
      }
    });

    imagePreloadCache.set(initialModule.image, initialPromise);
  };

  const preloadAllModuleImages = () => {
    Object.values(modules).forEach(module => {
      preloadImage(module.image, module.fallbackImage);
    });
  };

  registerInitialModuleImage();

  if (technologySection) {
    if ('IntersectionObserver' in window) {
      const modulePreloadObserver = new IntersectionObserver(entries => {
        if (!entries.some(entry => entry.isIntersecting)) return;
        preloadAllModuleImages();
        modulePreloadObserver.disconnect();
      }, { rootMargin: '800px 0px', threshold: 0 });
      modulePreloadObserver.observe(technologySection);
    } else {
      preloadAllModuleImages();
    }
  }

  const updateModuleTabScrollState = () => {
    tabScrollFrame = 0;
    if (!moduleTabsScroll || !moduleTabsList) return;
    const tolerance = 2;
    const overflows = moduleTabsList.scrollWidth > moduleTabsList.clientWidth + tolerance;
    const canScrollLeft = overflows && moduleTabsList.scrollLeft > tolerance;
    const canScrollRight = overflows && moduleTabsList.scrollLeft + moduleTabsList.clientWidth < moduleTabsList.scrollWidth - tolerance;

    moduleTabsScroll.classList.toggle('can-scroll-left', canScrollLeft);
    moduleTabsScroll.classList.toggle('can-scroll-right', canScrollRight);
    if (moduleTabsHint) moduleTabsHint.hidden = !overflows || tabHintDismissed;
  };

  const scheduleModuleTabScrollState = () => {
    if (tabScrollFrame) return;
    tabScrollFrame = requestAnimationFrame(updateModuleTabScrollState);
  };

  const dismissModuleTabHint = () => {
    tabHintDismissed = true;
    scheduleModuleTabScrollState();
  };

  const keepModuleTabVisible = button => {
    if (!moduleTabsList || !button || moduleTabsList.scrollWidth <= moduleTabsList.clientWidth + 2) return;
    const target = button.offsetLeft - (moduleTabsList.clientWidth - button.offsetWidth) / 2;
    const maxScroll = moduleTabsList.scrollWidth - moduleTabsList.clientWidth;
    moduleTabsList.scrollTo({
      left: Math.min(Math.max(target, 0), maxScroll),
      behavior: prefersReducedMotion() ? 'auto' : 'smooth'
    });
    scheduleModuleTabScrollState();
  };

  if (moduleTabsList) {
    moduleTabsList.addEventListener('scroll', scheduleModuleTabScrollState, { passive: true });
    moduleTabsList.addEventListener('pointerdown', dismissModuleTabHint, { passive: true });
    moduleTabsList.addEventListener('wheel', dismissModuleTabHint, { passive: true });
    window.addEventListener('resize', scheduleModuleTabScrollState);
    requestAnimationFrame(updateModuleTabScrollState);
    if (document.fonts?.ready) document.fonts.ready.then(scheduleModuleTabScrollState).catch(() => {});
  }

  const updateModuleContent = (button, module, finalSource) => {
    if (!modulePanel || !moduleImage || !moduleVisual || !moduleKicker || !moduleTitle || !moduleDescription || !modulePoints || !moduleTags) return;
    moduleKicker.textContent = module.kicker;
    moduleTitle.textContent = module.title;
    moduleDescription.textContent = module.description;
    modulePoints.replaceChildren(...module.points.map(item => {
      const listItem = document.createElement('li');
      listItem.textContent = item;
      return listItem;
    }));
    moduleTags.replaceChildren(...module.tags.map(tag => {
      const tagElement = document.createElement('span');
      tagElement.textContent = tag;
      return tagElement;
    }));
    moduleImage.src = finalSource;
    moduleImage.alt = module.alt;
    moduleImage.dataset.fallback = module.fallbackImage;
    moduleVisual.dataset.full = finalSource;
    moduleVisual.dataset.fallback = module.fallbackImage;
    moduleVisual.setAttribute('aria-label', module.label);
    modulePanel.setAttribute('aria-labelledby', button.id);
  };

  const activateModule = async (button, moveFocus = false) => {
    const module = modules[button?.dataset.module];
    if (!button || !module || !modulePanel || !moduleImage || !moduleVisual) return;
    const switchToken = ++moduleSwitchToken;

    moduleTabs.forEach(tab => {
      const active = tab === button;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });

    if (moveFocus) button.focus();
    keepModuleTabVisible(button);
    window.clearTimeout(moduleLoadingTimer);
    modulePanel.classList.remove('is-loading');
    modulePanel.classList.remove('is-changing');
    moduleLoadingTimer = window.setTimeout(() => {
      if (switchToken === moduleSwitchToken) modulePanel.classList.add('is-loading');
    }, 120);

    const finalSource = await preloadImage(module.image, module.fallbackImage);
    if (switchToken !== moduleSwitchToken) return;

    window.clearTimeout(moduleLoadingTimer);
    modulePanel.classList.remove('is-loading');
    if (!finalSource) return;

    modulePanel.classList.add('is-changing');
    updateModuleContent(button, module, finalSource);
    requestAnimationFrame(() => {
      if (switchToken === moduleSwitchToken) modulePanel.classList.remove('is-changing');
    });
  };

  moduleTabs.forEach((button, index) => {
    button.addEventListener('click', () => activateModule(button));
    button.addEventListener('keydown', event => {
      let nextIndex = null;
      if (event.key === 'ArrowRight') nextIndex = (index + 1) % moduleTabs.length;
      if (event.key === 'ArrowLeft') nextIndex = (index - 1 + moduleTabs.length) % moduleTabs.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = moduleTabs.length - 1;
      if (nextIndex === null) return;
      event.preventDefault();
      dismissModuleTabHint();
      activateModule(moduleTabs[nextIndex], true);
    });
  });

  const formatCounter = (number, element) => {
    if (element.dataset.format === 'compact') return number >= 1000 ? `${Math.round(number / 1000)}K+` : String(number);
    const decimals = Number(element.dataset.decimals || 0);
    return number.toFixed(decimals) + (element.dataset.suffix || '');
  };

  const counters = document.querySelectorAll('[data-count]');
  const completeCounter = element => {
    element.textContent = formatCounter(Number(element.dataset.count), element);
  };

  if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
    counters.forEach(completeCounter);
  } else {
    const counterObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const element = entry.target;
        const target = Number(element.dataset.count);
        const start = performance.now();
        const animate = now => {
          const progress = Math.min((now - start) / 1200, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          element.textContent = formatCounter(target * eased, element);
          if (progress < 1) requestAnimationFrame(animate);
          else completeCounter(element);
        };
        requestAnimationFrame(animate);
        counterObserver.unobserve(element);
      });
    }, { threshold: 0.5 });
    counters.forEach(counter => counterObserver.observe(counter));
  }

  const lightbox = document.querySelector('.lightbox');
  if (lightbox) {
    const lightboxImage = lightbox.querySelector('img');
    const lightboxViewport = lightbox.querySelector('.lightbox__viewport');
    const lightboxCanvas = lightbox.querySelector('.lightbox__canvas');
    const closeButton = lightbox.querySelector('.lightbox__close');
    const lightboxActions = lightbox.querySelectorAll('.lightbox__action');
    const zoomDisplay = lightbox.querySelector('[data-action="zoom-reset"]');
    let zoomLevel = 1;
    let baseWidth = 0;
    let baseHeight = 0;
    let isPanning = false;
    let panStartX = 0;
    let panStartY = 0;
    let scrollStartLeft = 0;
    let scrollStartTop = 0;
    let lastTrigger = null;

    const fitLightboxImage = () => {
      if (!lightboxImage || !lightboxViewport || !lightboxCanvas || !lightboxImage.naturalWidth || !lightboxImage.naturalHeight) return;
      const availableWidth = Math.max(lightboxViewport.clientWidth - 32, 1);
      const availableHeight = Math.max(lightboxViewport.clientHeight - 32, 1);
      const fitScale = Math.min(availableWidth / lightboxImage.naturalWidth, availableHeight / lightboxImage.naturalHeight, 1);
      baseWidth = Math.round(lightboxImage.naturalWidth * fitScale);
      baseHeight = Math.round(lightboxImage.naturalHeight * fitScale);
    };

    const applyZoom = (preserveCenter = true) => {
      if (!lightboxImage || !lightboxViewport || !lightboxCanvas) return;
      const centerX = preserveCenter && lightboxViewport.scrollWidth ? (lightboxViewport.scrollLeft + lightboxViewport.clientWidth / 2) / lightboxViewport.scrollWidth : 0.5;
      const centerY = preserveCenter && lightboxViewport.scrollHeight ? (lightboxViewport.scrollTop + lightboxViewport.clientHeight / 2) / lightboxViewport.scrollHeight : 0.5;
      const renderedWidth = Math.max(Math.round(baseWidth * zoomLevel), 1);
      const renderedHeight = Math.max(Math.round(baseHeight * zoomLevel), 1);

      lightboxImage.style.width = `${renderedWidth}px`;
      lightboxImage.style.height = `${renderedHeight}px`;
      lightboxCanvas.style.width = `${Math.max(lightboxViewport.clientWidth, renderedWidth + 32)}px`;
      lightboxCanvas.style.height = `${Math.max(lightboxViewport.clientHeight, renderedHeight + 32)}px`;
      lightboxViewport.classList.toggle('is-zoomed', zoomLevel > 1);
      if (zoomDisplay) zoomDisplay.textContent = `${Math.round(zoomLevel * 100)}%`;

      requestAnimationFrame(() => {
        lightboxViewport.scrollLeft = Math.max(0, centerX * lightboxViewport.scrollWidth - lightboxViewport.clientWidth / 2);
        lightboxViewport.scrollTop = Math.max(0, centerY * lightboxViewport.scrollHeight - lightboxViewport.clientHeight / 2);
      });
    };

    const resetZoom = () => {
      zoomLevel = 1;
      fitLightboxImage();
      applyZoom(false);
      if (lightboxViewport) {
        lightboxViewport.scrollLeft = 0;
        lightboxViewport.scrollTop = 0;
      }
    };

    const updateZoom = delta => {
      zoomLevel = Math.min(4, Math.max(1, Number((zoomLevel + delta).toFixed(2))));
      applyZoom();
    };

    const closeLightbox = () => {
      if (lightbox.hidden) return;
      lightbox.hidden = true;
      document.body.classList.remove('lightbox-open');
      isPanning = false;
      resetZoom();
      if (lastTrigger instanceof HTMLElement) lastTrigger.focus();
      lastTrigger = null;
    };

    const openLightbox = trigger => {
      if (!lightboxImage || !closeButton) return;
      const source = trigger.dataset.full || trigger.getAttribute('href');
      if (!source) return;
      lastTrigger = trigger;
      const sourceImage = trigger.querySelector('img');
      lightboxImage.alt = sourceImage?.alt ? `Expanded view: ${sourceImage.alt}` : 'Expanded CALY project figure';
      lightbox.hidden = false;
      document.body.classList.add('lightbox-open');
      zoomLevel = 1;
      lightboxImage.dataset.fallback = trigger.dataset.fallback || '';
      lightboxImage.src = source;
      if (lightboxImage.complete && lightboxImage.naturalWidth) requestAnimationFrame(resetZoom);
      closeButton.focus();
    };

    lightboxImage?.addEventListener('load', resetZoom);
    lightboxImage?.addEventListener('error', () => {
      const fallbackSource = lightboxImage.dataset.fallback;
      if (!fallbackSource || lightboxImage.getAttribute('src') === fallbackSource) return;
      lightboxImage.src = fallbackSource;
    });
    lightboxImage?.setAttribute('draggable', 'false');

    document.addEventListener('click', event => {
      const trigger = event.target.closest('.lightbox-trigger');
      if (!trigger) return;
      event.preventDefault();
      openLightbox(trigger);
    });

    lightboxActions.forEach(action => {
      action.addEventListener('click', () => {
        if (action.dataset.action === 'zoom-in') updateZoom(0.25);
        if (action.dataset.action === 'zoom-out') updateZoom(-0.25);
        if (action.dataset.action === 'zoom-reset') resetZoom();
      });
    });

    lightboxCanvas?.addEventListener('mousedown', event => {
      if (zoomLevel <= 1 || event.button !== 0 || !lightboxViewport) return;
      event.preventDefault();
      isPanning = true;
      lightboxViewport.classList.add('is-panning');
      panStartX = event.clientX;
      panStartY = event.clientY;
      scrollStartLeft = lightboxViewport.scrollLeft;
      scrollStartTop = lightboxViewport.scrollTop;
    });

    window.addEventListener('mousemove', event => {
      if (!isPanning || !lightboxViewport) return;
      lightboxViewport.scrollLeft = scrollStartLeft - (event.clientX - panStartX);
      lightboxViewport.scrollTop = scrollStartTop - (event.clientY - panStartY);
    });

    window.addEventListener('mouseup', () => {
      isPanning = false;
      lightboxViewport?.classList.remove('is-panning');
    });

    window.addEventListener('resize', () => {
      if (lightbox.hidden) return;
      fitLightboxImage();
      applyZoom();
    });

    closeButton?.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', event => {
      if (event.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', event => {
      if (lightbox.hidden) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        closeLightbox();
        return;
      }
      if (event.key === '+' || event.key === '=') {
        event.preventDefault();
        updateZoom(0.25);
      }
      if (event.key === '-') {
        event.preventDefault();
        updateZoom(-0.25);
      }
      if (event.key === '0') {
        event.preventDefault();
        resetZoom();
      }
      if (event.key === 'Tab') {
        const focusable = [...lightbox.querySelectorAll('button:not([disabled])')];
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });
  }

  const backToTop = document.querySelector('.back-to-top');
  backToTop?.addEventListener('click', event => {
    event.preventDefault();
    closeNavigation();
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth'
    });
  });

  const sections = [...document.querySelectorAll('main section[id]')];
  const navLinks = [...document.querySelectorAll('.primary-nav a[href^="#"]')];
  if ('IntersectionObserver' in window && sections.length && navLinks.length) {
    const navObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(link => link.classList.toggle('is-active', link.getAttribute('href') === `#${entry.target.id}`));
      });
    }, { rootMargin: '-35% 0px -55% 0px' });
    sections.forEach(section => navObserver.observe(section));
  }

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && nav?.classList.contains('is-open')) {
      closeNavigation();
      navToggle?.focus();
    }
  });
})();
