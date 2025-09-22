// js/searchSuggestions.js
// Versión robusta: usa delegación (document-level handlers) para evitar addEventListener sobre null.
// También previene doble carga con window.__searchSuggestionsLoaded.

if (window.__searchSuggestionsLoaded) {
  console.info('searchSuggestions: ya inicializado (guard).');
} else {
  window.__searchSuggestionsLoaded = true;
  console.info('searchSuggestions: cargado (v2025-09-21-robust).');
}

(function() {
  // Opciones (ajusta si tus modals tienen otro id)
  const aboutModalSelector = '#modalAcerca';
  const projectsModalSelector = '#modalProyectos';
  const options = [
    { title: '¿Quién soy?', sub: 'Ver sección "Sobre mí"', target: aboutModalSelector },
    { title: '¿Qué proyectos he realizado?', sub: 'Abrir proyectos', target: projectsModalSelector },
    { title: '¿Cómo contactarme?', sub: 'Formas de contacto', target: aboutModalSelector }
  ];

  // Util: crea o devuelve suggestions container
  function getOrCreateSuggestionsEl() {
    let s = document.getElementById('searchSuggestions');
    if (!s) {
      // Intenta insertarlo dentro del .search-wrapper si existe, si no, al body
      const wrapper = document.querySelector('.search-wrapper');
      s = document.createElement('ul');
      s.id = 'searchSuggestions';
      s.className = 'search-suggestions-list';
      s.style.display = 'none';
      s.setAttribute('role', 'listbox');
      if (wrapper) wrapper.appendChild(s);
      else document.body.appendChild(s);
      console.info('searchSuggestions: creado #searchSuggestions dinámicamente.');
    }
    return s;
  }

  function hideSuggestions() {
    const s = document.getElementById('searchSuggestions');
    if (s) {
      s.style.display = 'none';
      const campo = document.getElementById('campoBuscar');
      if (campo) campo.setAttribute('aria-expanded', 'false');
      Array.from(s.querySelectorAll('[aria-selected]')).forEach(el => el.removeAttribute('aria-selected'));
    }
    currentIndex = -1;
  }

  function renderSuggestions(filter) {
    const s = getOrCreateSuggestionsEl();
    s.innerHTML = '';
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
      li.innerHTML = `<div><div class="search-suggestion-title">${opt.title}</div><div class="search-suggestion-sub">${opt.sub}</div></div>`;

      li.addEventListener('click', () => selectSuggestion(opt.target));
      li.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter') { ev.preventDefault(); selectSuggestion(opt.target); }
      });

      s.appendChild(li);
    });

    currentIndex = -1;
    s.style.display = 'block';
    const campo = document.getElementById('campoBuscar');
    if (campo) campo.setAttribute('aria-expanded', 'true');
  }

  function selectSuggestion(targetSelector) {
    hideSuggestions();
    const campo = document.getElementById('campoBuscar');
    if (campo) campo.value = '';

    const targetEl = document.querySelector(targetSelector);
    if (!targetEl) {
      console.warn('searchSuggestions: target modal no encontrado ->', targetSelector);
      return;
    }

    try {
      let modalInstance;
      if (window.bootstrap && bootstrap.Modal) {
        if (typeof bootstrap.Modal.getOrCreateInstance === 'function') {
          modalInstance = bootstrap.Modal.getOrCreateInstance(targetEl);
        } else {
          modalInstance = new bootstrap.Modal(targetEl);
        }
        modalInstance.show();
      } else {
        targetEl.dispatchEvent(new Event('show.bs.modal'));
      }
    } catch (e) {
      console.error('Error al abrir modal desde searchSuggestions:', e);
    }
  }

  // Manejo de teclado/selección
  let currentIndex = -1;
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

  // --- Delegated handlers: no dependen de que #campoBuscar exista ahora ---
  document.addEventListener('input', function(e) {
    // solo reaccionamos si el input es nuestro campo
    const target = e.target;
    if (!target) return;
    if (target.id === 'campoBuscar') {
      const v = target.value.trim();
      if (v.length >= 1) renderSuggestions(v);
      else hideSuggestions();
    }
  });

  // Keydown: flechas / enter / escape cuando #campoBuscar está activo
  document.addEventListener('keydown', function(e) {
    const active = document.activeElement;
    if (!active) return;
    if (active.id !== 'campoBuscar') return;

    const s = document.getElementById('searchSuggestions');
    const items = s ? Array.from(s.querySelectorAll('.search-suggestion-item')) : [];
    if (!s || s.style.display === 'none' || items.length === 0) return;

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

  // Click global: si se hace click fuera de .search-wrapper, esconder sugerencias
  document.addEventListener('click', function(ev) {
    if (!ev.target.closest('.search-wrapper')) {
      hideSuggestions();
    } else {
      // clic dentro; si fue en el boton de búsqueda abrimos la primer sugerencia
      const maybeBoton = ev.target.closest('#botonBuscar');
      if (maybeBoton) {
        const s = document.getElementById('searchSuggestions');
        const visibleItems = s ? Array.from(s.querySelectorAll('.search-suggestion-item')) : [];
        if (visibleItems.length > 0) {
          selectSuggestion(visibleItems[0].dataset.target);
        }
      }
    }
  });

  // Intento inicializar si las plantillas ya cargaron
  document.addEventListener('templatesLoaded', function() {
    console.info('searchSuggestions: templatesLoaded recibido.');
    // comprobar si campo existe y avisar
    const campo = document.getElementById('campoBuscar');
    if (!campo) console.warn('searchSuggestions: tras templatesLoaded no se encontró #campoBuscar. Revisa el id en components/navbar.html');
    else console.info('searchSuggestions: #campoBuscar encontrado.');
  });

  // Doble seguro en load
  window.addEventListener('load', function() {
    const campo = document.getElementById('campoBuscar');
    if (!campo) console.warn('searchSuggestions: en load no se encontró #campoBuscar. Revisa el id en components/navbar.html');
    else console.info('searchSuggestions: en load #campoBuscar encontrado.');
  });

})(); // fin IIFE
