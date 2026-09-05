const menuButton = document.querySelector('.menu-toggle');
const menu = document.querySelector('.main-nav');

menuButton?.addEventListener('click', () => {
  const isOpen = menu.classList.toggle('is-open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
});

const powerButton = document.querySelector('#power-button');
const powerMessage = document.querySelector('#power-message');

powerButton?.addEventListener('click', () => {
  const powered = document.body.classList.toggle('powered');
  powerButton.textContent = powered ? 'Desactivar poder' : 'Activar poder';
  powerMessage.textContent = powered
    ? 'Nivel de energía: ¡DragonByte al máximo!'
    : 'Nivel de energía: estable.';
});
