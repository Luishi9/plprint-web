---
name: Precision Print Management
colors:
  surface: '#e8fdff'
  surface-dim: '#c3dfe1'
  surface-bright: '#e8fdff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#ddf9fb'
  surface-container: '#d7f3f5'
  surface-container-high: '#d1edf0'
  surface-container-highest: '#cce8ea'
  on-surface: '#041f21'
  on-surface-variant: '#3d4948'
  inverse-surface: '#1b3436'
  inverse-on-surface: '#daf6f8'
  outline: '#6d7978'
  outline-variant: '#bcc9c8'
  surface-tint: '#006a68'
  primary: '#006765'
  on-primary: '#ffffff'
  primary-container: '#008280'
  on-primary-container: '#f3fffd'
  inverse-primary: '#70d7d3'
  secondary: '#346667'
  on-secondary: '#ffffff'
  secondary-container: '#b6e9ea'
  on-secondary-container: '#396a6b'
  tertiary: '#006764'
  on-tertiary: '#ffffff'
  tertiary-container: '#00827e'
  on-tertiary-container: '#f3fffd'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#8df3f0'
  primary-fixed-dim: '#70d7d3'
  on-primary-fixed: '#00201f'
  on-primary-fixed-variant: '#00504e'
  secondary-fixed: '#b9eced'
  secondary-fixed-dim: '#9dd0d0'
  on-secondary-fixed: '#002020'
  on-secondary-fixed-variant: '#194e4f'
  tertiary-fixed: '#88f4ef'
  tertiary-fixed-dim: '#6ad8d2'
  on-tertiary-fixed: '#00201f'
  on-tertiary-fixed-variant: '#00504d'
  background: '#e8fdff'
  on-background: '#041f21'
  surface-variant: '#cce8ea'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 24px
  margin-desktop: 32px
  margin-mobile: 16px
---

## Brand & Style
The design system is engineered for efficiency, clarity, and industrial reliability. It targets print center operators and enterprise sales teams who require a high-density information environment that remains legible and stress-free during high-volume production cycles.

The visual style is **Corporate Modern with a Precision Edge**. It leverages the clarity of a systematic grid, ample whitespace to separate complex data sets, and a professional "Water Leaf" palette that evokes a sense of technical calm. The aesthetic avoids unnecessary decoration, focusing instead on structural integrity, clear hierarchies, and a "mechanical" refinement that mirrors the precision of high-end printing hardware.

## Colors
The palette is rooted in the "Water Leaf" spectrum, chosen for its balance between the sterile precision of medical tech and the professional depth of traditional finance.

- **Primary (#2e9e9b):** Used for primary actions, progress indicators, and active states. It provides high visibility without the aggression of pure blues or greens.
- **Deep Neutral (#0b2628):** Reserved for high-contrast typography and structural elements (sidebars, headers). It replaces pure black to provide a more sophisticated, "ink-like" depth.
- **Surface Scale:** Utilize the lighter tints (50-100) for large background areas and row zebra-striping to maintain a clean, airy feel even in data-heavy views.
- **Semantic Accents:** Use standard success (green), warning (amber), and error (red) colors sparingly, ensuring they are adjusted to match the saturation levels of the primary Water Leaf palette.

## Typography
This design system utilizes **Inter** for its exceptional legibility in SaaS interfaces and technical environments. The type scale is optimized for high-density layouts where distinguishing between "8" and "B" or "1" and "l" is critical for order management and pricing.

- **Headlines:** Use Bold and Semi-Bold weights in the Deep Neutral color (#0b2628) to anchor sections.
- **Body Text:** Standardize on `body-sm` for tabular data and property lists to maximize information density. Use `body-md` for general prose and descriptions.
- **Labels:** Use `label-md` with slight letter spacing and uppercase styling for table headers and form section titles to create a distinct visual break from content.

## Layout & Spacing
The layout follows a **12-column fluid grid** for desktop and a **single-column vertical stack** for mobile. The system relies on an 8px base unit to ensure consistent alignment.

- **Data Tables:** These are the heart of the system. Use a "Condensed" vertical rhythm (8px padding) for rows to allow more data above the fold, but maintain generous horizontal gutters (24px) to prevent visual crowding.
- **Side Panels:** Implement a fixed-width left navigation (256px) for global management and an optional right "Context Panel" for quick-edit functions on orders.
- **Margins:** Desktop views should maintain a 32px outer margin to provide visual "breathing room" that offsets the complexity of the management tools.

## Elevation & Depth
The design system uses a **Tonal Layering** approach combined with **Ambient Shadows** to define hierarchy.

- **Level 0 (Background):** #f2fbfa (Water Leaf 50). This serves as the canvas for the entire application.
- **Level 1 (Cards/Surface):** White (#FFFFFF). All primary content containers sit on white cards. They feature a 1px border (#d4f3ef) and a subtle, highly diffused shadow (0px 4px 12px rgba(11, 38, 40, 0.05)).
- **Level 2 (Modals/Popovers):** White surfaces with a more pronounced shadow (0px 12px 32px rgba(11, 38, 40, 0.12)) to indicate a clear break from the workflow.
- **Interactive States:** Elements should never "lift" too high. Use subtle border color shifts (Primary 500) rather than heavy shadows to indicate focus.

## Shapes
The design system employs a **Rounded** language (8px default) to soften the industrial nature of the software and make the interface feel more modern and approachable.

- **Standard Elements:** Buttons, Input Fields, and Cards use the 0.5rem (8px) radius.
- **Larger Containers:** Main content areas or dashboard widgets may use `rounded-lg` (16px) for a more pronounced "module" feel.
- **Inner Elements:** Small badges or tags within cards should use the 0.25rem (4px) radius to maintain geometric harmony with the larger containers.

## Components
- **Buttons:** 
  - **Primary:** Solid #2e9e9b background with White text. High-contrast, 8px corner radius.
  - **Secondary:** Ghost style with #2e9e9b border and text. 
  - **Critical:** Deep Neutral (#0b2628) for administrative or "Sales Close" actions.
- **Form Fields:** Use a white background with a 1px #d4f3ef border. On focus, the border transitions to #2e9e9b with a 2px outer glow of the same color at 15% opacity. Labels sit above the field in `label-sm` Deep Neutral.
- **Status Chips:** Small, low-contrast pills. For example, "In Progress" uses a Water Leaf 100 background with Water Leaf 700 text.
- **Data Tables:** Header rows use Water Leaf 50 background with `label-md` typography. Row hover states use Water Leaf 50 to subtly highlight the active record.
- **Order Cards:** Use a standard Level 1 elevation card. The top border should be a 4px thick accent line using a color-coded status (e.g., Primary 500 for "Ready to Print").
- **Search Inputs:** Should always include a magnifying glass icon and a keyboard shortcut hint (e.g., "⌘K") in `label-sm` styling.