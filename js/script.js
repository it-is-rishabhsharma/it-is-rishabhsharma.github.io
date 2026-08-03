const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");

function closeMobileMenu() {
  navLinks.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
}

navToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
  if (isOpen) {
    const firstLink = navLinks.querySelector("a");
    if (firstLink) firstLink.focus();
  }
});

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

document.getElementById("year").textContent = new Date().getFullYear();

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

// Scroll progress bar, back-to-top visibility, and subtle parallax
const scrollProgress = document.getElementById("scrollProgress");
const backToTop = document.getElementById("backToTop");
const heroBlob = document.getElementById("heroBlob");
const aboutPhotoImg = document.querySelector(".about__photo img");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function updateOnScroll() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
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
});
updateOnScroll();

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
});

// Copy-to-clipboard email button
const copyEmailBtn = document.getElementById("copyEmailBtn");
if (copyEmailBtn) {
  copyEmailBtn.addEventListener("click", async () => {
    const email = copyEmailBtn.getAttribute("data-email");
    try {
      await navigator.clipboard.writeText(email);
    } catch (err) {
      const textarea = document.createElement("textarea");
      textarea.value = email;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    const originalLabel = copyEmailBtn.textContent;
    copyEmailBtn.textContent = "Copied!";
    copyEmailBtn.classList.add("is-copied");
    setTimeout(() => {
      copyEmailBtn.textContent = originalLabel;
      copyEmailBtn.classList.remove("is-copied");
    }, 2000);
  });
}

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
