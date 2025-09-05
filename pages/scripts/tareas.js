document.addEventListener('DOMContentLoaded', () => {
    // Esperar a que cargue el DOM para ejecutar codigo

    const checkDOM = setInterval(() => {

        // Revisa cada 50ms  existen los elementos

        ///////////////// ELEMENTOS DEL DOM /////////////////////////

        // Canvas del chart progreso
        const chartCanvas = document.getElementById('progressChart');
        // Lista de tareas
        const taskList = document.getElementById('task-list');
        // Formulario para agregar tareas
        const taskInput = document.getElementById('input-tarea');
        // Boton submit
        const botonAgregar = document.getElementById('agregar-btn');
        // Campo de texto para agregar tareas
        const form = document.querySelector('.input-tasks');
        // Imagen y mensaje que se muestran si la imagen está vacía
        const emptyImg = document.getElementById('empty');
        // Contenedor de la lista de tareas
        const todosContainer = document.querySelector('.todo-container');
        // Barra de progreso (completación de tareas)
        const progressBar = document.getElementById('progreso');
        // Cantidad de tareas completadas n/n
        const progressNumbers = document.getElementById('numbers');
        //XP TOTAL acumulado por el usuario
        const totalXP = document.getElementById('totalXP');

        // Cantidad de tareas
        const tareasCompletadas = document.getElementById('tCompletadas');
        const tareasPendientes = document.getElementById('tPendientes');

        // Deja de revisar cuando todos los elementos ya estan cargados
        if (chartCanvas && taskList && taskInput && botonAgregar && form && emptyImg) {
            clearInterval(checkDOM);

            // Carga el XP acumulado por el usuario (desde localStorage)
            let xp = parseInt(localStorage.getItem('xp')) || 0;

            let progreso = { completadas: 0, pendientes: 0, total: 0 };

            // Recuperar progreso de tareas
            function obtenerProgreso() {
                const progreso = JSON.parse(localStorage.getItem('progresoTareas'));
                return progreso || { completadas: 0, pendientes: 0, total: 0 };
            }

            // Inicializar grafico de dona
            const progresoInicial = obtenerProgreso();

            /////// GRAFICO DE DONA ///////////////////////////////////////////////////

            const chartProgreso = new Chart(chartCanvas, {
                type: 'doughnut',
                data: {
                    labels: ['Completadas', 'Pendientes'],
                    datasets: [{
                        data: [progresoInicial.completadas, progresoInicial.pendientes],
                        label: 'Progreso de tareas',
                        backgroundColor: ['#ffa600ff', '#e43828ff'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    aspectRatio: 1,
                    cutout: '80%',
                }
            });

            ////// LISTA DE TAREAS /////////////////////////////////////////////////////////////

            // Mostrar o esconder imagen y mensaje en caso de que la lista esté vacía
            const toggleListaVacia = () => {
                emptyImg.style.display = taskList.children.length === 0 ? 'block' : 'none';
                todosContainer.style.width = taskList.children.length > 0 ? '100%' : '50%';
            };

            // Actualizar el progreso de las tareas y el chart
            const actualizarProgreso = (checkCompletion = true) => {
                const totalTasks = taskList.children.length;
                const tasksCompletadas = taskList.querySelectorAll('.checkbox:checked').length;
                const tasksPendientes = totalTasks - tasksCompletadas;

                // Actualizar dashboard
                tareasCompletadas.textContent = tasksCompletadas;
                tareasPendientes.textContent = tasksPendientes;
                totalXP.textContent = xp;

                // Actualizar barra de progreso
                progressBar.style.width = totalTasks ? `${(tasksCompletadas / totalTasks) * 100}%` : "0%";
                progressNumbers.textContent = `${tasksCompletadas} / ${totalTasks}`;

                // Mostrar explosión de confetti si se completan todas las tareas
                if (checkCompletion && totalTasks > 0 && tasksCompletadas == totalTasks) {
                    Confetti();
                }

                // Actualizar chart
                chartProgreso.data.datasets[0].data = [tasksCompletadas, tasksPendientes];
                chartProgreso.update();

                // Guardar progreso del usuario y retornarlo como un objeto
                progreso = {
                    completadas: tasksCompletadas,
                    pendientes: tasksPendientes,
                    total: totalTasks
                };
                
                return progreso;
            };

            // Guardar progreso del usuario en localStorage
            const guardarLocalStorage = () => {
                const tasks = Array.from(taskList.querySelectorAll('li')).map(li => ({
                    text: li.querySelector('span').textContent,
                    completed: li.querySelector('.checkbox').checked
                }));
                localStorage.setItem('tasks', JSON.stringify(tasks));
                localStorage.setItem('progresoTareas', JSON.stringify(progreso));

                // Guardar XP actual del usuario en localStorage
                localStorage.setItem('xp', xp);
            };

            // Funcion para agregar nuevas tareas a la lista
            const agregarTarea = (text, completed = false) => {
                //Eliminar espacios innecesarios
                const taskText = text || taskInput.value.trim();
                if (!taskText) return; // No hace nada si está vacío

                // Crear un nuevo elemento de lista con un checkbox en el DOM
                const li = document.createElement('li');
                li.innerHTML = `
                    <input type="checkbox" class="checkbox" ${completed ? 'checked' : ''}>
                    <span>${taskText}</span>
                    <div class="task-buttons">
                        <button class="editar-btn" aria-label="editar tarea"><i class="fa-solid fa-pen"></i></button>
                        <button class="eliminar-btn" aria-label="eliminar tarea"><i class="fa-solid fa-trash"></i></button>
                    </div>
                `;

                // Seleccionar checkbox de la tarea
                const checkbox = li.querySelector('.checkbox');
                //Seleccionar botón de edición
                const editarBtn = li.querySelector('.editar-btn');

                // En caso de que la tarea esté marcada como completada
                if (completed) {
                    li.classList.add('completed');
                    editarBtn.disabled = true; //Desabilitar opción de editar
                    editarBtn.style.opacity = '0.5';
                    editarBtn.style.pointerEvents = 'none';
                }

                // Marcar / Desmarcar tarea
                checkbox.addEventListener('change', () => {
                    const isChecked = checkbox.checked;
                    li.classList.toggle('completed', isChecked);
                    editarBtn.disabled = isChecked;
                    editarBtn.style.opacity = isChecked ? '0.5' : '1';
                    editarBtn.style.pointerEvents = isChecked ? 'none' : 'auto';
                    actualizarProgreso();
                    guardarLocalStorage();

                    // Sumar 10XP por cada tarea completada
                    if (isChecked && !li.classList.contains('completed')) {
                        xp += 10;
                    }
                });

                // Editar tarea
                editarBtn.addEventListener('click', () => {
                    if (!checkbox.checked) {
                        taskInput.value = li.querySelector('span').textContent;
                        li.remove();
                        toggleListaVacia();
                        actualizarProgreso(false);
                        guardarLocalStorage();
                    }
                });

                li.querySelector('.eliminar-btn').addEventListener('click', () => {
                    li.remove();
                    toggleListaVacia();
                    actualizarProgreso();
                    guardarLocalStorage();
                });

                taskList.appendChild(li);
                taskInput.value = '';
                toggleListaVacia();
                actualizarProgreso(true);
                guardarLocalStorage();
            };

            // Cargar tareas guardadas
            const cargarTasksLocalStorage = () => {
                const tasksGuardadas = JSON.parse(localStorage.getItem('tasks')) || [];
                tasksGuardadas.forEach(({ text, completed }) => {
                    agregarTarea(text, completed);
                });
                toggleListaVacia();
                actualizarProgreso();
            };

            // Enviar formulario (tareas)
            botonAgregar.addEventListener('click', () => agregarTarea());
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                agregarTarea();
            });

            // Cargar datos iniciales
            cargarTasksLocalStorage();
            toggleListaVacia();
        }
    }, 50);
});

///////////// FUNCIÓN PARA LANZAR CONFETTI ///////////////////////////////////////////////////////////////
const Confetti = () => {
    const count = 200, defaults = { origin: { y: 0.7 } };
    function fire(particleRatio, opts) {
        confetti(Object.assign({}, defaults, opts, { particleCount: Math.floor(count * particleRatio) }));
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
};
