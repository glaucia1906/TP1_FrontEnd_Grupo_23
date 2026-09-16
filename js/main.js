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

const glauciaTransform = document.querySelector('#glaucia-transform');
const transformHint = glauciaTransform?.querySelector('.transform-hint');

glauciaTransform?.addEventListener('click', () => {
  const isTransformed = glauciaTransform.classList.toggle('is-transformed');
  glauciaTransform.setAttribute('aria-pressed', String(isTransformed));
  glauciaTransform.setAttribute(
    'aria-label',
    isTransformed
      ? 'Volver al estado base de Glaucia'
      : 'Activar ki saiyajin de Glaucia'
  );

  if (transformHint) {
    transformHint.textContent = isTransformed ? 'Volver al estado base' : 'Activar ki saiyajin';
  }
});
