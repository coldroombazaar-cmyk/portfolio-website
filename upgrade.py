import os
import re

dir_path = "c:/Users/della/Documents/claud-code-mastry/curser training be10x"

def read_file(name):
    with open(os.path.join(dir_path, name), 'r', encoding='utf-8') as f:
        return f.read()

def write_file(name, content):
    with open(os.path.join(dir_path, name), 'w', encoding='utf-8') as f:
        f.write(content)

# Update HTML files
html_files = ['index.html', 'about.html', 'projects.html', 'contact.html']

theme_toggle_html = """
    <button class="theme-toggle" aria-label="Switch to dark mode">
      <span class="theme-toggle__icon dark-icon">🌙</span>
      <span class="theme-toggle__icon light-icon">☀️</span>
    </button>
"""

# Nav toggle insertion
for file in html_files:
    content = read_file(file)
    # Insert theme toggle right before navbar__toggle
    if 'class="theme-toggle"' not in content:
        content = content.replace(
            '<button\n      type="button"\n      class="navbar__toggle"',
            theme_toggle_html + '    <button\n      type="button"\n      class="navbar__toggle"'
        )
    
    # Reveal classes
    if file == 'index.html':
        content = content.replace('<article class="skills__card">', '<article class="skills__card reveal">')
        # scroll indicator
        if 'hero__scroll' not in content:
            scroll_html = '\n      <div class="hero__scroll"><div class="hero__scroll-dot"></div></div>\n    </div>'
            content = content.replace('</a>\n    </div>', '</a>' + scroll_html)
    elif file == 'about.html':
        content = content.replace('<li class="timeline__entry">', '<li class="timeline__entry reveal">')
        # stats strip ABOVE two-column section (about-bio)
        if 'about-stats' not in content:
            stats_html = """
    <section class="about-stats">
      <div class="stat"><span class="stat-num" data-target="5">0</span>+ years experience</div>
      <div class="stat"><span class="stat-num" data-target="30">0</span>+ shipped projects</div>
      <div class="stat"><span class="stat-num" data-target="12">0</span> awards</div>
    </section>
"""
            content = content.replace('<section class="about-bio">', stats_html + '\n    <section class="about-bio">')
    elif file == 'projects.html':
        content = content.replace('<article class="project-card">', '<article class="project-card reveal">')
        # marquee ABOVE grid
        if 'projects-marquee' not in content:
            marquee_html = """
    <div class="projects-marquee">
      <div class="projects-marquee__inner">
        <div class="projects-marquee__group">
          <span>Fintech</span><span>·</span><span>Edtech</span><span>·</span><span>Healthcare</span><span>·</span><span>B2B</span><span>·</span><span>A11y</span><span>·</span><span>Design Systems</span><span>·</span><span>Marketplace</span><span>·</span><span>Data Viz</span><span>·</span><span>Internal Tools</span><span>·</span><span>UX Writing</span><span>·</span>
        </div>
        <div class="projects-marquee__group" aria-hidden="true">
          <span>Fintech</span><span>·</span><span>Edtech</span><span>·</span><span>Healthcare</span><span>·</span><span>B2B</span><span>·</span><span>A11y</span><span>·</span><span>Design Systems</span><span>·</span><span>Marketplace</span><span>·</span><span>Data Viz</span><span>·</span><span>Internal Tools</span><span>·</span><span>UX Writing</span><span>·</span>
        </div>
        <div class="projects-marquee__group" aria-hidden="true">
          <span>Fintech</span><span>·</span><span>Edtech</span><span>·</span><span>Healthcare</span><span>·</span><span>B2B</span><span>·</span><span>A11y</span><span>·</span><span>Design Systems</span><span>·</span><span>Marketplace</span><span>·</span><span>Data Viz</span><span>·</span><span>Internal Tools</span><span>·</span><span>UX Writing</span><span>·</span>
        </div>
      </div>
    </div>
"""
            content = content.replace('<div class="projects-grid">', marquee_html + '\n    <div class="projects-grid">')
    elif file == 'contact.html':
        content = content.replace('<aside class="contact-card">', '<aside class="contact-card reveal">')
        content = content.replace('<div class="contact-form-panel">', '<div class="contact-form-panel reveal">')
        # Contact icons
        if 'contact-card__social' in content and 'LinkedIn 💼' not in content:
            social_html = """
        <ul class="contact-card__social">
          <li><a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" class="social-icon" aria-label="LinkedIn">💼</a></li>
          <li><a href="https://dribbble.com" target="_blank" rel="noopener noreferrer" class="social-icon" aria-label="Dribbble">🎨</a></li>
          <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer" class="social-icon" aria-label="Twitter">🐦</a></li>
        </ul>
"""
            content = re.sub(r'<ul class="contact-card__social">.*?</ul>', social_html.strip(), content, flags=re.DOTALL)
        # Form inputs placeholders
        content = content.replace('<input type="text" id="full-name" name="fullName" required>', '<input type="text" id="full-name" name="fullName" placeholder=" " required>')
        content = content.replace('<input type="email" id="email" name="email" required>', '<input type="email" id="email" name="email" placeholder=" " required>')
        # Note: Select cannot have placeholder space easily without custom CSS, but we can leave it or ignore it for select.
        content = content.replace('<textarea id="message" name="message" rows="5" required></textarea>', '<textarea id="message" name="message" rows="5" placeholder=" " required></textarea>')

    # Footer update: heart pulse
    if 'animated heart' not in content:
        content = content.replace('Built with curiosity and Cursor.', 'Built with curiosity and Cursor. <span class="footer-heart">♥</span>')
    
    # Add page load splash target if not added dynamically? JS handles it dynamically.
    write_file(file, content)

