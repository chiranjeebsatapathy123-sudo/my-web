/**
 * ExperienceSection — "Where I've Been"
 * Immersive Horizontal Spatial Canvas controlled by Vertical Scroll
 * 60/120 FPS Native Inertia Physics
 */

export function initExperienceSection() {
  const section = document.getElementById('experience');
  if (!section) return;

  const stage = document.getElementById('exp-horizontal-stage');
  if (!stage) return;

  const tickerTop = document.getElementById('exp-ticker-top');
  const tickerBottom = document.getElementById('exp-ticker-bottom');
  const hudProgress = document.getElementById('exp-hud-progress');
  const hudPhase = document.getElementById('exp-hud-phase');
  const dateBgs = document.querySelectorAll('.exp-date-bg');
  const jumpButtons = document.querySelectorAll('.exp-jump-btn');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Camera & Interpolation Physics
  let currentTranslateX = 0;
  let targetTranslateX = 0;
  let currentProgress = 0;
  let targetProgress = 0;
  let isTicking = false;

  function getDimensions() {
    const totalDist = section.offsetHeight - window.innerHeight;
    const stageWidth = stage.scrollWidth;
    const maxTranslate = Math.max(0, stageWidth - window.innerWidth);
    return { totalDist, maxTranslate };
  }

  let { totalDist, maxTranslate } = getDimensions();
  window.addEventListener('resize', () => {
    ({ totalDist, maxTranslate } = getDimensions());
    if (prefersReducedMotion) {
      stage.style.transform = 'none';
    }
  }, { passive: true });

  function renderFrame() {
    isTicking = false;

    if (prefersReducedMotion) return;

    // Smooth inertia lerp (0.09 factor provides tactile, responsive spatial feel)
    currentProgress += (targetProgress - currentProgress) * 0.09;
    currentTranslateX += (targetTranslateX - currentTranslateX) * 0.09;

    // 1. Move Horizontal Camera / Stage
    stage.style.transform = `translate3d(${currentTranslateX.toFixed(2)}px, 0, 0)`;

    // 2. Parallax Drift for Large Background Typography Dates
    dateBgs.forEach(dateEl => {
      const factor = parseFloat(dateEl.getAttribute('data-parallax-factor') || '0.15');
      const dateOffset = -currentTranslateX * factor;
      dateEl.style.transform = `translate3d(${dateOffset.toFixed(2)}px, 0, 0)`;
    });

    // 3. Ambient Running Tickers Parallax Drift
    if (tickerTop) {
      tickerTop.style.transform = `translate3d(${(-currentTranslateX * 0.28).toFixed(2)}px, 0, 0)`;
    }
    if (tickerBottom) {
      tickerBottom.style.transform = `translate3d(${(currentTranslateX * 0.28).toFixed(2)}px, 0, 0)`;
    }

    // 4. Update HUD Progress Indicator
    if (hudProgress) {
      hudProgress.style.width = `${Math.min(100, Math.max(0, currentProgress * 100)).toFixed(1)}%`;
    }

    // 5. Update HUD Phase Label
    if (hudPhase) {
      if (currentProgress < 0.33) {
        hudPhase.textContent = 'FOUNDATION & ACADEMIC RIGOR (ITER SOA)';
      } else if (currentProgress < 0.66) {
        hudPhase.textContent = 'ADVANCED AI & MACHINE LEARNING (CTTC BHUBANESWAR)';
      } else {
        hudPhase.textContent = 'OPEN SOURCE ARCHITECT (12 PRODUCTION REPOSITORIES)';
      }
    }

    // Continue frame if not fully settled
    if (Math.abs(targetTranslateX - currentTranslateX) > 0.1 || Math.abs(targetProgress - currentProgress) > 0.001) {
      isTicking = true;
      requestAnimationFrame(renderFrame);
    }
  }

  function onScroll() {
    const sectionTop = section.getBoundingClientRect().top + window.scrollY;
    const scrolled = window.scrollY - sectionTop;
    const rawProgress = scrolled / totalDist;
    targetProgress = Math.min(Math.max(rawProgress, 0), 1);
    targetTranslateX = -targetProgress * maxTranslate;

    if (!isTicking) {
      isTicking = true;
      requestAnimationFrame(renderFrame);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Interactive Chapter Jump Click Handlers
  jumpButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const p = parseFloat(btn.getAttribute('data-target-progress') || '0');
      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      const targetScroll = sectionTop + p * totalDist;

      window.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
      });
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initExperienceSection);
} else {
  initExperienceSection();
}

