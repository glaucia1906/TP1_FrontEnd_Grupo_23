const challengeButton = document.querySelector('#challenge-button');
const challengeResult = document.querySelector('#challenge-result');

const challenges = [
  'Crear un componente responsive sin usar medidas fijas.',
  'Resolver un error de consola y documentar su causa.',
  'Mejorar la accesibilidad de una sección del sitio.',
  'Proponer una animación sutil que no distraiga del contenido.'
];

function initializeChallenge() {
  if (!challengeButton || !challengeResult) return;

  const dialog = document.createElement('dialog');
  dialog.id = 'challenge-dialog';
  dialog.className = 'challenge-dialog';
  dialog.setAttribute('aria-labelledby', 'challenge-title');
  dialog.setAttribute('aria-describedby', 'challenge-message');

  // Las esferas se dibujan con CSS para conservar el fondo transparente.
  const spheres = Array.from({ length: 7 }, (_, index) => {
    const count = index + 1;
    const stars = '<i class="challenge-star"></i>'.repeat(count);
    return `
      <div class="challenge-orb challenge-orb-${count}" style="--orb-order: ${index}">
        <div class="challenge-ball">
          <span class="challenge-stars challenge-stars-${count}">${stars}</span>
        </div>
      </div>`;
  }).join('');

  dialog.innerHTML = `
    <div class="challenge-celebration">
      <button class="challenge-close" type="button" aria-label="Cerrar desafío" title="Cerrar desafío (Esc)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true" focusable="false">
          <path d="m6 6 12 12M18 6 6 18"></path>
        </svg>
      </button>
      <div class="challenge-orbs" aria-hidden="true">${spheres}</div>
      <div class="challenge-banner">
        <p class="challenge-eyebrow">Las 7 esferas se reunieron</p>
        <h2 id="challenge-title" tabindex="-1" autofocus>¡Desafío invocado!</h2>
        <p id="challenge-message" class="challenge-message" aria-live="polite" aria-atomic="true"></p>
        <div class="challenge-actions">
          <button class="button challenge-accept" type="button">¡Acepto el desafío!</button>
          <button class="challenge-reroll" type="button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
              <path d="M21 12a9 9 0 1 1-2.7-6.4L21 8"></path>
              <path d="M21 3v5h-5"></path>
            </svg>
            <span>Generar otro</span>
          </button>
        </div>
      </div>
      <p class="challenge-hint">Tu próxima aventura empieza ahora.</p>
    </div>`;

  document.body.append(dialog);
  challengeButton.setAttribute('aria-haspopup', 'dialog');
  challengeButton.setAttribute('aria-controls', dialog.id);
  const message = dialog.querySelector('#challenge-message');
  let lastIndex = -1;

  function generateChallenge() {
    // Evita repetir el mismo desafío dos veces seguidas.
    const available = challenges.map((_, index) => index).filter((index) => index !== lastIndex);
    lastIndex = available[Math.floor(Math.random() * available.length)];
    message.textContent = challenges[lastIndex];
    challengeResult.textContent = challenges[lastIndex];
  }

  challengeButton.addEventListener('click', () => {
    if (dialog.open) return;
    generateChallenge();
    dialog.showModal();
    document.body.classList.add('challenge-dialog-open');
  });

  dialog.querySelector('.challenge-reroll').addEventListener('click', () => {
    generateChallenge();
    dialog.querySelector('.challenge-orbs').getAnimations({ subtree: true }).forEach((animation) => {
      animation.currentTime = 0;
    });
  });

  dialog.querySelector('.challenge-close').addEventListener('click', () => dialog.close());
  dialog.querySelector('.challenge-accept').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  // Escape también dispara close; siempre restauramos el foco y el scroll.
  dialog.addEventListener('close', () => {
    document.body.classList.remove('challenge-dialog-open');
    challengeButton.focus({ preventScroll: true });
  });
}

initializeChallenge();
