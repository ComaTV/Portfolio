import './styles.css';

const icon = (name, size = 18) => {
  const paths = {
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    external: '<path d="M15 4h5v5M10 14 20 4M20 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h6"/>',
    github: '<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3.3-.4 6.8-1.6 6.8-7A5.4 5.4 0 0 0 19.3 4 5 5 0 0 0 19.1.5S18 0 15 2a13.4 13.4 0 0 0-7 0C5-.1 3.9.5 3.9.5A5 5 0 0 0 3.7 4a5.4 5.4 0 0 0-1.5 3.7c0 5.4 3.5 6.6 6.8 7A4.8 4.8 0 0 0 7.5 18v4M7.5 19c-3 .9-3-1.5-4.2-2"/>',
    play: '<path d="m5 3 14 9-14 9V3Z"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    chevron: '<path d="m9 18 6-6-6-6"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41"/>',
    moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z"/>',
  };
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.arrow}</svg>`;
};

const escapeHTML = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const formatDate = (value) => new Intl.DateTimeFormat('en', {
  month: 'short',
  year: 'numeric',
}).format(new Date(value));

const API_BASE = (import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : '')).replace(/\/+$/, '');
const apiUrl = (path) => `${API_BASE}${path}`;
const assetUrl = (value) => {
  if (typeof value === 'string') return value.startsWith('/') && API_BASE ? `${API_BASE}${value}` : value;
  if (value && typeof value === 'object') return { ...value, url: assetUrl(value.url) };
  return value;
};

const projectLink = (project, kind) => project.linksList?.find((link) => link.name.toLowerCase() === kind)?.url;

const getThemeFromUrl = () => {
  const theme = new URLSearchParams(window.location.search).get('theme');
  return theme === 'light' || theme === 'dark' ? theme : null;
};

const getPreferredTheme = () => {
  const linkedTheme = getThemeFromUrl();
  if (linkedTheme) return linkedTheme;
  const stored = localStorage.getItem('comatv-theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return 'light';
};

document.documentElement.dataset.theme = getPreferredTheme();

const loadData = async () => {
  const response = await fetch(apiUrl('/content'));
  if (!response.ok) throw new Error(`Portfolio API failed (${response.status})`);
  const content = await response.json();
  const withRemoteAssets = (item) => ({
    ...item,
    image: assetUrl(item.image),
    media: item.media?.map(assetUrl),
  });
  return {
    profile: { ...content.profile, avatar: assetUrl(content.profile.avatar) },
    projects: content.projects.map(withRemoteAssets),
    collaborators: content.collaborators.map(withRemoteAssets),
  };
};

const techBadges = (items = []) => items
  .map((item) => `<span class="tech-badge">${escapeHTML(item.name)}</span>`)
  .join('');

const mediaUrl = (media) => typeof media === 'string' ? media : media?.url;
const isVideoMedia = (media) => media?.type === 'video'
  || /\.(mp4|webm|mov|ogv)(?:$|[?#])/i.test(mediaUrl(media) || '');
const mediaElement = (media, className, title, controls = '') => {
  const url = mediaUrl(media);
  if (isVideoMedia(media)) {
    return `<video class="${className}" src="${escapeHTML(url)}" ${controls} preload="metadata" aria-label="${escapeHTML(title)}"></video>`;
  }
  return `<img class="${className}" src="${escapeHTML(url)}" alt="${escapeHTML(title)}" loading="lazy" />`;
};

const projectCard = (project, index) => `
  <article class="project-card reveal" data-project="${project.id}" style="--delay:${Math.min(index * 60, 300)}ms" tabindex="0" role="button" aria-label="View ${escapeHTML(project.title)} project">
    <div class="project-visual">
      <img src="${escapeHTML(project.image)}" alt="${escapeHTML(project.title)} project preview" loading="lazy" />
      <div class="project-hover">
        <span>View case study</span>
        ${icon('arrow', 20)}
      </div>
      ${project.special ? '<span class="featured-label">Featured build</span>' : ''}
    </div>
    <div class="project-content">
      <div class="project-meta">
        <span>${escapeHTML(project.category?.name)}</span>
        <span>${formatDate(project.date)}</span>
      </div>
      <h3>${escapeHTML(project.title)}</h3>
      <p>${escapeHTML(project.description)}</p>
      <div class="project-footer">
        <div class="tech-list">${techBadges(project.technologies)}</div>
        <span class="project-arrow">${icon('chevron', 18)}</span>
      </div>
    </div>
  </article>
