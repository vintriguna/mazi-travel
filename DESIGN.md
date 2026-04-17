# Design System Specification: The Fluid Explorer

## 1. Overview & Creative North Star

**Creative North Star: "The Curated Horizon"**

This design system rejects the "boxed-in" nature of traditional travel utilities. Instead of rigid grids and heavy borders, we embrace an editorial, high-end travel magazine aesthetic fused with modern digital fluidness. We aim for a "Curated Horizon"—a layout that feels as expansive and inviting as a coastal vista.

The system breaks the "template" look through **Intentional Asymmetry** and **Layered Depth**. By utilizing overlapping elements, organic background shapes, and a sophisticated typographic scale, we transform a functional planning tool into an inspiring journey. We move away from "UI as a container" and toward "UI as an environment."

---

## 2. Colors: Tonal Landscapes

Our palette is not just a collection of hex codes; it is a system of light and energy.

### Core Palette

- **Primary (Adventure Blue - #003D9B):** Our anchor. Use `primary` for high-authority actions. Apply `primary_container` (#0052CC) for moments of high energy.
- **Secondary (Sunset Orange - #904D00):** Used sparingly as a "heat map" for discovery and adventure-callouts.
- **Tertiary (Tropical Teal - #004C48):** Represents the "AI Intelligence." Use for smart suggestions and collaborative features.

### The "No-Line" Rule

**Explicit Instruction:** Prohibit 1px solid borders for sectioning. Boundaries must be defined solely through background color shifts. To separate a sidebar from a main feed, use `surface_container_low` against a `surface` background. Horizontal rules (HRs) are replaced by generous vertical whitespace.

### Surface Hierarchy & Nesting

Treat the UI as a series of physical layers.

- **The Base:** Use `surface` (#F7F9FC) for the canvas.
- **The Nested Layer:** Use `surface_container_low` for secondary content areas.
- **The Feature Card:** Use `surface_container_lowest` (#FFFFFF) for primary cards to make them "pop" against the off-white base.

### The "Glass & Gradient" Rule

To elevate the experience, floating elements (like a "Group Chat" or "AI Assistant" bubble) should utilize Glassmorphism:

- **Background:** `surface_container_lowest` at 70% opacity.
- **Effect:** `backdrop-blur: 20px`.
- **Gradients:** Main CTAs should use a subtle linear gradient from `primary` (#003D9B) to `primary_container` (#0052CC) at a 135-degree angle to add "soul" and dimension.

---

## 3. Typography: Editorial Authority

We use a high-contrast scale to create an approachable yet professional hierarchy.

- **Display & Headline (Plus Jakarta Sans):** These are our "Voice." With generous letter-spacing (-0.02em) and bold weights, they feel like headlines in a luxury travel journal. `display-lg` (3.5rem) should be used for hero statements to ground the user in inspiration.
- **Body & Labels (Inter):** These are our "Engine." Inter provides unparalleled legibility for complex travel itineraries. Use `body-md` (0.875rem) as the workhorse for all data-heavy planning views.
- **The Hierarchy Rule:** Always pair a `headline-lg` with a `body-lg` to create a sophisticated, high-end editorial rhythm. Avoid using more than three font sizes on a single screen to maintain "Quiet Luxury."

---

## 4. Elevation & Depth: The Layering Principle

We convey importance through **Tonal Layering**, not structural lines.

- **Ambient Shadows:** When an element must float (e.g., a modal or a primary action button), use a "Sunlight Shadow."
  - **Color:** A tinted version of `on_surface` at 6% opacity.
  - **Values:** `0px 12px 32px`. This mimics natural ambient light.
- **The "Ghost Border" Fallback:** If a border is required for accessibility (e.g., in high-contrast mode), use `outline_variant` (#C3C6D6) at 20% opacity. Never use 100% opaque borders.
- **Organic Shapes:** To reinforce the "Adventurous Spirit," use large, blurred SVG blobs in the background using `secondary_fixed` and `tertiary_fixed` at 10% opacity. These should "peek" from the corners of the screen to break the rectangular grid.

---

## 5. Components: Fluid Primitives

### Buttons: The Action Drivers

- **Primary:** Rounded `lg` (1rem). Gradient fill (Primary to Primary Container). White text.
- **Secondary:** Rounded `lg`. `surface_container_highest` background. No border.
- **Tertiary/Ghost:** No background. `primary` text. Use for low-emphasis actions like "Cancel."

### Cards: The Itinerary Blocks

- **Construction:** Use `surface_container_lowest` background. Radius: `xl` (1.5rem) for a friendly, modern feel.
- **Content Separation:** No dividers. Use `body-sm` in `on_surface_variant` for metadata, separated by 16px of whitespace from the title.

### Input Fields: The Conversation

- **Styling:** `surface_container_low` background with a `md` (0.75rem) radius.
- **States:** On focus, transition the background to `surface_container_lowest` and add a 2px "Ghost Border" of `primary`.

### Travel Specific: The "Route Chip"

- **Context:** Used for tagging destinations or flight types.
- **Design:** Use `tertiary_container` with `on_tertiary_container` text. Radius: `full` (9999px). This creates a vibrant, pill-shaped tag that feels like a modern passport stamp.

---

## 6. Do's and Don'ts

### Do

- **Do** use whitespace as a functional element to group related content.
- **Do** overlap images and text blocks slightly to create a bespoke, custom-built feel.
- **Do** use the `secondary` (Sunset Orange) color for AI-driven "Smart Suggestions" to highlight value.
- **Do** utilize `backdrop-blur` on navigation bars to keep the "Horizon" visible as users scroll.

### Don't

- **Don't** use 1px solid black or grey borders. They break the fluid, premium feel.
- **Don't** use default system drop shadows (e.g., `0px 2px 4px #000`). They feel "cheap."
- **Don't** crowd the interface. If a screen feels "busy," increase the vertical spacing between sections by one step on the spacing scale.
- **Don't** use sharp 0px corners. Every interaction should feel soft and approachable.
