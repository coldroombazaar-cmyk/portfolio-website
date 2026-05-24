
// === THEME (must run first) ===
(function() {
  const savedTheme = localStorage.getItem('atanu-theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  document.addEventListener('DOMContentLoaded', () => {
    const toggleBtns = document.querySelectorAll('.theme-toggle');
    toggleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('atanu-theme', next);
        btn.setAttribute('aria-label', next === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      });
    });
  });
})();

// === PAGE-LOAD SPLASH ===
document.addEventListener('DOMContentLoaded', () => {
  const splash = document.createElement('div');
  splash.id = 'splash-screen';
  splash.innerHTML = '<div class="splash-text">Atanu Mondal</div>';
  document.body.appendChild(splash);
  
  setTimeout(() => {
    splash.style.opacity = '0';
    setTimeout(() => splash.remove(), 900);
  }, 900);
});

// === SCROLL PROGRESS BAR ===
document.addEventListener('DOMContentLoaded', () => {
  const bar = document.createElement('div');
  bar.id = 'scroll-progress';
  document.body.appendChild(bar);
  
  window.addEventListener('scroll', () => {
    requestAnimationFrame(() => {
      const scrollY = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const progress = height > 0 ? (scrollY / height) * 100 : 0;
      bar.style.width = progress + '%';
    });
  }, { passive: true });
});

// === NAV SHRINK ON SCROLL ===
document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('.navbar');
  if (nav) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 8) {
        nav.classList.add('is-scrolled');
      } else {
        nav.classList.remove('is-scrolled');
      }
    }, { passive: true });
  }
});

// === REVEAL ON SCROLL ===
document.addEventListener('DOMContentLoaded', () => {
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
});

// === ABOUT STATS COUNTERS ===
document.addEventListener('DOMContentLoaded', () => {
  const stats = document.querySelectorAll('.stat-num');
  if (stats.length > 0) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.getAttribute('data-target'), 10);
          let current = 0;
          const duration = 1400; // 1.4s
          const start = performance.now();
          
          const update = (time) => {
            const elapsed = time - start;
            const progress = Math.min(elapsed / duration, 1);
            // ease out quad
            const easeProgress = 1 - (1 - progress) * (1 - progress);
            current = Math.floor(easeProgress * target);
            el.textContent = current;
            if (progress < 1) {
              requestAnimationFrame(update);
            } else {
              el.textContent = target;
            }
          };
          requestAnimationFrame(update);
          obs.unobserve(el);
        }
      });
    });
    
    stats.forEach(stat => observer.observe(stat));
  }
});

console.log("Portfolio loaded ✅");

const contactForm = document.getElementById("contact-form");

if (contactForm) {
  const contactSuccess = document.getElementById("contact-success");

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      return;
    }

    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData.entries());

    console.log(data);

    contactForm.hidden = true;
    contactSuccess.hidden = false;
  });
}

const navbar = document.querySelector(".navbar");
const navbarToggle = document.querySelector(".navbar__toggle");
const navbarMenu = document.getElementById("navbar-menu");

if (navbar && navbarToggle && navbarMenu) {
  navbarToggle.addEventListener("click", () => {
    const isOpen = navbar.classList.toggle("is-open");
    navbarToggle.setAttribute("aria-expanded", String(isOpen));
    navbarToggle.setAttribute(
      "aria-label",
      isOpen ? "Close navigation menu" : "Open navigation menu"
    );
  });

  navbarMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navbar.classList.remove("is-open");
      navbarToggle.setAttribute("aria-expanded", "false");
      navbarToggle.setAttribute("aria-label", "Open navigation menu");
    });
  });
}
 