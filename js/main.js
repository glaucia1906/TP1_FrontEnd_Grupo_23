const menuButton = document.querySelector('.menu-toggle');
const menu = document.querySelector('.main-nav');
const teamDropdown = menu?.querySelector('.nav-dropdown');

function closeNavigation() {
  if (teamDropdown) teamDropdown.open = false;
  menu?.classList.remove('is-open');
  menuButton?.setAttribute('aria-expanded', 'false');
}

menuButton?.addEventListener('click', () => {
  const isOpen = menu.classList.toggle('is-open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
  if (!isOpen && teamDropdown) teamDropdown.open = false;
});

menu?.addEventListener('click', (event) => {
  if (event.target.closest('a')) closeNavigation();
});

document.addEventListener('click', (event) => {
  if (!menu?.contains(event.target) && !menuButton?.contains(event.target)) {
    closeNavigation();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;

  if (teamDropdown?.open) {
    teamDropdown.open = false;
    teamDropdown.querySelector('summary').focus();
  } else if (menu?.classList.contains('is-open')) {
    closeNavigation();
    menuButton?.focus();
  }
});

teamDropdown?.addEventListener('focusout', (event) => {
  if (!teamDropdown.contains(event.relatedTarget)) teamDropdown.open = false;
});

const powerButton = document.querySelector('#power-button');
const powerMessage = document.querySelector('#power-message');
const hero = document.querySelector('.hero');
const energyCore = hero?.querySelector('.energy-core');

function updateHeroFlight() {
  if (!hero || !energyCore) return;

  // Keep the entire aura in the right half, including on narrow screens.
  const inset = 16;
  const areaLeft = hero.clientWidth / 2 + inset;
  const areaRight = hero.clientWidth - inset;
  const scale = Math.min(1, (areaRight - areaLeft) / energyCore.offsetWidth);
  const width = energyCore.offsetWidth * scale;
  const height = energyCore.offsetHeight * scale;
  // Compensate for scaling around the center; ignore the animated transform.
  const originX = energyCore.offsetLeft + (energyCore.offsetWidth - width) / 2;
  const originY = energyCore.offsetTop + (energyCore.offsetHeight - height) / 2;
  const bounds = {
    left: areaLeft - originX,
    right: areaRight - width - originX,
    top: inset - originY,
    bottom: hero.clientHeight - inset - height - originY,
  };
  bounds['home-x'] = Math.max(bounds.left, Math.min(0, bounds.right));
  bounds['home-y'] = Math.max(bounds.top, Math.min(0, bounds.bottom));

  energyCore.style.setProperty('--flight-scale', String(scale));
  Object.entries(bounds).forEach(([edge, offset]) => {
    energyCore.style.setProperty(`--flight-${edge}`, `${offset}px`);
  });
}

if (hero && energyCore) {
  const heroResizeObserver = new ResizeObserver(updateHeroFlight);
  heroResizeObserver.observe(hero);
  heroResizeObserver.observe(energyCore);
  updateHeroFlight();
}

powerButton?.addEventListener('click', () => {
  updateHeroFlight();
  const powered = document.body.classList.toggle('powered');
  powerButton.setAttribute('aria-pressed', String(powered));
  powerButton.textContent = powered ? 'Desactivar poder' : 'Activar poder';
  powerMessage.textContent = powered
    ? 'Nivel de energía: ¡DragonByte al máximo!'
    : 'Nivel de energía: estable.';
});

const profileTransforms = document.querySelectorAll('.member-photo-transform');

profileTransforms.forEach((transformButton) => {
  const memberName = transformButton.dataset.memberName;
  const transformHint = transformButton.querySelector('.transform-hint');

  transformButton.addEventListener('click', () => {
    const isTransformed = transformButton.classList.toggle('is-transformed');
    transformButton.setAttribute('aria-pressed', String(isTransformed));
    transformButton.setAttribute(
      'aria-label',
      isTransformed
        ? `Volver al estado base de ${memberName}`
        : `Activar ki saiyajin de ${memberName}`
    );

    if (transformHint) {
      transformHint.textContent = isTransformed
        ? 'Volver al estado base'
        : 'Activar ki saiyajin';
    }
  });
});
