# Cardora Web App

Aplicación mobile-first para el marketplace de cartas Cardora.

---

## Layouts y Componentes

### LayoutMobile (`src/layouts/mobile/LayoutMobile.tsx`)

Layout principal mobile que organiza la app en una columna flexible. Contiene:

- **Header** con logo, botón de usuario y botón de menú hamburguesa
- **SearchMobile** — barra de búsqueda con sugerencias dinámicas
- **OverlayTransition** — menú lateral que se despliega desde la derecha con navegación y toggle de tema
- **AuthPopover** — popover de autenticación que muestra distintas opciones según el estado del usuario (no autenticado, invitado, usuario registrado)

El estado de tema oscuro se persiste en `localStorage` y se respeta la preferencia del sistema (`prefers-color-scheme`).

### Overlay (`src/layouts/Overlay.tsx`)

Componentes de superposición modal:

- **`Overlay`** — overlay modal centrado con backdrop blur, útil para diálogos y modales genéricos
- **`OverlayTransition`** — panel lateral animado que puede deslizarse desde la izquierda o la derecha. Incluye un botón de cierre circular con posicionamiento automático según el lado. Soporta transiciones de opacidad, backdrop blur y transformación CSS

### Popover (`src/layouts/Popover.tsx`)

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
