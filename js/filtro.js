// Filtro de proyectos por rol. Sin JavaScript el filtro queda oculto y se ven todos los proyectos.
document.addEventListener('DOMContentLoaded', function () {
    const filtro = document.querySelector('.filtro-roles');
    if (!filtro) return;

    const botones = filtro.querySelectorAll('.filtro-roles__boton');
    const proyectos = document.querySelectorAll('.portfolio [data-roles]');
    const estado = document.querySelector('.filtro-roles__estado');

    const filtrar = (rol) => {
        let visibles = 0;
        proyectos.forEach((proyecto) => {
            const mostrar = rol === 'todos' || proyecto.dataset.roles.split(' ').includes(rol);
            proyecto.hidden = !mostrar;
            if (mostrar) visibles++;
        });

        // Un grupo o un bloque sin proyectos visibles se oculta entero, con su título
        document.querySelectorAll('.personales__grupo, .portafolio__bloque').forEach((contenedor) => {
            contenedor.hidden = !contenedor.querySelector('[data-roles]:not([hidden])');
        });

        botones.forEach((boton) => {
            boton.setAttribute('aria-pressed', boton.dataset.rol === rol ? 'true' : 'false');
        });

        if (estado) {
            estado.textContent = rol === 'todos' ? '' : filtro.dataset.estado.replace('{n}', visibles);
        }
    };

    botones.forEach((boton) => {
        boton.addEventListener('click', () => filtrar(boton.dataset.rol));
    });

    filtro.hidden = false;
});
