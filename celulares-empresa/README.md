# Catálogo de celulares

## Estructura

```
celulares-empresa/
├── index.html              Página
├── styles.css              Diseño
├── script.js               Lógica (no hace falta tocarlo)
├── config.js               Nombre, WhatsApp y link de la Sheet
├── plantilla-catalogo.csv  Plantilla para la Google Sheet
└── img/                    Fotos locales (opcional)
```

## 1. Probar en tu compu

1. Abre la carpeta en VS Code.
2. Instala la extensión **Live Server**.
3. Clic derecho en `index.html` → **Open with Live Server**.

Sin Sheet configurada se muestran 4 celulares de ejemplo.

## 2. Conectar la Google Sheet (para el admin)

1. En Google Sheets: **Archivo → Importar → Subir** → `plantilla-catalogo.csv`.
2. **Archivo → Compartir → Publicar en la Web**.
3. Elige la hoja, formato **Valores separados por comas (.csv)** → **Publicar**.
4. Copia el link y pégalo en `config.js` en `sheetCSV`.

Columnas (no cambiar los nombres de la fila 1):

| Columna | Ejemplo | Nota |
|---|---|---|
| marca | Samsung | Genera los filtros automáticamente |
| modelo | Galaxy A55 | |
| precio | 7999 | Solo números |
| precio_anterior | 8999 | Opcional. Si es mayor al precio, sale tachado y como "Oferta" |
| procesador | Exynos 1480 | |
| ram | 8 GB | |
| almacenamiento | 256 GB | |
| camara | 50 MP + 12 MP | |
| bateria | 5000 mAh | |
| pantalla | 6.6" AMOLED | |
| color | Lila | |
| foto | Link de Google Drive | Vacío = silueta genérica |
| descripcion | Texto libre | |
| etiqueta | Nuevo / Oferta | Opcional |
| disponible | si / no | "no" = Agotado, se va al final |

Las columnas vacías simplemente no se muestran.

Textos de "¡Quiero comprar!" y "Términos y condiciones" (pagos, horario, garantía, etc.) se editan en `config.js`.
Para usar una foto de fondo en el inicio: guárdala como `img/hero.jpg` y pon `imagenHero: "img/hero.jpg"` en `config.js`.

### Fotos

1. Sube la foto a Google Drive.
2. Clic derecho → **Compartir** → Acceso general: **Cualquier persona con el enlace**.
3. **Copiar enlace** y pegarlo en la columna `foto`.

Los cambios en la Sheet se reflejan en la página en unos minutos (Google actualiza el CSV publicado cada ~5 min).

## 3. Subir a internet (Netlify)

1. Entra a **https://app.netlify.com/drop** y crea tu cuenta.
2. Arrastra la carpeta `celulares-empresa`.
3. **Site configuration → Change site name** para elegir la dirección, ej. `celulares-empresa.netlify.app`.

Para actualizar el diseño: edita en VS Code y vuelve a arrastrar la carpeta en **Deploys**.
El catálogo NO requiere volver a subir nada: se actualiza desde la Sheet.
