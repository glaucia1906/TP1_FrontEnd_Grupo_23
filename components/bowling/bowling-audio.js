(() => {
  const button = document.querySelector('#bowling-sound');
  if (!button) return;

  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const preferenceKey = 'dragonbyte-bowling-sound';
  const voices = new Set();
  let enabled = true;
  let context;
  let master;
  let noiseBuffer;
  let charging;
  let rolling;
  let resuming = false;
  let lastHit = -Infinity;

  try { enabled = localStorage.getItem(preferenceKey) !== 'off'; } catch { /* Storage is optional. */ }
  if (!AudioContext) enabled = false;

  function updateButton() {
    button.disabled = !AudioContext;
    button.setAttribute('aria-pressed', String(enabled));
    button.title = !AudioContext ? 'Sonido no disponible' : enabled ? 'Silenciar sonido' : 'Activar sonido';
    button.querySelector('[data-sound-label]').textContent = !AudioContext
      ? 'Sonido no disponible' : enabled ? 'Sonido activado' : 'Sonido silenciado';
  }

  // Create and resume audio only from a player's gesture, never on page load.
  function unlock() {
    if (!enabled || !AudioContext || document.hidden) return;
    try {
      if (!context) {
        context = new AudioContext();
        master = context.createGain();
        master.gain.value = .45;
        master.connect(context.destination);
        noiseBuffer = context.createBuffer(1, context.sampleRate, context.sampleRate);
        const samples = noiseBuffer.getChannelData(0);
        for (let i = 0; i < samples.length; i += 1) samples[i] = Math.random() * 2 - 1;
      }
      if (context.state !== 'running' && !resuming) {
        resuming = true;
        context.resume().then(() => { resuming = false; }).catch(() => {
          resuming = false;
          stopAll();
        });
      }
    } catch {
      // A browser audio restriction must never interrupt the game.
      resuming = false;
      stopAll();
    }
  }

  function playable() {
    return enabled && context && master && noiseBuffer && (context.state === 'running' || resuming) && !document.hidden;
  }

  function stopVoice(voice) {
    if (!voice || voice.stopped) return;
    voice.stopped = true;
    const now = context.currentTime;
    voice.gain.gain.cancelScheduledValues(now);
    voice.gain.gain.setTargetAtTime(0, now, .008);
    voice.source.stop(now + .04);
  }

  // Short envelopes avoid clicks; finished voices release all their audio nodes.
  function sound({ frequency = 440, end = frequency, duration = .15, volume = .12, type = 'sine', delay = 0, noise = false, sustain = false }) {
    if (!playable()) return null;
    const at = context.currentTime + delay;
    const source = noise ? context.createBufferSource() : context.createOscillator();
    const gain = context.createGain();
    let filter;
    if (noise) {
      source.buffer = noiseBuffer;
      source.loop = true;
      filter = context.createBiquadFilter();
      filter.type = 'lowpass';
      filter.Q.value = .65;
      filter.frequency.setValueAtTime(frequency, at);
      filter.frequency.exponentialRampToValueAtTime(end, at + duration);
      source.connect(filter);
      filter.connect(gain);
    } else {
      source.type = type;
      source.frequency.setValueAtTime(frequency, at);
      source.frequency.exponentialRampToValueAtTime(end, at + duration);
      source.connect(gain);
    }
    gain.connect(master);
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(volume, at + .012);
    if (!sustain) gain.gain.exponentialRampToValueAtTime(.0001, at + duration);
    const voice = { source, gain, stopped: false };
    voices.add(voice);
    source.onended = () => {
      source.disconnect();
      gain.disconnect();
      filter?.disconnect();
      voices.delete(voice);
    };
    source.start(at);
    if (!sustain) source.stop(at + duration + .02);
    return voice;
  }

  function stopCharge() {
    stopVoice(charging);
    charging = null;
  }

  function stopRoll() {
    stopVoice(rolling);
    rolling = null;
  }

  function stopAll() {
    voices.forEach(stopVoice);
    charging = null;
    rolling = null;
    lastHit = -Infinity;
  }

  function startCharge() {
    stopCharge();
    charging = sound({ frequency: 170, volume: .035, type: 'triangle', sustain: true });
  }

  function updateCharge(power) {
    if (!charging || !playable()) return;
    const now = context.currentTime;
    charging.source.frequency.cancelScheduledValues(now);
    charging.source.frequency.setTargetAtTime(140 + power * 5, now, .035);
    charging.gain.gain.setTargetAtTime(.025 + power * .0005, now, .035);
  }

  function launch(power) {
    stopCharge();
    stopRoll();
    lastHit = -Infinity;
    sound({ frequency: 180, end: 48, duration: .22, volume: .22 });
    sound({ frequency: 1700, end: 260, duration: .28, volume: .14, noise: true });
    rolling = sound({ frequency: 180 + power * 2, end: 110, duration: 2, volume: .13, noise: true, sustain: true });
  }

  function hit(energy) {
    // Chain reactions can drop several pins in one frame; limit the combined volume.
    if (!playable() || context.currentTime - lastHit < .035) return;
    lastHit = context.currentTime;
    const strength = .6 + Math.max(0, Math.min(1, energy)) * .4;
    const pitch = 650 + Math.random() * 450;
    sound({ frequency: pitch, end: 170, duration: .12, volume: .17 * strength, type: 'triangle' });
    sound({ frequency: 3300, end: 650, duration: .17, volume: .24 * strength, noise: true });
    sound({ frequency: pitch * .7, end: 240, duration: .1, volume: .08 * strength, type: 'triangle', delay: .055 });
  }

  function result(kind) {
    const melodies = {
      start: [392, 523.25],
      hit: [523.25, 659.25],
      miss: [220, 164.81],
      won: [523.25, 659.25, 783.99, 1046.5],
      lost: [329.63, 261.63, 196]
    };
    const notes = melodies[kind];
    if (!notes) return;
    notes.forEach((frequency, index) => sound({
      frequency,
      duration: kind === 'lost' ? (index === notes.length - 1 ? .5 : .28) : (index === notes.length - 1 ? .42 : .19),
      volume: kind === 'won' ? .15 : .1,
      type: 'triangle',
      delay: index * (kind === 'lost' ? .22 : .14)
    }));
  }

  function setEnabled(value) {
    enabled = Boolean(value && AudioContext);
    if (!enabled) stopAll();
    try { localStorage.setItem(preferenceKey, enabled ? 'on' : 'off'); } catch { /* Keep the session preference. */ }
    updateButton();
    if (enabled) {
      unlock();
      result('start');
    }
  }

  button.addEventListener('click', () => setEnabled(!enabled));
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) return;
    stopAll();
    if (context?.state === 'running') context.suspend().catch(() => {});
  });
  window.addEventListener('pagehide', stopAll);
  updateButton();
  window.DragonByteBowlingAudio = Object.freeze({
    unlock, startCharge, updateCharge, stopCharge, launch, stopRoll, hit, result, stopAll, setEnabled
  });
})();
