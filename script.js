
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
(async function initPageSplash() {
  const defaultText = 'Atanu Mondal';
  const defaultDuration = 900;
  const defaultFadeDuration = 900;
  const localStorageKey = 'atanu_splash_settings';
  const sessionStorageKey = 'atanu_splash_shown';

  // 1. Read cached settings from localStorage
  let cached = null;
  try {
    const cachedData = localStorage.getItem(localStorageKey);
    if (cachedData) {
      cached = JSON.parse(cachedData);
    }
  } catch (e) {
    console.error('Failed to parse cached splash settings:', e);
  }

  // 2. Early checking of conditions using cached settings
  const hasShownThisSession = sessionStorage.getItem(sessionStorageKey) === 'true';
  let shouldShowSplash = true;
  let initialText = ''; // Blank splash by default if no cache

  if (cached) {
    if (cached.show_once_per_session === true && hasShownThisSession) {
      shouldShowSplash = false;
    }
    if (cached.is_enabled === false) {
      shouldShowSplash = false;
    }
    if (shouldShowSplash) {
      initialText = cached.splash_text || '';
    }
  }

  // 3. Create splash screen overlay immediately if we should show it
  let splash = null;
  if (shouldShowSplash) {
    splash = document.createElement('div');
    splash.id = 'splash-screen';
    splash.style.position = 'fixed';
    splash.style.inset = '0';
    splash.style.backgroundColor = '#05070f';
    splash.style.display = 'flex';
    splash.style.alignItems = 'center';
    splash.style.justifyContent = 'center';
    splash.style.zIndex = '9999';
    splash.style.opacity = '1';
    splash.innerHTML = `<div class="splash-text">${initialText}</div>`;
    document.body.appendChild(splash);
  }

  // Define completion handler that handles fade-out and session storage
  const handleSplashCompletion = (settings) => {
    if (!splash) return;

    // Set once per session flag if needed
    if (settings.show_once_per_session === true) {
      sessionStorage.setItem(sessionStorageKey, 'true');
    }

    // Update text
    const textEl = splash.querySelector('.splash-text');
    if (textEl) {
      textEl.textContent = settings.splash_text || defaultText;
    }

    const duration = settings.duration_ms !== undefined ? settings.duration_ms : defaultDuration;
    const fadeDuration = settings.fade_duration_ms !== undefined ? settings.fade_duration_ms : defaultFadeDuration;

    splash.style.transition = `opacity ${fadeDuration}ms ease`;

    setTimeout(() => {
      splash.style.opacity = '0';
      setTimeout(() => {
        if (splash && splash.parentNode) {
          splash.remove();
        }
      }, fadeDuration);
    }, duration);
  };

  // Define fallback function in case queries fail
  const runFallbackSplash = () => {
    // If Supabase fails: use cached settings if available, only use hardcoded fallback as last option
    const activeSettings = cached || {
      is_enabled: true,
      splash_text: defaultText,
      duration_ms: defaultDuration,
      fade_duration_ms: defaultFadeDuration,
      show_once_per_session: false
    };

    // If cache says disabled or shown, remove splash immediately
    if (activeSettings.is_enabled === false || (activeSettings.show_once_per_session === true && hasShownThisSession)) {
      if (splash) splash.remove();
      return;
    }

    handleSplashCompletion(activeSettings);
  };

  // Skip query if supabaseClient or Supabase script is completely missing
  if (typeof supabaseClient === 'undefined') {
    runFallbackSplash();
    return;
  }

  try {
    // Fetch latest splash settings from Supabase
    const { data: settings, error } = await supabaseClient
      .from('splash_settings')
      .select('*')
      .limit(1)
      .single();

    if (error || !settings) {
      runFallbackSplash();
      return;
    }

    // Cache the newly fetched settings
    try {
      localStorage.setItem(localStorageKey, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save splash settings to localStorage:', e);
    }

    // Check enablement and once-per-session restrictions dynamically
    if (settings.is_enabled === false) {
      if (splash) splash.remove();
      return;
    }

    if (settings.show_once_per_session === true && hasShownThisSession) {
      if (splash) splash.remove();
      return;
    }

    // Otherwise, complete splash screen animation using dynamic settings
    handleSplashCompletion(settings);
  } catch (err) {
    console.error('Error fetching dynamic splash settings, falling back:', err);
    runFallbackSplash();
  }
})();

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
function animateCounters() {
  const stats = document.querySelectorAll('.stat-num');
  if (stats.length > 0) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.getAttribute('data-target'), 10) || 0;
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
}

console.log("Portfolio loaded ✅");

const contactForm = document.getElementById("contact-form");

