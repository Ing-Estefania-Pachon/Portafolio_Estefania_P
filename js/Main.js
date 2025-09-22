// Main.js (usa waitForElement desde utils.js; se inicializa tras templatesLoaded)

/* mapeo entre el data-target de la tarjeta y el ID del modal que debe abrir */
const mapaTargetAModal = {
  proyectos: 'modalProyectos',
  educacion: 'modalEducacion',
  habilidades: 'modalHabilidades',
  acerca: 'modalAcerca'
};

document.addEventListener('templatesLoaded', async () => {
  try {
    await waitForElement('.tarjetaCategoria', 4000);
    initTarjetaClicks();
    initContactFormHandler(); // <-- asegúrate que esta línea exista
  } catch (err) {
    console.warn('Main.js: no se encontraron tarjetas o templates aún.', err);
  }
});


async function initTarjetaClicks() {
  const tarjetas = document.querySelectorAll('.tarjetaCategoria');
  if (!tarjetas || tarjetas.length === 0) return;

  tarjetas.forEach(tarjeta => {
    tarjeta.addEventListener('click', async (e) => {
      e.preventDefault();
      const target = tarjeta.dataset.target;
      const modalId = mapaTargetAModal[target];
      if (!modalId) {
        console.warn('No hay modal definido para target:', target);
        return;
      }
      try {
        await waitForElement('#' + modalId, 3000);
        const modalEl = document.getElementById(modalId);
        const modalObj = bootstrap.Modal.getOrCreateInstance(modalEl);
        modalObj.show();
      } catch (err) {
        console.error('No se pudo abrir el modal', modalId, err);
      }
    });
  });
}

// initContactFormHandler (reemplazar en js/Main.js)
function initContactFormHandler() {
  const formSelector = '#contactFormAcerca';
  const form = document.querySelector(formSelector);
  if (!form) return;

  // Previene múltiples listeners si se ejecuta más de una vez
  if (form.__contactHandlerAttached) return;
  form.__contactHandlerAttached = true;

  // Contenedor para mostrar alertas (si no existe, lo creamos y lo colocamos justo después del form)
  let alertContainer = form.parentElement.querySelector('.contact-alert-container');
  if (!alertContainer) {
    alertContainer = document.createElement('div');
    alertContainer.className = 'contact-alert-container mt-3';
    form.parentElement.insertBefore(alertContainer, form.nextSibling);
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    // Limpiamos alertas antiguas
    alertContainer.innerHTML = '';

    // Validación nativa
    if (!form.checkValidity()) {
      form.classList.add('was-validated');

      const err = document.createElement('div');
      err.className = 'alert alert-danger';
      err.role = 'alert';
      err.innerHTML = 'Por favor completa correctamente los campos requeridos.';
      alertContainer.appendChild(err);
      err.setAttribute('tabindex', '-1');
      err.focus();
      return;
    }

    // Botón: deshabilitar y mostrar spinner
    const btnEnviar = form.querySelector('button[type="submit"]');
    const originalBtnHtml = btnEnviar ? btnEnviar.innerHTML : '';
    if (btnEnviar) {
      btnEnviar.disabled = true;
      btnEnviar.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Enviando...';
    }

    try {
      const response = await fetch(form.action, {
        method: (form.method || 'POST').toUpperCase(),
        body: new FormData(form),
        headers: {
          'Accept': 'application/json'
        }
      });

      // Intentamos parsear JSON si viene
      let payload = null;
      const ct = response.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        payload = await response.json();
      } else {
        payload = await response.text();
      }

      if (response.ok) {
        // Mensaje de éxito (mismo estilo que antes)
        const success = document.createElement('div');
        success.className = 'alert alert-success';
        success.role = 'alert';
        success.innerHTML = '<strong>Mensaje enviado.</strong> Gracias, te responderé pronto.';
        alertContainer.appendChild(success);
        success.setAttribute('tabindex', '-1');
        success.focus();

        // Reset del formulario y estado
        form.reset();
        form.classList.remove('was-validated');

        // Auto-remove del mensaje después de 6s
        setTimeout(() => {
          if (success && success.parentElement) success.remove();
        }, 6000);

        console.info('Formspree OK:', payload);
      } else {
        // Mostrar error con info útil si Formspree responde con detalles
        let msg = 'Error al enviar. Intenta de nuevo más tarde.';
        if (payload && typeof payload === 'object' && payload.error) msg = payload.error;
        if (typeof payload === 'string' && payload.trim()) msg = payload;

        const err = document.createElement('div');
        err.className = 'alert alert-danger';
        err.role = 'alert';
        err.innerHTML = `<strong>No enviado:</strong> ${msg}`;
        alertContainer.appendChild(err);
        err.setAttribute('tabindex', '-1');
        err.focus();

        console.warn('Formspree error', response.status, payload);
      }
    } catch (err) {
      console.error('Error de conexión al enviar el formulario:', err);
      const errAlert = document.createElement('div');
      errAlert.className = 'alert alert-danger';
      errAlert.role = 'alert';
      errAlert.innerHTML = '<strong>Error de conexión.</strong> Revisa tu internet e intenta de nuevo.';
      alertContainer.appendChild(errAlert);
      errAlert.setAttribute('tabindex', '-1');
      errAlert.focus();
    } finally {
      if (btnEnviar) {
        btnEnviar.disabled = false;
        btnEnviar.innerHTML = originalBtnHtml;
      }
    }
  });
}


/* Inicialización principal: esperar a que las plantillas estén cargadas en el DOM */
document.addEventListener('templatesLoaded', async () => {
  try {
    await waitForElement('.tarjetaCategoria', 4000);
    initTarjetaClicks();
    initContactFormHandler();
  } catch (err) {
    console.warn('Main.js: no se encontraron tarjetas o templates aún.', err);
  }
});
