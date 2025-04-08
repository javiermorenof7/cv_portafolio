// Elementos del DOM
document.addEventListener('DOMContentLoaded', function() {
    const body = document.body;
    const header = document.getElementById('header');
    const navDarkMode = document.getElementById('header__nav');
    const menuItems = document.querySelectorAll('.header__nav-item');
    const darkModeSwitch = document.getElementById('dark_mode_menu');
    const profileSection = document.querySelector('.profile');
    const portfolioSection = document.querySelector('.portfolio');
    const experienciaSection = document.querySelector('.experiencia');
    const formSection = document.querySelector('.form');
    const menuButton = document.querySelector('.header__open-nav-buttom');
    const portfolioProjects = document.querySelectorAll('.portfolio__project');
    const experienciaItems = document.querySelectorAll('.experiencia__container-item');

    // Función para ACTIVAR el modo oscuro
    const enableDarkMode = () => {
        // Cambiar header
        header.classList.remove('header');
        header.classList.add('header_drackmode');
        
        // Cambiar nav
        if (navDarkMode) {
            navDarkMode.classList.add('header__nav-darckmode');
        }
        
        // Agregar clases CSS para portfolio y experiencia (en modo oscuro, mantener su diseño original)
        // Como ya son oscuros por defecto, simplemente quitamos las clases de modo claro si existieran
        if (portfolioSection) {
            portfolioSection.classList.remove('light-mode-section');
            portfolioSection.classList.remove('light-mode-portfolio');
        }
        
        if (experienciaSection) {
            experienciaSection.classList.remove('light-mode-section');
            experienciaSection.classList.remove('light-mode-experiencia');
        }
        
        // Cambiar color del botón del menú
        if (menuButton) {
            menuButton.style.color = '#fff';
        }
        
        // Cambiar fondo del body
        body.style.backgroundColor = '#121a2e';
        body.style.color = '#e2eaff';
        
        // Cambiar estilo del perfil
        if (profileSection) {
            const dataContainer = profileSection.querySelector('.porfile__data-container');
            if (dataContainer) {
                dataContainer.style.backgroundColor = '#18233f';
                dataContainer.style.color = '#fff';
            }
            
            const skillNames = profileSection.querySelectorAll('.profile__skill-name');
            skillNames.forEach(item => {
                item.style.color = '#8aabff';
            });
            
            const h1Elements = profileSection.querySelectorAll('h1');
            h1Elements.forEach(h1 => {
                h1.style.color = '#8aabff';
            });
        }
        
        // Mejorar el modo oscuro para la sección Portfolio
        if (portfolioSection) {
            // El fondo ya es oscuro, ajustamos los elementos internos
            const projectsHeadings = portfolioSection.querySelectorAll('h2');
            projectsHeadings.forEach(heading => {
                heading.style.color = '#8aabff';
            });
            
            // Mejorar contraste de los proyectos
            if (portfolioProjects) {
                portfolioProjects.forEach(project => {
                    project.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.5)';
                    project.style.border = '1px solid #2a3a5f';
                    
                    // Mejorar elementos internos
                    const paragraphs = project.querySelectorAll('p');
                    paragraphs.forEach(p => {
                        p.style.color = '#e2eaff';
                    });
                    
                    // Mejorar tablas
                    const tables = project.querySelectorAll('table');
                    tables.forEach(table => {
                        table.style.borderColor = '#2a3a5f';
                        table.style.color = '#e2eaff';
                    });
                    
                    // Mejorar textos de listas
                    const listItems = project.querySelectorAll('li');
                    listItems.forEach(item => {
                        item.style.color = '#e2eaff';
                    });
                });
            }
        }
        
        // Mejorar el modo oscuro para la sección Experiencia
        if (experienciaSection) {
            // Mejorar contrastes y elementos internos
            if (experienciaItems) {
                experienciaItems.forEach(item => {
                    item.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.5)';
                    item.style.border = '1px solid #2a3a5f';
                    
                    // Mejorar elementos internos
                    const paragraphs = item.querySelectorAll('p');
                    paragraphs.forEach(p => {
                        p.style.color = '#e2eaff';
                    });
                    
                    // Mejorar textos de listas
                    const listItems = item.querySelectorAll('li');
                    listItems.forEach(li => {
                        li.style.color = '#e2eaff';
                    });
                    
                    // Resaltar títulos y elementos importantes
                    const strongs = item.querySelectorAll('strong');
                    strongs.forEach(strong => {
                        strong.style.color = '#8aabff';
                    });
                });
            }
            
            // Ajustar títulos principales de la sección
            const experienciaHeadings = experienciaSection.querySelectorAll('h2:not(.portfolio__proyect-name)');
            experienciaHeadings.forEach(heading => {
                heading.style.color = '#8aabff';
            });
        }
        
        // Cambiar estilo del formulario
        if (formSection) {
            formSection.style.backgroundColor = '#121a2e';
            formSection.style.color = '#fff';
            
            const inputs = formSection.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                input.style.backgroundColor = '#18233f';
                input.style.color = '#fff';
                input.style.border = '1px solid #2a3a5f';
            });
        }
        
        localStorage.setItem('darkMode', 'enabled'); // Guardar en localStorage
    };

    // Función para DESACTIVAR el modo oscuro (activar modo claro)
    const disableDarkMode = () => {
        // Restaurar header
        header.classList.remove('header_drackmode');
        header.classList.add('header');
        
        // Restaurar nav
        if (navDarkMode) {
            navDarkMode.classList.remove('header__nav-darckmode');
        }
        
        // Agregar clases CSS para modo claro en portfolio y experiencia
        if (portfolioSection) {
            portfolioSection.classList.add('light-mode-section');
            portfolioSection.classList.add('light-mode-portfolio');
        }
        
        if (experienciaSection) {
            experienciaSection.classList.add('light-mode-section');
            experienciaSection.classList.add('light-mode-experiencia');
        }
        
        // Restaurar color del botón del menú
        if (menuButton) {
            menuButton.style.color = '#000';
        }
        
        // Restaurar fondo del body
        body.style.backgroundColor = '#e2eaff';
        body.style.color = 'initial';
        
        // Restaurar estilo del perfil
        if (profileSection) {
            const dataContainer = profileSection.querySelector('.porfile__data-container');
            if (dataContainer) {
                dataContainer.style.backgroundColor = '#fff';
                dataContainer.style.color = 'initial';
            }
            
            const skillNames = profileSection.querySelectorAll('.profile__skill-name');
            skillNames.forEach(item => {
                item.style.color = '#48e';
            });
            
            const h1Elements = profileSection.querySelectorAll('h1');
            h1Elements.forEach(h1 => {
                h1.style.color = '#26e';
            });
        }
        
        // Restaurar estilos de Portfolio
        if (portfolioSection) {
            const projectsHeadings = portfolioSection.querySelectorAll('h2');
            projectsHeadings.forEach(heading => {
                heading.style.color = '';
            });
            
            // Restaurar estilos de proyectos
            if (portfolioProjects) {
                portfolioProjects.forEach(project => {
                    project.style.boxShadow = '';
                    project.style.border = '';
                    
                    // Restaurar párrafos
                    const paragraphs = project.querySelectorAll('p');
                    paragraphs.forEach(p => {
                        p.style.color = '';
                    });
                    
                    // Restaurar tablas
                    const tables = project.querySelectorAll('table');
                    tables.forEach(table => {
                        table.style.borderColor = '';
                        table.style.color = '';
                    });
                    
                    // Restaurar listas
                    const listItems = project.querySelectorAll('li');
                    listItems.forEach(item => {
                        item.style.color = '';
                    });
                });
            }
        }
        
        // Restaurar estilos de Experiencia
        if (experienciaSection) {
            // Restaurar elementos de experiencia
            if (experienciaItems) {
                experienciaItems.forEach(item => {
                    item.style.boxShadow = '';
                    item.style.border = '';
                    
                    // Restaurar párrafos
                    const paragraphs = item.querySelectorAll('p');
                    paragraphs.forEach(p => {
                        p.style.color = '';
                    });
                    
                    // Restaurar listas
                    const listItems = item.querySelectorAll('li');
                    listItems.forEach(li => {
                        li.style.color = '';
                    });
                    
                    // Restaurar énfasis
                    const strongs = item.querySelectorAll('strong');
                    strongs.forEach(strong => {
                        strong.style.color = '';
                    });
                });
            }
            
            // Restaurar títulos principales
            const experienciaHeadings = experienciaSection.querySelectorAll('h2:not(.portfolio__proyect-name)');
            experienciaHeadings.forEach(heading => {
                heading.style.color = '';
            });
        }
        
        // Restaurar estilo del formulario
        if (formSection) {
            formSection.style.backgroundColor = '';
            formSection.style.color = '';
            
            const inputs = formSection.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                input.style.backgroundColor = '';
                input.style.color = '';
                input.style.border = '';
            });
        }
        
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
        
        // Aplicar Chart.js colores según modo
        adjustChartColors(darkModeStatus === 'enabled');
    };
    
    // Función para ajustar colores de gráficos según el modo
    const adjustChartColors = (isDarkMode) => {
        if (typeof Chart !== 'undefined') {
            if (isDarkMode) {
                // Colores para modo oscuro (default)
                Chart.defaults.color = '#fff';
            } else {
                // Colores para modo claro
                Chart.defaults.color = '#333';
            }
            
            // Actualizar gráficos existentes si están disponibles
            const charts = document.querySelectorAll('canvas');
            if (charts.length > 0) {
                charts.forEach(canvas => {
                    const chartInstance = Chart.getChart(canvas);
                    if (chartInstance) {
                        chartInstance.update();
                    }
                });
            }
        }
    };

    // Alternar modo oscuro al hacer clic
    if (darkModeSwitch) {
        darkModeSwitch.addEventListener('click', () => {
            const currentMode = localStorage.getItem('darkMode');
            if (currentMode !== 'enabled') {
                enableDarkMode();
                adjustChartColors(true);
            } else {
                disableDarkMode();
                adjustChartColors(false);
            }
        });
    }

    // Mejorar el menú desplegable
    const enhanceMenu = () => {
        const menuCheckbox = document.getElementById('open-menu');
        const menuNav = document.querySelector('.header__nav');
        
        if (!menuCheckbox || !menuNav) return;
        
        // Asegurar que el menú tiene estilos adecuados en modo oscuro
        menuCheckbox.addEventListener('change', function() {
            if (this.checked) {
                if (localStorage.getItem('darkMode') === 'enabled') {
                    menuNav.style.backgroundColor = '#18233f';
                } else {
                    menuNav.style.backgroundColor = '#fff';
                }
                
                // Animar la apertura del menú
                menuNav.style.transition = 'all 0.3s ease-in-out';
                menuNav.style.opacity = '1';
                
                // Ajustar la altura de los elementos de menú
                const menuItems = menuNav.querySelectorAll('.header__nav-item');
                menuItems.forEach(item => {
                    item.style.padding = '15px';
                    item.style.borderBottom = '1px solid #eee';
                });
            } else {
                menuNav.style.opacity = '0';
            }
        });
    };

    // Inicializar
    checkDarkMode();
    enhanceMenu();
});