if (contactForm) {
  const contactSuccess = document.getElementById("contact-success");

  // Listen for the form submission
  contactForm.addEventListener("submit", async (event) => {
    // Prevent the page from refreshing when the form is submitted
    event.preventDefault();

    // Check if the form passes basic HTML validation (like required fields)
    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      return;
    }

    // Extract the data from the form fields
    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData.entries());
    
    // Map the form data to our database columns
    const full_name = data.fullName;
    const email = data.email;
    const subject = data.subject;
    const message = data.message;

    // Send the data to our Supabase database table named 'form'
    const response = await supabaseClient
      .from('form')
      .insert([{ full_name, email, subject, message }]);

    // Log the full response object to the console so we can debug if needed
    console.log("Supabase response:", response);

    // Check if Supabase returned an error
    if (response.error) {
      // Find or create an error message element
      let errorMsg = document.getElementById("contact-error");
      if (!errorMsg) {
        errorMsg = document.createElement("p");
        errorMsg.id = "contact-error";
        errorMsg.style.color = "red";
        errorMsg.style.marginTop = "1rem";
        contactForm.appendChild(errorMsg);
      }
      // Show a red error message
      errorMsg.textContent = "Something went wrong. Please try again.";
    } else {
      // Hide the form and show the existing green success message
      contactForm.hidden = true;
      contactSuccess.hidden = false;
      
      // Reset the form fields
      contactForm.reset();
      
      // Clear any previous error message if it exists
      const errorMsg = document.getElementById("contact-error");
      if (errorMsg) errorMsg.remove();
    }
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

// === ADMIN DASHBOARD ===
document.addEventListener("DOMContentLoaded", () => {
  const adminGrid = document.getElementById("admin-inbox-grid");
  
  // Only run the admin logic if the inbox grid actually exists on the page
  if (adminGrid) {
    const messageCounter = document.getElementById("message-counter");
    const unreadToggle = document.getElementById("unread-only-toggle");

    // Helper to format dates to relative time like "2 hours ago"
    function timeAgo(dateParam) {
      if (!dateParam) return "";
      const date = typeof dateParam === 'object' ? dateParam : new Date(dateParam);
      const today = new Date();
      const seconds = Math.round((today - date) / 1000);
      const minutes = Math.round(seconds / 60);
      const hours = Math.round(minutes / 60);
      const days = Math.round(hours / 24);

      if (seconds < 60) return "just now";
      else if (minutes < 60) return minutes + " minutes ago";
      else if (hours < 24) return hours + " hours ago";
      else if (days < 7) return days + " days ago";
      else {
        // e.g. 21 May 2026
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      }
    }

    // Render a single message card
    function createCard(msg) {
      const card = document.createElement("div");
      // Add visual state class based on is_read
      card.className = `admin-card ${msg.is_read ? 'card--read' : 'card--unread'}`;
      card.id = `msg-${msg.id}`;

      // Card inner HTML structure
      card.innerHTML = `
        <div class="admin-card__top">
          <h3 class="admin-card__subject">${msg.subject}</h3>
          <span class="admin-card__time">${timeAgo(msg.created_at)}</span>
        </div>
        <p class="admin-card__sender">${msg.full_name} &middot; ${msg.email}</p>
        <p class="admin-card__body">${msg.message}</p>
      `;

      // Action container
      const actions = document.createElement("div");
      actions.className = "admin-card__actions";

      // If it's unread, show the "Mark as Read" button
      if (!msg.is_read) {
        const btn = document.createElement("button");
        btn.className = "admin-card__btn";
        btn.textContent = "Mark as Read";
        
        // Handle "Mark as Read" click
        btn.addEventListener("click", async () => {
          // Disable button immediately to prevent double-clicks
          btn.disabled = true;
          btn.textContent = "Marking...";
          
          // Send an UPDATE to Supabase
          const { error } = await supabaseClient
            .from('form')
            .update({ is_read: true })
            .eq('id', msg.id);

          if (error) {
            console.error("Error marking as read:", error);
            btn.disabled = false;
            btn.textContent = "Mark as Read";
            alert("Failed to mark as read.");
          } else {
            // Update the card visually without full reload
            card.classList.remove('card--unread');
            card.classList.add('card--read');
            // Remove the button since it's now read
            btn.remove();
          }
        });
        
        actions.appendChild(btn);
      }
      
      card.appendChild(actions);
      return card;
    }

    // Fetch messages from Supabase
    async function fetchMessages() {
      // Show loading text
      adminGrid.innerHTML = "<p>Loading messages...</p>";
      
      // Query the 'form' table ordered by newest first
      const { data, error } = await supabaseClient
        .from('form')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching messages:", error);
        adminGrid.innerHTML = "<p>Failed to load messages.</p>";
        return;
      }

      // Update total counter
      if (messageCounter) {
        messageCounter.textContent = `📬 ${data.length} messages`;
      }

      // Clear the loading text
      adminGrid.innerHTML = "";

      // Create and append a card for each message
      if (data.length === 0) {
        adminGrid.innerHTML = "<p>No messages found.</p>";
      } else {
        data.forEach(msg => {
          const card = createCard(msg);
          adminGrid.appendChild(card);
        });
      }
    }

    // Handle the "Unread only" toggle
    if (unreadToggle) {
      unreadToggle.addEventListener("change", (e) => {
        if (e.target.checked) {
          adminGrid.classList.add("show-unread-only");
        } else {
          adminGrid.classList.remove("show-unread-only");
        }
      });
    }

    // --- Login Security Logic ---
    const loginSection = document.getElementById("admin-login-section");
    const mainContent = document.getElementById("admin-main-content");
    const loginForm = document.getElementById("admin-login-form");
    const loginError = document.getElementById("login-error");

    if (loginForm) {
      // Check persistent login
      if (localStorage.getItem("adminLoggedIn") === "true") {
        loginSection.style.display = "none";
        mainContent.style.display = "flex";
        fetchMessages();
      }

      loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const idVal = document.getElementById("login-id").value;
        const passVal = document.getElementById("login-password").value;

        // Simple client-side check (Beginner friendly)
        if (idVal === "atmond" && passVal === "nopass") {
          // Success! Hide login, show dashboard, fetch messages
          localStorage.setItem("adminLoggedIn", "true");
          loginSection.style.display = "none";
          mainContent.style.display = "flex";
          fetchMessages();
        } else {
          // Show error
          loginError.style.display = "block";
        }
      });

      const logoutBtn = document.getElementById("admin-logout-btn");
      if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
          localStorage.removeItem("adminLoggedIn");
          mainContent.style.display = "none";
          loginSection.style.display = "flex";
          loginForm.reset();
          loginError.style.display = "none";
        });
      }
    } else {
      // Fallback if login form is missing but admin grid exists
      fetchMessages();
    }
  }
});

