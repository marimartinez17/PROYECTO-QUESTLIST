document.addEventListener('DOMContentLoaded', () => {
    const secciones = document.querySelectorAll('div[id]');
    const navbarLinks = document.querySelectorAll('a.nav-link, a#comenzar');

    const linkProgreso = document.querySelector('#nav-progreso');
    const linkPerfil = document.querySelector('#nav-perfil');
    const linkCerrarSesion = document.querySelector('#logout');

    const API = window.API_URL || 'http://localhost:3000/api';

    function registrado() {
        return localStorage.getItem('token') !== null;
    }

    function mostrarLinksOcultos() {
        if (registrado()) {
            linkProgreso.style.display = 'block';
            linkPerfil.style.display = 'block';
            linkCerrarSesion.style.display = 'block';
        } else {
            linkProgreso.style.display = 'none';
            linkPerfil.style.display = 'none';
            linkCerrarSesion.style.display = 'none';
        }
    }

    function mostrarSecciones(hash) {
        secciones.forEach(seccion => {
            seccion.style.display = (seccion.id === hash) ? 'block' : 'none';
        });
    }

    // Cambio de hash
    window.addEventListener('hashchange', () => {
        let hash = location.hash.replace('#', '') || 'inicio';
        if (!registrado() && (hash === 'progreso' || hash === 'perfil')) {
            hash = 'inicio';
        }
        mostrarSecciones(hash);
    });

    // Inicio
    mostrarSecciones(location.hash.replace('#', '') || 'inicio');

    navbarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const target = link.getAttribute('href').replace('#', '');
            mostrarSecciones(target);
        });
    });

    // LOGIN
    const formLogin = document.querySelector('#form-login');
    if (formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();
            const correo = document.querySelector('#correo-login').value;
            const password = document.querySelector('#contraseña-login').value;
            try {
                const res = await fetch(`${API}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ correo, password })
                });
                const data = await res.json();
                if (res.ok) {
                    localStorage.setItem('token', data.token);
                    mostrarLinksOcultos();
                    window.location.hash = 'progreso';
                    cargarPerfil();
                    cargarTareas();
                } else {
                    alert(data.message);
                }
            } catch (e) {
                console.error(e);
            }
        });
    }

    // REGISTRO
    const formRegistro = document.querySelector('#form-registro');
    if (formRegistro) {
        formRegistro.addEventListener('submit', async (e) => {
            e.preventDefault();
            const usn = document.querySelector('#username-registro').value;
            const nom = document.querySelector('#nombre-registro').value;
            const correo = document.querySelector('#correo-registro').value;
            const pass = document.querySelector('#contraseña-registro').value;
            try {
                const res = await fetch(`${API}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ usn, nom, correo, pass })
                });
                const data = await res.json();
                if (res.ok) {
                    alert('Usuario registrado. Ahora inicia sesión.');
                    window.location.hash = 'login';
                } else {
                    alert(data.message);
                }
            } catch (e) {
                console.error(e);
            }
        });
    }

    // LOGOUT
    linkCerrarSesion.addEventListener('click', () => {
        localStorage.removeItem('token');
        mostrarLinksOcultos();
        window.location.hash = 'inicio';
    });

    // CARGAR PERFIL
    async function cargarPerfil() {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const res = await fetch(`${API}/usuarios/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const user = await res.json();
            document.querySelector('#perfil-username').textContent = user.usn_usu;
            document.querySelector('#perfil-correo').textContent = user.cor_usu;
            document.querySelector('#perfil-xp').textContent = user.xp_usu;
        } catch (e) { console.error(e); }
    }

    // CARGAR TAREAS
    async function cargarTareas() {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const res = await fetch(`${API}/tareas`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const tareas = await res.json();
            const lista = document.querySelector('#task-list');
            lista.innerHTML = '';
            tareas.forEach(t => {
                const li = document.createElement('li');
                li.textContent = `${t.des_tar} - ${t.est_tar}`;
                lista.appendChild(li);
            });
        } catch (e) { console.error(e); }
    }

    // AGREGAR NUEVA TAREA
    const btnAgregar = document.querySelector('#agregar-btn');
    if (btnAgregar) {
        btnAgregar.addEventListener('click', async () => {
            const desc = document.querySelector('#input-tarea').value;
            const token = localStorage.getItem('token');
            if (!desc || !token) return;

            try {
                const res = await fetch(`${API}/tareas`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ des_tar: desc })
                });

                if (res.ok) {
                    document.querySelector('#input-tarea').value = '';
                    cargarTareas();
                } else {
                    const data = await res.json();
                    alert(data.message);
                }
            } catch (e) {
                console.error(e);
            }
        });
    }

    mostrarLinksOcultos();
});
