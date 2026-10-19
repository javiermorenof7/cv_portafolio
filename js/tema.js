// Tema claro u oscuro: sigue el del sistema del visitante salvo que elija uno con el botón.
// Se carga en <head> sin defer para aplicar el tema antes de pintar la página.
(function () {
    const CLAVE = 'tema';
    const raiz = document.documentElement;
    const sistemaOscuro = window.matchMedia('(prefers-color-scheme: dark)');

    const leerGuardado = () => {
        try {
            const valor = localStorage.getItem(CLAVE);
            return valor === 'dark' || valor === 'light' ? valor : null;
        } catch (e) {
            return null;
        }
    };

    const guardar = (tema) => {
        try {
            localStorage.setItem(CLAVE, tema);
        } catch (e) {
            // Sin almacenamiento (modo privado): el tema vale solo para esta visita
        }
    };

    const aplicar = (tema) => {
        raiz.dataset.theme = tema;
        const boton = document.getElementById('dark_mode_menu');
        if (boton) {
            boton.setAttribute('aria-pressed', tema === 'dark' ? 'true' : 'false');
        }
    };

    // La versión anterior guardaba "darkMode": "enabled" solo si el visitante eligió el modo
    // oscuro, pero "disabled" en cada visita, así que solo se conserva "enabled"
    try {
        if (localStorage.getItem('darkMode') === 'enabled' && !leerGuardado()) {
            guardar('dark');
        }
        localStorage.removeItem('darkMode');
    } catch (e) {
        // Sin almacenamiento
    }

    aplicar(leerGuardado() || (sistemaOscuro.matches ? 'dark' : 'light'));

    // Si el visitante no eligió tema, la página cambia junto con el sistema
    const alCambiarSistema = (evento) => {
        if (!leerGuardado()) {
            aplicar(evento.matches ? 'dark' : 'light');
        }
    };
    if (sistemaOscuro.addEventListener) {
        sistemaOscuro.addEventListener('change', alCambiarSistema);
    } else if (sistemaOscuro.addListener) {
        // Safari 13 y anteriores
        sistemaOscuro.addListener(alCambiarSistema);
    }

    document.addEventListener('DOMContentLoaded', () => {
        const boton = document.getElementById('dark_mode_menu');
        if (!boton) return;
        aplicar(raiz.dataset.theme);
        boton.addEventListener('click', () => {
            const nuevo = raiz.dataset.theme === 'dark' ? 'light' : 'dark';
            guardar(nuevo);
            aplicar(nuevo);
        });
    });
})();
