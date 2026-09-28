(() => {
  function initializeLogbook() {
    const entries = document.querySelector('#log-entries');
    const timeline = document.querySelector('.log-timeline');
    const dialog = document.querySelector('#log-dialog');
    const form = document.querySelector('#log-form');
    if (!entries || !timeline || !dialog || !form) return;

    const events = timeline.querySelector('.log-timeline-events');
    const addButtons = document.querySelectorAll('.log-timeline-add, #log-add-event');
    const addItem = timeline.querySelector('.log-timeline-action');
    const status = document.querySelector('#log-status');
    const filters = document.querySelector('#log-filters');
    const dateFilter = document.querySelector('#log-filter-date');
    const sortOrder = document.querySelector('#log-sort-order');
    const filterSummary = document.querySelector('#log-filter-summary');
    const storageKey = 'dragonbyte-logbook-v1';
    // Validación local del formulario; no reemplaza la autenticación en un servidor.
    const publicationKey = window.DragonByteAccess?.publicationKey;
    const authKeyField = form.elements.namedItem('authKey');
    const eventTypes = ['Inicio', 'Revisión', 'Diseño', 'Integración', 'Desarrollo'];
    const textLimits = { title: 120, description: 3000, decisions: 2000, nextStep: 2000 };
    const formatNumber = (number) => String(number).padStart(2, '0');
    const originalNumbers = new Set(Array.from(entries.querySelectorAll('.log-date span'),
      (label) => Number(label.textContent)));
    let savedEntries = [];

    function isValidEntry(entry) {
      if (!entry || !Number.isSafeInteger(entry.number) || entry.number < 1) return false;
      if (!eventTypes.includes(entry.type) || !/^\d{4}-\d{2}-\d{2}$/.test(entry.date)) return false;
      const date = new Date(`${entry.date}T12:00:00Z`);
      if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== entry.date) return false;
      return Object.entries(textLimits).every(([field, limit]) =>
        typeof entry[field] === 'string' && entry[field].trim().length > 0 && entry[field].length <= limit);
    }

    function createTextElement(tag, text, className) {
      const element = document.createElement(tag);
      element.textContent = text;
      if (className) element.className = className;
      return element;
    }

    function addEntryCard(entry) {
      const card = document.createElement('article');
      card.className = 'log-entry';
      card.dataset.eventDate = entry.date;
      const badge = document.createElement('div');
      badge.className = 'log-date';
      badge.append(createTextElement('span', formatNumber(entry.number)), createTextElement('small', entry.type));
      const copy = document.createElement('div');
      copy.className = 'log-entry-copy';
      const [year, month, day] = entry.date.split('-');
      copy.append(
        createTextElement('p', `Fecha: ${day}/${month}/${year}`, 'role'),
        createTextElement('h2', entry.title),
        createTextElement('p', entry.description),
        createTextElement('h3', 'Decisiones'),
        createTextElement('p', entry.decisions),
        createTextElement('h3', 'Próximo paso'),
        createTextElement('p', entry.nextStep)
      );
      card.append(badge, copy);
      entries.append(card);
      return card;
    }

    function updateTimeline() {
      events.replaceChildren(addItem);
      entries.querySelectorAll('.log-entry').forEach((card) => {
        const number = card.querySelector('.log-date span').textContent.trim();
        const title = card.querySelector('h2').textContent;
        card.id = `evento-${number}`;
        card.tabIndex = -1;
        if (card.hidden) return;
        const item = document.createElement('li');
        const link = document.createElement('a');
        link.className = 'log-timeline-link';
        link.href = `#${card.id}`;
        link.title = `Evento ${number}: ${title}`;
        link.setAttribute('aria-label', link.title);
        link.append(createTextElement('span', number, 'log-timeline-number'));
        item.append(link);
        events.insertBefore(item, addItem);
      });
    }

    function updateDateFilter() {
      const selectedDate = dateFilter.value;
      const dates = [...new Set(Array.from(entries.querySelectorAll('.log-entry'),
        (card) => card.dataset.eventDate))].sort().reverse();
      const allDates = createTextElement('option', 'Todas las fechas');
      allDates.value = '';
      dateFilter.replaceChildren(allDates);
      dates.forEach((date) => {
        const [year, month, day] = date.split('-');
        const option = createTextElement('option', `${day}/${month}/${year}`);
        option.value = date;
        dateFilter.append(option);
      });
      dateFilter.value = dates.includes(selectedDate) ? selectedDate : '';
    }

    function applyFilters() {
      const cards = Array.from(entries.querySelectorAll('.log-entry'));
      const direction = sortOrder.value === 'desc' ? -1 : 1;
      cards.sort((a, b) => direction * (
        Number(a.querySelector('.log-date span').textContent) -
        Number(b.querySelector('.log-date span').textContent)
      ));
      let visibleCount = 0;
      cards.forEach((card) => {
        card.hidden = Boolean(dateFilter.value && card.dataset.eventDate !== dateFilter.value);
        if (!card.hidden) visibleCount += 1;
        entries.append(card);
      });
      filterSummary.textContent = `${visibleCount} de ${cards.length} eventos`;
      updateTimeline();
    }

    function nextNumber() {
      return Math.max(0, ...originalNumbers, ...savedEntries.map((entry) => entry.number)) + 1;
    }

    try {
      const stored = JSON.parse(localStorage.getItem(storageKey) || '[]');
      if (Array.isArray(stored)) {
        const numbers = new Set(originalNumbers);
        savedEntries = stored.filter((entry) => {
          if (!isValidEntry(entry) || numbers.has(entry.number)) return false;
          numbers.add(entry.number);
          return true;
        }).sort((a, b) => a.number - b.number);
        savedEntries.forEach(addEntryCard);
      }
    } catch {
      status.textContent = 'No se pudieron recuperar las entradas guardadas en este navegador.';
    }

    updateDateFilter();
    applyFilters();
    timeline.hidden = false;
    filters.hidden = false;
    dateFilter.addEventListener('change', applyFilters);
    sortOrder.addEventListener('change', applyFilters);

    events.addEventListener('click', (event) => {
      const link = event.target.closest('a');
      if (!link) return;
      document.getElementById(link.hash.slice(1))?.focus({ preventScroll: true });
    });

    function openLogDialog() {
      form.reset();
      authKeyField.setCustomValidity('');
      Object.keys(textLimits).forEach((name) => form.elements.namedItem(name).setCustomValidity(''));
      form.elements.namedItem('number').value = formatNumber(nextNumber());
      const today = new Date();
      form.elements.namedItem('date').value =
        `${today.getFullYear()}-${formatNumber(today.getMonth() + 1)}-${formatNumber(today.getDate())}`;
      dialog.showModal();
      document.body.classList.add('log-dialog-open');
    }

    addButtons.forEach((button) => button.addEventListener('click', openLogDialog));

    dialog.querySelector('.log-dialog-close').addEventListener('click', () => dialog.close());
    document.querySelector('#log-cancel').addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => {
      document.body.classList.remove('log-dialog-open');
      authKeyField.value = '';
      authKeyField.setCustomValidity('');
    });

    authKeyField.addEventListener('input', () => authKeyField.setCustomValidity(''));

    Object.keys(textLimits).forEach((name) => {
      const field = form.elements.namedItem(name);
      field.addEventListener('input', () => {
        field.setCustomValidity(field.value.trim() ? '' : 'Completá este campo con texto.');
      });
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      authKeyField.setCustomValidity(
        authKeyField.value === publicationKey ? '' : 'La clave de autenticación es incorrecta.'
      );
      Object.keys(textLimits).forEach((name) => {
        const field = form.elements.namedItem(name);
        field.setCustomValidity(field.value.trim() ? '' : 'Completá este campo con texto.');
      });
      if (!form.reportValidity()) return;
      const entry = {
        number: nextNumber(),
        type: form.elements.namedItem('type').value,
        date: form.elements.namedItem('date').value,
      };
      Object.keys(textLimits).forEach((name) => {
        entry[name] = form.elements.namedItem(name).value.trim();
      });
      if (!isValidEntry(entry)) return;

      savedEntries.push(entry);
      let persisted = true;
      try {
        localStorage.setItem(storageKey, JSON.stringify(savedEntries));
      } catch {
        persisted = false;
      }
      const card = addEntryCard(entry);
      updateDateFilter();
      const resetDateFilter = dateFilter.value && dateFilter.value !== entry.date;
      if (resetDateFilter) dateFilter.value = '';
      applyFilters();
      dialog.close();
      status.textContent = persisted
        ? `Evento ${formatNumber(entry.number)} publicado y guardado en este navegador.`
        : `Evento ${formatNumber(entry.number)} publicado solo en esta sesión. No se pudo guardar en este navegador; se perderá al recargar.`;
      if (resetDateFilter) status.textContent += ' Se muestran todas las fechas para ver la nueva entrada.';
      card.focus({ preventScroll: true });
      card.scrollIntoView({ block: 'start' });
    });
  }

  initializeLogbook();
})();
