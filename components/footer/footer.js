(() => {
  const footer = document.querySelector('[data-site-footer]');
  if (!footer) return;

  const siteRoot = new URL('../../', document.currentScript.src);

  footer.innerHTML = `
    <div class="footer-inner">
      <div class="footer-main">
        <div class="footer-brand">
          <a class="brand footer-logo" data-site-path="index.html" aria-label="DragonByte, inicio">
            <span class="brand-mark" aria-hidden="true">DB</span>
            <span>DRAGONBYTE</span>
          </a>
          <p class="footer-description">
            Transformamos ideas en experiencias digitales
            potenciando cada proyecto.
          </p>
        </div>
        <nav class="footer-nav" aria-labelledby="footer-nav-title">
          <h2 id="footer-nav-title" class="footer-heading">Explorar</h2>
          <ul class="footer-links">
            <li><a data-site-path="index.html">Inicio</a></li>
            <li><a data-site-path="index.html#equipo">Equipo</a></li>
            <li><a data-site-path="pages/bitacora.html">Bitácora</a></li>
          </ul>
        </nav>
        <div class="footer-project">
          <h2 class="footer-heading">El proyecto</h2>
          <p>Desarrollo de Sistemas Web</p>
          <p class="footer-project-detail">Trabajo práctico 01 · Grupo 23</p>
          <span class="footer-tag">Proyecto académico</span>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© 2026 DragonByte. Creado en equipo.</p>
        <p class="footer-signoff">Cuatro miradas. Un mismo código.</p>
      </div>
    </div>
  `;

  footer.querySelectorAll('[data-site-path]').forEach((link) => {
    link.href = new URL(link.dataset.sitePath, siteRoot).href;
  });

  const currentPath = window.location.pathname === siteRoot.pathname
    ? new URL('index.html', siteRoot).pathname
    : window.location.pathname;

  footer.querySelectorAll('.footer-links a').forEach((link) => {
    if (!link.hash && link.pathname === currentPath) {
      link.setAttribute('aria-current', 'page');
    }
  });
})();
