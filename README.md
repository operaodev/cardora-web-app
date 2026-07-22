# Cardora Web App

Aplicación mobile-first para el marketplace de cartas Cardora.

## Integrantes

| N° | Integrantes | Participación |
|:--:|-------------|:-------------:|
| 1 | Balbin Casas, Alejandro Cesar | 100% |
| 2 | Maguiño Soto, Oswaldo | 100% |
| 3 | Quispilloclla Casique, Sergio | 100% |
| 4 | Ruiz Marquezado, Giancarlo | 100% |
| 5 | Zarate Davila, Issac | 100% |

**Video de presentación:** [https://youtu.be/xsZ6j4JKi5Q](https://youtu.be/xsZ6j4JKi5Q)

## Arquitectura
La aplicación web (Frontend) está construida utilizando **React (v19)** y **TypeScript**, empaquetada y servida con **Vite**. Se sigue un modelo SPA (Single Page Application) donde la interfaz de usuario se renderiza en el cliente.
- **Gestión de estado:** Se utiliza zustand para el estado global y @tanstack/react-query para la gestión del estado asíncrono y llamadas a la API.
- **Estilos:** Se emplea **Tailwind CSS v4** mediante clases utilitarias para lograr un diseño responsivo, mobile-first y soporte de tema oscuro de forma nativa.
- **Enrutamiento:** Gestionado mediante 
eact-router-dom para la navegación entre vistas sin recarga de página.

## APIs
La aplicación frontend se comunica a través de APIs RESTful con el backend (Cardex):
- Gestión de catálogo de cartas y búsquedas.
- Sincronización y manejo de inventario de usuarios.
- El cliente utiliza xios e integraciones nativas para realizar estas peticiones de red.

## Guías de instalación / Configuración

### Requisitos Previos
- Node.js (v18 o superior)
- Un gestor de paquetes como 
pm o pnpm.

### Pasos
1. Clona el repositorio e ingresa al directorio cardora-web-app.
2. Instala las dependencias:
   \\ash
   npm install
   \3. Ejecuta el servidor de desarrollo local:
   \\ash
   npm run dev
   \4. Para compilar la versión de producción:
   \\ash
   npm run build
   \
## Topologías de red
En un entorno de producción, la aplicación (Frontend) se sirve estáticamente a través de un CDN o servicio de hosting estático (como Vercel o Netlify). Los navegadores cliente descargan estos assets estáticos y luego realizan llamadas HTTPS directamente a la API de backend (Cardex) alojada en un servidor o servicio Cloud.

## Políticas de seguridad
- **CORS (Cross-Origin Resource Sharing):** La API de backend debe permitir peticiones desde el dominio donde se despliega esta web app.
- **Manejo de Sesiones:** Se utilizan tokens almacenados de forma segura para autenticar peticiones a rutas protegidas.
- **Protección XSS:** React sanitiza automáticamente el contenido renderizado para evitar inyección de código malicioso.

## Diccionario de Datos
Como aplicación frontend, no gestiona una base de datos propia directamente. Los tipos e interfaces de TypeScript en el directorio src/types actúan como el diccionario de entidades, mapeando estrictamente las respuestas JSON del backend.

## Manuales de operación
- La interfaz está diseñada con un enfoque **mobile-first**, adaptándose a dispositivos de escritorio manteniendo su usabilidad.
- La navegación principal se realiza desde el menú lateral (OverlayTransition).
- Para buscar cartas, se utiliza la barra dinámica superior (SearchSuggestions) que reacciona en tiempo real.

---

## Layouts y Componentes

### LayoutMobile (`src/layouts/LayoutMobile.tsx`)

Layout principal mobile que organiza la app en una columna flexible. Contiene:

- **Header** con logo, botón de usuario y botón de menú hamburguesa
- **SearchMobile** — barra de búsqueda con sugerencias dinámicas
- **OverlayTransition** — menú lateral que se despliega desde la derecha con navegación y toggle de tema
- **AuthPopover** — popover de autenticación que muestra distintas opciones según el estado del usuario (no autenticado, invitado, usuario registrado)

El estado de tema oscuro se persiste en `localStorage` y se respeta la preferencia del sistema (`prefers-color-scheme`).

### Overlay (`src/components/modal/Overlay.tsx`)

Componentes de superposición modal:

- **`Overlay`** — overlay modal centrado con backdrop blur, útil para diálogos y modales genéricos
- **`OverlayTransition`** — panel lateral animado que puede deslizarse desde la izquierda o la derecha. Incluye un botón de cierre circular con posicionamiento automático según el lado. Soporta transiciones de opacidad, backdrop blur y transformación CSS

### Popover (`src/components/modal/Popover.tsx`)

Componentes de popover posicionados dinámicamente:

- **`PopoverRef`** — popover que se posiciona en relación a un elemento `anchorRef`. Calcula automáticamente si debe aparecer hacia abajo o arriba, y hacia la izquierda o derecha, para mantenerse dentro del viewport. Se renderiza mediante portal a `document.body`
- **`Popover`** — similar a `PopoverRef` pero se posiciona en relación a un punto `anchorPoint` (coordenadas x, y)

Ambos incluyen un backdrop que cierra el popover al hacer clic fuera, y soporte para modo oscuro.

### SearchSuggestions (`src/layouts/SearchSuggestions.tsx`)

Barra de búsqueda completa con:

- Input con placeholder rotativo (cambia cada 3s con un nombre aleatorio de producto)
- Filtros de juego (TCG) e idioma mediante popovers
- Dropdown de sugerencias en tiempo real usando `useSuggestions`
- Estados de carga, resultados y vacío
- Cada fila de sugerencia (`SuggestionRow`) muestra imagen, nombre, código, rareza, set y badges de stock / wishlist

---

## Clases utilitarias (`src/index.css`)

Todas las clases están definidas dentro de `@layer utilities` y funcionan con Tailwind v4.

### Tema oscuro automático

```css
@custom-variant dark (&:is(.dark *));
```

La variante `dark:` se activa cuando el elemento `<html>` tiene la clase `.dark`. Ejemplo: `dark:bg-gray-800`.

### Mapeo de colores de texto `text-{n}`

Reemplazan a `text-gray-{n} dark:text-gray-{m}` con una sintaxis más corta. El número indica el tono en light mode; el dark mode se mapea automáticamente al tono invertido.

| Clase  | Light        | Dark          |
|--------|--------------|---------------|
| `text-50`  | `text-gray-50`  | `dark:text-gray-900` |
| `text-100` | `text-gray-100` | `dark:text-gray-800` |
| `text-200` | `text-gray-200` | `dark:text-gray-700` |
| `text-300` | `text-gray-300` | `dark:text-gray-600` |
| `text-400` | `text-gray-400` | `dark:text-gray-500` |
| `text-500` | `text-gray-500` | `dark:text-gray-400` |
| `text-600` | `text-gray-600` | `dark:text-gray-300` |
| `text-700` | `text-gray-700` | `dark:text-gray-200` |
| `text-800` | `text-gray-800` | `dark:text-gray-100` |
| `text-900` | `text-gray-900` | `dark:text-gray-50`  |

### `text-aurora`

Degradado en el texto: de índigo a fucsia. Útil para logos y títulos destacados.

```
@apply bg-clip-text text-transparent bg-linear-to-r from-indigo-500 to-fuchsia-500;
```

### `surface`

Fondo de superficie con cambio automático a modo oscuro. Útil para cards, dropdowns, modales y cualquier contenedor elevado.

```css
.surface {
    @apply bg-white dark:bg-gray-800 dark:text-gray-100;
}
```

### `popover-option`

Estilo para filas/opciones dentro de popovers. Incluye hover, disabled y dark mode.

```css
.popover-option {
    @apply flex items-center text-sm px-4 py-2 gap-3 rounded-lg
        text-gray-500 font-medium transition duration-200
        hover:bg-gray-100 hover:text-gray-800
        disabled:opacity-50 disabled:cursor-not-allowed
        dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100;
}
```

### `badge`

Etiqueta pequeña tipo pill/badge. Ideal para stock, wishlist, contadores, etc.

```css
.badge {
    @apply inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full;
}
```

Se combina con colores específicos. Ejemplo:

```html
<span class="badge bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
  x3
</span>
```

### `bevel-full`

Aplica `corner-shape: bevel` para esquinas biseladas (soporte experimental en navegadores basados en Chromium).

### `animate-placeholder-fade`

Animación CSS aplicada al `::placeholder` de un input. Reproduce un fade-in + slide hacia arriba cada vez que el atributo `placeholder` cambia.

```css
.animate-placeholder-fade::placeholder {
    animation: placeholder-fade 0.4s ease-out;
}

@keyframes placeholder-fade {
    0%   { opacity: 0; transform: translateY(-2px); }
    100% { opacity: 1; transform: translateY(0); }
}
```
