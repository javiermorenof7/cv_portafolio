// Elementos del DOM
const header = document.getElementById('header');
const navDarkMode = document.getElementById('header__nav-darckmode');
const darkModeSwitch = document.getElementById('dark_mode_menu'); // Botón de alternar

// Función para ACTIVAR el modo oscuro
const enableDarkMode = () => {
    header.classList.add('header_drackmode');
    navDarkMode.classList.add('header__nav-darckmode');
    localStorage.setItem('darkMode', 'enabled'); // Guardar en localStorage
};

// Función para DESACTIVAR el modo oscuro
const disableDarkMode = () => {
    header.classList.remove('header_drackmode');
    navDarkMode.classList.remove('header__nav-darckmode');
    localStorage.setItem('darkMode', 'disabled'); // Guardar en localStorage
};

// Verificar el estado al cargar la página
const checkDarkMode = () => {
    const darkModeStatus = localStorage.getItem('darkMode');
    
    if (darkModeStatus === 'enabled') {
        enableDarkMode();
    } else {
        disableDarkMode();
    }
};

// Alternar modo oscuro al hacer clic
darkModeSwitch.addEventListener('click', () => {
    if (localStorage.getItem('darkMode') !== 'enabled') {
        enableDarkMode();
    } else {
        disableDarkMode();
    }
});

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', checkDarkMode);