`;

const render = ({ profile, projects, collaborators }) => {
  const sortedProjects = [...projects].sort((a, b) => new Date(b.date) - new Date(a.date));
  const featured = sortedProjects.find((project) => project.special) || sortedProjects[0];
  const categories = ['All', ...new Set(sortedProjects.map((project) => project.category?.name).filter(Boolean))];
  const githubCount = projects.filter((project) => projectLink(project, 'github')).length;

  document.querySelector('#app').innerHTML = `
    <header class="site-header">
      <a class="brand" href="#top" aria-label="ComaTV home"><span>C/</span> ComaTV</a>
      <nav class="desktop-nav" aria-label="Main navigation">
        <a href="#work">Work</a>
        <a href="#expertise">Expertise</a>
        <a href="#about">About</a>
      </nav>
      <div class="header-actions">
        <button class="theme-toggle" type="button" aria-label="Switch to light mode" title="Switch color theme">
          <span class="theme-icon theme-icon-sun">${icon('sun', 17)}</span>
          <span class="theme-icon theme-icon-moon">${icon('moon', 17)}</span>
        </button>
        <a class="contact-link" href="#contact">Let's talk ${icon('arrow', 17)}</a>
        <button class="menu-toggle" aria-label="Open navigation">${icon('menu', 22)}</button>
      </div>
    </header>

    <div class="mobile-nav" aria-hidden="true">
      <button class="mobile-close" aria-label="Close navigation">${icon('close', 24)}</button>
      <a href="#work">Work</a>
      <a href="#expertise">Expertise</a>
      <a href="#about">About</a>
      <a href="#contact">Contact</a>
    </div>

    <main id="top">
      <section class="hero">
        <div class="hero-grid"></div>
        <div class="hero-kicker reveal">
          <span class="status-dot"></span>
          Available for select projects
        </div>
        <h1 class="reveal">
          I build systems<br />
          <span>players remember.</span>
        </h1>
        <div class="hero-bottom reveal">
          <p>Game systems and digital experiences engineered with intention — from Minecraft ecosystems to modern web products.</p>
          <a class="circle-link" href="#work" aria-label="Explore selected work">${icon('arrow', 24)}</a>
        </div>
      </section>

      <section class="hero-paper">
        <div class="hero-index">
          <span>Game Developer</span>
          <span>Web Developer</span>
        </div>
        <div class="marquee" aria-label="Core technologies">
          <div class="marquee-track">
            ${[...profile.technologies, ...profile.technologies].map((technology) => `
              <span>${escapeHTML(technology.name)}</span><i></i>
            `).join('')}
          </div>
        </div>
      </section>

      <section class="featured section-shell" aria-labelledby="featured-title">
        <div class="section-heading reveal">
          <div>
            <span class="eyebrow">01 / Selected impact</span>
            <h2 id="featured-title">Built for scale,<br />designed for play.</h2>
          </div>
          <p>A selection of systems focused on server performance, intuitive player experiences, and maintainable architecture.</p>
        </div>
        <article class="feature-case reveal" data-project="${featured.id}" tabindex="0" role="button">
          <div class="feature-image">
            <img src="${escapeHTML(featured.image)}" alt="${escapeHTML(featured.title)}" />
            <div class="feature-number">01</div>
          </div>
          <div class="feature-copy">
            <div>
              <span class="case-type">${escapeHTML(featured.category?.name)}</span>
              <h3>${escapeHTML(featured.title)}</h3>
              <p>${escapeHTML(featured.description)}</p>
            </div>
            <div class="case-result">
              <div><strong>Performance</strong><span>Optimized architecture</span></div>
              <div><strong>Experience</strong><span>Player-first systems</span></div>
              <span class="case-arrow">${icon('arrow', 24)}</span>
            </div>
          </div>
        </article>
      </section>

      <section class="work section-shell" id="work" aria-labelledby="work-title">
        <div class="section-heading compact reveal">
          <div>
            <span class="eyebrow">02 / Project archive</span>
            <h2 id="work-title">Recent work.</h2>
          </div>
          <div class="filter-row" role="group" aria-label="Filter projects">
            ${categories.map((category, index) => `<button class="filter-button ${index === 0 ? 'active' : ''}" data-filter="${escapeHTML(category)}">${escapeHTML(category)}</button>`).join('')}
          </div>
        </div>
        <div class="project-grid">
          ${sortedProjects.map(projectCard).join('')}
        </div>
        <button class="load-more">Show all projects <span class="project-count">${sortedProjects.length}</span></button>
      </section>

      <section class="expertise" id="expertise">
        <div class="section-shell">
          <div class="expertise-intro reveal">
            <span class="eyebrow">03 / What I do</span>
            <h2>Code that feels<br /><em>effortless.</em></h2>
          </div>
          <div class="service-list">
            <article class="service reveal">
              <span class="service-index">01</span>
              <div><h3>Game systems</h3><p>Custom mechanics, player-facing interfaces, and scalable gameplay systems for Minecraft Bedrock and Java communities.</p></div>
              <span class="service-stack">TypeScript · Java · Bedrock API</span>
            </article>
            <article class="service reveal">
              <span class="service-index">02</span>
              <div><h3>Plugin development</h3><p>Purpose-built Paper and Spigot plugins with thoughtful permissions, configuration, persistence, and server performance.</p></div>
              <span class="service-stack">Java · Paper · Spigot</span>
            </article>
            <article class="service reveal">
              <span class="service-index">03</span>
              <div><h3>Web experiences</h3><p>Clean, responsive interfaces and dependable web tooling that turn complex functionality into clear user experiences.</p></div>
              <span class="service-stack">JavaScript · APIs · UI</span>
            </article>
          </div>
        </div>
      </section>

      <section class="about section-shell" id="about">
        <div class="about-copy reveal">
          <span class="eyebrow">04 / About</span>
          <h2>Just a dev.</h2>
          <p class="about-lead">I'm ${escapeHTML(profile.name)}, a game and web developer who enjoys turning ambitious ideas into reliable, polished systems.</p>
          <p>Over ${escapeHTML(profile.experience).toLowerCase()}, I've worked across Bedrock scripting, Java server plugins, and web development — learning that the best technical work is the work users never have to think about.</p>
          <div class="stats">
            <div><strong>${projects.length}</strong><span>Projects shipped</span></div>
            <div><strong>${collaborators.length}+</strong><span>Long-term collaborations</span></div>
            <div><strong>${githubCount}+</strong><span>Open-source builds</span></div>
          </div>
        </div>
      </section>

      <section class="collaboration section-shell">
        <div class="section-heading compact reveal">
          <div><span class="eyebrow">05 / Collaboration</span><h2>Trusted in production.</h2></div>
        </div>
        ${collaborators.slice(0, 1).map((collaborator) => `
          <article class="collab-card reveal">
            <img src="${escapeHTML(collaborator.image)}" alt="${escapeHTML(collaborator.title)} logo" />
            <div>
              <span>Senior Developer · ${formatDate(collaborator.date)} — Present</span>
              <h3>${escapeHTML(collaborator.title)}</h3>
              <p>${escapeHTML(collaborator.description)}</p>
            </div>
            ${collaborator.social?.[0] ? `<a href="${escapeHTML(collaborator.social[0].link)}" target="_blank" rel="noreferrer" aria-label="Visit ${escapeHTML(collaborator.title)}">${icon('external', 20)}</a>` : ''}
          </article>
        `).join('')}
      </section>

      <section class="contact" id="contact">
        <div class="contact-inner reveal">
          <span class="eyebrow">Have a project in mind?</span>
          <h2>Let's build something<br /><em>worth playing.</em></h2>
          <div class="contact-actions">
            <a class="primary-button" href="https://www.linkedin.com/in/coma-tv-818a102aa" target="_blank" rel="noreferrer">Start a conversation ${icon('arrow', 18)}</a>
            <span>or find me on <strong>Discord · comatv</strong></span>
          </div>
        </div>
      </section>
    </main>

    <footer>
      <a class="brand" href="#top"><span>C/</span> ComaTV</a>
      <p>Game & Web Developer</p>
      <div>
        ${profile.social.filter((item) => item.link.startsWith('http')).map((item) => `<a href="${escapeHTML(item.link)}" target="_blank" rel="noreferrer">${escapeHTML(item.name)}</a>`).join('')}
      </div>
      <span>© ${new Date().getFullYear()}</span>
    </footer>

    <dialog class="project-dialog">
      <button class="dialog-close" aria-label="Close project">${icon('close', 24)}</button>
      <div class="dialog-body"></div>
    </dialog>
  `;

  setupInteractions(sortedProjects);
};

const setupInteractions = (projects) => {
  const header = document.querySelector('.site-header');
  const syncHeader = () => header.classList.toggle('scrolled', window.scrollY > 80);
  syncHeader();
  window.addEventListener('scroll', syncHeader, { passive: true });

  const themeToggle = document.querySelector('.theme-toggle');
  const syncThemeControl = () => {
    const isLight = document.documentElement.dataset.theme === 'light';
    themeToggle.setAttribute('aria-label', `Switch to ${isLight ? 'dark' : 'light'} mode`);
    themeToggle.setAttribute('aria-pressed', String(isLight));
  };
  syncThemeControl();
  themeToggle.addEventListener('click', () => {
    const nextTheme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem('comatv-theme', nextTheme);
    const shareableUrl = new URL(window.location.href);
    shareableUrl.searchParams.set('theme', nextTheme);
    window.history.replaceState({}, '', shareableUrl);
    syncThemeControl();
  });

  const mobileNav = document.querySelector('.mobile-nav');
  const toggleNav = (open) => {
    mobileNav.classList.toggle('open', open);
    mobileNav.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('nav-open', open);
  };
  document.querySelector('.menu-toggle').addEventListener('click', () => toggleNav(true));
  document.querySelector('.mobile-close').addEventListener('click', () => toggleNav(false));
  mobileNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => toggleNav(false)));

  const dialog = document.querySelector('.project-dialog');
  const dialogBody = dialog.querySelector('.dialog-body');
  const openProject = (project) => {
    const gallery = [project.image, ...(project.media || [])].filter(Boolean);
    dialogBody.innerHTML = `
      <div class="dialog-gallery">
        ${mediaElement(gallery[0], 'dialog-main-media dialog-main-image', project.title, 'controls')}
        ${gallery.length > 1 ? `<div class="dialog-thumbs">${gallery.map((media, index) => `<button class="${index === 0 ? 'active' : ''}" data-media-url="${escapeHTML(mediaUrl(media))}" data-media-type="${isVideoMedia(media) ? 'video' : 'image'}">${mediaElement(media, '', '', 'muted')}</button>`).join('')}</div>` : ''}
      </div>
      <div class="dialog-copy">
        <div class="project-meta"><span>${escapeHTML(project.category?.name)}</span><span>${formatDate(project.date)}</span></div>
        <h2>${escapeHTML(project.title)}</h2>
        <p>${escapeHTML(project.description)}</p>
        ${project.collaboration ? `<div class="dialog-line"><span>Collaboration</span><strong>${escapeHTML(project.collaboration)}</strong></div>` : ''}
        <div class="dialog-line"><span>Technology</span><div class="tech-list">${techBadges(project.technologies)}</div></div>
        <div class="dialog-links">
          ${(project.linksList || []).map((link) => `<a href="${escapeHTML(link.url)}" target="_blank" rel="noreferrer">${link.name.toLowerCase() === 'github' ? icon('github', 18) : icon('play', 18)} ${escapeHTML(link.name)} ${icon('external', 15)}</a>`).join('')}
        </div>
      </div>
    `;
    dialog.showModal();
    document.body.classList.add('dialog-open');
    dialog.querySelectorAll('[data-media-url]').forEach((button) => button.addEventListener('click', () => {
      const media = { url: button.dataset.mediaUrl, type: button.dataset.mediaType };
      dialog.querySelector('.dialog-main-media').outerHTML = mediaElement(media, 'dialog-main-media dialog-main-image', project.title, 'controls');
      dialog.querySelectorAll('.dialog-thumbs button').forEach((thumb) => thumb.classList.toggle('active', thumb === button));
    }));
  };

  document.querySelectorAll('[data-project]').forEach((card) => {
    const handler = () => openProject(projects.find((project) => String(project.id) === card.dataset.project));
    card.addEventListener('click', handler);
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') handler();
    });
  });
  const closeDialog = () => {
    dialog.close();
    document.body.classList.remove('dialog-open');
  };
  document.querySelector('.dialog-close').addEventListener('click', closeDialog);
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) closeDialog();
  });

  const cards = [...document.querySelectorAll('.project-card')];
  const loadMore = document.querySelector('.load-more');
  let expanded = false;
  const updateVisibleCards = () => {
    const activeFilter = document.querySelector('.filter-button.active').dataset.filter;
    const matching = cards.filter((card) => {
      const project = projects.find((item) => String(item.id) === card.dataset.project);
      return activeFilter === 'All' || project.category?.name === activeFilter;
    });
    cards.forEach((card) => card.classList.add('filtered-out'));
    matching.forEach((card, index) => card.classList.toggle('filtered-out', !expanded && index >= 6));
    loadMore.hidden = matching.length <= 6;
    loadMore.childNodes[0].textContent = expanded ? 'Show fewer projects ' : 'Show all projects ';
    loadMore.querySelector('.project-count').textContent = matching.length;
  };
  document.querySelectorAll('.filter-button').forEach((button) => button.addEventListener('click', () => {
    document.querySelectorAll('.filter-button').forEach((item) => item.classList.toggle('active', item === button));
    expanded = false;
    updateVisibleCards();
  }));
  loadMore.addEventListener('click', () => {
    expanded = !expanded;
    updateVisibleCards();
  });
  updateVisibleCards();

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
};

loadData().then(render).catch((error) => {
  console.error(error);
  document.querySelector('#app').innerHTML = '<div class="error-state"><strong>Unable to load portfolio.</strong><p>Please refresh and try again.</p></div>';
});
