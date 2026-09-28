(() => {
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

})();
