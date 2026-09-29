(() => {
  const section = document.querySelector('[data-bowling]');
  if (!section) return;

  const game = section.querySelector('.bowling-game');
  const arena = section.querySelector('.bowling-arena');
  const lane = section.querySelector('#bowling-lane');
  const launchButton = section.querySelector('#bowling-launch');
  const resetButton = section.querySelector('#bowling-reset');
  const helpButton = section.querySelector('#bowling-help-button');
  const helpDialog = section.querySelector('#bowling-help-dialog');
  const playfield = section.querySelector('.bowling-playfield');
  const overlay = section.querySelector('.bowling-overlay');
  const overlayTitle = section.querySelector('#bowling-overlay-title');
  const overlayMessage = section.querySelector('#bowling-overlay-message');
  const overlayEyebrow = section.querySelector('#bowling-overlay-eyebrow');
  const bannerActions = section.querySelector('.bowling-banner-actions');
  const startButton = section.querySelector('#bowling-start');
  const logbookLink = section.querySelector('#bowling-logbook');
  const status = section.querySelector('#bowling-status');
  const score = section.querySelector('#bowling-score');
  const attempts = [...section.querySelectorAll('#bowling-attempts li')];
  const resultAttempts = [...section.querySelectorAll('#bowling-result-attempts li')];
  const attemptsRemaining = section.querySelector('#bowling-attempts-remaining');
  const shotSummary = section.querySelector('#bowling-shot-summary');
  const shotsRemaining = section.querySelector('#bowling-shots-remaining');
  const orbs = [...section.querySelectorAll('.bowling-collectible')];
  const directionButtons = [...section.querySelectorAll('[data-aim]')];
  const reward = section.querySelector('#bowling-reward');
  const code = section.querySelector('#bowling-code');
  const copyButton = section.querySelector('#bowling-copy');
  const copyStatus = section.querySelector('#bowling-copy-status');
  const powerMeter = section.querySelector('#bowling-power');
  const powerValue = section.querySelector('#bowling-power-value');
  const powerFill = section.querySelector('#bowling-power-fill');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const audio = window.DragonByteBowlingAudio;
  const svgNS = 'http://www.w3.org/2000/svg';
  const start = { x: 50, y: 94 };
  const arrowDirections = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
  let phase = 'idle';
  let aim = { x: 60, y: 26 };
  let pins = [];
  let shots = [];
  let power = 0;
  let frame = 0;
  let chargeStarted = 0;
  let chargeSource = null;
  let pointerId = null;
  let ball = null;
  let lastFrame = 0;
  let rollTime = 0;
  let impactQueue = [];
  let ignoreClickUntil = 0;
  let copyRequest = 0;
  let resultTimer = 0;

  // A single, normalized playing field keeps collisions identical at every screen size.
  function project(x, y) {
    return { x: 350 + (x - 50) * (2.45 + y * .028), y: 94 + y * 4.45, scale: .7 + y * .006 };
  }

  lane.innerHTML = `
    <defs>
      <linearGradient id="bowling-wood" x1="0" y1="0" x2="0" y2="1">
        <stop stop-color="#1c3549"/><stop offset="1" stop-color="#24394a"/>
      </linearGradient>
      <linearGradient id="bowling-pin" x1="0" x2="1">
        <stop stop-color="#94b1c4"/><stop offset=".38" stop-color="#fff"/><stop offset="1" stop-color="#bcd5df"/>
      </linearGradient>
      <radialGradient id="bowling-orb" cx=".32" cy=".25" r=".75">
        <stop stop-color="#fff3bd"/><stop offset=".25" stop-color="#ffd454"/><stop offset=".7" stop-color="#ff961e"/><stop offset="1" stop-color="#b94709"/>
      </radialGradient>
      <radialGradient id="bowling-glow"><stop stop-color="#ff9b28" stop-opacity=".24"/><stop offset="1" stop-color="#ff9b28" stop-opacity="0"/></radialGradient>
      <clipPath id="bowling-lane-clip"><path d="M227 72H473L626 553H74Z"/></clipPath>
      <g id="bowling-pin-shape">
        <ellipse cy="1" rx="12" ry="4" fill="#000" opacity=".25"/>
        <path d="M-9 0C-15-9-10-18-5-29L-4-35C-12-42-7-51 0-51S12-42 4-35L5-29C10-18 15-9 9 0Z" fill="url(#bowling-pin)" stroke="#d6ecf3" stroke-width=".6"/>
        <path d="M-5-32H5M-6-27H6" stroke="#ff7c22" stroke-width="3.2"/>
        <path d="M-5-18Q-8-8-5-4" stroke="#fff" stroke-opacity=".8" stroke-width="2" fill="none"/>
      </g>
    </defs>
    <ellipse cx="350" cy="360" rx="290" ry="230" fill="url(#bowling-glow)"/>
    <path d="M206 72H227L74 553H43Z M473 72H494L657 553H626Z" fill="#060e1b" stroke="#345266"/>
    <path d="M227 72H473L626 553H74Z" fill="url(#bowling-wood)" stroke="#7596a5" stroke-opacity=".4"/>
    <g clip-path="url(#bowling-lane-clip)" stroke="#b8cbd3" stroke-opacity=".09">
      ${Array.from({ length: 13 }, (_, i) => `<path d="M${227 + i * 20.5} 72L${74 + i * 46} 553"/>`).join('')}
      <path d="M0 178H700M0 275H700M0 392H700M0 520H700"/>
    </g>
    <path d="M213 80L58 548M487 80L642 548" stroke="#49e5ff" stroke-width="2" opacity=".7"/>
    <path d="M79 535H621" stroke="#ff9c32" stroke-width="4"/>
    <path d="M90 544H610" stroke="#ff9c32" stroke-opacity=".15" stroke-width="12"/>
    <g fill="#8ca9b9" opacity=".5">${[26, 38, 50, 62, 74].map((x) => {
      const p = project(x, 64);
      return `<path d="M${p.x} ${p.y - 7}l-5 9h10Z"/>`;
    }).join('')}</g>
    <g id="bowling-trajectory"><path fill="none" stroke="#49e5ff" stroke-opacity=".55" stroke-width="2" stroke-dasharray="5 9"/></g>
    <g id="bowling-pins"></g>
    <g id="bowling-target" fill="none" stroke="#49e5ff" stroke-width="2">
      <ellipse rx="23" ry="12" fill="#49e5ff" fill-opacity=".07"/>
      <path d="M-32 0h17M15 0h17M0-21v13M0 8v13"/>
      <circle r="3" fill="#49e5ff" stroke="none"/>
    </g>
    <g id="bowling-ball">
      <ellipse cy="18" rx="24" ry="7" fill="#000" opacity=".3"/>
      <circle r="31" fill="url(#bowling-glow)"/>
      <circle r="21" fill="url(#bowling-orb)" stroke="#ffc34f" stroke-width=".8"/>
      <ellipse cx="-7" cy="-10" rx="6" ry="3" fill="#fff8c9" opacity=".65" transform="rotate(-30)"/>
      <g fill="#b84113" font-size="10" text-anchor="middle"><text x="-5" y="0">★</text><text x="5" y="0">★</text><text x="-5" y="9">★</text><text x="5" y="9">★</text></g>
    </g>`;

  const pinLayer = lane.querySelector('#bowling-pins');
  const target = lane.querySelector('#bowling-target');
  const trajectory = lane.querySelector('#bowling-trajectory');
  const ballElement = lane.querySelector('#bowling-ball');

  function setPhase(value) {
    if (value !== 'result') clearResultTimer();
    phase = value;
    game.dataset.phase = value;
    const ended = value === 'won' || value === 'lost';
    const blocked = value === 'idle' || value === 'result' || ended;
    playfield.inert = blocked;
    overlay.hidden = !blocked;
    arena.tabIndex = blocked ? -1 : 0;
    launchButton.disabled = value === 'rolling' || blocked;
    directionButtons.forEach((button) => { button.disabled = value !== 'aiming'; });
    target.style.display = blocked || value === 'rolling' ? 'none' : '';
    trajectory.style.display = blocked || value === 'rolling' ? 'none' : '';
    launchButton.textContent = value === 'charging' ? 'Cargando…' : value === 'rolling' ? 'Esfera en movimiento…' : value === 'result' ? 'Resultado del intento' : ended ? 'Partida terminada' : 'Cargar esfera';
  }

  function updatePower(value) {
    power = Math.round(value);
    if (phase === 'charging') audio?.updateCharge(power);
    powerValue.textContent = `${power}%`;
    powerFill.style.height = `${power}%`;
    powerMeter.setAttribute('aria-valuenow', String(power));
  }

  function drawAim() {
    const point = project(aim.x, aim.y);
    const origin = project(start.x, start.y);
    target.setAttribute('transform', `translate(${point.x} ${point.y})`);
    trajectory.firstElementChild.setAttribute('d', `M${origin.x} ${origin.y}L${point.x} ${point.y}`);
    section.querySelector('#bowling-aim-label').textContent = `Mira: ${aim.x}, ${aim.y}`;
  }

  function drawBall() {
    const position = ball || start;
    const point = project(position.x, position.y);
    ballElement.setAttribute('transform', `translate(${point.x} ${point.y - 14 * point.scale}) scale(${point.scale})`);
    ballElement.style.opacity = ball?.finished ? '0' : '1';
  }

  function drawPins() {
    pins.forEach((pin) => {
      const fall = pin.down ? (reducedMotion.matches ? 1 : Math.min(1, (rollTime - pin.fellAt) / .32)) : 0;
      const direction = pin.fallDirection || 1;
      const point = project(pin.x + fall * direction * 2.5, pin.y - fall * 2);
      pin.element.setAttribute('transform', `translate(${point.x} ${point.y}) scale(${point.scale}) rotate(${fall * direction * 78})`);
      pin.element.style.opacity = pin.down ? String(1 - fall * .5) : '1';
    });
  }

  function updateScore() {
    const count = pins.filter((pin) => pin.down).length;
    const used = shots.length + (phase === 'rolling' ? 1 : 0);
    const ended = phase === 'won' || phase === 'lost';
    const current = phase === 'rolling' ? shots.length : phase === 'result' || ended ? shots.length - 1 : -1;
    score.textContent = `${count} / 10`;
    attemptsRemaining.textContent = `${used} de 3 usados`;
    orbs.forEach((orb, index) => orb.classList.toggle('is-lit', count >= Math.ceil((index + 1) * 10 / 7)));
    [attempts, resultAttempts].forEach((list) => list.forEach((attempt, index) => {
      const consumed = index < used;
      const completed = index < shots.length;
      const label = completed
        ? `Intento ${index + 1} usado: ${shots[index]} ${shots[index] === 1 ? 'palo derribado' : 'palos derribados'}`
        : consumed ? `Intento ${index + 1} usado: lanzamiento en curso`
          : `Intento ${index + 1} ${ended ? 'sin usar' : 'disponible'}`;
      attempt.classList.toggle('is-used', consumed);
      attempt.classList.toggle('is-active', index === shots.length && (phase === 'aiming' || phase === 'charging'));
      attempt.classList.toggle('is-current', index === current);
      attempt.setAttribute('aria-label', label);
      attempt.title = label;
    }));
    return count;
  }

  function updateBanner() {
    const won = phase === 'won';
    const lost = phase === 'lost';
    const result = phase === 'result';
    const down = pins.filter((pin) => pin.down).length;
    const hit = shots[shots.length - 1] || 0;
    const remaining = 3 - shots.length;
    overlayEyebrow.textContent = result || won || lost ? `INTENTO ${shots.length} DE 3` : 'DRAGONBYTE ARCADE';
    overlayTitle.textContent = won ? '¡Ganaste!' : lost ? 'Game over' : result ? (hit ? `Derribaste ${hit} ${hit === 1 ? 'palo' : 'palos'}` : 'Sin derribos') : '¿Listo para jugar?';
    overlayMessage.textContent = won || lost
      ? `${hit} ${hit === 1 ? 'palo' : 'palos'} en este tiro. Total: ${down}/10.${won && reward.hidden ? ' No se pudo cargar la clave.' : ''}`
      : result ? `Total: ${down}/10 palos derribados.` : 'Tu próxima misión empieza acá.';
    shotSummary.hidden = !result && !won && !lost;
    shotsRemaining.textContent = lost ? 'Sin intentos disponibles.'
      : won ? (remaining ? `${remaining} ${remaining === 1 ? 'esfera sin usar' : 'esferas sin usar'}.` : 'Usaste las 3 esferas.')
        : `${remaining} ${remaining === 1 ? 'intento disponible' : 'intentos disponibles'}.`;
    bannerActions.hidden = result;
    startButton.textContent = won || lost ? 'Volver a jugar' : 'Empezar partida';
    logbookLink.hidden = !won || reward.hidden;
  }

  function clearResultTimer() {
    window.clearTimeout(resultTimer);
    resultTimer = 0;
  }

  function scheduleResultClose() {
    clearResultTimer();
    if (phase !== 'result' || helpDialog.open || document.hidden) return;
    resultTimer = window.setTimeout(continueGame, 2000);
  }

  function continueGame() {
    if (phase !== 'result') return;
    const restoreFocus = overlay.contains(document.activeElement);
    setPhase('aiming');
    updatePower(0);
    updateScore();
    updateBanner();
    status.textContent = `Intento ${shots.length + 1} de 3. Ajustá la mira y cargá la esfera.`;
    if (restoreFocus && !helpDialog.open && !document.hidden) arena.focus({ preventScroll: true });
  }

  function moveAim(direction) {
    if (phase !== 'aiming') return;
    const moves = { left: [-2, 0], right: [2, 0], up: [0, -2], down: [0, 2] };
    const [x, y] = moves[direction];
    aim.x = Math.max(8, Math.min(92, aim.x + x));
    aim.y = Math.max(8, Math.min(42, aim.y + y));
    drawAim();
  }

  function setCopyLabel(label) {
    copyButton.setAttribute('aria-label', label);
    copyButton.title = label;
  }

  async function copyKey() {
    if (phase !== 'won' || reward.hidden || !code.textContent || copyButton.disabled) return;
    const request = ++copyRequest;
    const key = code.textContent;
    copyButton.disabled = true;
    copyButton.classList.remove('is-copied');
    setCopyLabel('Copiando…');
    copyStatus.textContent = '';
    let copied = false;

    try {
      await navigator.clipboard.writeText(key);
      copied = true;
    } catch {
      // Direct HTML opening and some browsers need the selection-based fallback.
      if (request !== copyRequest) return;
      try {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(code);
        selection.removeAllRanges();
        selection.addRange(range);
        copied = document.execCommand('copy');
      } catch {
        copied = false;
      }
    }

    // A pending clipboard request must not update a new game's banner.
    if (request !== copyRequest) return;
    copyButton.disabled = false;
    copyButton.classList.toggle('is-copied', copied);
    setCopyLabel(copied ? 'Clave copiada' : 'Copiar clave');
    copyStatus.textContent = copied
      ? 'Clave copiada al portapapeles.'
      : 'No se pudo copiar. Seleccioná la clave y copiala manualmente.';
  }

  // Nearby pins pass their remaining impact backwards through the rack.
  // Low power has a shorter reach and cannot sustain the same chain reaction.
  function knockPin(pin, energy, direction) {
    if (pin.down) return;
    pin.down = true;
    audio?.hit(energy);
    pin.fellAt = rollTime;
    pin.fallDirection = direction < 0 ? -1 : 1;
    if (energy < .34) return;
    pins.forEach((neighbor) => {
      const dx = neighbor.x - pin.x;
      const dy = pin.y - neighbor.y;
      const distance = Math.hypot(dx, dy);
      if (!neighbor.down && dy >= 0 && distance > 0 && distance < 20) {
        impactQueue.push({ pin: neighbor, energy: energy - .12 - distance * .005, direction: dx || direction, at: rollTime + .09 });
      }
    });
  }

  function finishRoll() {
    frame = 0;
    audio?.stopRoll();
    const down = pins.filter((pin) => pin.down).length;
    const hit = down - shots.reduce((total, value) => total + value, 0);
    shots.push(hit);
    ball = null;
    if (down === 10) {
      setPhase('won');
      const publicationKey = window.DragonByteAccess?.publicationKey;
      if (publicationKey) {
        code.textContent = publicationKey;
        reward.hidden = false;
        status.textContent = `${shots.length === 1 ? '¡Strike!' : '¡Desafío completado!'} Derribaste los 10 palos. Tu clave está desbloqueada.`;
      } else {
        status.textContent = '¡Derribaste los 10 palos! No se pudo cargar la clave. Recargá la página para volver a intentarlo.';
      }
    } else if (shots.length === 3) {
      setPhase('lost');
      status.textContent = `Fin de la partida: ${down} de 10 palos. Sin tiros disponibles.`;
    } else {
      setPhase('result');
      const remaining = 3 - shots.length;
      status.textContent = `${hit ? `¡Derribaste ${hit} ${hit === 1 ? 'palo' : 'palos'}!` : power < 45 ? 'Potencia insuficiente.' : 'La esfera pasó de largo.'} ${10 - down} en pie. ${remaining === 1 ? 'Te queda 1 tiro.' : `Te quedan ${remaining} tiros.`}`;
    }
    audio?.result(phase === 'won' || phase === 'lost' ? phase : hit ? 'hit' : 'miss');
    updateScore();
    drawBall();
    updateBanner();
    // Announce the result on its banner without moving focus out of the help dialog.
    if (!helpDialog.open && (section.contains(document.activeElement) || document.activeElement === document.body)) {
      (overlay.hidden ? arena : overlayTitle).focus({ preventScroll: true });
    }
    scheduleResultClose();
  }

  function animateRoll(timestamp) {
    const dt = Math.min((timestamp - lastFrame) / 1000, .032);
    lastFrame = timestamp;
    rollTime += dt;
    if (!ball.finished) {
      const travel = Math.min(ball.speed * dt, ball.distance - ball.traveled);
      ball.x += ball.dx * travel;
      ball.y += ball.dy * travel;
      ball.traveled += travel;
      pins.forEach((pin) => {
        if (!pin.down && Math.hypot(ball.x - pin.x, ball.y - pin.y) < 6.5) knockPin(pin, power / 100, ball.dx || pin.x - 50 || 1);
      });
      if (ball.traveled >= ball.distance || ball.y < 2 || ball.x < 3 || ball.x > 97) {
        ball.finished = true;
        audio?.stopRoll();
        ball.finishedAt = rollTime;
      }
    }
    const impacts = impactQueue.filter((impact) => impact.at <= rollTime);
    impactQueue = impactQueue.filter((impact) => impact.at > rollTime);
    impacts.forEach((impact) => knockPin(impact.pin, impact.energy, impact.direction));
    drawPins();
    drawBall();
    score.textContent = `${pins.filter((pin) => pin.down).length} / 10`;
    if (ball.finished && !impactQueue.length && rollTime - ball.finishedAt > .5) finishRoll();
    else frame = requestAnimationFrame(animateRoll);
  }

  function launch(value = power) {
    if (phase !== 'aiming' && phase !== 'charging') return;
    audio?.unlock();
    cancelAnimationFrame(frame);
    chargeSource = null;
    updatePower(value);
    audio?.launch(power);
    setPhase('rolling');
    updateScore();
    status.textContent = `Lanzamiento ${shots.length + 1} de 3. Potencia: ${power}%.`;
    const length = Math.hypot(aim.x - start.x, aim.y - start.y);
    ball = { ...start, dx: (aim.x - start.x) / length, dy: (aim.y - start.y) / length, distance: 40 + power * .72, traveled: 0, speed: 42 + power * .7, finished: false };
    // Fallen pins stay down between throws; their animation is already complete.
    pins.filter((pin) => pin.down).forEach((pin) => { pin.fellAt = -1; });
    rollTime = 0;
    impactQueue = [];
    lastFrame = performance.now();
    frame = requestAnimationFrame(animateRoll);
  }

  function charge(timestamp) {
    if (phase !== 'charging') return;
    const cycle = ((timestamp - chargeStarted) / 1300) % 2;
    updatePower(15 + (cycle <= 1 ? cycle : 2 - cycle) * 85);
    frame = requestAnimationFrame(charge);
  }

  function beginCharge(source) {
    if (phase !== 'aiming') return;
    audio?.unlock();
    audio?.startCharge();
    chargeSource = source;
    chargeStarted = performance.now();
    setPhase('charging');
    updatePower(15);
    frame = requestAnimationFrame(charge);
  }

  function releasePointer() {
    const id = pointerId;
    pointerId = null;
    if (id !== null && launchButton.hasPointerCapture(id)) launchButton.releasePointerCapture(id);
  }

  function cancelCharge() {
    if (phase !== 'charging') return;
    audio?.stopCharge();
    cancelAnimationFrame(frame);
    frame = 0;
    chargeSource = null;
    releasePointer();
    setPhase('aiming');
    updatePower(0);
    status.textContent = 'Carga cancelada. Conservás tus tiros.';
  }

  function reset(nextPhase = 'idle') {
    audio?.stopAll();
    cancelCharge();
    cancelAnimationFrame(frame);
    frame = 0;
    aim = { x: 60, y: 26 };
    shots = [];
    ball = null;
    impactQueue = [];
    rollTime = 0;
    pins = [];
    pinLayer.replaceChildren();
    for (let row = 0; row < 4; row += 1) {
      for (let col = 0; col < 4 - row; col += 1) {
        const element = document.createElementNS(svgNS, 'use');
        element.setAttribute('href', '#bowling-pin-shape');
        pinLayer.append(element);
        pins.push({ x: 50 + (col - (3 - row) / 2) * 14, y: 10 + row * 9, element, down: false });
      }
    }
    reward.hidden = true;
    code.textContent = '';
    copyRequest += 1;
    copyButton.disabled = false;
    copyButton.classList.remove('is-copied');
    setCopyLabel('Copiar clave');
    copyStatus.textContent = '';
    setPhase(nextPhase);
    updatePower(0);
    updateScore();
    drawAim();
    drawPins();
    drawBall();
    updateBanner();
    status.textContent = nextPhase === 'idle' ? 'Partida sin iniciar.' : 'Partida lista. 3 tiros disponibles.';
  }

  directionButtons.forEach((button) => button.addEventListener('click', () => moveAim(button.dataset.aim)));
  arena.addEventListener('pointerdown', () => { if (!playfield.inert) arena.focus({ preventScroll: true }); });
  launchButton.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 || phase !== 'aiming' || !event.isPrimary) return;
    event.preventDefault();
    launchButton.focus({ preventScroll: true });
    pointerId = event.pointerId;
    launchButton.setPointerCapture(pointerId);
    beginCharge('pointer');
  });
  launchButton.addEventListener('pointerup', (event) => {
    if (event.pointerId !== pointerId) return;
    ignoreClickUntil = performance.now() + 500;
    releasePointer();
    if (phase === 'charging' && chargeSource === 'pointer') launch();
  });
  launchButton.addEventListener('pointercancel', cancelCharge);
  launchButton.addEventListener('lostpointercapture', () => {
    if (pointerId !== null) cancelCharge();
  });
  launchButton.addEventListener('contextmenu', (event) => event.preventDefault());
  // Assistive technology can activate a button without pointer or keyboard events.
  launchButton.addEventListener('click', (event) => {
    if (event.detail === 0 && performance.now() > ignoreClickUntil && phase === 'aiming') launch(80);
  });
  section.addEventListener('keydown', (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'Escape' && phase === 'result' && !helpDialog.open) {
      event.preventDefault();
      continueGame();
      return;
    }
    const playingControl = event.target === arena || event.target === launchButton || directionButtons.includes(event.target);
    if (!playingControl) return;
    if (arrowDirections[event.key] && (phase === 'aiming' || phase === 'charging')) {
      event.preventDefault();
      moveAim(arrowDirections[event.key]);
    } else if (event.code === 'Space' && (event.target === arena || event.target === launchButton)) {
      event.preventDefault();
      if (!event.repeat) beginCharge('keyboard');
    } else if (event.key === 'Enter' && (event.target === arena || event.target === launchButton)) {
      event.preventDefault();
      if (!event.repeat && phase === 'aiming') launch(80);
    } else if (event.key === 'Escape') {
      cancelCharge();
    }
  });
  section.addEventListener('keyup', (event) => {
    if (event.code === 'Space' && chargeSource === 'keyboard') {
      event.preventDefault();
      ignoreClickUntil = performance.now() + 500;
      launch();
    }
  });
  section.addEventListener('focusout', (event) => {
    if (phase === 'charging' && event.relatedTarget !== event.target) cancelCharge();
  });
  window.addEventListener('blur', () => { cancelCharge(); audio?.stopAll(); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelCharge();
      clearResultTimer();
    } else {
      scheduleResultClose();
    }
  });
  helpButton.addEventListener('click', () => {
    cancelCharge();
    clearResultTimer();
    if (!helpDialog.open) helpDialog.showModal();
  });
  helpDialog.querySelectorAll('[data-close-help]').forEach((button) => {
    button.addEventListener('click', () => helpDialog.close());
  });
  helpDialog.addEventListener('close', () => {
    const focusTarget = phase === 'result' || phase === 'won' || phase === 'lost' ? overlayTitle : helpButton;
    focusTarget.focus({ preventScroll: true });
    scheduleResultClose();
  });
  copyButton.addEventListener('click', copyKey);
  startButton.addEventListener('click', () => {
    if (overlay.hidden || phase === 'result') return;
    reset('aiming');
    audio?.unlock();
    audio?.result('start');
    arena.focus({ preventScroll: true });
  });
  resetButton.addEventListener('click', () => { reset(); startButton.focus({ preventScroll: true }); });
  reset();
})();
