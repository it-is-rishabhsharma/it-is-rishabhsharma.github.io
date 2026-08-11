const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");
const navBackdrop = document.getElementById("navBackdrop");

function closeMobileMenu() {
  navLinks.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
  navBackdrop.classList.remove("is-visible");
}

navToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
  navBackdrop.classList.toggle("is-visible", isOpen);
  if (isOpen) {
    const firstLink = navLinks.querySelector("a");
    if (firstLink) firstLink.focus();
  }
});

navBackdrop.addEventListener("click", closeMobileMenu);

navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMobileMenu);
});

// Focus trap + Escape-to-close for the mobile menu
navLinks.addEventListener("keydown", (e) => {
  if (navToggle.getAttribute("aria-expanded") !== "true") return;

  if (e.key === "Escape") {
    closeMobileMenu();
    navToggle.focus();
    return;
  }

  if (e.key === "Tab") {
    const focusable = Array.from(navLinks.querySelectorAll("a"));
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
});

// Scroll-reveal: fade/slide elements in as they enter the viewport
const revealTargets = document.querySelectorAll(".reveal");
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
);
revealTargets.forEach((el) => revealObserver.observe(el));

// Scroll progress bar, back-to-top visibility, subtle parallax, and scroll-depth accent desaturation
const scrollProgress = document.getElementById("scrollProgress");
const backToTop = document.getElementById("backToTop");
const heroBlob = document.getElementById("heroBlob");
const aboutPhotoImg = document.querySelector(".about__photo img");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const pointerFine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

let lastScrollPct = 0;

function updateOnScroll() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  lastScrollPct = pct / 100;
  scrollProgress.style.width = pct + "%";
  backToTop.classList.toggle("is-visible", scrollTop > window.innerHeight * 0.6);

  if (!prefersReducedMotion) {
    if (heroBlob) {
      heroBlob.style.transform = `translateY(${scrollTop * 0.15}px)`;
    }
    if (aboutPhotoImg) {
      const rect = aboutPhotoImg.getBoundingClientRect();
      const centerOffset = rect.top - window.innerHeight / 2;
      aboutPhotoImg.style.transform = `translateY(${centerOffset * -0.03}px)`;
    }
  }

  updateAccentColor();
}

let scrollTicking = false;
window.addEventListener("scroll", () => {
  if (!scrollTicking) {
    requestAnimationFrame(() => {
      updateOnScroll();
      scrollTicking = false;
    });
    scrollTicking = true;
  }
  registerActivity();
});

// Active nav-link + side-dot highlighting (scrollspy)
const navLinkEls = document.querySelectorAll("[data-nav-link]");
const sectionByLink = new Map();
navLinkEls.forEach((link) => {
  const id = link.getAttribute("href").slice(1);
  const section = document.getElementById(id);
  if (section) {
    if (!sectionByLink.has(section)) sectionByLink.set(section, []);
    sectionByLink.get(section).push(link);
  }
});

const spyObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const links = sectionByLink.get(entry.target);
      if (!links) return;
      if (entry.isIntersecting) {
        navLinkEls.forEach((l) => l.classList.remove("is-active"));
        links.forEach((l) => l.classList.add("is-active"));
      }
    });
  },
  { rootMargin: "-40% 0px -55% 0px" }
);
sectionByLink.forEach((_, section) => spyObserver.observe(section));

// Animated count-up for hero stat tiles
function easeOutQuad(t) {
  return t * (2 - t);
}

function animateCount(el) {
  const target = parseFloat(el.getAttribute("data-count-to"));
  const prefix = el.getAttribute("data-prefix") || "";
  const suffix = el.getAttribute("data-suffix") || "";
  const duration = 1400;
  const start = performance.now();

  function tick(now) {
    const elapsed = Math.min((now - start) / duration, 1);
    const value = Math.round(target * easeOutQuad(elapsed));
    el.textContent = prefix + value + suffix;
    if (elapsed < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const countTargets = document.querySelectorAll("[data-count-to]");
const countObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        countObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.4 }
);
countTargets.forEach((el) => countObserver.observe(el));

// Graceful fallback for images that haven't been added yet
document.querySelectorAll(".js-fallback-img").forEach((img) => {
  const wrapper = img.closest(".media-placeholder");
  img.addEventListener("load", () => {
    if (img.naturalWidth > 0) {
      if (wrapper) wrapper.classList.add("is-loaded");
      img.classList.remove("is-broken");
    }
  });
  img.addEventListener("error", () => {
    img.classList.add("is-broken");
  });
});

// Dark mode toggle
const themeToggle = document.getElementById("themeToggle");
const root = document.documentElement;

function systemPrefersDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function effectiveTheme() {
  return root.getAttribute("data-theme") || (systemPrefersDark() ? "dark" : "light");
}

function updateThemeToggleIcon() {
  themeToggle.textContent = effectiveTheme() === "dark" ? "☀️" : "🌙";
}

const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark" || savedTheme === "light") {
  root.setAttribute("data-theme", savedTheme);
}
updateThemeToggleIcon();