# -----------------
# styles.css Update
# -----------------
css_content = read_file('styles.css')
# Replace variables block
new_vars = """:root {
  /* Light theme (default) */
  --bg:            #f7f7fb;
  --surface:       #ffffff;
  --surface-2:     #f1f1f8;
  --text:          #0b0b14;
  --text-muted:    #5b5b78;
  --border:        rgba(11,11,20,.08);
  --primary:       #6d5efc;     /* indigo-violet */
  --primary-2:     #b06dfc;     /* magenta-violet */
  --accent:        #22d3ee;     /* cyan */
  --success:       #16a34a;
  --danger:        #ef4444;
  --shadow-sm:     0 2px 6px rgba(11,11,20,.06);
  --shadow-md:     0 12px 32px -8px rgba(109,94,252,.18);
  --shadow-lg:     0 30px 60px -20px rgba(109,94,252,.35);
  --radius-sm:     10px;
  --radius-md:     16px;
  --radius-lg:     24px;
  --radius-pill:   999px;
  --ease:          cubic-bezier(.2,.7,.2,1);
  --dur-fast:      180ms;
  --dur:           320ms;
  --dur-slow:      650ms;
  --grad-hero:     linear-gradient(135deg,#6d5efc 0%,#b06dfc 50%,#22d3ee 100%);
  --grad-text:     linear-gradient(135deg,#0b0b14 0%,#6d5efc 60%,#22d3ee 100%);

  --font-body: "Inter", system-ui, -apple-system, sans-serif;
  --font-heading: "Fraunces", Georgia, serif;

  --font-size-h1: 48px;
  --font-size-h2: 32px;
  --font-size-h3: 22px;
  --font-size-body: 16px;
  --font-size-small: 14px;
  --line-height-body: 1.6;
  --line-height-heading: 1.2;
}

[data-theme="dark"] {
  --bg:#08090f; --surface:#13141f; --surface-2:#1c1d2e;
  --text:#f5f5fa; --text-muted:#9ca3b7;
  --border:rgba(245,245,250,.10);
  --shadow-sm:0 2px 8px rgba(0,0,0,.4);
  --shadow-md:0 14px 40px -10px rgba(34,211,238,.20);
  --shadow-lg:0 30px 80px -20px rgba(109,94,252,.45);
  --grad-text: linear-gradient(135deg,#ffffff 0%,#b06dfc 60%,#22d3ee 100%);
}

body, *, *::before, *::after {
  transition: background-color var(--dur) var(--ease), color var(--dur) var(--ease), border-color var(--dur) var(--ease), box-shadow var(--dur) var(--ease);
}
"""
css_content = re.sub(r':root\s*\{.*?\n\}', new_vars, css_content, flags=re.DOTALL, count=1)
# Update body colors
css_content = css_content.replace('color: var(--color-text);', 'color: var(--text);')
css_content = css_content.replace('background-color: var(--color-bg);', 'background-color: var(--bg);')
css_content = css_content.replace('color: var(--color-bg);', 'color: var(--bg);')

