Opción 2 ya aprobada ("si aplica la opcion 2"): que el selector de color de VS Code aparezca sobre las variables del tema, sin romper las opacidades existentes (bg-card/50, ring-destructive/40, etc. — ~70 usos).

**Cambios (3 archivos):**
1. `src/index.css`: envolver los valores de color de ambos temas (`:root` claro y `.dark`) en `hsl(...)` — 25 variables por bloque. `--radius` no se toca (no es color). Mismos valores → mismos colores.
2. `tailwind.config.js`: cada mapeo `'hsl(var(--x))'` pasa a `'color-mix(in srgb, var(--x) calc(<alpha-value> * 100%), transparent)'` — así los modificadores de opacidad (`/50`, `/40`) siguen funcionando con tokens de color completo.
3. `src/components/ui/sidebar.tsx:475`: `hsl(var(--sidebar-border))` → `var(--sidebar-border)` (y sidebar-accent) — único consumidor directo.

**Verificación:** `npm run build` + grep en `dist/` confirmando que las variables quedan como `hsl(...)` y que `bg-card/50` genera el `color-mix` con alpha. Colores visualmente idénticos (mismos valores, solo cambia el formato).