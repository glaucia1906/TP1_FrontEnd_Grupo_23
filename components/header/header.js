(() => {
  const header = document.querySelector('[data-site-header]');
  if (!header) return;

  // Resolver desde este archivo permite usar páginas a distintas profundidades.
  const siteRoot = new URL('../../', document.currentScript.src);

  header.innerHTML = `
    <a class="brand" data-site-path="index.html" aria-label="DragonByte, inicio">
      <img class="brand-mark" src="${new URL('assets/img/iconos/dragonbyte-header-3d.png', siteRoot).href}" alt="" width="42" height="42">
      <span>DRAGONBYTE</span>
    </a>
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="main-menu">
      <span class="menu-toggle-icon" aria-hidden="true"></span>
      <span class="menu-toggle-label">Menú</span>
    </button>
    <nav id="main-menu" class="main-nav" aria-label="Navegación principal">
      <a class="nav-link" data-site-path="index.html">
        <span>Inicio</span>
      </a>
      <details class="nav-dropdown">
        <summary class="nav-dropdown-toggle">
          <span>Equipo</span>
        </summary>
        <ul class="nav-submenu">
          <li class="nav-submenu-overview"><a data-site-path="index.html#equipo"><span>Ver equipo</span><span aria-hidden="true">→</span></a></li>
          <li><a data-site-path="pages/equipo/sebastian-fernandez.html"><span class="nav-member-initials" aria-hidden="true">SF</span><span>Sebastián Fernández</span></a></li>
          <li><a data-site-path="pages/equipo/glaucia-ferreira.html"><span class="nav-member-initials" aria-hidden="true">GF</span><span>Glaucia Ferreira</span></a></li>
          <li><a data-site-path="pages/equipo/ignacio-grosman.html"><span class="nav-member-initials" aria-hidden="true">IG</span><span>Ignacio Grosman</span></a></li>
          <li><a data-site-path="pages/equipo/andrea-maslucan-moreno.html"><span class="nav-member-initials" aria-hidden="true">AM</span><span>Andrea Maslucan</span></a></li>
        </ul>
      </details>
      <div class="nav-bitacora">
        <a class="nav-link" data-site-path="pages/bitacora.html">
          <span>Bitácora</span>
        </a>
        <a class="nav-key-link" data-site-path="index.html#arcade" aria-label="Jugar para conseguir la llave de la bitácora" title="Conseguir la llave de la bitácora">
          <img src="${new URL('assets/img/iconos/llave-bitacora.png?v=3', siteRoot).href}" alt="" width="40" height="40">
        </a>
      </div>
    </nav>
  `;

  header.querySelectorAll('[data-site-path]').forEach((link) => {
    link.href = new URL(link.dataset.sitePath, siteRoot).href;
  });

  const menuButton = header.querySelector('.menu-toggle');
  const menuLabel = menuButton.querySelector('.menu-toggle-label');
  const menu = header.querySelector('.main-nav');
  const teamDropdown = menu.querySelector('.nav-dropdown');
  let pointerInTeam = false;
  let teamCloseTimer;
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

  function closeTeamDropdown() {
    window.clearTimeout(teamCloseTimer);
    teamDropdown.open = false;
  }

  teamDropdown.addEventListener('pointerenter', (event) => {
    if (event.pointerType !== 'mouse') return;
    pointerInTeam = true;
    window.clearTimeout(teamCloseTimer);
    teamDropdown.open = true;
  });

  teamDropdown.addEventListener('pointerleave', (event) => {
    if (event.pointerType !== 'mouse') return;
    pointerInTeam = false;
    // Dar margen para cruzar al panel sin interrumpir la navegación por teclado.
    teamCloseTimer = window.setTimeout(() => {
      if (!teamDropdown.querySelector(':focus-visible')) closeTeamDropdown();
    }, 160);
  });

  function setNavigationOpen(isOpen) {
    menu.classList.toggle('is-open', isOpen);
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuLabel.textContent = isOpen ? 'Cerrar' : 'Menú';
    if (!isOpen) closeTeamDropdown();
  }

  function closeNavigation() {
    setNavigationOpen(false);
  }

  menuButton.addEventListener('click', () => {
    setNavigationOpen(!menu.classList.contains('is-open'));
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
      closeTeamDropdown();
      teamDropdown.querySelector('summary').focus();
    } else if (menu.classList.contains('is-open')) {
      closeNavigation();
      menuButton.focus();
    }
  });

  teamDropdown.addEventListener('focusout', (event) => {
    if (!teamDropdown.contains(event.relatedTarget) && !pointerInTeam) closeTeamDropdown();
  });
})();