# Now add the new sections at the end
new_css = """
/* === DESIGN TOKENS === */
/* Replaced via python script in :root */

/* === GLOBAL ANIMATIONS & UTILITIES === */
.reveal {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity var(--dur-slow) var(--ease), transform var(--dur-slow) var(--ease);
}
.reveal.is-visible {
  opacity: 1;
  transform: translateY(0);
}

.timeline__entry:nth-child(1) { transition-delay: 50ms; }
.timeline__entry:nth-child(2) { transition-delay: 150ms; }
.timeline__entry:nth-child(3) { transition-delay: 250ms; }
.timeline__entry:nth-child(4) { transition-delay: 350ms; }

.project-card:nth-child(1) { transition-delay: 0ms; }
.project-card:nth-child(2) { transition-delay: 50ms; }
.project-card:nth-child(3) { transition-delay: 100ms; }
.project-card:nth-child(4) { transition-delay: 150ms; }
.project-card:nth-child(5) { transition-delay: 200ms; }
.project-card:nth-child(6) { transition-delay: 250ms; }

*:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 3px;
  border-radius: inherit;
}

#scroll-progress {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  background: var(--grad-hero);
  width: 0%;
  z-index: 9999;
  transition: width 0.1s linear;
}

#splash-screen {
  position: fixed;
  inset: 0;
  background: var(--bg);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 900ms var(--ease);
}
#splash-screen .splash-text {
  font-family: var(--font-heading);
  font-size: clamp(24px, 4vw, 48px);
  background: var(--grad-hero);
  -webkit-background-clip: text;
  color: transparent;
  font-weight: 700;
  animation: splashFade 900ms ease forwards;
}
@keyframes splashFade {
  0% { opacity: 0; transform: scale(0.9); }
  50% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(1.05); }
}

/* === NAV (GLASS) === */
.navbar {
  background-color: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(18px) saturate(140%);
  -webkit-backdrop-filter: blur(18px) saturate(140%);
  border-bottom: 1px solid var(--border);
  color: var(--text);
  transition: height var(--dur) var(--ease), box-shadow var(--dur) var(--ease), background-color var(--dur) var(--ease);
}
[data-theme="dark"] .navbar {
  background-color: rgba(19, 20, 31, 0.55);
}
.navbar.is-scrolled {
  height: 56px;
  box-shadow: var(--shadow-md);
  background-color: rgba(255, 255, 255, 0.85);
}
[data-theme="dark"] .navbar.is-scrolled {
  background-color: rgba(19, 20, 31, 0.85);
}
.navbar__brand {
  background: var(--grad-hero);
  -webkit-background-clip: text;
  color: transparent !important;
  font-weight: 700;
}
.navbar__links a {
  color: var(--text);
  position: relative;
}
.navbar__links a:hover {
  color: var(--primary);
}
.navbar__links a.active {
  text-decoration: none;
}
.navbar__links a.active::after {
  content: "";
  position: absolute;
  bottom: -4px;
  left: 0;
  height: 2px;
  width: 100%;
  background: var(--grad-hero);
  animation: navUnderline var(--dur) var(--ease) forwards;
}
@keyframes navUnderline {
  0% { width: 0%; }
  100% { width: 100%; }
}
.theme-toggle {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-pill);
  background-color: var(--surface-2);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-right: 16px;
  padding: 0;
  color: var(--text);
  position: relative;
  overflow: hidden;
}
.theme-toggle__icon {
  position: absolute;
  transition: transform var(--dur) var(--ease), opacity var(--dur) var(--ease);
}
.light-icon { opacity: 0; transform: translateY(20px); }
.dark-icon { opacity: 1; transform: translateY(0); }
[data-theme="dark"] .light-icon { opacity: 1; transform: translateY(0); }
[data-theme="dark"] .dark-icon { opacity: 0; transform: translateY(-20px); }

.navbar__toggle {
  color: var(--text);
}

/* === HERO (BLOBS) === */
.hero {
  background: var(--surface);
  position: relative;
  overflow: hidden;
  z-index: 1;
}
@keyframes blobFloat {
  0% { transform: translate(0, 0); }
  25% { transform: translate(40px, -40px); }
  50% { transform: translate(-20px, 20px); }
  75% { transform: translate(-40px, -20px); }
  100% { transform: translate(0, 0); }
}
.hero::before, .hero::after {
  content: "";
  position: absolute;
  width: 60vw;
  height: 60vw;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.55;
  z-index: -1;
  animation: blobFloat 12s ease-in-out infinite;
  mix-blend-mode: multiply;
  transition: none; /* exclude from global */
}
[data-theme="dark"] .hero::before, [data-theme="dark"] .hero::after {
  mix-blend-mode: screen;
}
.hero::before {
  background: #6d5efc;
  top: -10vw;
  left: -10vw;
  animation-delay: -2s;
}
.hero::after {
  background: #22d3ee;
  bottom: -20vw;
  right: -10vw;
  animation-delay: -6s;
}
.hero__eyebrow {
  color: var(--text-muted);
}
.hero__headline {
  background: var(--grad-text);
  -webkit-background-clip: text;
  color: transparent;
  font-size: clamp(40px, 6vw, 84px);
  line-height: 1.05;
}
.hero__subheadline {
  color: var(--text-muted);
}
.hero__cta {
  background: var(--grad-hero);
  color: white;
  border-radius: var(--radius-pill);
  padding: 18px 36px;
  box-shadow: var(--shadow-md);
  position: relative;
  overflow: hidden;
  border: none;
}
.hero__cta::before {
  content: "";
  position: absolute;
  top: 0; left: -100%;
  width: 100%; height: 100%;
  background: linear-gradient(120deg, transparent, rgba(255,255,255,0.4), transparent);
  transition: transform 700ms var(--ease);
}
.hero__cta:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
  color: white;
}
.hero__cta:hover::before {
  transform: translateX(200%);
}
.hero__scroll {
  width: 22px;
  height: 36px;
  border: 2px solid var(--text-muted);
  border-radius: var(--radius-pill);
  position: absolute;
  bottom: 32px;
  display: flex;
  justify-content: center;
  padding-top: 4px;
}
@keyframes scrollDot {
  0% { transform: translateY(0); opacity: 1; }
  100% { transform: translateY(16px); opacity: 0; }
}
.hero__scroll-dot {
  width: 4px;
  height: 4px;
  background: var(--text-muted);
  border-radius: 50%;
  animation: scrollDot 1.6s infinite;
}

/* === SKILLS (UPGRADED) === */
.skills {
  background-color: var(--bg);
}
.skills__tagline {
  color: var(--text-muted);
}
.skills__card {
  background-color: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 28px;
  box-shadow: var(--shadow-sm);
  position: relative;
  overflow: hidden;
}
.skills__card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-lg);
  border-color: transparent;
}
.skills__card::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: var(--grad-hero);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  transition: opacity var(--dur) var(--ease);
}
.skills__card:hover::before {
  opacity: 1;
}
.skills__card::after {
  content: "";
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: linear-gradient(120deg, transparent, rgba(255,255,255,0.1), transparent);
  transform: translateX(-100%);
  transition: transform var(--dur-slow) var(--ease);
  pointer-events: none;
}
[data-theme="dark"] .skills__card::after {
  background: linear-gradient(120deg, transparent, rgba(255,255,255,0.05), transparent);
}
.skills__card:hover::after {
  transform: translateX(100%);
}
.skills__icon {
  width: 56px;
  height: 56px;
  background-color: var(--surface-2);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  box-shadow: 0 0 0 6px rgba(109,94,252,0.08);
}
.skills__name {
  color: var(--text);
}
.skills__description {
  color: var(--text-muted);
}

/* === ABOUT (STATS + TIMELINE) === */
.about-page {
  background-color: var(--bg);
}
.about-header {
  position: relative;
}
.about-header::before {
  content: "";
  position: absolute;
  width: 150px;
  height: 150px;
  background: var(--primary);
  filter: blur(40px);
  opacity: 0.25;
  border-radius: 50%;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  z-index: -1;
  animation: blobFloat 8s ease-in-out infinite;
}
.about-header__subtitle {
  color: var(--text-muted);
}
.about-stats {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 24px;
  margin-bottom: 64px;
  background: var(--surface);
  padding: 32px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
}
.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-weight: 600;
  color: var(--text-muted);
}
.stat-num {
  font-size: clamp(32px, 4vw, 48px);
  font-family: var(--font-heading);
  background: var(--grad-hero);
  -webkit-background-clip: text;
  color: transparent;
  font-weight: 800;
}
.about-bio__image {
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  position: relative;
  border: 8px solid transparent;
  background: linear-gradient(var(--surface), var(--surface)) padding-box, var(--grad-hero) border-box;
}
@media (min-width: 900px) {
  .about-bio__image {
    transform: rotate(-3deg);
    transition: transform var(--dur) var(--ease);
  }
  .about-bio__image:hover {
    transform: rotate(0);
  }
}
.about-bio__text p {
  color: var(--text);
}
.about-timeline__heading {
  color: var(--text);
}
.timeline::before {
  background-color: transparent;
  background: var(--grad-hero);
}
.timeline__entry::before {
  background-color: var(--primary);
  box-shadow: 0 0 0 6px rgba(109,94,252,0.2);
}
.timeline__year {
  color: var(--primary);
}
.timeline__role {
  color: var(--text);
}
.timeline__description {
  color: var(--text-muted);
}

/* === PROJECTS (MARQUEE + CARDS) === */
.projects-marquee {
  overflow: hidden;
  white-space: nowrap;
  padding: 16px 0;
  margin-bottom: 48px;
  background: var(--surface-2);
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  display: flex;
}
.projects-marquee__inner {
  display: flex;
  width: fit-content;
  animation: marquee 30s linear infinite;
}
.projects-marquee:hover .projects-marquee__inner {
  animation-play-state: paused;
}
.projects-marquee__group {
  display: flex;
  gap: 16px;
  padding-right: 16px;
}
.projects-marquee__group span {
  font-weight: 600;
  color: var(--text);
  font-size: 14px;
}
@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-33.3333%); }
}

.project-card {
  background-color: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  transition: transform var(--dur) var(--ease), box-shadow var(--dur) var(--ease);
}
.project-card:hover {
  transform: rotate(-0.4deg) translateY(-6px);
  box-shadow: var(--shadow-lg);
}
.project-card__image {
  border-radius: var(--radius-md) var(--radius-md) 0 0;
  transition: transform var(--dur) var(--ease);
}
.project-card:hover .project-card__image {
  transform: scale(1.06);
}
.project-card__image-wrapper {
  overflow: hidden;
  position: relative;
  border-radius: var(--radius-md) var(--radius-md) 0 0;
}
.project-card__image-wrapper::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.55) 100%);
  opacity: 0;
  transition: opacity var(--dur) var(--ease);
  pointer-events: none;
}
.project-card:hover .project-card__image-wrapper::after {
  opacity: 1;
}

.project-card__title {
  color: var(--text);
}
.project-card__description {
  color: var(--text-muted);
}
.project-card__tag {
  background-color: var(--surface-2);
  color: var(--text);
  border: 1px solid var(--border);
  transition: background var(--dur-fast), color var(--dur-fast);
}
.project-card__tag:hover {
  background: var(--grad-hero);
  color: white;
  border-color: transparent;
}
.project-card__link {
  color: var(--primary);
  opacity: 0;
  transform: translateY(8px);
  display: inline-block;
  transition: opacity var(--dur) var(--ease), transform var(--dur) var(--ease);
}
.project-card:hover .project-card__link {
  opacity: 1;
  transform: translateY(0);
}

/* === CONTACT (FROSTED + FLOAT-LABELS) === */
.contact-header__subtitle {
  color: var(--text-muted);
}
.contact-card {
  background-color: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}
.contact-card__item {
  color: var(--text);
}
.contact-card__item a {
  color: var(--primary);
}
.contact-card__social {
  flex-direction: row;
}
.contact-card__social .social-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  background-color: var(--surface-2);
  border-radius: var(--radius-md);
  font-size: 24px;
  text-decoration: none;
  transition: transform var(--dur) var(--ease), background var(--dur) var(--ease);
}
.contact-card__social .social-icon:hover {
  transform: scale(1.08);
  background: var(--grad-hero);
}

.contact-form-panel {
  background-color: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}
.contact-form__field {
  position: relative;
  margin-bottom: 24px;
}
.contact-form__field label {
  position: absolute;
  top: 50%;
  left: 16px;
  transform: translateY(-50%);
  background: transparent;
  padding: 0 4px;
  color: var(--text-muted);
  transition: transform var(--dur-fast) var(--ease), font-size var(--dur-fast) var(--ease), top var(--dur-fast) var(--ease), background var(--dur-fast) var(--ease);
  pointer-events: none;
  margin: 0;
}
.contact-form__field textarea + label,
.contact-form__field:has(textarea) label {
  top: 24px;
}

.contact-form__field input,
.contact-form__field select,
.contact-form__field textarea {
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  padding: 16px;
  background-color: var(--surface);
  color: var(--text);
}
.contact-form__field input:focus,
.contact-form__field select:focus,
.contact-form__field textarea:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(109,94,252,0.18);
}
.contact-form__field input:not(:placeholder-shown) + label,
.contact-form__field input:focus + label,
.contact-form__field select:focus + label,
.contact-form__field select:valid + label,
.contact-form__field textarea:not(:placeholder-shown) + label,
.contact-form__field textarea:focus + label {
  top: 0;
  transform: translateY(-50%) scale(0.82);
  left: 12px;
  background: var(--bg);
  border-radius: 4px;
}
/* Re-order in DOM needed for adjacent sibling selector to work if we want pure CSS */
/* We will fix HTML order via python script if needed, or use JS, or just use :placeholder-shown */

.contact-form__submit {
  background: var(--grad-hero);
  color: white;
  border-radius: var(--radius-pill);
  padding: 14px 28px;
  box-shadow: var(--shadow-md);
  position: relative;
  overflow: hidden;
}
.contact-form__submit::before {
  content: "";
  position: absolute;
  top: 0; left: -100%;
  width: 100%; height: 100%;
  background: linear-gradient(120deg, transparent, rgba(255,255,255,0.4), transparent);
  transition: transform 700ms var(--ease);
}
.contact-form__submit:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  background: var(--grad-hero);
}
.contact-form__submit:hover::before {
  transform: translateX(200%);
}

/* === FOOTER (UPGRADED) === */
.site-footer {
  background-color: var(--surface-2);
  border-top: 1px solid var(--border);
  color: var(--text-muted);
  position: relative;
}
.site-footer::before {
  content: "";
  position: absolute;
  top: 0; left: 0; width: 100%; height: 2px;
  background: var(--grad-hero);
  opacity: 0.6;
}
.site-footer__name {
  color: var(--text);
}
.site-footer__tagline {
  color: var(--text-muted);
}
.site-footer__heading {
  color: var(--text);
}
.site-footer__links a {
  color: var(--text-muted);
}
.site-footer__links a:hover {
  color: var(--primary);
}
.site-footer__social {
  display: flex;
  gap: 12px;
  flex-direction: row;
}
.site-footer__social a {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px; height: 40px;
  background: var(--surface);
  border-radius: var(--radius-md);
  font-size: 18px;
  color: transparent !important;
  text-shadow: 0 0 0 var(--text);
  transition: transform var(--dur) var(--ease), background var(--dur) var(--ease);
}
.site-footer__social a:hover {
  transform: scale(1.08);
  background: var(--grad-hero);
  text-shadow: 0 0 0 white;
}
.site-footer__bottom {
  color: var(--text-muted);
  border-top-color: var(--border);
}
@keyframes pulseHeart {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}
.footer-heart {
  display: inline-block;
  color: var(--danger);
  animation: pulseHeart 1.4s infinite;
}

/* === REDUCED MOTION === */
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-duration: .001ms !important;
    transition-duration: .001ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
  }
}
"""

