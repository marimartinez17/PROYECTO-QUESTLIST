document.addEventListener('DOMContentLoaded',()=>{
    
    // Seleccionar las secciones del HTML
    const secciones = document.querySelectorAll('div[id]');

    //  Mostrar seccion segun el hash
    function mostrarSecciones(hash){
        secciones.forEach(seccion => {
            // Mostrar seccion si el id coincide
            if(seccion.id == hash) {
                seccion.style.display = 'block';
            } else {
                seccion.style.display = 'none';
            }
        });
    }

    // Cambiar de seccion al cambiar de hash

    window.addEventListener('hashchange',()=>{
        const hash = location.hash.replace('#','') || 'inicio';
        mostrarSecciones(hash);
    });

    // Cambiar de seccion al cambiar de hash
    const hashInicio = location.hash.replace('#','') || 'inicio';
    mostrarSecciones(hashInicio);

    // Manejar enlaces de la navbar y botones
    const navbarLinks = document.querySelectorAll('a.nav-link, a#comenzar');
    navbarLinks.forEach(link => {
        link.addEventListener('click', (e)=>{
            const target = link.getAttribute('href').replace('#','');
            mostrarSecciones(target);
        })
    })
})