themeToggle.addEventListener("click", () => {
  const next = effectiveTheme() === "dark" ? "light" : "dark";
  root.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
  updateThemeToggleIcon();
  updateAccentColor();
});

// Copy-to-clipboard buttons (contact email + phone)
document.querySelectorAll(".icon-copy-btn").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const value = btn.getAttribute("data-copy");
    try {
      await navigator.clipboard.writeText(value);
    } catch (err) {
      const textarea = document.createElement("textarea");
      textarea.value = value;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    btn.classList.add("is-copied");
    setTimeout(() => btn.classList.remove("is-copied"), 2000);
  });
});

// Hero rotating-word typewriter effect
const rotatorWord = document.getElementById("rotatorWord");
if (rotatorWord && !prefersReducedMotion) {
  const phrases = ["GTM Strategy", "Paid Acquisition", "Marketing Automation", "Revenue Operations"];
  let phraseIndex = 0;
  let charIndex = phrases[0].length;
  let deleting = false;

  function typeTick() {
    const current = phrases[phraseIndex];
    if (!deleting) {
      charIndex++;
      if (charIndex > current.length) {
        deleting = true;
        setTimeout(typeTick, 1600);
        return;
      }
    } else {
      charIndex--;
      if (charIndex < 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        charIndex = 0;
      }
    }
    rotatorWord.textContent = phrases[phraseIndex].slice(0, charIndex) || phrases[phraseIndex].slice(0, 1);
    setTimeout(typeTick, deleting ? 40 : 70);
  }

  setTimeout(typeTick, 1600);
} else if (rotatorWord) {
  rotatorWord.textContent = "GTM Strategy";
}

// Cursor-following glow inside hovered cards (desktop, pointer:fine only)
if (pointerFine && !prefersReducedMotion) {
  document.querySelectorAll(".case-study, .testimonial-card, .education-card, .service-card, .badge-card").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const mx = ((e.clientX - rect.left) / rect.width) * 100;
      const my = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty("--mx", mx + "%");
      card.style.setProperty("--my", my + "%");
    });
  });
}

// Keyboard shortcuts: press "g" then a letter to jump to a section
(function setupKeyboardShortcuts() {
  const shortcutMap = { a: "about", w: "work", e: "experience", t: "testimonials", s: "services", c: "contact" };
  let awaitingSecondKey = false;
  let resetTimer = null;

  document.addEventListener("keydown", (e) => {
    const tag = document.activeElement.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || e.metaKey || e.ctrlKey || e.altKey) return;

    if (e.key === "g" || e.key === "G") {
      awaitingSecondKey = true;
      clearTimeout(resetTimer);
      resetTimer = setTimeout(() => {
        awaitingSecondKey = false;
      }, 1500);
      return;
    }

    if (awaitingSecondKey) {
      const targetId = shortcutMap[e.key.toLowerCase()];
      awaitingSecondKey = false;
      if (targetId) {
        const el = document.getElementById(targetId);
        if (el) el.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
      }
    }
  });
})();

// Cursor-trail particles within the hero (desktop, pointer:fine only)
if (pointerFine && !prefersReducedMotion) {
  const heroEl = document.querySelector(".hero");
  let lastParticleTime = 0;
  if (heroEl) {
    heroEl.addEventListener("mousemove", (e) => {
      const now = performance.now();
      if (now - lastParticleTime < 60) return;
      lastParticleTime = now;
      const particle = document.createElement("span");
      particle.className = "cursor-particle";
      particle.style.left = e.clientX + "px";
      particle.style.top = e.clientY + "px";
      document.body.appendChild(particle);
      setTimeout(() => particle.remove(), 700);
    });
  }
}