if "=== DESIGN TOKENS ===" not in css_content:
    css_content += "\n" + new_css

# Fix contact HTML for float labels: label needs to be AFTER input
# So `<label>...</label><input...>` becomes `<input...><label>...</label>`
# Let's fix this in contact.html if we haven't already.
contact_html = read_file('contact.html')
# Replace field inner HTML
contact_html = re.sub(
    r'<label for="([^"]+)">(.*?)</label>\s*<input([^>]*)>',
    r'<input\3>\n            <label for="\1">\2</label>',
    contact_html
)
contact_html = re.sub(
    r'<label for="([^"]+)">(.*?)</label>\s*<select([^>]*)>(.*?)</select>',
    r'<select\3>\4</select>\n            <label for="\1">\2</label>',
    contact_html, flags=re.DOTALL
)
contact_html = re.sub(
    r'<label for="([^"]+)">(.*?)</label>\s*<textarea([^>]*)>(.*?)</textarea>',
    r'<textarea\3>\4</textarea>\n            <label for="\1">\2</label>',
    contact_html, flags=re.DOTALL
)

# Project card image wrapper fix
projects_html = read_file('projects.html')
projects_html = projects_html.replace('<img\n          class="project-card__image"', '<div class="project-card__image-wrapper">\n          <img\n          class="project-card__image"')
projects_html = projects_html.replace('height="360"\n        >', 'height="360"\n        >\n        </div>')

# Re-write the updated ones
write_file('contact.html', contact_html)
write_file('projects.html', projects_html)
write_file('styles.css', css_content)


# ----------------
# script.js Update
# ----------------
js_content = read_file('script.js')

new_js = """
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
"""

if "// === THEME" not in js_content:
    js_content = new_js + "\n" + js_content
    write_file('script.js', js_content)

print("Upgrade complete.")
