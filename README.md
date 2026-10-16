# BUKLABS Play

Marketplace de juegos de fiesta y PWA para celular, tablet o computador. Creado por BUKLABS.

Incluye Ni lo digas (1.000 cartas, 20 categorías), Blockbuster (90 películas, cinco pistas, tres niveles) y MAL. (200 preguntas, respuestas incorrectas y turnos de 30/45/60 segundos).

La actualización incorpora ocho imágenes proporcionadas por el usuario: cuatro logos, tres portadas y una foto principal. Incluye fichas con reglas, puntos, opciones y ejemplos interactivos; búsqueda, filtros, favoritos, último juego y guías de instalación.

Consulta **GUIA-VERCEL.md** para publicar, editar imágenes y textos, y probar la instalación. `vercel.json` ya está configurado. No hay dependencias de producción, base de datos ni secretos.

## Comandos

- `npm run build`: regenera `dist/sw.js` con inventario y hash de todos los recursos.
- `npm test`: comprueba las reglas y la integración.
- `python3 -m http.server 8080 --directory dist`: vista local si tienes Python.

La web vive en `dist`. Los textos de las fichas están en `dist/games-data.js`; los ejemplos en `dist/details.js`; las imágenes en `dist/assets`. Los motores de juego están dentro de cada carpeta de `dist/games`.

## Instalación y datos

Un único manifest y service worker para los tres juegos. El mensaje «Listo sin conexión» exige que todos los recursos estén guardados. La caché usa rutas independientes y excluye autenticación. Las partidas y los favoritos se guardan en el navegador, sin sincronización entre dispositivos ni dominios. Los iconos compactos de instalación se conservan; los logos proporcionados se usan en la web y los encabezados de los juegos.

## Verificación

14 pruebas automatizadas aprobadas y sintaxis JavaScript comprobada. La precarga y las rutas offline se verificaron en un entorno simulado. No se hizo QA visual ni instalación en dispositivos reales porque el control de navegador no estaba disponible. No se ha realizado un despliegue en Vercel desde este entorno.
