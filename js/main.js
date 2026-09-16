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
