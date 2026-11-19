/* ======================================================================
   SORRELWAKE LODGE — OPENING EXPERIENCE
   ----------------------------------------------------------------------
   A short, skippable arrival ritual. It uses the local GSAP copy when
   available and falls back to a simple fade if the library cannot load.
   Visitors who prefer reduced motion bypass it automatically.
   ====================================================================== */

(function initialiseOpening() {
    'use strict';

    const opening = document.querySelector('[data-opening]');
    const skipButton = document.querySelector('[data-opening-skip]');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!opening) {
        return;
    }

    let completed = false;
    let timeline;

    /**
     * Remove the opening from view and return keyboard focus to the page.
     */
    function completeOpening() {
        if (completed) {
            return;
        }

        completed = true;
        document.body.classList.remove('is-opening');
        opening.classList.add('is-complete');
        opening.setAttribute('aria-hidden', 'true');
    }

    /**
     * Let the visitor bypass the sequence immediately.
     */
    function skipOpening() {
        if (timeline) {
            timeline.kill();
        }

        if (window.gsap) {
            window.gsap.to(opening, {
                autoAlpha: 0,
                duration: 0.35,
                ease: 'power2.out',
                onComplete: completeOpening
            });
        } else {
            opening.style.opacity = '0';
            window.setTimeout(completeOpening, 350);
        }
    }

    skipButton?.addEventListener('click', skipOpening);

    // Play once per visit; returning to the page in the same session goes straight to the site.
    let seenOpening = false;
    try {
        seenOpening = sessionStorage.getItem('sw-opening') === '1';
        sessionStorage.setItem('sw-opening', '1');
    } catch (error) {
        seenOpening = false;
    }

    if (seenOpening) {
        completeOpening();
        return;
    }

    if (prefersReducedMotion) {
        completeOpening();
        return;
    }

    document.body.classList.add('is-opening');

    if (!window.gsap) {
        window.setTimeout(skipOpening, 1700);
        return;
    }

    const gsap = window.gsap;
    const trail = opening.querySelector('.opening__trail');
    const trailLength = trail?.getTotalLength?.() || 1000;

    gsap.set([
        '.opening__eyebrow',
        '.opening__line',
        '.opening__mark',
        '.opening__brand',
        '.opening__whisper'
    ], {
        autoAlpha: 0,
        y: 18
    });

    if (trail) {
        gsap.set(trail, {
            strokeDasharray: trailLength,
            strokeDashoffset: trailLength
        });
    }

    timeline = gsap.timeline({
        defaults: { ease: 'power3.out' },
        onComplete: completeOpening
    });

    timeline
        .to('.opening__orb', {
            autoAlpha: 1,
            scale: 1,
            duration: 1.25
        })
        .to('.opening__eyebrow', {
            autoAlpha: 1,
            y: 0,
            duration: 0.65
        }, 0.18)
        .to(trail, {
            strokeDashoffset: 0,
            duration: 2.2,
            ease: 'power1.inOut'
        }, 0.2)
        .to('.opening__line', {
            autoAlpha: 1,
            y: 0,
            duration: 0.9
        }, 0.55)
        .to('.opening__mark', {
            autoAlpha: 1,
            y: 0,
            rotation: 0,
            duration: 0.85
        }, 1.25)
        .to('.opening__brand', {
            autoAlpha: 1,
            y: 0,
            duration: 0.6
        }, 1.55)
        .to('.opening__whisper', {
            autoAlpha: 1,
            y: 0,
            duration: 0.6
        }, 1.72)
        .to('.opening__copy', {
            autoAlpha: 0,
            y: -12,
            duration: 0.55,
            ease: 'power2.in'
        }, 3.35)
        .to('.opening__door', {
            scaleX: 1,
            duration: 0.55,
            ease: 'power3.inOut'
        }, 3.35)
        .to('.opening__door--left', {
            xPercent: -101,
            duration: 0.85,
            ease: 'power4.inOut'
        }, 3.9)
        .to('.opening__door--right', {
            xPercent: 101,
            duration: 0.85,
            ease: 'power4.inOut'
        }, 3.9)
        .to(opening, {
            autoAlpha: 0,
            duration: 0.25
        }, 4.5);

    // Keep the whole arrival to about 3.4 seconds.
    timeline.timeScale(1.4);
}());