// Live "leads auto-routed" counter — playful, illustrative, not real data
const liveCounterEl = document.getElementById("liveCounterValue");
if (liveCounterEl) {
  let liveCount = 0;
  setInterval(() => {
    liveCount += Math.floor(Math.random() * 3) + 1;
    liveCounterEl.textContent = liveCount.toLocaleString();
  }, 2200);
}

// Live clock — visitor's-eye view of local time in Noida
const footerClockEl = document.getElementById("footerClock");
if (footerClockEl) {
  function updateFooterClock() {
    const formatter = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
    });
    footerClockEl.textContent = formatter.format(new Date());
  }
  updateFooterClock();
  setInterval(updateFooterClock, 15000);
}

// Rotating footer tagline
const footerTaglineEl = document.getElementById("footerTagline");
if (footerTaglineEl && !prefersReducedMotion) {
  const taglines = [
    "i turn ad-spend and messy data into systems that scale themselves.",
    "still here? that's exactly the kind of retention I try to build into pipelines.",
    "built with HTML, CSS, and a healthy obsession with automation.",
    "GTM strategy by day, workflow automation by... also day.",
  ];
  let taglineIndex = 0;
  setInterval(() => {
    footerTaglineEl.classList.add("is-fading");
    setTimeout(() => {
      taglineIndex = (taglineIndex + 1) % taglines.length;
      footerTaglineEl.textContent = taglines[taglineIndex];
      footerTaglineEl.classList.remove("is-fading");
    }, 400);
  }, 30000);
}

// Toast system (shared by idle nudge, reading-time nudge, theme nudge)
const toastEl = document.getElementById("toast");
let toastQueue = [];
let toastShowing = false;

function showToast(message, actionLabel, actionFn, duration = 6000) {
  toastQueue.push({ message, actionLabel, actionFn, duration });
  processToastQueue();
}

function processToastQueue() {
  if (toastShowing || toastQueue.length === 0) return;
  toastShowing = true;
  const { message, actionLabel, actionFn, duration } = toastQueue.shift();

  toastEl.innerHTML = "";
  const text = document.createElement("span");
  text.textContent = message;
  toastEl.appendChild(text);

  if (actionLabel && actionFn) {
    const btn = document.createElement("button");
    btn.textContent = actionLabel;
    btn.addEventListener("click", () => {
      actionFn();
      hideToast();
    });
    toastEl.appendChild(btn);
  }

  toastEl.classList.add("is-visible");
  setTimeout(hideToast, duration);
}

function hideToast() {
  toastEl.classList.remove("is-visible");
  toastShowing = false;
  setTimeout(processToastQueue, 400);
}

// Idle-detection nudge
let lastActivity = Date.now();
let idleNudgeShown = false;

function registerActivity() {
  lastActivity = Date.now();
}
["mousemove", "keydown", "click", "touchstart"].forEach((evt) => {
  window.addEventListener(evt, registerActivity, { passive: true });
});

setInterval(() => {
  if (!idleNudgeShown && Date.now() - lastActivity > 90000) {
    idleNudgeShown = true;
    showToast("still there? 👋 no rush — take your time.");
  }
}, 10000);

// Reading-time nudge
setTimeout(() => {
  showToast("you've been reading for a couple minutes now — thanks for sticking around.");
}, 120000);

// Evening theme nudge (only if the visitor hasn't set an explicit preference)
(function maybeSuggestDarkMode() {
  if (localStorage.getItem("theme")) return;
  const hour = new Date().getHours();
  const isEvening = hour >= 20 || hour < 6;
  if (isEvening && effectiveTheme() === "light") {
    setTimeout(() => {
      showToast("looks like it's evening — want to switch to dark mode?", "Switch", () => {
        root.setAttribute("data-theme", "dark");
        localStorage.setItem("theme", "dark");
        updateThemeToggleIcon();
        updateAccentColor();
      });
    }, 6000);
  }
})();