// === PUBLIC PROJECTS CMS RENDERING ===
document.addEventListener('DOMContentLoaded', async () => {
  const publicGrid = document.getElementById('public-projects-grid');
  
  if (publicGrid) {
    publicGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center;">Loading projects...</p>';

    if (typeof supabaseClient !== 'undefined') {
      const { data, error } = await supabaseClient
        .from('projects')
        .select('*')
        .eq('status', 'published')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching public projects:', error);
        publicGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: var(--danger);">Unable to load projects at this time.</p>';
        return;
      }

      if (data && data.length > 0) {
        publicGrid.innerHTML = '';
        
        data.forEach((p) => {
          const article = document.createElement('article');
          article.className = 'project-card reveal is-visible';
          
          const tagsList = Array.isArray(p.tags) 
            ? p.tags.map(tag => `<li><span class="project-card__tag">${tag.trim()}</span></li>`).join('') 
            : '';
            
          const imgUrl = p.image_url || `https://placehold.co/640x360/${(p.image_bg_color || '#4f46e5').replace('#', '')}/ffffff?text=${encodeURIComponent(p.title)}`;

          article.innerHTML = `
            <div class="project-card__image-wrapper">
              <img class="project-card__image" src="${imgUrl}" alt="${p.title} project preview" width="640" height="360">
            </div>
            <div class="project-card__body">
              <h3 class="project-card__title">${p.title}</h3>
              <p class="project-card__description">${p.short_description}</p>
              <ul class="project-card__tags">
                ${tagsList}
              </ul>
              <a href="${p.button_link || '#'}" class="project-card__link">${p.button_text || 'View Case Study →'}</a>
            </div>
          `;
          
          publicGrid.appendChild(article);
        });
      } else {
        publicGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center;">No projects available yet.</p>';
      }
    } else {
      publicGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center;">Database configuration missing.</p>';
    }
  }
});
// === PUBLIC ABOUT CMS RENDERING ===
document.addEventListener('DOMContentLoaded', async () => {
  const profileImg = document.getElementById('about-profile-img');
  
  // If we are on the about page
  if (profileImg) {
    if (typeof supabaseClient !== 'undefined') {
      try {
        const { data, error } = await supabaseClient
          .from('about_content')
          .select('*')
          .limit(1)
          .single();
  
        if (!error && data) {
          // Page Header - Title & Subtitle
          const pageTitleEl = document.getElementById('about-page-title');
          const pageSubtitleEl = document.getElementById('about-page-subtitle');
          
          if (pageTitleEl && data.page_title) {
            pageTitleEl.textContent = data.page_title;
          }
          if (pageSubtitleEl && data.page_subtitle) {
            pageSubtitleEl.textContent = data.page_subtitle;
          }

          // Stats - Update data-targets so our animateCounters logic animates to the new values
          const yNum = document.getElementById('about-years-num');
          const sNum = document.getElementById('about-shipped-num');
          const aNum = document.getElementById('about-awards-num');
          
          if (yNum && data.years_experience !== undefined) { 
            yNum.setAttribute('data-target', data.years_experience); 
            yNum.textContent = '0'; 
          }
          if (sNum && data.shipped_projects !== undefined) { 
            sNum.setAttribute('data-target', data.shipped_projects); 
            sNum.textContent = '0'; 
          }
          if (aNum && data.awards_count !== undefined) { 
            aNum.setAttribute('data-target', data.awards_count); 
            aNum.textContent = '0'; 
          }
  
          const yLbl = document.getElementById('about-years-label');
          const sLbl = document.getElementById('about-shipped-label');
          const aLbl = document.getElementById('about-awards-label');
          
          if (yLbl && data.years_label) yLbl.textContent = data.years_label;
          if (sLbl && data.shipped_label) sLbl.textContent = data.shipped_label;
          if (aLbl && data.awards_label) aLbl.textContent = data.awards_label;
  
          // Image
          if (data.profile_image_url) {
            profileImg.src = data.profile_image_url;
          }
  
          // Paragraphs (HTML allowed for p1, just text for others based on user spec)
          const p1 = document.getElementById('about-para-1');
          const p2 = document.getElementById('about-para-2');
          const p3 = document.getElementById('about-para-3');
          
          if (p1 && data.paragraph_1) p1.innerHTML = data.paragraph_1;
          if (p2 && data.paragraph_2) p2.textContent = data.paragraph_2;
          if (p3 && data.paragraph_3) p3.textContent = data.paragraph_3;
        }

        // Fetch career timeline items dynamically from Supabase
        const { data: timelineData, error: timelineError } = await supabaseClient
          .from('career_timeline')
          .select('*')
          .eq('status', 'published')
          .order('display_order', { ascending: true })
          .order('year', { ascending: false });

        if (!timelineError && timelineData && timelineData.length > 0) {
          const timelineContainer = document.getElementById('public-timeline-container');
          if (timelineContainer) {
            timelineContainer.innerHTML = '';
            timelineData.forEach(item => {
              const li = document.createElement('li');
              li.className = 'timeline__entry reveal';
              li.innerHTML = `
                <span class="timeline__year">${item.year}</span>
                <div class="timeline__content">
                  <h3 class="timeline__role">${item.role}, ${item.company}</h3>
                  <p class="timeline__description">${item.description || ''}</p>
                </div>
              `;
              timelineContainer.appendChild(li);
            });

            // Observe the newly added timeline reveal elements so scroll reveal animation works beautifully
            const localRevealObserver = new IntersectionObserver((entries, obs) => {
              entries.forEach(entry => {
                if (entry.isIntersecting) {
                  entry.target.classList.add('is-visible');
                  obs.unobserve(entry.target);
                }
              });
            }, { threshold: 0.1 });
            timelineContainer.querySelectorAll('.reveal').forEach(el => localRevealObserver.observe(el));
          }
        }
      } catch (err) {
        console.error('Failed to load dynamic about or timeline content:', err);
      } finally {
        // Trigger counter animation AFTER data has loaded (or failed with fallback targets)
        animateCounters();
      }
    } else {
      // Supabase is missing, run animation with hardcoded fallback values
      animateCounters();
    }
  }
});

