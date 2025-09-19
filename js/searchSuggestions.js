/* js/searchSuggestions.js
   Autocomplete mínimo: muestra 3 sugerencias cuando el usuario escribe al menos 1 carácter.
   Al seleccionar una sugerencia abre el modal correspondiente (Bootstrap 5).

   >>> Ajusta `aboutModalSelector` si tu modal "about" tiene otro id. <<<
*/

document.addEventListener('DOMContentLoaded', function () {
  const campo = document.getElementById('campoBuscar');
  const suggestionsEl = document.getElementById('searchSuggestions');
  const botonBuscar = document.getElementById('botonBuscar');

  // ---------- CONFIG ----------
  // Cambia aquí si tu modal "about" tiene otro id.
  const aboutModalSelector = '#modalAcerca';        // <-- CAMBIAR si es distinto
  const projectsModalSelector = '#modalProyectos'; // tu modal de proyectos ya existe con este id

  const options = [
    { title: '¿Quién soy?', sub: 'Ver sección "Sobre mí"', target: aboutModalSelector },
    { title: '¿Qué proyectos he realizado?', sub: 'Abrir proyectos', target: projectsModalSelector },
    { title: '¿Cómo contactarme?', sub: 'Formas de contacto', target: aboutModalSelector }
  ];

  let currentIndex = -1;

  function renderSuggestions(filter) {
    suggestionsEl.innerHTML = '';

    const filtered = options.filter(o => {
      if (!filter) return true;
      return o.title.toLowerCase().includes(filter.toLowerCase()) || o.sub.toLowerCase().includes(filter.toLowerCase());
    }).slice(0, 3);

    if (filtered.length === 0) {
      hideSuggestions();
      return;
    }

    filtered.forEach((opt, i) => {
      const li = document.createElement('li');
      li.className = 'search-suggestion-item';
      li.setAttribute('role', 'option');
      li.setAttribute('tabindex', '0');
      li.dataset.target = opt.target;
      li.dataset.index = i;

      li.innerHTML = `
        <div>
          <div class="search-suggestion-title">${opt.title}</div>
          <div class="search-suggestion-sub">${opt.sub}</div>
        </div>
      `;

      li.addEventListener('click', () => selectSuggestion(opt.target));
      li.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter') { ev.preventDefault(); selectSuggestion(opt.target); }
      });

      suggestionsEl.appendChild(li);
    });

    currentIndex = -1;
    suggestionsEl.style.display = 'block';
    campo.setAttribute('aria-expanded', 'true');
  }

  function hideSuggestions() {
    suggestionsEl.style.display = 'none';
    campo.setAttribute('aria-expanded', 'false');
    currentIndex = -1;
    const items = suggestionsEl.querySelectorAll('[aria-selected]');
    items.forEach(el => el.removeAttribute('aria-selected'));
  }

  function selectSuggestion(targetSelector) {
    hideSuggestions();
    campo.value = '';

    const targetEl = document.querySelector(targetSelector);
    if (!targetEl) {
      console.warn('searchSuggestions: target modal no encontrado ->', targetSelector);
      return;
    }

    // Mostrar modal con Bootstrap 5 (compatibilidad con getOrCreateInstance)
    try {
      let modalInstance;
      if (bootstrap && bootstrap.Modal) {
        if (typeof bootstrap.Modal.getOrCreateInstance === 'function') {
          modalInstance = bootstrap.Modal.getOrCreateInstance(targetEl);
        } else {
          modalInstance = new bootstrap.Modal(targetEl);
        }
        modalInstance.show();
      } else {
        // fallback mínimo: intentar disparar evento (no abrirá si no hay bootstrap)
        targetEl.dispatchEvent(new Event('show.bs.modal'));
      }
    } catch (e) {
      console.error('Error al abrir modal desde searchSuggestions:', e);
    }
  }

  campo.addEventListener('input', (e) => {
    const v = e.target.value.trim();
    if (v.length >= 1) {
      renderSuggestions(v);
    } else {
      hideSuggestions();
    }
  });

  campo.addEventListener('keydown', (e) => {
    const items = Array.from(suggestionsEl.querySelectorAll('.search-suggestion-item'));
    if (suggestionsEl.style.display === 'none' || items.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      currentIndex = (currentIndex + 1) % items.length;
      updateSelected(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      currentIndex = (currentIndex - 1 + items.length) % items.length;
      updateSelected(items);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (currentIndex >= 0 && items[currentIndex]) {
        selectSuggestion(items[currentIndex].dataset.target);
      }
    } else if (e.key === 'Escape') {
      hideSuggestions();
    }
  });

  function updateSelected(items) {
    items.forEach((it, idx) => {
      if (idx === currentIndex) {
        it.setAttribute('aria-selected', 'true');
        it.focus();
      } else {
        it.removeAttribute('aria-selected');
      }
    });
  }

  document.addEventListener('click', (ev) => {
    if (!ev.target.closest('.search-wrapper')) {
      hideSuggestions();
    }
  });

  botonBuscar.addEventListener('click', (ev) => {
    const visibleItems = Array.from(suggestionsEl.querySelectorAll('.search-suggestion-item'));
    if (visibleItems.length > 0) {
      selectSuggestion(visibleItems[0].dataset.target);
    }
  });

  // Inicial: ocultas hasta que escriba algo
  hideSuggestions();
});
