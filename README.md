# DragonByte — TP1 Proyecto web en equipo

Sitio web grupal realizado para Desarrollo de Sistemas Web(Frontend).

## Integrantes

- Sebastián Fernández — [GitHub](https://github.com/Fernandez-Sebastian)
- Glaucia Ferreira — [GitHub](https://github.com/glaucia1906)
- Ignacio Grosman — [GitHub](https://github.com/IgnacioGrosman735)
- Andrea Maslucan Moreno — [GitHub](https://github.com/andreamm-lab)

## Tecnologías

- HTML5
- CSS3
- JavaScript
- Google Fonts: Orbitron y Space Grotesk

## Estructura

```text
dragonbyte/
├── .editorconfig
├── .gitignore
├── index.html
├── assets/
│   ├── css/
│   │   ├── base.css
│   │   └── pages/
│   │       ├── inicio.css
│   │       ├── bitacora.css
│   │       └── perfiles.css
│   ├── js/
│   │   └── pages/
│   │       ├── inicio.js
│   │       └── bitacora.js
│   └── img/
│       ├── albums/
│       ├── iconos/
│       │   ├── github.webp
│       │   └── ubicacion.webp
│       ├── peliculas/
│       ├── perfiles/
│       ├── sources-ignacio.json
│       └── sources-sebastian.json
├── components/
│   ├── challenge/
│   │   ├── challenge.css
│   │   └── challenge.js
│   ├── footer/
│   │   ├── footer.css
│   │   └── footer.js
│   ├── header/
│   │   ├── header.css
│   │   └── header.js
│   └── member-photo/
│       ├── member-photo.css
│       └── member-photo.js
├── pages/
│   ├── bitacora.html
│   └── equipo/
│       ├── sebastian-fernandez.html
│       ├── glaucia-ferreira.html
│       ├── ignacio-grosman.html
│       └── andrea-maslucan-moreno.html
└── README.md
```

La portada permanece en `index.html`. La bitácora está en `pages/bitacora.html` y los perfiles en `pages/equipo/`. Las imágenes se organizan por uso dentro de `assets/img/`: `perfiles/` contiene las fotos, avatares y `avatar-placeholder.svg` (9 archivos); `iconos/` contiene los iconos de GitHub y ubicación. Las carpetas `albums/` y `peliculas/` conservan sus portadas y pósters, y los registros `sources-*.json` permanecen en `assets/img/`.

## Organización del código

Cada archivo tiene una responsabilidad y cada página carga los recursos que utiliza:

| Ubicación | Responsabilidad |
| --- | --- |
| `assets/css/base.css` | Variables de diseño, estilos base, tipografía, controles, layout común y marca compartida. |
| `assets/css/pages/` | Estilos específicos de portada, bitácora y perfiles, con sus ajustes responsive. |
| `assets/js/pages/inicio.js` | Botón de poder y animación del núcleo de la portada. |
| `assets/js/pages/bitacora.js` | Entradas, formulario, filtros, orden y almacenamiento local de la bitácora. |
| `components/header/` | Encabezado, enlaces, estado de navegación y menú adaptable. |
| `components/footer/` | Pie de página y enlaces de navegación. |
| `components/member-photo/` | Retratos y transformación de fotos en portada y perfiles. |
| `components/challenge/` | Generación de desafíos y su diálogo en los perfiles. |
| `assets/img/perfiles/` | Fotos, avatares y retrato de reemplazo de los integrantes. |
| `assets/img/iconos/` | Iconos compartidos de GitHub y ubicación. |
| `assets/img/albums/` y `assets/img/peliculas/` | Portadas de discos y pósters de películas y series. |
| `assets/img/sources-*.json` | Registros de fuentes de las imágenes. |

El encabezado y el pie se mantienen en un único lugar. Para cambiar su contenido, editá la plantilla HTML dentro de su JavaScript. Cada página incluye los contenedores `data-site-header` y `data-site-footer`; los componentes resuelven sus enlaces desde la ubicación de sus scripts para funcionar también en páginas internas y despliegues bajo un subdirectorio.

Los scripts son clásicos, se cargan con `defer` y encapsulan su estado para evitar variables globales. Se conserva la apertura directa de los HTML, sin dependencias ni compilación. La navegación compartida requiere JavaScript habilitado.

## Convenciones de mantenimiento

- Usar nombres descriptivos en minúsculas y separados por guiones para archivos nuevos.
- Mantener el contenido de cada página en su HTML, su presentación en CSS y su comportamiento en JavaScript.
- Guardar en `base.css` solo estilos compartidos. Mantener cada componente con sus propios estilos, interacciones y ajustes responsive.
- Cargar primero `base.css`, después los retratos cuando correspondan, los estilos de la página y del desafío cuando corresponda, y al final el encabezado y el pie. Este orden conserva la cascada actual.
- Cargar los scripts del encabezado y pie en todas las páginas, y los demás solo donde se utilicen. Mantener `defer` y las rutas relativas.
- Respetar UTF-8, indentación de dos espacios y salto de línea final, definidos en `.editorconfig`.
- Al modificar un recurso con `?v=`, actualizar su versión en todas las páginas que lo carguen para evitar una copia anterior en caché.

## Cómo abrir el sitio

Abrí `index.html` directamente en el navegador con JavaScript habilitado. Los componentes se cargan mediante scripts clásicos, sin `fetch` ni una etapa de compilación.

Opcionalmente, desde la carpeta raíz podés iniciar un servidor local con Python:

```sh
python -m http.server 8000
```

Luego accedé a `http://localhost:8000/`. La bitácora estará en `http://localhost:8000/pages/bitacora.html` y los perfiles bajo `http://localhost:8000/pages/equipo/`.

## Guía de estilos

- Fondo: `#070b18`
- Superficie: `#10182c`
- Naranja: `#ff8a18`
- Amarillo: `#ffd84d`
- Cian: `#49e5ff`
- Texto principal: `#f6f8ff`
- Tipografías: Orbitron para títulos y Space Grotesk para texto.

## Funciones JavaScript

- Portada: el botón **Activar poder** cambia el estado visual y el mensaje del núcleo de energía.
- Navegación: el menú se abre y cierra en pantallas pequeñas.
- Retratos: las fotos alternan entre su estado base y su transformación.
- Perfiles: el botón **Generar desafío** propone un reto aleatorio de desarrollo.
- Bitácora: permite agregar entradas, filtrar por fecha y cambiar el orden. Las entradas nuevas se guardan en `localStorage` del navegador; no se sincronizan entre integrantes. La clave del formulario es una validación local de demostración.

## Verificación antes de entregar

- Abrir portada, bitácora y los cuatro perfiles; comprobar enlaces, imágenes y consola del navegador.
- Revisar el menú y la distribución en pantallas pequeñas y grandes.
- Probar el poder de la portada, los retratos y la apertura, regeneración y cierre de desafíos.
- Probar filtros y formulario de bitácora en un navegador de prueba, y recargar para comprobar el almacenamiento local.
- Comprobar navegación con teclado, cierre de diálogos con Escape y preferencia de movimiento reducido.

## Imágenes obtenidas mediante APIs

En el perfil Andrea se usó [iTunes Search API](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/index.html) para obtener las portadas de discos y la [API PageImages de Wikipedia](https://www.mediawiki.org/wiki/Extension:PageImages) para los posters de películas. Las consultas son gratuitas y no requieren clave API. Las URLs obtenidas se incorporaron al HTML; la página carga las imágenes externas sin consultar las APIs en cada visita.

## Pendientes

- Revisar los datos personales y textos que todavía sean provisorios.
- Agregar capturas de pantalla.
- Completar la documentación del uso de IA.
- Publicar en Vercel y agregar aquí la URL.

## Uso de IA

Se utilizó Codex de OpenAI para crear la estructura base, proponer la identidad visual y generar una
primera versión de HTML, CSS y JavaScript. El equipo debe revisar, comprender, probar y adaptar todo
el material antes de la entrega, e indicar aquí el plan utilizado y su experiencia previa.
