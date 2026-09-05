const challengeButton = document.querySelector('#challenge-button');
const challengeResult = document.querySelector('#challenge-result');

const challenges = [
  'Crear un componente responsive sin usar medidas fijas.',
  'Resolver un error de consola y documentar su causa.',
  'Mejorar la accesibilidad de una sección del sitio.',
  'Proponer una animación sutil que no distraiga del contenido.'
];

challengeButton?.addEventListener('click', () => {
  const index = Math.floor(Math.random() * challenges.length);
  challengeResult.textContent = challenges[index];
});
