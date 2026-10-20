// Gráficos SVG dibujados a partir de la tabla de datos que acompaña a cada uno.
// Sin JavaScript se ve la tabla; con JavaScript la tabla pasa a "Ver datos" debajo del gráfico.
(function () {
    const SVG = 'http://www.w3.org/2000/svg';
    const idioma = document.documentElement.lang || 'es';
    const en = idioma === 'en';
    const textoVerDatos = en ? 'View data' : 'Ver datos';
    const textoPista = en ? 'Use the arrow keys to move through the data.' : 'Usa las flechas para recorrer los datos.';
    // El español separa el símbolo de porcentaje con un espacio (2,3 %), como en las etiquetas de datos
    const conUnidad = (v, unidad) => `${v.toLocaleString(idioma, { maximumFractionDigits: 1 })}${unidad === '%' && !en ? ' ' : ''}${unidad}`;
    let contador = 0;

    const crear = (etiqueta, atributos, padre) => {
        const el = document.createElementNS(SVG, etiqueta);
        Object.entries(atributos || {}).forEach(([k, v]) => el.setAttribute(k, v));
        if (padre) padre.appendChild(el);
        return el;
    };

    // Colores por defecto como atributos del SVG: el CSS del tema los sobrescribe, pero si el CSS
    // no llega (caché vieja) el gráfico sigue legible en lugar de salir en negro
    const COLOR = { azul: '#1d4ed8', naranja: '#ea6a1a', gris: '#b4bccb' };
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
            inicio: celda.dataset.inicio,
            fin: celda.dataset.fin,
        };
    });

    // Tooltip compartido por todos los gráficos
    const tooltip = document.createElement('div');
    tooltip.className = 'grafico__tooltip';
    tooltip.setAttribute('role', 'status');
    tooltip.hidden = true;

    const mostrarTooltip = (contenido, evento, marca) => {
        // role="status" anuncia cada cambio de texto: solo se reescribe si cambia, no en cada movimiento del ratón
        if (tooltip.textContent !== contenido) tooltip.textContent = contenido;
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

    // Una sola parada de tabulador por gráfico: las flechas, Inicio y Fin recorren las marcas.
    // marcas: [{ el, texto, zona? }]; `zona` recibe el ratón si es más grande que la marca.
    const navegable = (svg, figura, marcas, efectos = {}) => {
        let actual = Math.min(Number(figura.dataset.actual || 0), marcas.length - 1);
        const mostrar = (i, evento) => {
            actual = i;
            figura.dataset.actual = i;
            marcas.forEach((m, j) => m.el.classList.toggle('grafico__marca--activa', j === i && !evento));
            if (efectos.mostrar) efectos.mostrar(i);
            mostrarTooltip(evento ? marcas[i].texto : `${marcas[i].texto} (← →)`, evento, marcas[i].el);
        };
        const esconder = () => {
            marcas.forEach((m) => m.el.classList.remove('grafico__marca--activa'));
            if (efectos.ocultar) efectos.ocultar();
            ocultarTooltip();
        };
        marcas.forEach((m, i) => {
            if (!m.zona) return;
            m.zona.addEventListener('pointermove', (e) => mostrar(i, e));
            m.zona.addEventListener('pointerleave', esconder);
        });
        svg.setAttribute('tabindex', '0');
        svg.addEventListener('focus', () => mostrar(actual));
        svg.addEventListener('blur', esconder);
        svg.addEventListener('keydown', (e) => {
            const pasos = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1 };
            let i = null;
            if (e.key in pasos) i = actual + pasos[e.key];
            else if (e.key === 'Home') i = 0;
            else if (e.key === 'End') i = marcas.length - 1;
            if (i === null) return;
            e.preventDefault();
            mostrar(Math.max(0, Math.min(marcas.length - 1, i)));
        });
        return { mostrar, esconder };
    };

    // Barras horizontales: etiqueta encima de cada barra para que nunca se pisen en móvil
    const dibujarBarras = (svg, filas, ancho, figura) => {
        const maximo = Math.max(...filas.map((f) => f.valor));
        const reservaValor = 72;
        const util = ancho - reservaValor;
        const altoBarra = 14;
        const paso = 44;
        const marcas = filas.map((f, i) => {
            const y = i * paso;
            const largo = Math.max(2, (f.valor / maximo) * util);
            const grupo = crear('g', { class: 'grafico__fila' }, svg);
            const zona = crear('rect', { x: 0, y, width: ancho, height: paso - 4, class: 'grafico__zona', fill: 'transparent' }, grupo);
            texto(grupo, 0, y + 14, f.nombre, 'grafico__texto');
            const marca = barra(grupo, 0, y + 20, largo, altoBarra, `grafico__marca grafico__marca--${f.color}`, ['der']);
            texto(grupo, largo + 6, y + 32, f.etiqueta, 'grafico__texto grafico__texto--valor');
            return { el: marca, zona, texto: `${f.nombre}: ${f.etiqueta}` };
        });
        navegable(svg, figura, marcas);
        return filas.length * paso;
    };

    // Barra apilada al 100 %, con leyenda que lleva los valores
    const dibujarApilada = (svg, filas, ancho, figura) => {
        const total = filas.reduce((s, f) => s + f.valor, 0);
        const separacion = 2;
        const alto = 28;
        let x = 0;
        const marcas = filas.map((f, i) => {
            const largo = (f.valor / total) * (ancho - separacion * (filas.length - 1));
            const redondear = [];
            if (i === 0) redondear.push('izq');
            if (i === filas.length - 1) redondear.push('der');
            const marca = barra(svg, x, 0, Math.max(largo, 2), alto, `grafico__marca grafico__marca--${f.color}`, redondear);
            // Zona táctil de al menos 24 px aunque el segmento sea más estrecho (WCAG 2.5.8)
            const ancho24 = Math.max(largo, 24);
            const zona = crear('rect', { x: Math.min(ancho - ancho24, Math.max(0, x + largo / 2 - ancho24 / 2)), y: 0, width: ancho24, height: alto, class: 'grafico__zona', fill: 'transparent' }, svg);
            x += largo + separacion;
            return { el: marca, zona, texto: `${f.nombre}: ${f.etiqueta}` };
        });
        navegable(svg, figura, marcas);
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

    // Pendiente entre dos valores: antes a la izquierda (etiqueta arriba) y después a la derecha (etiqueta abajo)
    const dibujarPendiente = (svg, filas, ancho, figura) => {
        const arr = 40;
        const aba = 40;
        const alto = 160;
        const maximo = Math.max(...filas.map((f) => f.valor));
        const yDe = (v) => arr + (1 - v / maximo) * (alto - arr - aba);
        const [a, b] = filas;
        const x0 = 8;
        const x1 = ancho - 8;
        crear('line', { x1: x0, y1: yDe(a.valor), x2: x1, y2: yDe(b.valor), class: 'grafico__linea', stroke: COLOR.gris, 'stroke-width': 2 }, svg);
        const marcas = [[a, x0, 'start', -24], [b, x1, 'end', 20]].map(([f, x, ancla, dy]) => {
            const y = yDe(f.valor);
            const punto = crear('circle', { cx: x, cy: y, r: 6, class: `grafico__marca grafico__marca--${f.color}`, fill: colorDe(`--${f.color}`) }, svg);
            texto(svg, x, y + dy, f.nombre, 'grafico__texto', ancla);
            texto(svg, x, y + dy + 16, f.etiqueta, 'grafico__texto grafico__texto--valor', ancla);
            const zona = crear('circle', { cx: x, cy: y, r: 16, class: 'grafico__zona', fill: 'transparent' }, svg);
            return { el: punto, zona, texto: `${f.nombre}: ${f.etiqueta}` };
        });
        navegable(svg, figura, marcas);
        return alto;
    };

    // Línea de tiempo por empresa; "fin" vacío significa hasta hoy
    const dibujarGantt = (svg, filas, ancho, figura) => {
        const hoy = new Date();
        const mes = (t) => {
            if (!t) return hoy.getFullYear() * 12 + hoy.getMonth();
            const [anio, m] = t.split('-').map(Number);
            return anio * 12 + m - 1;
        };
        const anioIni = Math.floor(Math.min(...filas.map((f) => mes(f.inicio))) / 12);
        const anioFin = Math.floor(Math.max(...filas.map((f) => mes(f.fin))) / 12) + 1;
        const xDe = (m) => ((m - anioIni * 12) / ((anioFin - anioIni) * 12)) * ancho;
        const paso = 40;
        const altoFilas = filas.length * paso;
        const anchoAnio = ancho / (anioFin - anioIni);
        for (let anio = anioIni; anio <= anioFin; anio += 1) {
            const x = xDe(anio * 12);
            crear('line', { x1: x, x2: x, y1: 0, y2: altoFilas, class: 'grafico__rejilla', stroke: '#d6e0fa' }, svg);
            // Con poco ancho, un año sí y otro no
            if (anio < anioFin && (anchoAnio >= 40 || (anio - anioIni) % 2 === 0)) {
                texto(svg, x + 2, altoFilas + 14, String(anio), 'grafico__eje');
            }
        }
        const marcas = filas.map((f, i) => {
            const y = i * paso;
            const x0 = xDe(mes(f.inicio));
            const x1 = xDe(mes(f.fin) + 1);
            const grupo = crear('g', { class: 'grafico__fila' }, svg);
            const zona = crear('rect', { x: 0, y, width: ancho, height: paso - 4, class: 'grafico__zona', fill: 'transparent' }, grupo);
            const etiqueta = texto(grupo, x0, y + 13, f.nombre, 'grafico__texto');
            // Si el nombre no cabe a la derecha del inicio, se alinea al final de la barra
            if (x0 + etiqueta.getComputedTextLength() > ancho) {
                etiqueta.setAttribute('x', x1);
                etiqueta.setAttribute('text-anchor', 'end');
            }
            const marca = barra(grupo, x0, y + 19, Math.max(2, x1 - x0), 12, `grafico__marca grafico__marca--${f.color}`, ['izq', 'der']);
            return { el: marca, zona, texto: `${f.nombre}: ${f.etiqueta}` };
        });
        navegable(svg, figura, marcas);
        return altoFilas + 20;
    };

    // Línea de una serie con cuadrícula tenue, etiquetas en los extremos y cruz al pasar el ratón
    const dibujarLinea = (svg, filas, ancho, figura) => {
        // Alto proporcional al ancho (con tope) para que la pendiente se lea igual en móvil y en escritorio
        const alto = Math.round(Math.min(240, Math.max(160, ancho * 0.4)));
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
            texto(svg, margen.izq - 6, yDe(v) + 4, conUnidad(v, unidad), 'grafico__eje', 'end');
        }
        // Marcas del eje X sin solaparse: si una choca con la anterior se omite (la última siempre se queda)
        const marcasX = (figura.dataset.marcasX || '').split(',').map(Number).filter((n) => !Number.isNaN(n));
        const puestas = [];
        marcasX.forEach((i, k) => {
            const ancla = i === 0 ? 'start' : i === filas.length - 1 ? 'end' : 'middle';
            const t = texto(svg, xDe(i), alto - 6, filas[i].nombre, 'grafico__eje', ancla);
            const caja = t.getBBox();
            const previa = puestas[puestas.length - 1];
            if (previa && caja.x < previa.fin + 8) {
                if (k === marcasX.length - 1) {
                    previa.el.remove();
                    puestas.pop();
                } else {
                    t.remove();
                    return;
                }
            }
            puestas.push({ el: t, fin: caja.x + caja.width });
        });

        // Anotación de un hecho (p. ej. "14|COVID-19"): línea discontinua en ese punto
        const [indice, nota] = (figura.dataset.anotacion || '').split('|');
        if (nota) {
            const x = xDe(Number(indice));
            crear('line', { x1: x, x2: x, y1: margen.arr, y2: margen.arr + plotAlto, class: 'grafico__anotacion', stroke: '#4b5563', 'stroke-dasharray': '4 3' }, svg);
            texto(svg, x - 4, margen.arr + 10, nota, 'grafico__eje', 'end');
        }

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
        if (figura.dataset.actual === undefined) figura.dataset.actual = filas.length - 1;
        const nav = navegable(svg, figura, filas.map((f) => ({ el: marcador, texto: `${f.nombre}: ${f.etiqueta}` })), {
            mostrar: (i) => {
                cruz.setAttribute('x1', xDe(i));
                cruz.setAttribute('x2', xDe(i));
                cruz.setAttribute('visibility', 'visible');
                marcador.setAttribute('cx', xDe(i));
                marcador.setAttribute('cy', yDe(filas[i].valor));
                marcador.setAttribute('visibility', 'visible');
            },
            ocultar: () => {
                cruz.setAttribute('visibility', 'hidden');
                marcador.setAttribute('visibility', 'hidden');
            },
        });
        zona.addEventListener('pointermove', (e) => {
            const caja = svg.getBoundingClientRect();
            const escala = ancho / caja.width;
            const xLocal = (e.clientX - caja.left) * escala;
            const i = Math.round(((xLocal - margen.izq) / plotAncho) * (filas.length - 1));
            nav.mostrar(Math.max(0, Math.min(filas.length - 1, i)), e);
        });
        zona.addEventListener('pointerleave', nav.esconder);
        return alto;
    };

    const DIBUJOS = { barras: dibujarBarras, apilada: dibujarApilada, linea: dibujarLinea, pendiente: dibujarPendiente, gantt: dibujarGantt };

    const dibujar = (figura) => {
        const lienzo = figura.querySelector('.grafico__lienzo');
        const tabla = figura.querySelector('table');
        const ancho = Math.round(lienzo.clientWidth);
        if (!ancho) return;
        // Al redibujar (zoom, giro del móvil) el foco vuelve al gráfico nuevo y el tooltip no queda flotando
        const teniaFoco = lienzo.contains(document.activeElement);
        ocultarTooltip();
        const anterior = figura.querySelector('.grafico__leyenda');
        if (anterior) anterior.remove();
        lienzo.textContent = '';
        const svg = crear('svg', { class: 'grafico__svg', role: 'group', 'aria-labelledby': `${figura.id}-titulo ${figura.id}-pista` });
        lienzo.appendChild(svg);
        const alto = DIBUJOS[figura.dataset.tipo](svg, leerFilas(tabla), ancho, figura);
        svg.setAttribute('viewBox', `0 0 ${ancho} ${alto}`);
        svg.setAttribute('width', ancho);
        svg.setAttribute('height', alto);
        figura.dataset.ancho = ancho;
        if (teniaFoco) svg.focus();
    };

    const preparar = (figura) => {
        const tabla = figura.querySelector('table');
        if (!tabla || !DIBUJOS[figura.dataset.tipo]) return;
        contador += 1;
        if (!figura.id) figura.id = `grafico-${contador}`;
        const titulo = figura.querySelector('figcaption');
        titulo.id = `${figura.id}-titulo`;
        const pista = document.createElement('span');
        pista.id = `${figura.id}-pista`;
        pista.className = 'grafico__pista';
        pista.textContent = textoPista;
        const lienzo = document.createElement('div');
        lienzo.className = 'grafico__lienzo';
        titulo.after(pista, lienzo);
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
