// Esperar a que el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", function () {
    // Datos para el gráfico de productos
    Chart.defaults.color = '#fff';
    const productCtx = document.getElementById("productChart").getContext("2d");
    const productChart = new Chart(productCtx, {
        type: "pie",
        data: {
            labels: ["Tarjeta CMR", "Cuenta Corriente", "Cuenta de Ahorro"],
            datasets: [
                {
                    data: [45, 30, 25],
                    backgroundColor: ["#0066b2", "#00a651", "#f7941d"],
                    borderWidth: 2,
                    hoverBorderColor: "#fff"
                },
            ],
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                
                    position: "bottom",
                },
                title: {
                    display: true,
                    text: "Distribución por Producto (%)",
                    color: "#fff"
                },
            },
        },
    });

    // Datos para el gráfico de conversión
    const conversionCtx = document
        .getElementById("conversionChart")
        .getContext("2d");
    const conversionChart = new Chart(conversionCtx, {
        type: "line",
        data: {
            labels: ["Enero", "Febrero", "Marzo", "Abril"],
            datasets: [
                {
                    label: "Tasa de Conversión (%)",
                    data: [18, 21, 24, 27],
                    borderColor: "#fff",
                    backgroundColor: "rgba(236, 236, 236, 0.1)",
                    tension: 0.4,
                    fill: true,
                },
            ],
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 40,
                },
            },
        },
    });
});
