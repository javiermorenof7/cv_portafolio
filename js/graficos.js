// Gráficos SVG dibujados a partir de la tabla de datos que acompaña a cada uno.
// Sin JavaScript se ve la tabla; con JavaScript la tabla pasa a "Ver datos" debajo del gráfico.
(function () {
    const SVG = 'http://www.w3.org/2000/svg';
    const idioma = document.documentElement.lang || 'es';
    const textoVerDatos = idioma === 'en' ? 'View data' : 'Ver datos';

    const crear = (etiqueta, atributos, padre) => {
        const el = document.createElementNS(SVG, etiqueta);
        Object.entries(atributos || {}).forEach(([k, v]) => el.setAttribute(k, v));
        if (padre) padre.appendChild(el);
        return el;
    };

    // Colores por defecto como atributos del SVG: el CSS del tema los sobrescribe, pero si el CSS
    // no llega (caché vieja) el gráfico sigue legible en lugar de salir en negro
    const COLOR = { azul: '#2266ee', naranja: '#c2410c', gris: '#7b8496' };
    const colorDe = (clase) => COLOR[(clase.match(/--(azul|naranja|gris)/) || [])[1]] || COLOR.azul;

    const texto = (padre, x, y, contenido, clase, ancla) => {
        const t = crear('text', { x, y, class: clase, 'text-anchor': ancla || 'start', fill: 'currentColor', 'font-size': 12 }, padre);
        t.textContent = contenido;
        return t;
    };

    // Rectángulo con las esquinas del extremo de datos redondeadas (4px) y la base recta
    const barra = (padre, x, y, ancho, alto, clase, redondear) => {
        const r = Math.min(4, ancho / 2, alto / 2);
        const izq = redondear.includes('izq') ? r : 0;
        const der = redondear.includes('der') ? r : 0;
        const d = [
            `M${x + izq},${y}`, `H${x + ancho - der}`,
            der ? `Q${x + ancho},${y} ${x + ancho},${y + der}` : '',
            `V${y + alto - der}`,
            der ? `Q${x + ancho},${y + alto} ${x + ancho - der},${y + alto}` : '',
            `H${x + izq}`,
            izq ? `Q${x},${y + alto} ${x},${y + alto - izq}` : '',
            `V${y + izq}`,
            izq ? `Q${x},${y} ${x + izq},${y}` : '',
            'Z',
        ].join(' ');
        return crear('path', { d, class: clase, fill: colorDe(clase) }, padre);
    };

    const leerFilas = (tabla) => Array.from(tabla.tBodies[0].rows).map((fila) => {
        const celda = fila.cells[1];
        return {
            nombre: fila.cells[0].textContent.trim(),
            valor: parseFloat(celda.dataset.valor),
            etiqueta: celda.textContent.trim(),
            color: fila.dataset.color || 'azul',
        };
    });

    // Tooltip compartido por todos los gráficos
    const tooltip = document.createElement('div');
    tooltip.className = 'grafico__tooltip';
    tooltip.setAttribute('role', 'status');
    tooltip.hidden = true;

    const mostrarTooltip = (contenido, evento, marca) => {
        tooltip.textContent = contenido;
        tooltip.hidden = false;
        let x;
        let y;
        if (evento && evento.clientX !== undefined) {
            x = evento.clientX;
            y = evento.clientY;
        } else {
            const caja = marca.getBoundingClientRect();
            x = caja.left + caja.width / 2;
            y = caja.top;
        }
        const ancho = tooltip.offsetWidth;
        tooltip.style.left = `${Math.max(8, Math.min(window.innerWidth - ancho - 8, x - ancho / 2))}px`;
        tooltip.style.top = `${Math.max(8, y - tooltip.offsetHeight - 12)}px`;
    };

    const ocultarTooltip = () => {
        tooltip.hidden = true;
    };

    const interactivo = (marca, contenido) => {
        marca.setAttribute('tabindex', '0');
        marca.setAttribute('role', 'img');
        marca.setAttribute('aria-label', contenido);
        marca.addEventListener('pointerenter', (e) => mostrarTooltip(contenido, e, marca));
        marca.addEventListener('pointermove', (e) => mostrarTooltip(contenido, e, marca));
        marca.addEventListener('pointerleave', ocultarTooltip);
        marca.addEventListener('focus', () => mostrarTooltip(contenido, null, marca));
        marca.addEventListener('blur', ocultarTooltip);
    };

    // Barras horizontales: etiqueta encima de cada barra para que nunca se pisen en móvil
    const dibujarBarras = (svg, filas, ancho) => {
        const maximo = Math.max(...filas.map((f) => f.valor));
        const reservaValor = 72;
        const util = ancho - reservaValor;
        const altoBarra = 14;
        const paso = 44;
        filas.forEach((f, i) => {
            const y = i * paso;
            const largo = Math.max(2, (f.valor / maximo) * util);
            const grupo = crear('g', { class: 'grafico__fila' }, svg);
            crear('rect', { x: 0, y, width: ancho, height: paso - 4, class: 'grafico__zona', fill: 'transparent' }, grupo);
            texto(grupo, 0, y + 14, f.nombre, 'grafico__texto');
            barra(grupo, 0, y + 20, largo, altoBarra, `grafico__marca grafico__marca--${f.color}`, ['der']);
            texto(grupo, largo + 6, y + 32, f.etiqueta, 'grafico__texto grafico__texto--valor');
            interactivo(grupo, `${f.nombre}: ${f.etiqueta}`);
        });
        return filas.length * paso;
    };

    // Barra apilada al 100 %, con leyenda que lleva los valores
    const dibujarApilada = (svg, filas, ancho, figura) => {
        const total = filas.reduce((s, f) => s + f.valor, 0);
        const separacion = 2;
        const alto = 28;
        let x = 0;
        filas.forEach((f, i) => {
            const largo = (f.valor / total) * (ancho - separacion * (filas.length - 1));
            const redondear = [];
            if (i === 0) redondear.push('izq');
            if (i === filas.length - 1) redondear.push('der');
            const marca = barra(svg, x, 0, Math.max(largo, 2), alto, `grafico__marca grafico__marca--${f.color}`, redondear);
            interactivo(marca, `${f.nombre}: ${f.etiqueta}`);
            x += largo + separacion;
        });
        const leyenda = document.createElement('ul');
        leyenda.className = 'grafico__leyenda';
        filas.forEach((f) => {
            const item = document.createElement('li');
            const muestra = document.createElement('span');
            muestra.className = `grafico__muestra grafico__muestra--${f.color}`;
            item.append(muestra, `${f.nombre}: `);
            const valor = document.createElement('strong');
            valor.textContent = f.etiqueta;
            item.append(valor);
            leyenda.appendChild(item);
        });
        figura.querySelector('.grafico__lienzo').after(leyenda);
        return alto;
    };

    // Línea de una serie con cuadrícula tenue, etiquetas en los extremos y cruz al pasar el ratón
    const dibujarLinea = (svg, filas, ancho, figura) => {
        const alto = 180;
        const margen = { izq: 34, der: 46, arr: 18, aba: 26 };
        const plotAncho = ancho - margen.izq - margen.der;
        const plotAlto = alto - margen.arr - margen.aba;
        const maximo = Math.max(...filas.map((f) => f.valor));
        const paso = parseFloat(figura.dataset.pasoEje || '1');
        const tope = Math.ceil((maximo * 1.1) / paso) * paso;
        const unidad = figura.dataset.unidad || '';
        const xDe = (i) => margen.izq + (i / (filas.length - 1)) * plotAncho;
        const yDe = (v) => margen.arr + plotAlto - (v / tope) * plotAlto;

        for (let v = 0; v <= tope + 1e-9; v += paso) {
            crear('line', { x1: margen.izq, x2: margen.izq + plotAncho, y1: yDe(v), y2: yDe(v), class: 'grafico__rejilla', stroke: '#d6e0fa' }, svg);
            texto(svg, margen.izq - 6, yDe(v) + 4, `${v.toLocaleString(idioma)}${unidad}`, 'grafico__eje', 'end');
        }
        const marcasX = (figura.dataset.marcasX || '').split(',').map(Number).filter((n) => !Number.isNaN(n));
        marcasX.forEach((i) => {
            texto(svg, xDe(i), alto - 6, filas[i].nombre, 'grafico__eje', i === 0 ? 'start' : i === filas.length - 1 ? 'end' : 'middle');
        });

        const puntos = filas.map((f, i) => `${xDe(i)},${yDe(f.valor)}`).join(' ');
        crear('polyline', { points: puntos, class: 'grafico__linea', fill: 'none', stroke: COLOR.azul, 'stroke-width': 2 }, svg);

        // Etiquetas directas solo en el primer y el último punto
        const primero = filas[0];
        const ultimo = filas[filas.length - 1];
        crear('circle', { cx: xDe(0), cy: yDe(primero.valor), r: 4, class: 'grafico__punto', fill: COLOR.azul }, svg);
        crear('circle', { cx: xDe(filas.length - 1), cy: yDe(ultimo.valor), r: 4, class: 'grafico__punto', fill: COLOR.azul }, svg);
        texto(svg, xDe(0) + 6, yDe(primero.valor) - 10, primero.etiqueta, 'grafico__texto grafico__texto--valor');
        texto(svg, xDe(filas.length - 1) + 6, yDe(ultimo.valor) + 4, ultimo.etiqueta, 'grafico__texto grafico__texto--valor');

        const cruz = crear('line', { y1: margen.arr, y2: margen.arr + plotAlto, class: 'grafico__cruz', visibility: 'hidden', stroke: '#4b5563' }, svg);
        const marcador = crear('circle', { r: 5, class: 'grafico__punto grafico__punto--activo', visibility: 'hidden', fill: COLOR.azul }, svg);
        const zona = crear('rect', { x: margen.izq, y: margen.arr, width: plotAncho, height: plotAlto, class: 'grafico__zona', fill: 'transparent' }, svg);
        let actual = filas.length - 1;
        const mostrar = (i, evento) => {
            actual = i;
            const f = filas[i];
            [cruz].forEach((l) => { l.setAttribute('x1', xDe(i)); l.setAttribute('x2', xDe(i)); l.setAttribute('visibility', 'visible'); });
            marcador.setAttribute('cx', xDe(i));
            marcador.setAttribute('cy', yDe(f.valor));
            marcador.setAttribute('visibility', 'visible');
            mostrarTooltip(`${f.nombre}: ${f.etiqueta}`, evento, marcador);
        };
        const esconder = () => {
            cruz.setAttribute('visibility', 'hidden');
            marcador.setAttribute('visibility', 'hidden');
            ocultarTooltip();
        };
        zona.addEventListener('pointermove', (e) => {
            const caja = svg.getBoundingClientRect();
            const escala = ancho / caja.width;
            const xLocal = (e.clientX - caja.left) * escala;
            const i = Math.round(((xLocal - margen.izq) / plotAncho) * (filas.length - 1));
            mostrar(Math.max(0, Math.min(filas.length - 1, i)), e);
        });
        zona.addEventListener('pointerleave', esconder);
        svg.setAttribute('tabindex', '0');
        svg.addEventListener('focus', () => mostrar(actual));
        svg.addEventListener('blur', esconder);
        svg.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                e.preventDefault();
                mostrar(Math.max(0, Math.min(filas.length - 1, actual + (e.key === 'ArrowRight' ? 1 : -1))));
            }
        });
        return alto;
    };

    const DIBUJOS = { barras: dibujarBarras, apilada: dibujarApilada, linea: dibujarLinea };

    const dibujar = (figura) => {
        const lienzo = figura.querySelector('.grafico__lienzo');
        const tabla = figura.querySelector('table');
        const ancho = Math.round(lienzo.clientWidth);
        if (!ancho) return;
        const anterior = figura.querySelector('.grafico__leyenda');
        if (anterior) anterior.remove();
        lienzo.textContent = '';
        const svg = crear('svg', { class: 'grafico__svg', role: 'group', 'aria-label': figura.querySelector('figcaption').textContent.trim() });
        lienzo.appendChild(svg);
        const alto = DIBUJOS[figura.dataset.tipo](svg, leerFilas(tabla), ancho, figura);
        svg.setAttribute('viewBox', `0 0 ${ancho} ${alto}`);
        svg.setAttribute('width', ancho);
        svg.setAttribute('height', alto);
        figura.dataset.ancho = ancho;
    };

    const preparar = (figura) => {
        const tabla = figura.querySelector('table');
        if (!tabla || !DIBUJOS[figura.dataset.tipo]) return;
        const lienzo = document.createElement('div');
        lienzo.className = 'grafico__lienzo';
        figura.querySelector('figcaption').after(lienzo);
        const detalles = document.createElement('details');
        detalles.className = 'grafico__datos';
        const resumen = document.createElement('summary');
        resumen.textContent = textoVerDatos;
        detalles.append(resumen, tabla);
        figura.appendChild(detalles);
        dibujar(figura);
        if ('ResizeObserver' in window) {
            new ResizeObserver(() => {
                if (Math.round(lienzo.clientWidth) !== Number(figura.dataset.ancho)) dibujar(figura);
            }).observe(lienzo);
        }
    };

    document.addEventListener('DOMContentLoaded', () => {
        document.body.appendChild(tooltip);
        document.querySelectorAll('figure.grafico').forEach(preparar);
        window.addEventListener('scroll', ocultarTooltip, { passive: true });
    });
})();
