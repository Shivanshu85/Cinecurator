# Design System: High-End Cinematic Editorial

## 1. Overview & Creative North Star

**Creative North Star: The Digital Curator**  
This design system moves beyond the utility of a standard streaming interface to create an editorial, cinematic experience. It is designed to feel like a premium digital gallery where the content—the films—is the singular focus. By merging the structural rigor of Material 3 with the bold, high-contrast atmosphere of modern cinema, we transition from "browsing a database" to "exploring a curated collection."

To break the "template" look, this system utilizes **intentional asymmetry** and **overlapping elements**. Typography is not just for information; it is a design element that uses dramatic scale shifts to create a sense of hierarchy and prestige. Surfaces are treated as physical layers of glass and light, ensuring the UI feels deep, immersive, and premium.

---

## 2. Colors

The palette is anchored in deep obsidian tones, using the primary accent as a high-energy pulse through the dark environment.

### Tonal Strategy
- **Background (`#131313`) & Surface (`#131313`):** The foundation of the system. This is a "true dark" that allows movie posters to pop with maximum vibrance.
- **Primary (`#ffb4aa`) & Primary Container (`#e50914`):** Use the container token (`#e50914`) for high-impact actions. The lighter primary token is reserved for subtle states or active indicators.
- **Secondary & Tertiary:** These are muted, desaturated tones used to deprioritize metadata, ensuring the eye remains on the primary movie content.

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to section content. Traditional lines create a "boxed-in" feel that breaks the cinematic immersion. Instead:
- Define boundaries through **background color shifts**. Place a `surface-container-low` section against a `surface` background.
- Use **vertical whitespace** from our spacing scale to imply grouping.

### Surface Hierarchy & Nesting
Treat the UI as a series of nested layers. 
- **Base Level:** `surface`
- **Sectioning:** `surface-container` (Highest for active cards, Lowest for background blocks).
- **Glass & Gradient Rule:** For floating elements like the Search Bar or Movie Info overlays, use **Glassmorphism**. Apply semi-transparent surface colors with a `backdrop-blur (20px)`. Main CTAs should feature a subtle linear gradient from `primary-container` to a slightly darker shade to provide a "soul" and depth that flat hex codes lack.

---

## 3. Typography

The typography strategy relies on the interplay between the authoritative **Plus Jakarta Sans** (Display/Headline) and the highly readable **Inter** (Body/Labels).

- **Display & Headline (Plus Jakarta Sans):** These are the "Editorial Voice." Use `display-lg` for hero movie titles with tight letter-spacing to mimic movie posters.
- **Body & Title (Inter):** These are the "Information Layer." They provide clarity and modern elegance.
- **The Scale Shift:** We use a high-contrast scale. A `display-lg` title may sit directly above a `label-md` metadata tag. This dramatic difference in size conveys a premium, curated feel rather than a generic list.

---

## 4. Elevation & Depth

We eschew traditional drop shadows for **Tonal Layering**, creating a softer, more sophisticated sense of space.

- **The Layering Principle:** Place a `surface-container-lowest` card on a `surface-container-low` section. This creates a natural "recessed" or "lifted" look without the clutter of shadows.
- **Ambient Shadows:** For floating elements like top app bars or active movie cards, use extra-diffused shadows. 
    - *Blur:* 32px to 64px.
    - *Opacity:* 4% - 8% of the `on-surface` color.
- **The "Ghost Border" Fallback:** If accessibility requires a container edge, use the `outline-variant` at **15% opacity**. This creates a "glint" on the edge of the glass rather than a hard line.

---

## 5. Components

### Search Bar
The search bar is a centerpiece. Instead of a solid box, use a `surface-variant` with 60% opacity and a `backdrop-blur`. The search icon should use the `primary` token to draw the eye immediately.

### Movie Poster Cards
- **Construction:** No borders. Use `md` (0.75rem) rounded corners. 
- **Interaction:** On hover, the card should scale (1.05x) and transition from `surface-container-low` to `surface-container-highest`.
- **Labels:** Title text should be hidden or overlaid with a gradient wash at the bottom of the poster, using `title-sm` typography.

### Detailed Movie Info Sections
- **Badges:** Use Material 3 style badges with `secondary-container` backgrounds and `on-secondary-container` text for genres.
- **Buttons:**
    - **Primary:** `primary-container` background, no border, `label-md` (bold) text. 
    - **Secondary:** Transparent background with a `Ghost Border`.
- **Input Fields:** Use a simple bottom-border focus state in `primary` red, but otherwise maintain a borderless `surface-container` look.

---

## 6. Do's and Don'ts

### Do
- **Do** overlap elements. Allow a movie poster to slightly "break" the container of the section above it to create depth.
- **Do** use high-quality imagery as the primary background for info sections, using a `surface-dim` gradient overlay to ensure text legibility.
- **Do** prioritize negative space. If the UI feels crowded, increase the spacing between sections rather than adding dividers.

### Don't
- **Don't** use 100% opaque, high-contrast borders. This kills the "cinematic" atmosphere instantly.
- **Don't** use standard Material 3 "elevated" shadows. They are too aggressive for this dark, editorial aesthetic. Stick to Tonal Layering.
- **Don't** use pure `#FFFFFF` for body text. Use `on-surface-variant` (`#e9bcb6`) or `on-surface` (`#e5e2e1`) to reduce eye strain and maintain the moody atmosphere.