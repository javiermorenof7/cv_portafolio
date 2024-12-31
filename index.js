// Agregar funcionalidad al botón de "Ver más" en la sección de inicio
document.querySelector('#inicio button').addEventListener('click', function() {
    window.location.href = '#portafolio';
});

// Agregar funcionalidad al envío del formulario de contacto
document.querySelector('#contacto form').addEventListener('submit', function(event) {
    event.preventDefault();
    alert('Mensaje enviado con éxito');
});