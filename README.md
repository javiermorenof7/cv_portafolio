# Francisco Javier Garcia Moreno · CV y portafolio

Sitio web con mi CV y portafolio de ingeniero de datos, en español e inglés.

**Sitio:** https://javiermorenof7.github.io/cv_portafolio/

## Qué tiene

- **Perfil:** resumen, el pipeline con el que trabajo (fuentes, bronce, plata, oro y decisiones), tecnologías con dónde usé cada una y formación.
- **Experiencia:** línea de tiempo de Scala Learning, Banco Falabella, Factor IT, BBVA y Aviomar, con cifras y contribuciones clave.
- **Portafolio:** proyectos profesionales y proyectos personales, con un filtro por rol (ingeniería, análisis y ciencia de datos) y gráficos hechos con los datos de cada proyecto.
- **CV en PDF:** en español e inglés, para descargar desde el botón de la cabecera.

El tema claro u oscuro sigue el del sistema de quien visita la página y se puede cambiar con el botón.

## Estructura

| Ruta | Contenido |
| --- | --- |
| `index.html` | Página en español. |
| `links/index-en.html` | Página en inglés. |
| `links/print-es.html`, `links/print-en.html` | Versión del CV para imprimir (dos hojas A4). |
| `css/` | Estilos del sitio, de la experiencia, de los gráficos y de la versión para imprimir; `fonts.css` carga Montserrat desde `fonts/`. |
| `js/tema.js` | Tema claro u oscuro. |
| `js/filtro.js` | Filtro de proyectos por rol. |
| `js/graficos.js` | Dibuja cada gráfico en SVG a partir de su tabla de datos. |
| `js/menuclose.js` | Cierra el menú del móvil al elegir una sección. |
| `img/`, `fonts/`, `pdf/` | Imágenes, tipografía y el CV en PDF. |
| `.githooks/` | Hook que quita los metadatos de las imágenes antes de cada commit. |

El sitio no usa librerías ni recursos de terceros, y su política de seguridad (CSP) no permite estilos ni scripts en línea. Los gráficos funcionan sin JavaScript: en ese caso se ve su tabla de datos.

## Ver en local

```bash
python3 -m http.server 8000
```

Y abrir http://localhost:8000.

Para activar el hook de metadatos en un clon nuevo:

```bash
git config core.hooksPath .githooks
```

## Proyectos

El código de los proyectos personales está en [javiermorenof7/javiermorenof7](https://github.com/javiermorenof7/javiermorenof7). Sus datos son ficticios.

## Contacto

- GitHub: https://github.com/javiermorenof7
- LinkedIn: https://www.linkedin.com/in/francisco-javier-garcia-moreno-78b184166/

## Licencia

Proyecto personal. No tiene una licencia de código abierto.
