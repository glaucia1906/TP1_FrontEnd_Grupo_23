(() => {
  const header = document.querySelector('[data-site-header]');
  if (!header) return;

  // Resolver desde este archivo permite usar páginas a distintas profundidades.
  const siteRoot = new URL('../../', document.currentScript.src);

  header.innerHTML = `
    <a class="brand" data-site-path="index.html" aria-label="DragonByte, inicio">
      <span class="brand-mark" aria-hidden="true">DB</span>
      <span>DRAGONBYTE</span>
    </a>
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="main-menu">Menú</button>
    <nav id="main-menu" class="main-nav" aria-label="Navegación principal">
      <a data-site-path="index.html">Inicio</a>
      <details class="nav-dropdown">
        <summary class="nav-dropdown-toggle">Equipo</summary>
        <ul class="nav-submenu">
          <li><a data-site-path="index.html#equipo">Ver equipo</a></li>
          <li><a data-site-path="pages/equipo/sebastian-fernandez.html">Sebastián Fernández</a></li>
          <li><a data-site-path="pages/equipo/glaucia-ferreira.html">Glaucia Ferreira</a></li>
          <li><a data-site-path="pages/equipo/ignacio-grosman.html">Ignacio Grosman</a></li>
          <li><a data-site-path="pages/equipo/andrea-maslucan-moreno.html">Andrea Maslucan Moreno</a></li>
        </ul>
      </details>
      <a data-site-path="index.html#esferas">Arcade</a>
      <a data-site-path="pages/bitacora.html">Bitácora</a>
    </nav>
  `;

  header.querySelectorAll('[data-site-path]').forEach((link) => {
    link.href = new URL(link.dataset.sitePath, siteRoot).href;
  });

  const menuButton = header.querySelector('.menu-toggle');
  const menu = header.querySelector('.main-nav');
  const teamDropdown = menu.querySelector('.nav-dropdown');
  const currentPath = window.location.pathname === siteRoot.pathname
    ? new URL('index.html', siteRoot).pathname
    : window.location.pathname;

  menu.querySelectorAll('a').forEach((link) => {
    if (!link.hash && link.pathname === currentPath) {
      link.classList.add('is-active');
      link.setAttribute('aria-current', 'page');
    }
  });

  if (teamDropdown.querySelector('[aria-current="page"]')) {
    teamDropdown.querySelector('summary').classList.add('is-active');
  }

  function closeNavigation() {
    teamDropdown.open = false;
    menu.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded', 'false');
  }

  menuButton.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('is-open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
    if (!isOpen) teamDropdown.open = false;
  });

  menu.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeNavigation();
  });

  document.addEventListener('click', (event) => {
    if (!menu.contains(event.target) && !menuButton.contains(event.target)) {
      closeNavigation();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;

    if (teamDropdown.open) {
      teamDropdown.open = false;
      teamDropdown.querySelector('summary').focus();
    } else if (menu.classList.contains('is-open')) {
      closeNavigation();
      menuButton.focus();
    }
  });

  teamDropdown.addEventListener('focusout', (event) => {
    if (!teamDropdown.contains(event.relatedTarget)) teamDropdown.open = false;
  });
})();