// === PUBLIC NAVBAR CMS RENDERING ===
document.addEventListener('DOMContentLoaded', async () => {
  const navContainer = document.getElementById('public-nav-container');
  if (!navContainer || typeof supabaseClient === 'undefined') return;

  try {
    // 1. Fetch Brand Settings
    const { data: settings, error: settingsError } = await supabaseClient
      .from('navbar_settings')
      .select('*')
      .limit(1)
      .single();

    if (settingsError) throw settingsError;

    // 2. Fetch Active Menu Items
    const { data: items, error: itemsError } = await supabaseClient
      .from('navbar_items')
      .select('*')
      .eq('status', 'active')
      .order('display_order', { ascending: true });

    if (itemsError) throw itemsError;

    if (settings && items && items.length > 0) {
      // Find current page path to highlight active state
      const currentPath = window.location.pathname.split('/').pop() || 'index.html';
      
      // Render Brand Link & Text
      const brandText = settings.brand_text || 'Atanu Mondal';
      const brandLink = settings.brand_link || 'index.html';
      
      // Build items list
      let menuItemsHtml = '';
      items.forEach(item => {
        // Determine if this item link points to the current active page
        const isUrlActive = item.url === currentPath || 
                            (currentPath === '' && item.url === 'index.html') ||
                            (currentPath === 'index.html' && item.url === '');
        const activeClass = isUrlActive ? 'class="active"' : '';
        
        // Never render administrative routes on the public site
        if (item.url.toLowerCase().includes('admin')) return;

        menuItemsHtml += `<li><a href="${item.url}" ${activeClass}>${item.label}</a></li>`;
      });

      // Theme Toggle option
      let themeToggleHtml = '';
      if (settings.show_theme_toggle !== false) {
        themeToggleHtml = `
          <li>
            <button class="theme-toggle" aria-label="Switch to dark mode">
              <span class="theme-toggle__icon dark-icon">🌙</span>
              <span class="theme-toggle__icon light-icon">☀️</span>
            </button>
          </li>
        `;
      }

      // Reconstruct Navbar HTML dynamically
      navContainer.innerHTML = `
        <a href="${brandLink}" class="navbar__brand">${brandText}</a>
        <button
          type="button"
          class="navbar__toggle"
          aria-expanded="false"
          aria-controls="navbar-menu"
          aria-label="Open navigation menu"
        >
          <span class="navbar__icon navbar__icon--menu" aria-hidden="true">☰</span>
          <span class="navbar__icon navbar__icon--close" aria-hidden="true">✕</span>
        </button>
        
        <div class="navbar__menu" id="navbar-menu">
          <ul class="navbar__links">
            ${menuItemsHtml}
            ${themeToggleHtml}
          </ul>
        </div>
      `;

      // RE-BIND EVENT HANDLERS
      // Since we replaced the inner HTML of the navbar, we must re-bind the theme toggling
      // and mobile hamburger menu click event handlers so they work perfectly!

      // A. Mobile Hamburger toggle
      const navbarToggle = navContainer.querySelector(".navbar__toggle");
      const navbarMenu = navContainer.querySelector("#navbar-menu");
      if (navbarToggle && navbarMenu) {
        navbarToggle.addEventListener("click", () => {
          const isOpen = navContainer.classList.toggle("is-open");
          navbarToggle.setAttribute("aria-expanded", String(isOpen));
          navbarToggle.setAttribute(
            "aria-label",
            isOpen ? "Close navigation menu" : "Open navigation menu"
          );
        });

        navbarMenu.querySelectorAll("a").forEach((link) => {
          link.addEventListener("click", () => {
            navContainer.classList.remove("is-open");
            navbarToggle.setAttribute("aria-expanded", "false");
            navbarToggle.setAttribute("aria-label", "Open navigation menu");
          });
        });
      }

      // B. Theme Toggle Button Binding
      if (settings.show_theme_toggle !== false) {
        const toggleBtns = navContainer.querySelectorAll('.theme-toggle');
        
        // Re-trigger theme icons initial state based on active theme
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        toggleBtns.forEach(btn => {
          btn.setAttribute('aria-label', currentTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
          btn.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('atanu-theme', next);
            btn.setAttribute('aria-label', next === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
          });
        });
      }
    }
  } catch (err) {
    console.error('Failed to load dynamic navbar CMS content, falling back to static HTML:', err);
  }
});

