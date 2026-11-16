/* ======================================================================
   SORRELWAKE LODGE — SITE INTERACTIONS
   ----------------------------------------------------------------------
   Contents
   01. Shared helpers
   02. Header and mobile menu
   03. Reveal animations and hero effects
   04. Room explorer
   05. Daily ritual and dining switcher
   06. Spotlight cards and FAQ
   07. Demo stay planners
   ====================================================================== */

(function initialiseSite() {
    'use strict';

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* 01. SHARED HELPERS
       ================================================================== */
    const all = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));
    const one = (selector, parent = document) => parent.querySelector(selector);

    /**
     * Toggle the hidden state and active class together.
     */
    function showElement(element, shouldShow) {
        if (!element) {
            return;
        }

        element.hidden = !shouldShow;
        element.classList.toggle('is-active', shouldShow);
    }

    /* 02. HEADER AND MOBILE MENU
       ================================================================== */
    const header = one('[data-header]');
    const menu = one('[data-menu]');
    const menuToggle = one('[data-menu-toggle]');

    function updateHeader() {
        header?.classList.toggle('is-scrolled', window.scrollY > 36);
    }

    function closeMenu() {
        document.body.classList.remove('is-menu-open');
        menu?.classList.remove('is-open');
        menuToggle?.setAttribute('aria-expanded', 'false');
    }

    function toggleMenu() {
        const willOpen = !menu?.classList.contains('is-open');

        document.body.classList.toggle('is-menu-open', willOpen);
        menu?.classList.toggle('is-open', willOpen);
        menuToggle?.setAttribute('aria-expanded', String(willOpen));
    }

    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
    menuToggle?.addEventListener('click', toggleMenu);
    all('a, button', menu).forEach((item) => item.addEventListener('click', closeMenu));

    window.addEventListener('resize', () => {
        if (window.innerWidth > 900) {
            closeMenu();
        }
    });

    /* 03. REVEAL ANIMATIONS AND HERO EFFECTS
       ================================================================== */
    const revealItems = all('[data-reveal]');

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
        revealItems.forEach((item) => item.classList.add('is-visible'));
    } else {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '0px 0px -8% 0px',
            threshold: 0.12
        });

        revealItems.forEach((item, index) => {
            item.style.transitionDelay = `${Math.min((index % 4) * 70, 210)}ms`;
            revealObserver.observe(item);
        });
    }

    const hero = one('.hero');
    const heroGlow = one('[data-hero-glow]');

    hero?.addEventListener('pointermove', (event) => {
        if (!heroGlow || prefersReducedMotion) {
            return;
        }

        const bounds = hero.getBoundingClientRect();
        heroGlow.style.left = `${event.clientX - bounds.left}px`;
        heroGlow.style.top = `${event.clientY - bounds.top}px`;
    });

    if (window.gsap && !prefersReducedMotion) {
        const gsap = window.gsap;

        gsap.from('[data-hero-word]', {
            y: 32,
            autoAlpha: 0,
            duration: 0.9,
            stagger: 0.12,
            delay: 4.45,
            ease: 'power3.out'
        });

        if (window.ScrollTrigger) {
            gsap.registerPlugin(window.ScrollTrigger);
            gsap.to('.hero__image', {
                yPercent: 10,
                ease: 'none',
                scrollTrigger: {
                    trigger: '.hero',
                    start: 'top top',
                    end: 'bottom top',
                    scrub: true
                }
            });
        }
    }

    /* 04. ROOM EXPLORER
       ================================================================== */
    const roomTabs = all('[data-room-tab]');
    const roomPanels = all('[data-room-panel]');
    const roomCopies = all('[data-room-copy]');

    function selectRoom(roomName) {
        roomTabs.forEach((tab) => {
            const isSelected = tab.dataset.roomTab === roomName;
            tab.classList.toggle('is-active', isSelected);
            tab.setAttribute('aria-selected', String(isSelected));
        });

        roomPanels.forEach((panel) => showElement(panel, panel.dataset.roomPanel === roomName));
        roomCopies.forEach((copy) => showElement(copy, copy.dataset.roomCopy === roomName));
    }

    roomTabs.forEach((tab) => {
        tab.addEventListener('click', () => selectRoom(tab.dataset.roomTab));
    });

    /* 05. DAILY RITUAL AND DINING SWITCHER
       ================================================================== */
    const ritualSteps = all('[data-ritual-step]');
    const ritualImages = all('[data-ritual-image]');
    const ritualTime = one('[data-ritual-time]');

    function selectRitual(name, time) {
        ritualSteps.forEach((step) => step.classList.toggle('is-active', step.dataset.ritualStep === name));
        ritualImages.forEach((image) => image.classList.toggle('is-active', image.dataset.ritualImage === name));

        if (ritualTime) {
            ritualTime.textContent = time;
        }
    }

    if ('IntersectionObserver' in window) {
        const ritualObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    selectRitual(entry.target.dataset.ritualStep, entry.target.dataset.time);
                }
            });
        }, {
            rootMargin: '-40% 0px -40% 0px',
            threshold: 0
        });

        ritualSteps.forEach((step) => ritualObserver.observe(step));
    }

    const menuTimeButtons = all('[data-menu-time]');
    const sampleMenus = all('[data-menu-panel]');

    menuTimeButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const selectedTime = button.dataset.menuTime;

            menuTimeButtons.forEach((item) => {
                const isSelected = item === button;
                item.classList.toggle('is-active', isSelected);
                item.setAttribute('aria-selected', String(isSelected));
            });

            sampleMenus.forEach((panel) => showElement(panel, panel.dataset.menuPanel === selectedTime));
        });
    });

    /* 06. SPOTLIGHT CARDS AND FAQ
       ================================================================== */
    all('[data-spotlight]').forEach((card) => {
        card.addEventListener('pointermove', (event) => {
            const bounds = card.getBoundingClientRect();
            card.style.setProperty('--spot-x', `${event.clientX - bounds.left}px`);
            card.style.setProperty('--spot-y', `${event.clientY - bounds.top}px`);
        });
    });

    all('.faq-item > button').forEach((button) => {
        button.addEventListener('click', () => {
            const item = button.closest('.faq-item');
            const answer = one('.faq-item__answer', item);
            const willOpen = !item.classList.contains('is-open');

            all('.faq-item').forEach((otherItem) => {
                otherItem.classList.remove('is-open');
                one('button', otherItem)?.setAttribute('aria-expanded', 'false');

                const otherAnswer = one('.faq-item__answer', otherItem);
                if (otherAnswer) {
                    otherAnswer.hidden = true;
                }
            });

            item.classList.toggle('is-open', willOpen);
            button.setAttribute('aria-expanded', String(willOpen));

            if (answer) {
                answer.hidden = !willOpen;
            }
        });
    });

    /* 07. DEMO STAY PLANNERS
       ================================================================== */
    const bookingDialog = one('[data-booking-dialog]');
    const bookingForm = one('[data-booking-form]');
    const bookingStatus = one('[data-booking-status]');
    const quickPlan = one('[data-quick-plan]');
    const quickStatus = one('[data-quick-status]');

    function openBookingDialog() {
        if (!bookingDialog) {
            return;
        }

        closeMenu();
        bookingStatus.textContent = '';
        bookingDialog.showModal();
        document.body.classList.add('is-dialog-open');
    }

    function closeBookingDialog() {
        bookingDialog?.close();
        document.body.classList.remove('is-dialog-open');
    }

    all('[data-booking-open]').forEach((button) => button.addEventListener('click', openBookingDialog));
    one('[data-booking-close]')?.addEventListener('click', closeBookingDialog);

    bookingDialog?.addEventListener('click', (event) => {
        if (event.target === bookingDialog) {
            closeBookingDialog();
        }
    });

    bookingDialog?.addEventListener('close', () => {
        document.body.classList.remove('is-dialog-open');
    });

    bookingForm?.addEventListener('submit', (event) => {
        event.preventDefault();
        bookingStatus.textContent = 'Demo complete — your fictional stay was shaped, but nothing was stored or sent.';
    });

    quickPlan?.addEventListener('submit', (event) => {
        event.preventDefault();
        quickStatus.textContent = 'Demo preview ready. Open “Plan a stay” to explore the fictional room choices; nothing is sent.';
        openBookingDialog();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && menu?.classList.contains('is-open')) {
            closeMenu();
        }
    });
}());
