/**
 * WorksWheel - 3D Vertical Drum & Ring Portfolio Index Component
 * Vanilla JavaScript Implementation of the WorksWheel Component
 */

const CARD_H = 0.38; // front card height, of the stage
const CARD_MAX_W = 0.34; // ... but never wider than this much of the stage
const CARD_RATIO = 1.45; // card width / height
const STEP = 40; // degrees between cards on the drum
const DRUM = 2.22; // drum radius, in card heights - and everything below likewise
const LENS = 2.7; // perspective distance
const RING_R = 1.14; // ring radius
const BOW = 1.82;
const TITLE = 0.115; // ring label and front-card title
const INDEX = 0.038; // the index down the right-hand side
const CULL = 1.6;

const WHEEL_UNITS = 900;
const DRAG_UNITS = 420;
const SETTLE = 140;
const EASE = 0.12;

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const lerp = (a, b, t) => a + (b - a) * t;
const rad = (deg) => (deg * Math.PI) / 180;
const bowAt = (drumDeg, bow) => -bow * (1 - Math.cos(rad(drumDeg)));

function place(ringDeg, drumDeg, ringR, drumR, bow, m) {
  return (
    `translateX(${m * bowAt(drumDeg, bow)}px)` +
    ` rotateZ(${(1 - m) * ringDeg}deg) translateY(${-(1 - m) * ringR}px)` +
    ` rotateX(${m * drumDeg}deg) translateZ(${m * drumR}px)`
  );
}

