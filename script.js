
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
      loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const idVal = document.getElementById("login-id").value;
        const passVal = document.getElementById("login-password").value;

        // Simple client-side check (Beginner friendly)
        if (idVal === "atmond" && passVal === "nopass") {
          // Success! Hide login, show dashboard, fetch messages
          loginSection.style.display = "none";
          mainContent.style.display = "block";
          fetchMessages();
        } else {
          // Show error
          loginError.style.display = "block";
        }
      });
    } else {
      // Fallback if login form is missing but admin grid exists
      fetchMessages();
    }
  }
});