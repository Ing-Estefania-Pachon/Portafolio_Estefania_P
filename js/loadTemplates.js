//loadTemplates.js***

// Función para cargar plantillas HTML en un elemento específico
function loadTemplate(id, url, callback){
    fetch(url)
        .then(response => response.text())
        .then(data => {
            document.getElementById(id).innerHTML = data;
            if (typeof callback === "function") {
                callback();
            }
        })
        .catch(err => console.error(`Error cargando ${url}:`, err));
}

// Cargar plantillas
loadTemplate ("navbar", "components/navbar.html");
loadTemplate ("heroEncarta", "components/heroEncarta.html");
loadTemplate ("about", "components/about.html");
loadTemplate ("education", "components/education.html");
loadTemplate ("habilidades", "components/habilidades.html");
loadTemplate ("proyects", "components/proyects.html");
loadTemplate ("footer", "components/footer.html");