export const DEFAULT_WORKS = [
  {
    "id": "12",
    "title": "AgroFedly",
    "subtitle": "AI Agriculture & Supply Chain Intelligence",
    "description": "Enterprise-grade agricultural intelligence and produce supply chain management system integrating machine learning models for crop disease detection and predictive price analytics.",
    "image": "/media/projects/agrofedly_showcase.png",
    "src": "/media/projects/agrofedly_showcase.png",
    "href": "https://github.com/chiranjeebsatapathy123-sudo/AgroFedly",
    "link": "https://agro-fedly.vercel.app",
    "stats": "YOLOv8 Detection \u2022 Django REST \u2022 Vercel Edge",
    "tools": [
      "Python",
      "Django",
      "Machine Learning",
      "Docker",
      "Vercel"
    ],
    "deliverables": [
      "YOLOv8 crop disease classification",
      "Predictive pricing volatility engine",
      "Decoupled Django REST API",
      "Real-time inventory monitoring"
    ]
  },
  {
    "id": "13",
    "title": "MediStock Pro",
    "subtitle": "Healthcare & Pharmaceutical Inventory Intelligence",
    "description": "Comprehensive pharmaceutical inventory and hospital supply chain management platform designed to eliminate drug shortages and streamline clinic dispensing workflows.",
    "image": "/media/projects/medistock_showcase.png",
    "src": "/media/projects/medistock_showcase.png",
    "href": "https://github.com/chiranjeebsatapathy123-sudo/medi-stock",
    "link": "https://medi-stock-nu.vercel.app",
    "stats": "Real-Time Stock Alerts \u2022 Batch Expiry Tracking \u2022 RESTful Architecture",
    "tools": [
      "Python",
      "JavaScript",
      "REST APIs",
      "Docker",
      "Vercel"
    ],
    "deliverables": [
      "Threshold alerting and automated reorders",
      "Batch expiry tracking & clinic audit logs",
      "Role-based authentication",
      "Sub-100ms API response latency"
    ]
  },
  {
    "id": "15",
    "title": "Real-Time Emotion AI",
    "subtitle": "Computer Vision & Micro-Expression Classifier",
    "description": "Deep learning computer vision pipeline capable of detecting human faces and classifying emotional micro-expressions in real-time through live web camera video feeds.",
    "image": "/media/projects/real_emotion_showcase.png",
    "src": "/media/projects/real_emotion_showcase.png",
    "href": "https://github.com/chiranjeebsatapathy123-sudo/real_emotion",
    "link": "https://real-emotion.vercel.app",
    "stats": "60 FPS Video Stream \u2022 OpenCV & CNNs \u2022 7 Emotion Classes",
    "tools": [
      "Python",
      "OpenCV",
      "TensorFlow",
      "Deep Learning",
      "PyTorch"
    ],
    "deliverables": [
      "Haar Cascade & CNN multi-face detection",
      "Sub-20ms inference latency for 7 classes",
      "Interactive webcam feed overlay",
      "Confidence score telemetry"
    ]
  },
  {
    "id": "14",
    "title": "Margdarshak AI (Nirmit)",
    "subtitle": "Agentic Regional Language Learning",
    "description": "Agentic, personalized educational guidance platform engineered to deliver multilingual STEM learning in vernacular Indian regional dialects using Google Gemini APIs.",
    "image": "/media/projects/nirmit_showcase.png",
    "src": "/media/projects/nirmit_showcase.png",
    "href": "https://github.com/chiranjeebsatapathy123-sudo/nirmit",
    "link": "https://nirmit-edu.vercel.app",
    "stats": "Google Gemini 2.5/3.5 \u2022 Multilingual NLP \u2022 FastAPI Microservice",
    "tools": [
      "Python",
      "FastAPI",
      "Gemini API",
      "Docker",
      "Machine Learning"
    ],
    "deliverables": [
      "Autonomous Gemini agent for personalized learning",
      "Adaptive difficulty assessment engine",
      "High-throughput asynchronous backend",
      "Vernacular STEM translation"
    ]
  },
  {
    "id": "16",
    "title": "Life RPG",
    "subtitle": "Gamified Habit & Productivity Progression",
    "description": "Life RPG turns real-world daily activities and engineering habits into an immersive role-playing quest game with experience points, stat attributes, and rank badges.",
    "image": "/media/projects/rpm_game_showcase.png",
    "src": "/media/projects/rpm_game_showcase.png",
    "href": "https://github.com/chiranjeebsatapathy123-sudo/Rpm_Game",
    "link": "https://rpm-game.vercel.app",
    "stats": "XP Mathematical Model \u2022 Canvas Graphics \u2022 Offline Storage",
    "tools": [
      "JavaScript",
      "HTML5/CSS3",
      "Game Development",
      "Vercel"
    ],
    "deliverables": [
      "Custom XP and level progression mechanics",
      "Interactive canvas quest animations",
      "Offline localStorage persistence",
      "Daily habit streak tracking"
    ]
  },
  {
    "id": "17",
    "title": "NextGen E-Commerce",
    "subtitle": "Cloud Storefront & Payment Architecture",
    "description": "High-concurrency modern e-commerce storefront designed with decoupled frontend-backend architecture, persistent cart state, and order tracking.",
    "image": "/media/projects/ecommerce_showcase.png",
    "src": "/media/projects/ecommerce_showcase.png",
    "href": "https://github.com/chiranjeebsatapathy123-sudo/e-commerce",
    "link": "https://e-commerce-gray-beta-20.vercel.app",
    "stats": "Decoupled REST API \u2022 Reactive Cart \u2022 Mobile-First UX",
    "tools": [
      "JavaScript",
      "Node.js",
      "REST APIs",
      "Docker",
      "Vercel"
    ],
    "deliverables": [
      "Sub-second product catalog search",
      "Reactive shopping cart state machine",
      "Node.js REST API with automated notifications",
      "Vercel Edge network deployment"
    ]
  },
  {
    "id": "7",
    "title": "CampusConnect",
    "subtitle": "Academic Discussion & Student Forum",
    "description": "Academic discussion platform engineered for university students to exchange course materials, verify study solutions, and collaborate on engineering projects.",
    "image": "/media/projects/student_forum_showcase.png",
    "src": "/media/projects/student_forum_showcase.png",
    "href": "https://github.com/chiranjeebsatapathy123-sudo/student-forum",
    "link": "https://student-forum-fvxs.vercel.app",
    "stats": "Django 5 Architecture \u2022 ACID PostgreSQL \u2022 Zero Bottlenecks",
    "tools": [
      "Python",
      "Django",
      "PostgreSQL",
      "HTML5/CSS3",
      "REST APIs"
    ],
    "deliverables": [
      "Threaded discussion hierarchy with markdown",
      "Upvoting algorithms & reputation badges",
      "Django ORM query optimization",
      "Role-based moderation tools"
    ]
  },
  {
    "id": "8",
    "title": "AtmosphereIQ",
    "subtitle": "Meteorological Radar & Telemetry",
    "description": "Interactive meteorological radar and telemetry platform that aggregates multi-city weather sensor metrics, historical forecast models, and humidity trends.",
    "image": "/media/projects/weather_dashboard_showcase.png",
    "src": "/media/projects/weather_dashboard_showcase.png",
    "href": "https://github.com/chiranjeebsatapathy123-sudo/weather-dashboard",
    "link": "https://weather-dashboard-lkf1.vercel.app",
    "stats": "Chart.js Visuals \u2022 Geospatial Radar \u2022 OpenWeather Integration",
    "tools": [
      "JavaScript",
      "Python",
      "Chart.js",
      "REST APIs"
    ],
    "deliverables": [
      "Dynamic Chart.js temperature radar",
      "Real-time OpenWeatherMap API geospatial integration",
      "Auto-detect geolocation",
      "Dark-mode cybernetic dashboard"
    ]
  },
  {
    "id": "9",
    "title": "ZenFlow",
    "subtitle": "Agile Productivity & Team Collaboration",
    "description": "Enterprise agile productivity system that empowers distributed software engineering teams with sprint telemetry, kanban workflows, and focus timers.",
    "image": "/media/projects/zenflow_showcase.png",
    "src": "/media/projects/zenflow_showcase.png",
    "href": "https://github.com/chiranjeebsatapathy123-sudo/ZenFlow",
    "link": "https://zen-flow-two.vercel.app",
    "stats": "TypeScript Next.js \u2022 Drag & Drop Kanban \u2022 Pomodoro Soundscape",
    "tools": [
      "TypeScript",
      "React",
      "Next.js",
      "TailwindCSS",
      "Vercel"
    ],
    "deliverables": [
      "Drag-and-drop Kanban state machine",
      "Pomodoro cognitive focus timer with soundscape",
      "TypeScript type-safe architecture",
      "Sprint burndown task analytics"
    ]
  },
  {
    "id": "18",
    "title": "EcoFuture",
    "subtitle": "Environmental Intelligence & Green Tech",
    "description": "Environmental advocacy and sustainability platform dedicated to global climate analytics, carbon footprint calculation, and renewable initiative funding.",
    "image": "/media/projects/ecofuture_showcase.png",
    "src": "/media/projects/ecofuture_showcase.png",
    "href": "https://github.com/chiranjeebsatapathy123-sudo/Eco-future",
    "link": "https://eco-future-rosy.vercel.app",
    "stats": "Carbon Offset Calculator \u2022 Sustainability Analytics \u2022 Green Tech UI",
    "tools": [
      "JavaScript",
      "HTML5/CSS3",
      "Vercel"
    ],
    "deliverables": [
      "Interactive carbon offset calculator",
      "Global renewable initiative discovery feed",
      "High-performance static rendering",
      "Mobile-first responsive design"
    ]
  },
  {
    "id": "19",
    "title": "Thiranex 2.0",
    "subtitle": "Autonomous Workflow & Developer Automation",
    "description": "Continuous workflow monitoring and autonomous task management for engineering teams. Integrates developer tools, milestone roadmaps, and release monitoring.",
    "image": "/media/projects/thiranex2_showcase.png",
    "src": "/media/projects/thiranex2_showcase.png",
    "href": "https://github.com/chiranjeebsatapathy123-sudo/thiranex2",
    "link": "https://thiranex2-taupe.vercel.app",
    "stats": "Continuous Release Telemetry \u2022 Git Activity Logger \u2022 Automation",
    "tools": [
      "JavaScript",
      "HTML5/CSS3",
      "Git & GitHub",
      "Vercel"
    ],
    "deliverables": [
      "Continuous release telemetry & sprint dashboard",
      "Automated git activity logger",
      "Decoupled responsive UI with fluid transitions",
      "Automated Vercel staging"
    ]
  },
  {
    "id": "11",
    "title": "PersonalVault",
    "subtitle": "Encrypted Cloud & Autonomous AI Portfolio",
    "description": "All-in-one personal cloud platform and cinematic developer portfolio featuring AES-256 secret vaulting, interactive 3D WebGL universes, and integrated Gemini AI Copilot.",
    "image": "/media/projects/cloudvault_showcase.png",
    "src": "/media/projects/cloudvault_showcase.png",
    "href": "https://github.com/chiranjeebsatapathy123-sudo/my-web",
    "link": "https://thiranex3-iota.vercel.app/",
    "stats": "AES-256 Encryption \u2022 Three.js Cosmos \u2022 Gemini 3.5 Copilot",
    "tools": [
      "Python",
      "Django",
      "JavaScript",
      "Gemini API",
      "Three.js"
    ],
    "deliverables": [
      "AES-256 encrypted secret vault with 2FA",
      "Interactive Three.js particle cosmos background",
      "Full-stack Django 5 architecture",
      "Autonomous Gemini AI Copilot"
    ]
  }
];