// === PUBLIC FOOTER CMS RENDERING ===
document.addEventListener('DOMContentLoaded', async () => {
  const footerContainer = document.getElementById('public-footer-container');
  if (!footerContainer || typeof supabaseClient === 'undefined') return;

  try {
    // 1. Fetch Footer Settings
    const { data: settings, error: settingsError } = await supabaseClient
      .from('footer_settings')
      .select('*')
      .limit(1)
      .single();

    if (settingsError) throw settingsError;

    // 2. Fetch Active Footer Links
    const { data: links, error: linksError } = await supabaseClient
      .from('footer_links')
      .select('*')
      .eq('status', 'active')
      .order('display_order', { ascending: true });

    if (linksError) throw linksError;

    if (settings && links) {
      const brandName = settings.brand_name || 'Atanu Mondal';
      const tagline = settings.tagline || '';
      const quickHeading = settings.quick_links_heading || 'Quick links';
      const socialHeading = settings.social_heading || 'Social';
      const copyright = settings.copyright_text || '';
      const icon = settings.footer_icon || '❤️';

      // Build Quick Links HTML
      let quickLinksHtml = '';
      const quickLinks = links.filter(l => l.section === 'quick');
      quickLinks.forEach(link => {
        // Never render administrative routes
        if (link.url.toLowerCase().includes('admin')) return;
        quickLinksHtml += `<li><a href="${link.url}">${link.label}</a></li>`;
      });

      // Show footer theme toggle if configured
      if (settings.show_theme_toggle !== false) {
        quickLinksHtml += `
          <li>
            <button class="theme-toggle" aria-label="Switch to dark mode">
              <span class="theme-toggle__icon dark-icon">🌙</span>
              <span class="theme-toggle__icon light-icon">☀️</span>
            </button>
          </li>
        `;
      }

      // Build Social Links HTML
      let socialLinksHtml = '';
      const socialLinks = links.filter(l => l.section === 'social');
      socialLinks.forEach(link => {
        // Never render administrative routes
        if (link.url.toLowerCase().includes('admin')) return;
        
        const emoji = link.icon ? `<span aria-hidden="true">${link.icon}</span> ` : '';
        const isExternal = link.url.startsWith('http://') || link.url.startsWith('https://');
        const targetAttr = isExternal ? 'target="_blank" rel="noopener noreferrer"' : '';
        
        socialLinksHtml += `<li><a href="${link.url}" ${targetAttr}>${emoji}${link.label}</a></li>`;
      });

      // Update Footer inner HTML
      footerContainer.innerHTML = `
        <div class="site-footer__inner">
          <div class="site-footer__columns">
            <div class="site-footer__brand">
              <p class="site-footer__name">${brandName}</p>
              <p class="site-footer__tagline">${tagline}</p>
            </div>
            <div class="site-footer__column">
              <h2 class="site-footer__heading">${quickHeading}</h2>
              <ul class="site-footer__links">
                ${quickLinksHtml}
              </ul>
            </div>
            <div class="site-footer__column">
              <h2 class="site-footer__heading">${socialHeading}</h2>
              <ul class="site-footer__social">
                ${socialLinksHtml}
              </ul>
            </div>
          </div>
          <p class="site-footer__bottom">${copyright} <span class="footer-heart">${icon}</span></p>
        </div>
      `;

      // RE-BIND EVENT HANDLERS FOR THEME TOGGLE
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      const allThemeToggles = document.querySelectorAll('.theme-toggle');
      
      allThemeToggles.forEach(btn => {
        btn.setAttribute('aria-label', currentTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      });

      // Bind click handlers to footer theme toggles specifically
      const footerToggles = footerContainer.querySelectorAll('.theme-toggle');
      footerToggles.forEach(footerBtn => {
        footerBtn.addEventListener('click', () => {
          const current = document.documentElement.getAttribute('data-theme');
          const next = current === 'dark' ? 'light' : 'dark';
          document.documentElement.setAttribute('data-theme', next);
          localStorage.setItem('atanu-theme', next);
          
          // Sync all toggles on the page
          document.querySelectorAll('.theme-toggle').forEach(tBtn => {
            tBtn.setAttribute('aria-label', next === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
          });
        });
      });
    }
  } catch (err) {
    console.error('Failed to load dynamic footer CMS content, falling back to static HTML:', err);
  }
});

// === PUBLIC HOME CMS + SKILLS CAROUSEL RENDERING ===
document.addEventListener('DOMContentLoaded', async () => {
  const track = document.getElementById('home-skills-track');
  const heroSection = document.getElementById('home-hero-section');
  
  // Exit cleanly if we are not on the landing page
  if (!heroSection && !track) return;

  // Initialize skills carousel logic on the fallback HTML by default
  // This ensures the slider functions immediately while queries are loading or if offline
  let sliderInitialized = false;

  const initFallbackSlider = () => {
    if (sliderInitialized) return;
    initSkillsSlider();
    sliderInitialized = true;
  };

  // If Supabase client is missing, run slider on fallback cards immediately
  if (typeof supabaseClient === 'undefined') {
    initFallbackSlider();
    return;
  }

  try {
    // 1. Fetch Hero & Page Settings
    const { data: hero, error: heroError } = await supabaseClient
      .from('home_hero')
      .select('*')
      .limit(1)
      .single();

    if (heroError) throw heroError;

    if (hero) {
      // Handle hero visibility
      if (hero.is_enabled === false) {
        heroSection.style.display = 'none';
      } else {
        heroSection.style.display = 'flex';
        const eyebrow = document.getElementById('home-hero-eyebrow');
        const headline = document.getElementById('home-hero-headline');
        const subheadline = document.getElementById('home-hero-subheadline');
        const cta = document.getElementById('home-hero-cta');

        if (eyebrow) eyebrow.textContent = hero.eyebrow || '';
        if (headline) headline.textContent = hero.headline || '';
        if (subheadline) subheadline.textContent = hero.subheadline || '';
        if (cta) {
          cta.textContent = hero.cta_text || 'See My Work →';
          cta.setAttribute('href', hero.cta_link || 'projects.html');
        }
      }

      // Update Skills Section headers
      const skillsHeading = document.getElementById('home-skills-heading');
      const skillsTagline = document.getElementById('home-skills-tagline');
      
      if (skillsHeading) skillsHeading.textContent = hero.skills_heading || 'What I Do';
      if (skillsTagline) skillsTagline.textContent = hero.skills_tagline || '';
    }

    // 2. Fetch Active Skills Cards
    const { data: skills, error: skillsError } = await supabaseClient
      .from('home_skills')
      .select('*')
      .eq('status', 'published')
      .order('display_order', { ascending: true });

    if (skillsError) throw skillsError;

    if (skills && skills.length > 0 && track) {
      track.innerHTML = '';
      skills.forEach(skill => {
        const card = document.createElement('article');
        card.className = 'skills__card reveal';
        card.innerHTML = `
          <span class="skills__icon" aria-hidden="true">${skill.icon || ''}</span>
          <h3 class="skills__name">${skill.title}</h3>
          <p class="skills__description">${skill.description}</p>
        `;
        track.appendChild(card);
      });

      // Re-observe dynamic card entries so scroll animations render
      const revealObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });
      track.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
    }

    // Initialize the slider carousel on the loaded/dynamic cards
    initFallbackSlider();

  } catch (err) {
    console.error('Failed to load Home page dynamic content, running fallbacks:', err);
    initFallbackSlider();
  }

  // --- Premium Carousel Slider Engine ---
  function initSkillsSlider() {
    const sliderContainer = document.getElementById('home-skills-slider');
    const trackEl = document.getElementById('home-skills-track');
    const prevBtn = document.getElementById('btn-skills-prev');
    const nextBtn = document.getElementById('btn-skills-next');
    const dotsContainer = document.getElementById('home-skills-dots');

    if (!sliderContainer || !trackEl || !prevBtn || !nextBtn || !dotsContainer) return;

    let currentIndex = 0;
    let cards = trackEl.querySelectorAll('.skills__card');
    if (cards.length === 0) return;

    // Responsive visible counts
    const getVisibleCount = () => {
      const width = window.innerWidth;
      if (width > 1024) return 4;
      if (width > 768) return 3;
      if (width > 480) return 2;
      return 1;
    };

    let visibleCount = getVisibleCount();
    let maxIndex = Math.max(0, cards.length - visibleCount);

    // Render navigation indicators
    const renderDots = () => {
      dotsContainer.innerHTML = '';
      maxIndex = Math.max(0, cards.length - getVisibleCount());
      
      if (maxIndex <= 0) return;

      for (let i = 0; i <= maxIndex; i++) {
        const dot = document.createElement('button');
        dot.className = `skills-slider-dot ${i === currentIndex ? 'active' : ''}`;
        dot.setAttribute('aria-label', `Navigate to slide ${i + 1}`);
        dot.addEventListener('click', () => {
          currentIndex = i;
          updateSlider();
          resetAutoSlide();
        });
        dotsContainer.appendChild(dot);
      }
    };

    // Transition execution
    const updateSlider = () => {
      maxIndex = Math.max(0, cards.length - getVisibleCount());
      if (currentIndex > maxIndex) currentIndex = maxIndex;
      if (currentIndex < 0) currentIndex = 0;

      const card = cards[0];
      const cardWidth = card.getBoundingClientRect().width;
      // Gap size matches 24px in CSS
      const translation = currentIndex * (cardWidth + 24);
      trackEl.style.transform = `translateX(-${translation}px)`;

      // Sync active indicators
      const dots = dotsContainer.querySelectorAll('.skills-slider-dot');
      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === currentIndex);
      });

      prevBtn.disabled = currentIndex === 0;
      nextBtn.disabled = currentIndex >= maxIndex;
    };

    // Auto-slide loops
    let autoSlideInterval = null;
    const startAutoSlide = () => {
      maxIndex = Math.max(0, cards.length - getVisibleCount());
      if (maxIndex <= 0) return;

      autoSlideInterval = setInterval(() => {
        currentIndex++;
        if (currentIndex > maxIndex) {
          currentIndex = 0;
        }
        updateSlider();
      }, 2500);
    };

    const stopAutoSlide = () => {
      if (autoSlideInterval) {
        clearInterval(autoSlideInterval);
        autoSlideInterval = null;
      }
    };

    const resetAutoSlide = () => {
      stopAutoSlide();
      startAutoSlide();
    };

    // Button event bindings
    prevBtn.addEventListener('click', () => {
      if (currentIndex > 0) {
        currentIndex--;
        updateSlider();
        resetAutoSlide();
      }
    });

    nextBtn.addEventListener('click', () => {
      if (currentIndex < maxIndex) {
        currentIndex++;
        updateSlider();
        resetAutoSlide();
      }
    });

    // Pause on hover
    sliderContainer.addEventListener('mouseenter', stopAutoSlide);
    sliderContainer.addEventListener('mouseleave', startAutoSlide);

    // Handle screen resizing
    window.addEventListener('resize', () => {
      const oldVisible = visibleCount;
      const newVisible = getVisibleCount();
      
      if (oldVisible !== newVisible) {
        visibleCount = newVisible;
        maxIndex = Math.max(0, cards.length - visibleCount);
        
        setupControlsVisibility();
        renderDots();
        
        if (currentIndex > maxIndex) currentIndex = maxIndex;
        updateSlider();
      }
    });

    // Determine navigation controls visibility
    const setupControlsVisibility = () => {
      maxIndex = Math.max(0, cards.length - getVisibleCount());
      
      if (maxIndex <= 0) {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
        dotsContainer.style.display = 'none';
        trackEl.style.justifyContent = 'center';
        stopAutoSlide();
      } else {
        prevBtn.style.display = 'flex';
        nextBtn.style.display = 'flex';
        dotsContainer.style.display = 'flex';
        trackEl.style.justifyContent = 'flex-start';
      }
    };

    // Init slider
    setupControlsVisibility();
    renderDots();
    updateSlider();
    
    if (maxIndex > 0) {
      startAutoSlide();
    }
  }
});

