/* Chenglie Barongsai — script.js */

(function() {
  "use strict";

  // Nav scroll detection
  var nav = document.getElementById("nav");
  if (nav) {
    var scrollThreshold = 80;
    var navLinks = document.querySelectorAll(".nav__links a");
    var sections = document.querySelectorAll("section[id]");
    function updateNav() {
      var y = window.scrollY;
      nav.classList.toggle("scrolled", y > scrollThreshold);
      // Active link
      var current = "";
      sections.forEach(function(sec) {
        if (y >= sec.offsetTop - 200) current = sec.getAttribute("id");
      });
      navLinks.forEach(function(a) {
        a.classList.toggle("active", a.getAttribute("href") === "#" + current);
      });
    }
    window.addEventListener("scroll", updateNav, { passive: true });
    updateNav();
  }

  // FAQ
  document.querySelectorAll(".faq__btn").forEach(function(btn) {
    btn.addEventListener("click", function() {
      var item = btn.closest(".faq__item");
      var wasOpen = item.classList.contains("open");

      // Close all
      document.querySelectorAll(".faq__item").forEach(function(el) {
        el.classList.remove("open");
        el.querySelector(".faq__btn").setAttribute("aria-expanded", "false");
      });

      // Toggle current
      if (!wasOpen) {
        item.classList.add("open");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });

  // Mobile menu
  var burger = document.getElementById("navBurger");
  var menu = document.getElementById("mobileMenu");
  if (burger && menu) {
    burger.addEventListener("click", function() {
      var open = burger.classList.toggle("open");
      menu.classList.toggle("open", open);
      document.body.style.overflow = open ? "hidden" : "";
    });
    menu.querySelectorAll("a").forEach(function(a) {
      a.addEventListener("click", function() {
        burger.classList.remove("open");
        menu.classList.remove("open");
        document.body.style.overflow = "";
      });
    });
  }

  // 3D Carousel
  var cards = document.querySelectorAll(".carousel-3d__card");
  var prevBtn = document.getElementById("carouselPrev");
  var nextBtn = document.getElementById("carouselNext");
  var active = 0;
  var MAX_VIS = 3;
  function updateCarousel() {
    cards.forEach(function(card, i) {
      var offset = (active - i) / 3;
      var dir = Math.sign(active - i);
      var absOff = Math.abs(active - i) / 3;
      card.style.setProperty("--active", i === active ? 1 : 0);
      card.style.setProperty("--offset", offset);
      card.style.setProperty("--direction", dir);
      card.style.setProperty("--abs-offset", absOff);
      card.style.pointerEvents = i === active ? "auto" : "none";
      card.style.opacity = absOff >= MAX_VIS ? "0" : "1";
      card.style.display = Math.abs(active - i) > MAX_VIS ? "none" : "block";
    });
    if (prevBtn) prevBtn.style.display = active > 0 ? "flex" : "none";
    if (nextBtn) nextBtn.style.display = active < cards.length - 1 ? "flex" : "none";
  }
  if (prevBtn) prevBtn.addEventListener("click", function() { active--; updateCarousel(); });
  if (nextBtn) nextBtn.addEventListener("click", function() { active++; updateCarousel(); });
  if (cards.length) updateCarousel();

  // Booking — scroll-driven number counter + staggered reveal
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (window.gsap && window.ScrollTrigger && !reduceMotion) {
    gsap.registerPlugin(ScrollTrigger);
    var bookingSteps = gsap.utils.toArray(".booking__step");
    bookingSteps.forEach(function(step) {
      var numEl = step.querySelector(".booking__num");
      var target = parseInt(numEl.getAttribute("data-target"), 10);
      var counter = { val: 0 };
      gsap.to(counter, {
        val: target,
        duration: 1,
        ease: "power2.out",
        onUpdate: function() { numEl.textContent = Math.round(counter.val); },
        scrollTrigger: { trigger: step, start: "top 75%", end: "top 35%", scrub: 0.5 }
      });
    });
    gsap.from(bookingSteps, {
      y: 50, opacity: 0, duration: 0.7, stagger: 0.12, ease: "power3.out",
      scrollTrigger: { trigger: ".booking__grid", start: "top 80%" }
    });
  } else if (window.gsap && window.ScrollTrigger && reduceMotion) {
    // Reduced motion: just set final numbers
    document.querySelectorAll(".booking__num").forEach(function(el) {
      el.textContent = el.getAttribute("data-target");
    });
  }

  // Gallery — GLightbox + GSAP stagger reveal + hero parallax
  if (window.GLightbox) {
    GLightbox({ selector: ".glightbox", touchNavigation: true, loop: true });
  }
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    var tiles = gsap.utils.toArray(".gallery-tile");
    if (!reduceMotion) {
      gsap.from(tiles, {
        y: 50, opacity: 0, duration: 0.7, stagger: 0.06, ease: "power3.out",
        scrollTrigger: { trigger: ".gallery-masonry", start: "top 78%" }
      });
      var heroImg = document.querySelector(".gallery-tile--hero img");
      if (heroImg) {
        gsap.to(heroImg, {
          yPercent: 12, ease: "none",
          scrollTrigger: { trigger: ".gallery-section", start: "top bottom", end: "bottom top", scrub: 1 }
        });
      }
    } else {
      tiles.forEach(function(t) { t.style.opacity = 1; });
    }
  }

  // Kanji ornaments — subtle GSAP float drift
  if (window.gsap && !reduceMotion) {
    gsap.utils.toArray(".kanji").forEach(function(el, i) {
      gsap.to(el, {
        y: "+=" + (8 + Math.random() * 12),
        x: "+=" + (Math.random() * 6 - 3),
        duration: 6 + Math.random() * 6,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: i * 0.8
      });
    });
  }

  // Scroll reveal
  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!prefersReduced && "IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          observer.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
    document.querySelectorAll(".reveal").forEach(function(el) { observer.observe(el); });
  } else {
    document.querySelectorAll(".reveal").forEach(function(el) { el.classList.add("visible"); });
  }

  // Scrubbing word reveal
  var stmt = document.getElementById("statementText");
  if (stmt && !prefersReduced) {
    var words = stmt.textContent.trim().split(/\s+/);
    stmt.innerHTML = words.map(function(w) { return "<span>" + w + "</span>"; }).join(" ");
    var wordEls = stmt.querySelectorAll("span");

    if ("IntersectionObserver" in window) {
      var stmtObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(e) {
          if (e.isIntersecting) {
            wordEls.forEach(function(w, i) {
              setTimeout(function() { w.classList.add("show"); }, i * 80);
            });
            stmtObserver.unobserve(e.target);
          }
        });
      }, { threshold: 0.3 });
      stmtObserver.observe(stmt);
    } else {
      wordEls.forEach(function(w) { w.classList.add("show"); });
    }
  } else if (stmt) {
    // Reduced motion: show all words
    var words2 = stmt.textContent.trim().split(/\s+/);
    stmt.innerHTML = words2.map(function(w) { return '<span class="show">' + w + "</span>"; }).join(" ");
  }

})();