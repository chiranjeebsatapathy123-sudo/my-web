// ScrollExpandMedia Vanilla JS Component - Zero Lag & High Performance 60/120 FPS 3D Engine
export function initScrollExpandMedia() {
  const section = document.getElementById('about');
  if (!section) return;

  const bgImg = document.getElementById('sem-bg-img');
  const mediaContainer = document.getElementById('sem-media-container');
  const mediaImg = document.getElementById('sem-media-img');
  const mediaBlur = document.getElementById('sem-media-blur');
  const mediaOverlay = document.getElementById('sem-media-overlay');
  const titleFirst = document.getElementById('sem-title-first');
  const titleRest = document.getElementById('sem-title-rest');
  const dateTag = document.getElementById('sem-date');
  const scrollPrompt = document.getElementById('sem-scroll-prompt');
  const mediaContent = document.getElementById('sem-media-content');
  const closedTeaser = document.getElementById('sem-closed-teaser');

  let isMobile = window.innerWidth < 768;
  window.addEventListener('resize', () => {
    isMobile = window.innerWidth < 768;
    renderFrame();
  }, { passive: true });

  let rafScheduled = false;
  let lastProgress = 0;

  // 3D Mouse Parallax Tilt Physics for Closed State
  let mouseTiltX = 0;
  let mouseTiltY = 0;
  let currentTiltX = 0;
  let currentTiltY = 0;

  section.addEventListener('mousemove', (e) => {
    if (lastProgress > 0.25) return;
    const rect = mediaContainer ? mediaContainer.getBoundingClientRect() : null;
    if (!rect) return;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = (e.clientX - centerX) / (rect.width / 2);
    const dy = (e.clientY - centerY) / (rect.height / 2);
    mouseTiltY = Math.max(-1, Math.min(1, dx)) * 14;
    mouseTiltX = Math.max(-1, Math.min(1, -dy)) * 14;
    if (!rafScheduled) {
      rafScheduled = true;
      requestAnimationFrame(renderFrame);
    }
  }, { passive: true });

  section.addEventListener('mouseleave', () => {
    mouseTiltX = 0;
    mouseTiltY = 0;
    if (!rafScheduled) {
      rafScheduled = true;
      requestAnimationFrame(renderFrame);
    }
  }, { passive: true });

  function applyFrame(progress) {
    lastProgress = progress;

    // Initial closed shape: 320px x 440px (mobile: 290px x 400px)
    const startW = isMobile ? 290 : 330;
    const startH = isMobile ? 390 : 440;

    // Fully expanded size matching large viewport deck
    const maxWByViewport = window.innerWidth * 0.96;
    const endW = Math.min(maxWByViewport, 1420);
    const endH = Math.min(window.innerHeight * 0.93, 940);

    const currentW = startW + progress * (endW - startW);
    const currentH = startH + progress * (endH - startH);
    const textTranslateX = (progress * (isMobile ? 180 : 150)).toFixed(1);

    // Smooth tilt dampening: tilt fades to 0 as card expands
    const tiltBlend = Math.max(0, 1 - progress * 4);
    currentTiltX += (mouseTiltX * tiltBlend - currentTiltX) * 0.15;
    currentTiltY += (mouseTiltY * tiltBlend - currentTiltY) * 0.15;

    // Hardware accelerated unblur: smoothly fades out the pre-blurred layer
    if (mediaBlur) {
      if (progress < 0.45) {
        mediaBlur.style.visibility = 'visible';
        mediaBlur.style.opacity = Math.max(0, 1 - progress * 2.3).toFixed(3);
      } else {
        mediaBlur.style.opacity = '0';
        mediaBlur.style.visibility = 'hidden';
      }
    }

    // Media container sizing & 3D perspective update
    if (mediaContainer) {
      mediaContainer.style.width = `${currentW.toFixed(1)}px`;
      mediaContainer.style.height = `${currentH.toFixed(1)}px`;
      mediaContainer.style.transform = `translate(-50%, -50%) perspective(1200px) rotateX(${currentTiltX.toFixed(2)}deg) rotateY(${currentTiltY.toFixed(2)}deg) translateZ(0)`;
      const borderOpacity = (0.2 + (1 - progress) * 0.4).toFixed(2);
      mediaContainer.style.borderColor = `rgba(6, 182, 212, ${borderOpacity})`;
      mediaContainer.style.borderRadius = progress > 0.6 ? '24px' : '32px';
    }

    // Closed state teaser fade out
    if (closedTeaser) {
      const teaserOpacity = Math.max(0, 1 - progress * 3.2).toFixed(3);
      closedTeaser.style.opacity = teaserOpacity;
      closedTeaser.style.pointerEvents = teaserOpacity > 0.1 ? 'auto' : 'none';
    }

    // Background ambient image fade
    if (bgImg) {
      bgImg.style.opacity = Math.max(0.15, 1 - progress * 1.1).toFixed(3);
    }

    // Media overlay contrast
    if (mediaOverlay) {
      mediaOverlay.style.opacity = Math.max(0.4, 0.85 - progress * 0.35).toFixed(3);
    }

    // Title words translate outward in 3D perspective and fade
    const titleOpacity = Math.max(0, 1 - progress * 1.6).toFixed(3);
    if (titleFirst) {
      titleFirst.style.transform = `translate3d(-${textTranslateX}vw, -${(progress * 25).toFixed(1)}px, 50px) rotateY(-${(progress * 10).toFixed(1)}deg)`;
      titleFirst.style.opacity = titleOpacity;
    }
    if (titleRest) {
      titleRest.style.transform = `translate3d(${textTranslateX}vw, ${(progress * 25).toFixed(1)}px, 50px) rotateY(${(progress * 10).toFixed(1)}deg)`;
      titleRest.style.opacity = titleOpacity;
    }

    // Subtitles translate outward and fade quickly
    const subOpacity = Math.max(0, 1 - progress * 2.8).toFixed(3);
    if (dateTag) {
      dateTag.style.transform = `translate3d(-${textTranslateX}vw, 0, 30px)`;
      dateTag.style.opacity = subOpacity;
    }
    if (scrollPrompt) {
      scrollPrompt.style.transform = `translate3d(${textTranslateX}vw, 0, 30px)`;
      scrollPrompt.style.opacity = subOpacity;
    }

    // Command Deck reveals smoothly as media finishes expanding
    if (mediaContent) {
      if (progress >= 0.68) {
        const contentFade = Math.min(1, (progress - 0.68) / 0.22);
        mediaContent.style.opacity = contentFade.toFixed(3);
        mediaContent.style.pointerEvents = contentFade > 0.4 ? 'auto' : 'none';
        mediaContent.style.transform = `translateY(${((1 - contentFade) * 16).toFixed(1)}px)`;
      } else {
        mediaContent.style.opacity = '0';
        mediaContent.style.pointerEvents = 'none';
        mediaContent.style.transform = 'translateY(20px)';
      }
    }
  }

  function renderFrame() {
    rafScheduled = false;
    const rect = section.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const totalDist = section.offsetHeight - windowHeight;

    if (totalDist <= 0) return;

    const scrolled = -rect.top;
    let target = 0;
    if (scrolled > 0) {
      const rawRatio = scrolled / totalDist;
      target = Math.min(Math.max(rawRatio / 0.90, 0), 1);
    }

    applyFrame(target);
  }

  function onScroll() {
    if (!rafScheduled) {
      rafScheduled = true;
      requestAnimationFrame(renderFrame);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  renderFrame();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initScrollExpandMedia);
} else {
  initScrollExpandMedia();
}
