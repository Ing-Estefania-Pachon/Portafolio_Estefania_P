// js/utils.js
// Espera sencilla para un selector (reutilizable)
function waitForElement(selector, timeout = 4000) {
  return new Promise((resolve, reject) => {
    const interval = 50;
    let elapsed = 0;
    const id = setInterval(() => {
      const el = document.querySelector(selector);
      if (el) {
        clearInterval(id);
        resolve(el);
      } else {
        elapsed += interval;
        if (elapsed >= timeout) {
          clearInterval(id);
          reject(new Error('Timeout esperando ' + selector));
        }
      }
    }, interval);
  });
}

/**
 * Inicializa un carousel "multi-item" responsive:
 *  - >=992px => 3 por slide
 *  - >=576px && <992px => 2 por slide
 *  - <576px => 1 por slide
 *
 * Al hacer hover sobre cada tarjeta añadimos/removemos la clase
 * `modalConHoverTarjeta` en la .ventanaEncarta para ocultar el borde del modal.
 */
async function initCarouselProyectosMultiples() {
  try {
    const modalProyectos = await waitForElement('#modalProyectos', 6000);
    const carouselEl = modalProyectos.querySelector('#carouselProyectos');
    if (!carouselEl) return;

    // guardamos outerHTML de cada tarjeta (para clonar luego)
    const tarjetasOriginales = Array.from(carouselEl.querySelectorAll('.tarjetaProyecto'));
    if (tarjetasOriginales.length === 0) return;
    const tarjetasHTML = tarjetasOriginales.map(t => t.outerHTML);

    function getItemsPerSlide() {
      const w = window.innerWidth;
      if (w >= 992) return 3;
      if (w >= 576) return 2;
      return 1;
    }

    function attachHoverListeners() {
      const tarjetas = carouselEl.querySelectorAll('.tarjetaProyecto');
      tarjetas.forEach(t => {
        t.addEventListener('mouseenter', () => {
          const ventana = modalProyectos.querySelector('.ventanaEncarta');
          if (ventana) ventana.classList.add('modalConHoverTarjeta');
        });
        t.addEventListener('mouseleave', () => {
          const ventana = modalProyectos.querySelector('.ventanaEncarta');
          if (ventana) ventana.classList.remove('modalConHoverTarjeta');
        });
      });
    }

    function rebuildCarousel() {
      const itemsPerSlide = getItemsPerSlide();
      const inner = carouselEl.querySelector('.carousel-inner');
      inner.innerHTML = ''; // limpiamos

      for (let i = 0; i < tarjetasHTML.length; i += itemsPerSlide) {
        const item = document.createElement('div');
        item.className = 'carousel-item';
        if (i === 0) item.classList.add('active');

        const row = document.createElement('div');
        row.className = 'row g-4 justify-content-center';

        for (let j = 0; j < itemsPerSlide && (i + j) < tarjetasHTML.length; j++) {
          const col = document.createElement('div');
          if (itemsPerSlide === 3) col.className = 'col-12 col-md-6 col-lg-4 d-flex';
          else if (itemsPerSlide === 2) col.className = 'col-12 col-md-6 d-flex';
          else col.className = 'col-12 d-flex';

          const wrapper = document.createElement('div');
          wrapper.innerHTML = tarjetasHTML[i + j].trim();
          const tarjetaNode = wrapper.firstElementChild;
          col.appendChild(tarjetaNode);
          row.appendChild(col);
        }

        item.appendChild(row);
        inner.appendChild(item);
      }

      // Aseguramos espacio inferior para las flechas (evita recorte)
      const modalBody = carouselEl.closest('.modal-body');
      if (modalBody) {
        // valor suficiente para los controles centrados debajo
        modalBody.style.paddingBottom = '84px';
      }

      // (Re)inicializamos instancia bootstrap
      const prevInstance = bootstrap.Carousel.getInstance(carouselEl);
      if (prevInstance) prevInstance.dispose();

      const intervalo = parseInt(carouselEl.getAttribute('data-bs-interval')) || 8000;
      const wrapAttr = carouselEl.getAttribute('data-bs-wrap');
      const wrap = wrapAttr === null ? true : (wrapAttr !== 'false');

      new bootstrap.Carousel(carouselEl, { interval: intervalo, wrap: wrap, pause: 'hover', touch: true });

      attachHoverListeners();
    }

    // Primera construcción
    rebuildCarousel();

    // Reconstruir al redimensionar (debounced)
    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        rebuildCarousel();
      }, 260);
    });

    // Al mostrar el modal, asegurar que empiece en el slide 0
    modalProyectos.addEventListener('show.bs.modal', () => {
      const instance = bootstrap.Carousel.getOrCreateInstance(carouselEl);
      if (instance) instance.to(0);
    });

  } catch (err) {
    console.warn('initCarouselProyectosMultiples: no inicializado', err);
  }
}

// Inicializamos al DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initCarouselProyectosMultiples();
});
