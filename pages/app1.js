// Mapeamos las rutas para cada archivo HTML
const routes = {
    'inicio': './inicio.html',
    'progreso': './progreso.html'
};

// Función para cargar el contenido HTML en el div #app
async function loadPage() {
    // Obtiene el hash de la URL y quita #
    const hash = location.hash.substring(1) || "inicio"; // Si no hay URL, usa "inicio"
    
    // Buscar ruta, si no hay, redirige al inicio
    const route = routes[hash] || routes["inicio"];

    try {
        // Trae el HTML correspondiente a la ruta
        const res = await fetch(route);

        // error (si no es OK)
        if (!res.ok) throw new Error("Error al cargar la página");
        
        // Leer HTML como texto
        const html = await res.text();

        //iNsertar html dentro de app
        document.getElementById("app").innerHTML = html;
    } catch (err) {

        // Error genérico
        document.getElementById("app").innerHTML =
        "<h2>Error al cargar la página.</h2>";

    }

    // Actualizar navbar
    document.querySelectorAll(".nav-link").forEach(link => {
        link.classList.remove("active");
        if (link.getAttribute("href") === "#" + hash) {
            link.classList.add("active");
        }
    });
}

// Escuchar cambios de hash URL al navegar la pagina
window.addEventListener("hashchange", loadPage);

// cargar pagina al cargar el dom
window.addEventListener("DOMContentLoaded", loadPage);