// === CONTACT CMS (Public Fetch) ===
document.addEventListener('DOMContentLoaded', async () => {
  // Only run if we are on contact page
  const titleEl = document.getElementById('pub-contact-page-title');
  if (!titleEl || typeof supabaseClient === 'undefined') return;

  try {
    // 1. Fetch Contact Settings
    const { data: settings, error: settingsErr } = await supabaseClient
      .from('contact_page_settings')
      .select('*')
      .limit(1)
      .single();

    if (!settingsErr && settings) {
      const elSubtitle = document.getElementById('pub-contact-page-subtitle');
      const elHeading = document.getElementById('pub-contact-heading');
      const elEmailLabel = document.getElementById('pub-contact-email-label');
      const elEmailAddress = document.getElementById('pub-contact-email-address');
      const elLocLabel = document.getElementById('pub-contact-location-label');
      const elLocText = document.getElementById('pub-contact-location-text');
      const elSuccessMsg = document.getElementById('pub-contact-success-message');

      if (titleEl) titleEl.textContent = settings.page_title;
      if (elSubtitle) elSubtitle.textContent = settings.page_subtitle;
      if (elHeading) elHeading.textContent = settings.card_heading;
      if (elEmailLabel) elEmailLabel.textContent = settings.email_label;
      if (elEmailAddress) {
        elEmailAddress.textContent = settings.email_address;
        elEmailAddress.href = 'mailto:' + settings.email_address;
      }
      if (elLocLabel) elLocLabel.textContent = settings.location_label;
      if (elLocText) elLocText.textContent = settings.location_text;
      if (elSuccessMsg) elSuccessMsg.textContent = settings.success_message;
    }

    // 2. Fetch Contact Social Links
    const { data: socials, error: socialErr } = await supabaseClient
      .from('contact_social_links')
      .select('*')
      .eq('status', 'active')
      .order('display_order', { ascending: true });

    if (!socialErr && socials && socials.length > 0) {
      const socialList = document.getElementById('pub-contact-social-list');
      if (socialList) {
        socialList.innerHTML = socials.map(link => `
          <li><a href="${link.url}" target="_blank" rel="noopener noreferrer" class="social-icon" aria-label="${link.label}">${link.icon}</a></li>
        `).join('');
      }
    }

    // 3. Fetch Contact Subject Options
    const { data: subjects, error: subjErr } = await supabaseClient
      .from('contact_subject_options')
      .select('*')
      .eq('status', 'active')
      .order('display_order', { ascending: true });

    if (!subjErr && subjects && subjects.length > 0) {
      const subjectSelect = document.getElementById('subject');
      if (subjectSelect) {
        subjectSelect.innerHTML = '<option value="" disabled selected>Select a subject</option>' + 
          subjects.map(sub => `<option value="${sub.option_value}">${sub.option_label}</option>`).join('');
      }
    }

  } catch (err) {
    console.error('Error fetching contact content from Supabase:', err);
  }
});
