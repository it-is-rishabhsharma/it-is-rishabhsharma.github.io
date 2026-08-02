const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");

navToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  });
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

// Scroll progress bar
const scrollProgress = document.getElementById("scrollProgress");
function updateScrollProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  scrollProgress.style.width = pct + "%";
}
let scrollTicking = false;
window.addEventListener("scroll", () => {
  if (!scrollTicking) {
    requestAnimationFrame(() => {
      updateScrollProgress();
      scrollTicking = false;
    });
    scrollTicking = true;
  }
});
updateScrollProgress();

// Active nav-link highlighting (scrollspy)
const navLinkEls = document.querySelectorAll("[data-nav-link]");
const sectionByLink = new Map();
navLinkEls.forEach((link) => {
  const id = link.getAttribute("href").slice(1);
  const section = document.getElementById(id);
  if (section) sectionByLink.set(section, link);
});

const spyObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const link = sectionByLink.get(entry.target);
      if (!link) return;
      if (entry.isIntersecting) {
        navLinkEls.forEach((l) => l.classList.remove("is-active"));
        link.classList.add("is-active");
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
