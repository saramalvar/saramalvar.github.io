// Theme toggle, mobile nav, scroll reveal, footer year

(function () {
  const root = document.documentElement;
  const STORAGE_KEY = "theme";

  // Initialize theme from storage or OS preference
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "light" || saved === "dark") {
    root.setAttribute("data-theme", saved);
  } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
    root.setAttribute("data-theme", "light");
  }

  const toggle = document.getElementById("theme-toggle");
  if (toggle) {
    toggle.addEventListener("click", () => {
      const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      root.setAttribute("data-theme", next);
      localStorage.setItem(STORAGE_KEY, next);
    });
  }

  // Mobile menu
  const nav = document.querySelector(".nav");
  const burger = document.getElementById("nav-burger");
  if (burger && nav) {
    burger.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      burger.setAttribute("aria-expanded", String(open));
    });
    nav.querySelectorAll(".nav__links a").forEach((link) =>
      link.addEventListener("click", () => {
        nav.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
      })
    );
  }

  // Footer year
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // Experience timeline slider
  const slider = document.querySelector("[data-experience-slider]");
  if (slider) {
    const viewport = slider.querySelector(".experience-slider__viewport");
    const slides = Array.from(slider.querySelectorAll(".experience-slide"));
    const prev = slider.querySelector("[data-slider-prev]");
    const next = slider.querySelector("[data-slider-next]");
    const dotsWrap = slider.querySelector("[data-slider-dots]");

    const dots = dotsWrap ? slides.map((_, index) => {
      const dot = document.createElement("button");
      dot.className = "experience-slider__dot";
      dot.type = "button";
      dot.setAttribute("aria-label", `Go to experience ${index + 1}`);
      dot.addEventListener("click", () => slides[index].scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" }));
      dotsWrap.appendChild(dot);
      return dot;
    }) : [];

    const currentIndex = () => {
      const left = viewport.scrollLeft;
      return slides.reduce((closest, slide, index) => {
        const distance = Math.abs((slide.offsetLeft - slides[0].offsetLeft) - left);
        return distance < closest.distance ? { index, distance } : closest;
      }, { index: 0, distance: Infinity }).index;
    };

    const updateSlider = () => {
      const index = currentIndex();
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle("is-active", dotIndex === index);
        dot.setAttribute("aria-current", dotIndex === index ? "true" : "false");
      });
      if (prev) prev.disabled = index === 0;
      if (next) next.disabled = index === slides.length - 1;
    };

    const go = (direction) => {
      const index = Math.min(Math.max(currentIndex() + direction, 0), slides.length - 1);
      slides[index].scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
    };

    if (prev) prev.addEventListener("click", () => go(-1));
    if (next) next.addEventListener("click", () => go(1));
    viewport.addEventListener("scroll", () => window.requestAnimationFrame(updateSlider), { passive: true });
    window.addEventListener("resize", updateSlider);
    updateSlider();
  }

  // Scroll reveal
  const revealEls = document.querySelectorAll(".section");
  revealEls.forEach((el) => el.classList.add("reveal"));
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  // Reviews carousel
  document.querySelectorAll("[data-reviews-carousel]").forEach((carousel) => {
    const track = carousel.querySelector(".reviews-carousel__track");
    const slides = Array.from(carousel.querySelectorAll(".reviews-carousel__slide"));
    const prev = carousel.querySelector("[data-review-prev]");
    const next = carousel.querySelector("[data-review-next]");
    const dotsWrap = carousel.querySelector("[data-review-dots]");
    if (!track || !prev || !next || !dotsWrap || slides.length < 2) return;

    let active = 0;
    carousel.classList.add("is-enhanced");

    const dots = slides.map((_, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "reviews-carousel__dot";
      dot.setAttribute("aria-label", `Show review ${index + 1} of ${slides.length}`);
      dot.addEventListener("click", () => goTo(index));
      dotsWrap.appendChild(dot);
      return dot;
    });

    slides.forEach((slide, index) => {
      slide.setAttribute("aria-roledescription", "slide");
      slide.setAttribute("aria-label", `${index + 1} of ${slides.length}`);
    });

    function goTo(index) {
      active = (index + slides.length) % slides.length;
      track.style.transform = `translateX(-${active * 100}%)`;
      slides.forEach((slide, slideIndex) => {
        slide.setAttribute("aria-hidden", String(slideIndex !== active));
      });
      dots.forEach((dot, dotIndex) => {
        dot.setAttribute("aria-current", String(dotIndex === active));
      });
    }

    prev.addEventListener("click", () => goTo(active - 1));
    next.addEventListener("click", () => goTo(active + 1));
    carousel.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        goTo(active + (event.key === "ArrowRight" ? 1 : -1));
      }
    });

    goTo(0);
  });
})();
