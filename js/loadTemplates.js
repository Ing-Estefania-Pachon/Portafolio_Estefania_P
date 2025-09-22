// loadTemplates.js (version corregida: devuelve promesas y emite evento 'templatesLoaded')

function loadTemplate(id, url) {
    return fetch(url)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status} cargando ${url}`);
            return response.text();
        })
        .then(html => {
            const el = document.getElementById(id);
            if (!el) throw new Error(`Elemento con id="${id}" no encontrado en index.html`);
            el.innerHTML = html;
        })
        .catch(err => {
            console.error(`Error cargando plantilla ${url}:`, err);
            // No lanzamos más arriba para permitir que otras plantillas sigan cargando.
        });
}

// Lista de plantillas a cargar
const templates = [
    { id: "navbar", url: "components/navbar.html" },
    { id: "heroEncarta", url: "components/heroEncarta.html" },
    { id: "about", url: "components/about.html" },
    { id: "education", url: "components/education.html" },
    { id: "habilidades", url: "components/habilidades.html" },
    { id: "proyects", url: "components/proyects.html" },
    { id: "footer", url: "components/footer.html" }
];

// Cargar todas y emitir evento cuando terminen (aunque algunas fallen)
Promise.all(templates.map(t => loadTemplate(t.id, t.url)))
    .then(() => {
        // Notificar al resto de scripts que las plantillas ya están en el DOM
        document.dispatchEvent(new Event('templatesLoaded'));
        console.info('loadTemplates: templatesLoaded dispatched');
    })
    .catch(err => {
        console.error('loadTemplates: error general al cargar templates', err);
        document.dispatchEvent(new Event('templatesLoaded')); // aún notificamos para intentar inicializar.
    });