// Logo click easter egg
(function setupLogoEasterEgg() {
  const logo = document.querySelector(".nav__logo");
  if (!logo) return;
  let clickCount = 0;
  let resetTimer = null;

  logo.addEventListener("click", (e) => {
    clickCount++;
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => (clickCount = 0), 2000);

    if (clickCount >= 5) {
      clickCount = 0;
      if (!prefersReducedMotion) {
        for (let i = 0; i < 24; i++) {
          const confetti = document.createElement("span");
          confetti.className = "cursor-particle cursor-particle--confetti";
          confetti.style.left = e.clientX + "px";
          confetti.style.top = e.clientY + "px";
          confetti.style.background = i % 2 === 0 ? "var(--color-accent)" : "var(--color-accent-2)";
          document.body.appendChild(confetti);

          const angle = Math.random() * Math.PI * 2;
          const distance = 60 + Math.random() * 80;
          requestAnimationFrame(() => {
            confetti.style.transform = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(0.3)`;
            confetti.style.opacity = "0";
          });
          setTimeout(() => confetti.remove(), 750);
        }
      }
      showToast("okay okay, you found the easter egg. 🎉");
    }
  });
})();

// Palette toggle (default orange-forward vs. teal-forward)
const paletteToggle = document.getElementById("paletteToggle");
const PALETTES = {
  default: {
    light: { accent: [16, 100, 56], accent2: [180, 45, 33] },
    dark: { accent: [16, 100, 56], accent2: [178, 45, 53] },
  },
  teal: {
    light: { accent: [180, 45, 33], accent2: [16, 100, 56] },
    dark: { accent: [178, 45, 53], accent2: [16, 100, 60] },
  },
};

function getPalette() {
  return localStorage.getItem("palette") === "teal" ? "teal" : "default";
}

function updateAccentColor() {
  const palette = getPalette();
  const theme = effectiveTheme();
  const base = PALETTES[palette][theme];

  const hour = new Date().getHours();
  const hueOffset = Math.sin((hour / 24) * Math.PI * 2) * 10;
  const satMultiplier = 1 - lastScrollPct * 0.22;

  const [h1, s1, l1] = base.accent;
  root.style.setProperty("--color-accent", `hsl(${Math.round(h1 + hueOffset)}, ${Math.round(s1 * satMultiplier)}%, ${l1}%)`);

  const [h2, s2, l2] = base.accent2;
  root.style.setProperty("--color-accent-2", `hsl(${h2}, ${s2}%, ${l2}%)`);
}

if (paletteToggle) {
  paletteToggle.addEventListener("click", () => {
    const next = getPalette() === "teal" ? "default" : "teal";
    localStorage.setItem("palette", next);
    updateAccentColor();
  });
}

updateAccentColor();
updateOnScroll();

// Auto-advancing carousels (stats, testimonials, services) — mainly for mobile,
// where these become horizontally swipeable and a visitor might not realize there's
// more content off-screen. No-ops harmlessly on desktop, where these aren't scrollable.
function setupAutoCarousel(containerSelector, itemSelector, intervalMs) {
  const container = document.querySelector(containerSelector);
  if (!container || prefersReducedMotion) return;

  let autoTimer = null;
  let resumeTimer = null;
  let currentIndex = 0;

  function getItems() {
    return Array.from(container.querySelectorAll(itemSelector));
  }

  function isScrollable() {
    return container.scrollWidth > container.clientWidth + 4;
  }

  function scrollToIndex(index) {
    const items = getItems();
    if (items.length === 0) return;
    currentIndex = ((index % items.length) + items.length) % items.length;
    const item = items[currentIndex];
    const containerRect = container.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    const targetScrollLeft = container.scrollLeft + (itemRect.left - containerRect.left);
    container.scrollTo({ left: targetScrollLeft, behavior: "smooth" });
  }

  function advance() {
    if (!isScrollable()) return;
    const items = getItems();
    const isAtEnd = container.scrollLeft + container.clientWidth >= container.scrollWidth - 4;
    scrollToIndex(isAtEnd ? 0 : currentIndex + 1);
  }

  function startAuto() {
    stopAuto();
    autoTimer = setInterval(advance, intervalMs);
  }

  function stopAuto() {
    if (autoTimer) clearInterval(autoTimer);
    autoTimer = null;
  }

  function pauseThenResume() {
    stopAuto();
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(startAuto, intervalMs * 1.5);
  }

  container.addEventListener("touchstart", pauseThenResume, { passive: true });
  container.addEventListener("mousedown", pauseThenResume);
  container.addEventListener("wheel", pauseThenResume, { passive: true });

  startAuto();
}

setupAutoCarousel(".stats", ".stat-tile", 3000);
setupAutoCarousel(".testimonials__grid", ".testimonial-card", 4500);
setupAutoCarousel(".services__grid", ".service-card", 4500);