export function initWorksWheel(container, options = {}) {
  if (!container) return null;

  const items = options.items || DEFAULT_WORKS;
  const label = options.label || "Works '26";
  const action = options.action !== undefined ? options.action : "View";
  const onSelect = options.onSelect || null;

  const count = items.length;
  const last = Math.max(count - 1, 0);

  let turn = 0;
  let target = 0;
  let active = 0;
  let stage = { w: container.clientWidth || 800, h: container.clientHeight || 600 };
  let reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Drag & click state
  let isPointerDown = false;
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let lastY = 0;
  let dragCapturedPointerId = null;
  const DRAG_THRESHOLD = 6; // pixels

  // Build DOM Structure
  container.innerHTML = "";
  container.classList.add("relative", "w-full", "h-full", "overflow-hidden", "select-none");

  const section = document.createElement("section");
  section.setAttribute("aria-label", label);
  section.className = "relative w-full h-full min-h-[24rem] overflow-hidden select-none bg-transparent text-neutral-900 dark:text-neutral-100";

  // Stage (perspective container)
  const stageEl = document.createElement("div");
  stageEl.tabIndex = 0;
  stageEl.role = "listbox";
  stageEl.setAttribute("aria-label", label);
  stageEl.className = "absolute inset-0 cursor-grab touch-pan-x outline-none focus-visible:outline-2 focus-visible:outline-neutral-900 dark:focus-visible:outline-white focus-visible:-outline-offset-4 active:cursor-grabbing";

  // Wheel (preserve-3d anchor)
  const wheelEl = document.createElement("div");
  wheelEl.className = "absolute top-1/2 left-1/2 pointer-events-none transition-none";
  wheelEl.style.transformStyle = "preserve-3d";

  // Cards
  const cardRefs = [];
  items.forEach((item, i) => {
    const card = document.createElement("div");
    card.id = `works-wheel-${i}`;
    card.role = "option";
    card.tabIndex = 0;
    card.setAttribute("aria-selected", i === 0 ? "true" : "false");
    card.setAttribute("aria-label", `${item.title} — Click or press Enter to view details`);
    card.className = "group absolute cursor-pointer pointer-events-auto [backface-visibility:hidden] focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white rounded-2xl outline-none";
    card.style.transformStyle = "preserve-3d";
    card.style.willChange = "transform, opacity";

    const face = document.createElement("div");
    face.className = "relative block w-full h-full overflow-hidden rounded-2xl bg-white dark:bg-[#181818] border border-neutral-300/80 dark:border-neutral-700/80 shadow-[0_20px_45px_-15px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_45px_-15px_rgba(0,0,0,0.6)] transition-all duration-300 hover:shadow-[0_28px_50px_-10px_rgba(0,0,0,0.22)] hover:border-neutral-500 dark:hover:border-neutral-400";
    face.style.willChange = "transform";
    face.style.transformOrigin = "center center";

    const img = document.createElement("img");
    img.src = item.image;
    img.alt = item.title;
    img.draggable = false;
    img.className = "w-full h-full object-cover select-none pointer-events-none";
    img.loading = "eager";

    face.appendChild(img);

    // Subtle gradient overlay for card readability
    const gradientOverlay = document.createElement("div");
    gradientOverlay.className = "pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent";
    face.appendChild(gradientOverlay);

    // Bottom subtle info badge on card with fully functional VIEW button
    const cardInfo = document.createElement("div");
    cardInfo.className = "pointer-events-auto absolute left-3.5 bottom-3.5 right-3.5 flex items-center justify-between z-20";

    const cardTitle = document.createElement("span");
    cardTitle.className = "text-[11px] font-mono tracking-wider text-white drop-shadow font-semibold truncate max-w-[65%] select-none pointer-events-none";
    cardTitle.textContent = item.title;

    // Fully accessible, functional VIEW ↗ link button
    const viewBtn = document.createElement("a");
    viewBtn.href = item.href || item.link;
    viewBtn.target = "_blank";
    viewBtn.rel = "noopener noreferrer";
    viewBtn.className = "view-project-btn pointer-events-auto cursor-pointer bg-white/95 hover:bg-white dark:bg-neutral-800/95 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-100 dark:border dark:border-neutral-600 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1 hover:scale-105 active:scale-95 transition-all outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white";
    viewBtn.setAttribute("aria-label", `View ${item.title} repository in a new tab`);
    viewBtn.setAttribute("title", `Open ${item.title} repository in new tab`);
    viewBtn.innerHTML = `<span>${action} ↗</span>`;

    // Intercept drag so direct button clicks open link cleanly
    const handleViewClick = (e) => {
      if (isDragging) {
        e.preventDefault();
        return;
      }
      e.stopPropagation();
    };
    viewBtn.addEventListener("click", handleViewClick);
    viewBtn.addEventListener("touchend", handleViewClick);

    cardInfo.appendChild(cardTitle);
    cardInfo.appendChild(viewBtn);
    face.appendChild(cardInfo);
    card.appendChild(face);

    // Click on card body opens project modal for active card or rotates to non-active card
    const handleCardActivate = (e) => {
      if (isDragging) return;
      if (active === i) {
        if (onSelect) {
          onSelect(i, item);
        } else if (window.openProjectModal) {
          window.openProjectModal(item);
        } else if (item.href && item.href.startsWith("http")) {
          window.open(item.href, "_blank", "noopener,noreferrer");
        }
      } else {
        to(i + 1);
      }
    };

    card.addEventListener("click", handleCardActivate);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleCardActivate(e);
      }
    });

    wheelEl.appendChild(card);
    cardRefs.push(card);
  });

  stageEl.appendChild(wheelEl);
  section.appendChild(stageEl);

  // Center ring label ("Works '26" or "Landing Pages")
  const labelEl = document.createElement("div");
  labelEl.className = "pointer-events-none absolute inset-0 grid place-items-center tracking-tight font-black uppercase text-center text-neutral-900 dark:text-neutral-100 select-none z-10 transition-opacity duration-300";
  labelEl.textContent = label;
  section.appendChild(labelEl);

  // Front-card title - responsive positioning prevents any card collision
  const titleEl = document.createElement("div");
  titleEl.className = "pointer-events-none absolute tracking-tight font-black uppercase text-neutral-900 dark:text-white opacity-0 select-none z-10 leading-[1.05] transition-opacity duration-300";
  titleEl.textContent = items[0] ? items[0].title : "";
  section.appendChild(titleEl);

  // Side Index List
  const indexList = document.createElement("ol");
  indexList.className = "text-neutral-500 dark:text-neutral-400 absolute top-[7%] right-[3%] text-right leading-[1.75] z-20 space-y-0.5 select-none font-mono";
  const indexButtons = [];

  items.forEach((item, i) => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.setAttribute("aria-label", `Jump to project: ${item.title}`);
    if (i === 0) {
      btn.innerHTML = `<span class="inline-block w-1.5 h-1.5 rounded-full bg-black dark:bg-white mr-2 align-middle"></span><span class="text-neutral-900 dark:text-white font-extrabold underline decoration-2 underline-offset-4">${item.title}</span>`;
      btn.className = "cursor-pointer transition-all duration-200 text-[10px] md:text-xs tracking-wider outline-none block ml-auto scale-105";
    } else {
      btn.innerHTML = `<span>${item.title}</span>`;
      btn.className = "cursor-pointer transition-all duration-200 text-[10px] md:text-xs tracking-wider outline-none text-neutral-400 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-white block ml-auto";
    }
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      to(i + 1);
    });
    li.appendChild(btn);
    indexList.appendChild(li);
    indexButtons.push(btn);
  });
  section.appendChild(indexList);

  // Bottom helper pill
  const hintPill = document.createElement("div");
  hintPill.className = "pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-[#181818]/90 border border-neutral-200 dark:border-neutral-800 shadow-sm backdrop-blur-md text-[10px] md:text-[11px] font-mono text-neutral-600 dark:text-neutral-300 uppercase tracking-wider";
  hintPill.innerHTML = `
    <svg class="w-3 h-3 text-neutral-500 animate-bounce" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
      <path d="M19 14l-7 7m0 0l-7-7m7 7V3" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <span>SCROLL OR DRAG DRUM TO CYCLE</span>
  `;
  section.appendChild(hintPill);

  container.appendChild(section);

  // Geometry computation
  let currentMetrics = calculateMetrics();

  function calculateMetrics() {
    const w = stage.w || 800;
    const h = stage.h || 600;
    const isMobile = w < 768;
    const isTablet = w >= 768 && w < 1024;

    // Responsive card dimensions: tablet and mobile cards scaled for clear visibility without crowding
    const maxWFactor = isMobile ? 0.58 : isTablet ? 0.31 : 0.33;
    const cardHFactor = isMobile ? 0.28 : CARD_H;

    const cardW = Math.min(h * cardHFactor * CARD_RATIO, w * maxWFactor);
    const cardH = cardW / CARD_RATIO;
    const drumR = cardH * DRUM;
    const ringR = cardH * RING_R;
    const ringScale = count
      ? clamp((((2 * Math.PI * ringR) / count) * 0.82) / (cardW || 1), 0.16, 1)
      : 1;

    return {
      cardW,
      cardH,
      ringR,
      ringScale,
      drumR,
      bow: cardH * BOW,
      depth: cardH * LENS,
      title: Math.max(22, cardH * TITLE),
      index: Math.max(10, cardH * INDEX),
    };
  }

  function applyMetrics() {
    currentMetrics = calculateMetrics();
    stageEl.style.perspective = `${currentMetrics.depth}px`;

    cardRefs.forEach((card) => {
      card.style.width = `${currentMetrics.cardW}px`;
      card.style.height = `${currentMetrics.cardH}px`;
      card.style.marginLeft = `${-currentMetrics.cardW / 2}px`;
      card.style.marginTop = `${-currentMetrics.cardH / 2}px`;
    });

    const w = stage.w || 800;
    labelEl.style.fontSize = `${currentMetrics.title}px`;

    if (w >= 1024) {
      // Desktop: left-aligned dramatic heading vertically centered with dedicated reserved width
      titleEl.style.fontSize = `${Math.min(36, Math.max(24, currentMetrics.cardH * 0.135))}px`;
      titleEl.style.top = "50%";
      titleEl.style.left = "6%";
      titleEl.style.transform = "translateY(-50%)";
      titleEl.style.maxWidth = "28%";
      titleEl.style.textAlign = "left";

      indexList.style.top = "7%";
      indexList.style.right = "3%";
      indexList.style.maxWidth = "260px";
      indexList.style.fontSize = "12px";
      indexList.style.lineHeight = "1.75";
    } else if (w >= 768) {
      // Tablet: 3-column layout with left heading, center wheel, and right index list
      titleEl.style.fontSize = `${Math.min(24, Math.max(19, currentMetrics.cardH * 0.13))}px`;
      titleEl.style.top = "50%";
      titleEl.style.left = "4%";
      titleEl.style.transform = "translateY(-50%)";
      titleEl.style.maxWidth = "28%";
      titleEl.style.textAlign = "left";

      indexList.style.top = "7%";
      indexList.style.right = "2.5%";
      indexList.style.maxWidth = "200px";
      indexList.style.fontSize = "11px";
      indexList.style.lineHeight = "1.65";
    } else {
      // Mobile: heading sits cleanly at top, index list below it on right, card deck centered in lower area
      titleEl.style.fontSize = "19px";
      titleEl.style.top = "3%";
      titleEl.style.left = "4%";
      titleEl.style.transform = "none";
      titleEl.style.maxWidth = "92%";
      titleEl.style.textAlign = "left";

      indexList.style.top = "76px";
      indexList.style.right = "4%";
      indexList.style.maxWidth = "65%";
      indexList.style.fontSize = "9.5px";
      indexList.style.lineHeight = "1.55";
    }
  }

  applyMetrics();

  // ResizeObserver
  const ro = new ResizeObserver(() => {
    stage = { w: stageEl.clientWidth, h: stageEl.clientHeight };
    applyMetrics();
  });
  ro.observe(stageEl);

  // Target steering
  function to(next) {
    target = clamp(next, 0, last + 1);
  }

  // Wheel interaction
  let settlingTimer = null;
  const onWheel = (event) => {
    const delta = event.deltaY;
    const next = target + delta / WHEEL_UNITS;
    // Native listener: cancellable only while inside wheel range so page scrolls on at edges
    if (next > 0 && next < last + 1) {
      event.preventDefault();
    }
    to(next);
    clearTimeout(settlingTimer);
    settlingTimer = setTimeout(() => {
      to(Math.round(target));
    }, SETTLE);
  };
  stageEl.addEventListener("wheel", onWheel, { passive: false });

  // Pointer drag interaction (with drag threshold so clicks are not swallowed)
  stageEl.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    // Let button or link clicks pass through without initiating wheel drag
    if (event.target.closest("a, button")) {
      return;
    }
    isPointerDown = true;
    isDragging = false;
    startX = event.clientX;
    startY = event.clientY;
    lastY = event.clientY;
    dragCapturedPointerId = event.pointerId;
  });

  stageEl.addEventListener("pointermove", (event) => {
    if (!isPointerDown) return;
    const dist = Math.hypot(event.clientX - startX, event.clientY - startY);
    if (!isDragging && dist > DRAG_THRESHOLD) {
      isDragging = true;
      try {
        stageEl.setPointerCapture(event.pointerId);
      } catch (_) {}
    }
    if (isDragging) {
      const diff = lastY - event.clientY;
      to(target + diff / DRAG_UNITS);
      lastY = event.clientY;
    }
  });

  const endDrag = (event) => {
    if (!isPointerDown) return;
    isPointerDown = false;
    if (dragCapturedPointerId !== null && stageEl.hasPointerCapture(dragCapturedPointerId)) {
      try {
        stageEl.releasePointerCapture(dragCapturedPointerId);
      } catch (_) {}
    }
    dragCapturedPointerId = null;

    if (isDragging) {
      to(Math.round(target));
      setTimeout(() => {
        isDragging = false;
      }, 60);
    }
  };

  stageEl.addEventListener("pointerup", endDrag);
  stageEl.addEventListener("pointercancel", endDrag);

  // Keyboard navigation
  stageEl.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      to(Math.round(target) + 1);
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      to(Math.round(target) - 1);
    }
  });

  // UI Active State Update
  function updateActiveUI(near) {
    stageEl.setAttribute("aria-activedescendant", `works-wheel-${near}`);
    cardRefs.forEach((card, idx) => {
      card.setAttribute("aria-selected", idx === near ? "true" : "false");
    });

    indexButtons.forEach((btn, idx) => {
      if (idx === near) {
        btn.innerHTML = `<span class="inline-block w-1.5 h-1.5 rounded-full bg-black dark:bg-white mr-2 align-middle"></span><span class="text-neutral-900 dark:text-white font-extrabold underline decoration-2 underline-offset-4">${items[idx].title}</span>`;
        btn.className = "cursor-pointer transition-all duration-200 text-[10px] md:text-xs tracking-wider outline-none block ml-auto scale-105";
      } else {
        btn.innerHTML = `<span>${items[idx].title}</span>`;
        btn.className = "cursor-pointer transition-all duration-200 text-[10px] md:text-xs tracking-wider outline-none text-neutral-400 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-white block ml-auto";
      }
    });

    const counter = document.getElementById("works-wheel-counter");
    if (counter) {
      counter.textContent = `${String(near + 1).padStart(2, "0")} / ${String(count).padStart(2, "0")}`;
    }

    if (items[near]) {
      titleEl.textContent = items[near].title;
    }
  }

  // Animation Loop (Single rAF pass writing direct DOM transforms)
  let frameId = 0;
  let isRunning = true;

  const draw = () => {
    if (!isRunning) return;
    frameId = requestAnimationFrame(draw);

    const gap = target - turn;
    if (Math.abs(gap) < 0.0005) {
      turn = target;
    } else {
      turn += gap * (reduced ? 1 : EASE);
    }

    const t = turn;
    const m = clamp(t, 0, 1);
    const pos = Math.max(0, t - 1);

    const { ringR, ringScale, drumR, bow } = currentMetrics;

    const isDesktop = (stage.w || 800) >= 1024;
    const isTablet = (stage.w || 800) >= 768 && (stage.w || 800) < 1024;
    // Desktop and Tablet: smoothly shift wheel center to right to preserve dramatic title space; Mobile: shift downward
    const targetLeft = isDesktop ? lerp(50, 54, m) : isTablet ? lerp(50, 52, m) : 50;
    const targetTop = (isDesktop || isTablet) ? 50 : lerp(50, 68, m);
    if (wheelEl) {
      wheelEl.style.left = `${targetLeft}%`;
      wheelEl.style.top = `${targetTop}%`;
      wheelEl.style.transform = `translateZ(${-m * drumR}px)`;
    }

    for (let i = 0; i < count; i++) {
      const d = i - pos;
      const drumDeg = d * STEP;
      const card = cardRefs[i];
      if (card) {
        card.style.transform = place(
          d * (360 / count),
          drumDeg,
          ringR,
          drumR,
          bow,
          m
        );
        card.style.opacity = m > 0.5 && Math.abs(d) > CULL ? "0" : "1";
        card.style.zIndex = String(Math.round(100 - Math.abs(d) * 2));
      }
      const face = card ? card.firstElementChild : null;
      if (face) {
        face.style.transform = `scale(${lerp(ringScale, 1, m)})`;
      }
    }

    if (labelEl) labelEl.style.opacity = String(1 - m);
    if (titleEl) titleEl.style.opacity = String(m);

    const near = clamp(Math.round(pos), 0, last);
    if (near !== active) {
      active = near;
      updateActiveUI(near);
    }
  };

  frameId = requestAnimationFrame(draw);

  return {
    to,
    next: () => to(Math.min(last + 1, Math.round(target) + 1)),
    prev: () => to(Math.max(0, Math.round(target) - 1)),
    getActive: () => active,
    destroy: () => {
      isRunning = false;
      cancelAnimationFrame(frameId);
      ro.disconnect();
      stageEl.removeEventListener("wheel", onWheel);
      clearTimeout(settlingTimer);
    }
  };
}
