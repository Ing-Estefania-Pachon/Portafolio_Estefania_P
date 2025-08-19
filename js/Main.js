// js/Main.js (fragmento principal corregido)
function waitForElement(selector, timeout = 5000) {
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
          reject(new Error('timeout waiting for ' + selector));
        }
      }
    }, interval);
  });
}

/* mapeo entre el data-target de la tarjeta y el ID del modal que debe abrir
   CORRECCIÓN: nombres en lowerCamelCase y en español */
const mapaTargetAModal = {
  proyectos: 'modalProyectos',
  educacion: 'modalEducacion',
  habilidades: 'modalHabilidades',
  acerca: 'modalAcerca'
};

/* inicialización: espera a que las tarjetas existan (loadTemplates las inserta dinámicamente) */
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await waitForElement('.tarjetaCategoria', 4000); // espera que loadTemplates haya cargado hero
    initTarjetaClicks();
    initContactFormHandler();
  } catch (err) {
    console.warn('Main.js: no se encontraron tarjetas o templates aún.', err);
  }
});

/* agrega listeners a cada tarjeta para abrir el modal correcto */
function initTarjetaClicks() {
  document.querySelectorAll('.tarjetaCategoria').forEach(tarjeta => {
    tarjeta.addEventListener('click', async (e) => {
      e.preventDefault();
      const target = tarjeta.dataset.target; // ej. "proyectos", "educacion", "habilidades", "acerca"
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

/* handler simple para el formulario de contacto (simulado) */
function initContactFormHandler() {
  const formSelector = '#contactFormAcerca';
  const form = document.querySelector(formSelector);
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }
    const btnEnviar = form.querySelector('button[type="submit"]');
    const textoOriginal = btnEnviar.innerHTML;
    btnEnviar.disabled = true;
    btnEnviar.innerHTML = 'Enviando...';

    setTimeout(() => {
      const alerta = document.createElement('div');
      alerta.className = 'alert alert-success mt-3';
      alerta.role = 'alert';
      alerta.innerHTML = '<strong>Mensaje enviado.</strong> Gracias, te responderé pronto.';
      form.parentElement.appendChild(alerta);
      btnEnviar.disabled = false;
      btnEnviar.innerHTML = textoOriginal;
      form.reset();
      form.classList.remove('was-validated');
    }, 900);
  });
}
