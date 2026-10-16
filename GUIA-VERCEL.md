# Publicar BUKLABS Play en Vercel

Este paquete contiene el marketplace y los tres juegos completos. No necesita base de datos, claves API ni variables de entorno. Creado por BUKLABS.

## Opción recomendada: GitHub + Vercel

1. Descomprime `BUKLABS-Play-Vercel.zip`.
2. Crea un repositorio en tu cuenta de GitHub, por ejemplo `buklabs-play`.
3. Sube **el contenido** de la carpeta descomprimida. En la raíz del repositorio deben verse `vercel.json`, `package.json`, `dist` y `scripts`. No subas el ZIP sin descomprimir ni pongas todo dentro de una carpeta adicional. Puedes usar **Add file → Upload files** y guardar con **Commit changes**.
4. Entra en https://vercel.com/new, conecta GitHub e importa ese repositorio.
5. La configuración incluida en `vercel.json` define estos valores:

| Ajuste | Valor |
| --- | --- |
| Framework Preset | Other |
| Root Directory | raíz del repositorio (`.`) |
| Build Command | `node scripts/build-pwa.mjs` |
| Output Directory | `dist` |
| Install Command | vacío; no hay dependencias |
| Environment Variables | ninguna |

6. Pulsa **Deploy**. Cuando termine, abre la dirección que Vercel te entregue. No es necesario que coincida con el nombre del repositorio.
7. Comprueba la web desde el celular: abre cada juego, visita sus detalles y prueba una ronda. Pulsa **Instalar app** para ver las instrucciones correspondientes al dispositivo. Espera **Listo sin conexión**, cierra la app, desconecta internet y vuelve a abrirla para comprobar el modo offline.

El archivo de configuración mantiene las rutas de los tres juegos y permite actualizar el service worker. No añadas una redirección global hacia `index.html`: este proyecto tiene varias páginas y varios juegos.

## Alternativa desde terminal

Con una versión de Node.js compatible con la CLI de Vercel instalada, abre una terminal dentro de la carpeta que contiene `vercel.json`:

```bash
npx vercel@latest --prod
```

Sigue el inicio de sesión y crea o vincula el proyecto correcto. Conserva la carpeta actual y la configuración incluida. Esta alternativa no exige crear un repositorio de GitHub.

## Cambiar contenido antes o después de publicarlo

Puedes abrir los archivos en un editor como VS Code. No hace falta cambiar los motores de los juegos para modificar el catálogo.

| Qué quieres cambiar | Archivo o carpeta |
| --- | --- |
| Logos, portadas y fotografía principal | `dist/assets/` |
| Descripciones, reglas, tiempos orientativos y puntuaciones de las fichas | `dist/games-data.js` |
| Texto principal, preguntas frecuentes y pie del catálogo | `dist/index.html` |
| Colores, tamaños y presentación del catálogo y las fichas | `dist/catalog.css` |
| Ejemplos interactivos de las fichas | `dist/details.js` |
| Cartas de Ni lo digas | `dist/games/ni-lo-digas/deck.js` |
| Películas y cinco pistas | `dist/games/blockbuster/movies.js` |
| Preguntas de MAL. | `dist/games/mal/questions.js` |
| Nombre de la app instalada e iconos de instalación | `dist/manifest.webmanifest` y sus archivos de icono |

Las imágenes entregadas se incorporaron tal como fueron adjuntadas. Para reemplazarlas, conserva su nombre y formato o actualiza la ruta en el código. Los logos actuales son PNG transparentes de proporción 3:1, las portadas 3:2 y la fotografía principal aproximadamente 16:9. El icono compacto de instalación permanece independiente de los logos horizontales.

En `games-data.js`, cada juego tiene campos `description` (resumen de la tarjeta), `pitch` (descripción larga), `rules` (pasos), `options` (opciones) y `scoring` (tabla de puntos). Cambiar esos textos no cambia las reglas programadas: si modificas una puntuación real, hay que cambiar también el motor del juego y sus pruebas.

Con GitHub conectado, guarda los cambios en la rama de producción para que Vercel vuelva a desplegar. El comando de construcción regenera automáticamente la caché PWA. Si publicas por terminal, ejecuta de nuevo `npx vercel@latest --prod`.

## Verificación local

```bash
npm run build
npm test
```

Para revisar la web, sirve `dist` mediante un servidor local. Por ejemplo, si tienes Python:

```bash
python3 -m http.server 8080 --directory dist
```

Abre http://localhost:8080. No pruebes la instalación abriendo el HTML mediante `file://`: necesita HTTPS o localhost.

## Instalación y actualización

La instalación corresponde a **BUKLABS Play completo**: incluye Ni lo digas, Blockbuster y MAL. No entrega un APK ni requiere una tienda de aplicaciones. Las opciones disponibles dependen del navegador. El primer guardado offline descarga las imágenes y los recursos de los tres juegos; espera el indicador de finalización.

Después de publicar cambios, abre la app con internet para que descargue la nueva versión y vuelve a abrirla para ver todos los recursos actualizados. Los favoritos y las partidas son locales a cada navegador y dominio. No se trasladan automáticamente desde la dirección anterior a la nueva dirección de Vercel.

Antes de compartir el enlace, ábrelo en una ventana privada para comprobar el acceso que deseas ofrecer. La publicación en Vercel es independiente de la copia privada alojada en ChatGPT.

## Documentación oficial consultada

- Configuración del proyecto: https://vercel.com/docs/project-configuration/vercel-json
- Configuración de construcción: https://vercel.com/docs/builds/configure-a-build
- GitHub y Vercel: https://vercel.com/docs/git/vercel-for-github
- CLI: https://vercel.com/docs/cli/deploy

## Comprobaciones realizadas

14 pruebas automatizadas superadas: reglas, puntos, temporizadores, archivos, fichas, recursos offline y configuración de Vercel. Sintaxis JavaScript revisada. No se comprobó visualmente en navegador ni se instaló en dispositivos reales; el proyecto todavía no se ha desplegado en tu cuenta de Vercel.
