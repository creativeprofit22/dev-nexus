# Component Moodboard - Design System Documentation

**Project**: DevNexus Component Library Showcase
**Phase**: Pre-implementation Design Specification
**Design Philosophy**: Organized Chaos + Maximalist Aesthetics + Performance Hybrid
**Date**: 2026-01-16

---

## Core Design Principles

### 1. Mixed Styles with Unified Language

**The Challenge**: Use different design styles per category without creating visual chaos.

**The Solution**: Establish a **consistency framework** that ties everything together:

#### Unifying Elements (The Glue)

1. **Spacing System** (Sacred Grid)
   - All cards use multiples of 8px (8, 16, 24, 32, 40, 48)
   - Padding: Minimum 24px, maximum 48px
   - Gaps between cards: 24px consistent
   - Margin from viewport: 40px

2. **Typography Hierarchy** (Consistent Across All Styles)
   ```
   Component Name: 20px, font-weight: 700
   Category Badge: 12px, font-weight: 600, uppercase
   Description: 14px, font-weight: 400
   Code snippets: 13px, monospace
   ```

3. **Color Temperature Rules**
   - Warm categories (orange/red) never touch cool categories (cyan/blue)
   - Each category has a **primary accent color** but shares the same neutral grays
   - Dark mode base: `#0a0e1a` (universal background)
   - Light mode base: `#f8fafc` (universal background)

4. **Transition Timing** (Universal Rhythm)
   - Micro interactions: 150ms
   - Hover states: 300ms
   - Modal open/close: 400ms
   - Page transitions: 600ms
   - All use `cubic-bezier(0.4, 0.0, 0.2, 1)` (Material Design easing)

5. **Shadow Depth System** (Z-axis consistency)
   ```
   Level 0 (flush): none
   Level 1 (card): 0 2px 8px rgba(0,0,0,0.15)
   Level 2 (hover): 0 8px 24px rgba(0,0,0,0.25)
   Level 3 (modal): 0 16px 48px rgba(0,0,0,0.35)
   Level 4 (tooltip): 0 4px 12px rgba(0,0,0,0.2)
   ```

6. **Border Weight Consistency**
   - All borders: 1px, 2px, or 3px only
   - Brutalist style gets 3px
   - Default styles get 1px
   - Emphasis states get 2px

#### Style-to-Category Mapping

| Category | Primary Style | Secondary Elements | Accent Color | Shape Profile |
|----------|---------------|-------------------|--------------|---------------|
| **Buttons** | Neo-Brutalism | Hard shadows, thick borders | `#facc15` (yellow) | Rectangle, sharp corners |
| **Cards** | Claymorphism | Soft shadows, glossy highlights | `#a855f7` (purple) | Rounded blobs (24px radius) |
| **Inputs** | Dark Neumorphism | Inset shadows, subtle emboss | `#06b6d4` (cyan) | Soft rectangles (12px radius) |
| **Navigation** | Cyberpunk | Neon borders, notched corners | `#ec4899` (pink) | Clip-path notches |
| **Feedback** | Skeuomorphism | Textures, material depth | `#f97316` (orange) | Rounded + pseudo-elements |
| **Data Display** | Brutalism | B&W high contrast, geometric | `#ffffff` (white) | Hexagons, hard angles |
| **Advanced/3D** | Vaporwave + Organic | Gradients, glitch, morphing | Rainbow spectrum | Irregular blobs |

---

## 2. Organized Chaos Framework

### Grid System: **Masonry with Constraints**

**Base Grid**:
```
Desktop (1920px): 4 columns, 24px gap
Laptop (1440px): 3 columns, 24px gap
Tablet (768px): 2 columns, 20px gap
Mobile (375px): 1 column, 16px gap
```

**Chaos Elements** (controlled randomization):

1. **Card Height Variation**
   - Small: 320px (simple components like buttons)
   - Medium: 480px (standard cards, inputs)
   - Large: 640px (complex components, advanced features)
   - X-Large: 800px (featured showcases with live demos)

2. **Subtle Rotation** (personality without disorder)
   ```javascript
   // Seed-based rotation (consistent per card ID)
   const rotation = ((cardId.charCodeAt(0) % 5) - 2) * 0.5; // -1deg to 1deg
   transform: rotate(${rotation}deg);
   ```

3. **Z-Index Layering** (sticker board effect)
   - Base layer: z-index 1
   - Hover: z-index 10 (brings card forward)
   - Active: z-index 20 (modal open)
   - Featured cards: z-index 5 (slightly elevated always)

4. **Stagger Animation Delay**
   ```javascript
   // On page load, cards animate in with staggered delay
   gsap.from(cards, {
     y: 80,
     opacity: 0,
     scale: 0.9,
     stagger: 0.05, // 50ms between each card
     duration: 0.6,
     ease: "power3.out"
   });
   ```

5. **Overflow Tolerance**
   - Cards can overlap by max 8px at corners
   - Creates depth perception without messiness
   - Hover state pulls card above neighbors

---

## 3. Maximalist Features (The Fun Stuff)

### Visual Effects Library

#### A. Per-Card Effects

**Buttons Category - Neo-Brutalist**
```css
/* Static state */
background: #facc15;
border: 3px solid #000;
box-shadow: 6px 6px 0 #ec4899;
color: #000;
font-weight: 900;

/* Hover state */
transform: translate(3px, 3px);
box-shadow: 3px 3px 0 #ec4899;

/* Active state (click) */
transform: translate(6px, 6px);
box-shadow: 0 0 0 #ec4899;
```

**Cards Category - Claymorphism**
```css
/* Static */
background: linear-gradient(145deg, #8b5cf6, #7c3aed);
border-radius: 32px;
box-shadow:
  0 8px 32px rgba(139, 92, 246, 0.4),
  inset 0 -4px 16px rgba(0, 0, 0, 0.2),
  inset 0 4px 16px rgba(255, 255, 255, 0.1);

/* Hover - glossy highlight moves */
&::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 40%;
  background: linear-gradient(
    180deg,
    rgba(255,255,255,0.3) 0%,
    transparent 100%
  );
  border-radius: inherit;
  transition: transform 0.3s;
}

&:hover::before {
  transform: translateY(10px) scale(1.1);
}
```

**Inputs Category - Dark Neumorphism**
```css
background: #0e1219;
border-radius: 16px;
box-shadow:
  inset 6px 6px 12px rgba(0, 0, 0, 0.6),
  inset -6px -6px 12px rgba(30, 35, 45, 0.15),
  0 0 0 2px rgba(6, 182, 212, 0.1); /* Cyan glow ring */

/* Focus state */
box-shadow:
  inset 6px 6px 12px rgba(0, 0, 0, 0.6),
  inset -6px -6px 12px rgba(30, 35, 45, 0.15),
  0 0 0 3px rgba(6, 182, 212, 0.4),
  0 0 24px rgba(6, 182, 212, 0.3);
```

**Navigation Category - Cyberpunk**
```css
background: rgba(10, 14, 26, 0.95);
clip-path: polygon(
  12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px
);

/* Animated holographic border */
&::before {
  content: '';
  position: absolute;
  inset: -2px;
  background: linear-gradient(
    45deg,
    #ec4899 0%, #06b6d4 25%, #ec4899 50%, #06b6d4 75%, #ec4899 100%
  );
  background-size: 400% 400%;
  clip-path: inherit;
  z-index: -1;
  animation: holo-flow 6s linear infinite;
  filter: blur(4px);
}

@keyframes holo-flow {
  to { background-position: 400% 0; }
}
```

**Feedback Category - Skeuomorphic**
```css
/* Brushed metal texture */
background:
  repeating-linear-gradient(
    90deg,
    #2a3142 0px,
    #3a4152 1px,
    #2a3142 2px
  ),
  linear-gradient(180deg, rgba(255,255,255,0.1), rgba(0,0,0,0.1));
border: 1px solid rgba(255,255,255,0.1);
box-shadow:
  0 2px 8px rgba(0,0,0,0.5),
  inset 0 1px 0 rgba(255,255,255,0.1);
border-radius: 8px;

/* Embossed label */
.label {
  text-shadow:
    0 1px 2px rgba(0,0,0,0.8),
    0 -1px 0 rgba(255,255,255,0.1);
}
```

**Data Display Category - Brutalism**
```css
background: #000;
border: 4px solid #fff;
clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
box-shadow: 8px 8px 0 #fff;
color: #fff;
font-family: 'Courier New', monospace;
font-weight: 700;

/* Hover - no smooth transitions, instant jump */
&:hover {
  background: #fff;
  color: #000;
  box-shadow: 12px 12px 0 #000;
  border-color: #000;
  transition: none; /* Instant switch */
}
```

**Advanced/3D Category - Vaporwave**
```css
background:
  linear-gradient(135deg,
    #ff006e 0%,
    #8338ec 25%,
    #3a86ff 50%,
    #8338ec 75%,
    #ff006e 100%
  );
background-size: 400% 400%;
animation: gradient-flow 8s ease infinite;
border-radius: 45% 55% 62% 38% / 53% 40% 60% 47%;
animation: gradient-flow 8s ease infinite, blob-morph 12s ease infinite;
box-shadow: 0 8px 32px rgba(255, 0, 110, 0.5);

/* Scanline overlay */
&::after {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent 0px,
    rgba(0, 0, 0, 0.3) 1px,
    transparent 2px,
    transparent 4px
  );
  pointer-events: none;
  mix-blend-mode: multiply;
}

@keyframes gradient-flow {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@keyframes blob-morph {
  0%, 100% { border-radius: 45% 55% 62% 38% / 53% 40% 60% 47%; }
  25% { border-radius: 62% 38% 55% 45% / 47% 60% 40% 53%; }
  50% { border-radius: 38% 62% 45% 55% / 60% 47% 53% 40%; }
  75% { border-radius: 55% 45% 38% 62% / 40% 53% 47% 60%; }
}
```

#### B. Global Effects (Page-Level)

**1. Cursor Trail Effect**
```javascript
// Canvas-based particle trail
// Spawns small colored dots that fade out
// Color matches the category of hovered card
// 60fps via requestAnimationFrame
// Max 50 particles at once (performance limit)
```

**2. Ambient Background Animation**
```css
/* Subtle moving gradient in background */
body::before {
  content: '';
  position: fixed;
  inset: -100%;
  background:
    radial-gradient(circle at 20% 30%, rgba(139, 92, 246, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(6, 182, 212, 0.05) 0%, transparent 50%);
  animation: ambient-drift 30s ease-in-out infinite;
  pointer-events: none;
}

@keyframes ambient-drift {
  0%, 100% { transform: translate(0, 0); }
  33% { transform: translate(5%, 5%); }
  66% { transform: translate(-5%, 5%); }
}
```

**3. Spotlight Effect** (follows cursor)
```css
/* Radial gradient that follows mouse position */
/* Applied to a pseudo-element over the grid */
/* Brightens cards under the cursor */
.grid::before {
  content: '';
  position: fixed;
  width: 600px;
  height: 600px;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.03) 0%,
    transparent 70%
  );
  pointer-events: none;
  z-index: 100;
  transition: transform 0.15s ease-out;
  /* Position updated via JS on mousemove */
}
```

**4. Card Hover Interactions**

- **Magnetic Effect**: Cards subtly move toward cursor when nearby (within 200px radius)
- **Neighbor Fade**: Adjacent cards slightly dim (opacity: 0.7) when one is hovered
- **Scale Pop**: Hovered card scales to 1.05 and increases z-index
- **Info Reveal**: Description and action buttons fade in from bottom

#### C. Micro-Interactions

**Copy Code Button**
```
1. Hover: Icon changes to clipboard + scale(1.1)
2. Click:
   - Button morphs into checkmark (GSAP morph)
   - Success ripple emanates (green ring expands and fades)
   - Toast notification slides from bottom-right
   - After 2s, button returns to original state
```

**Component Preview Toggle**
```
1. Default: Static image preview
2. Hover:
   - Play icon fades in center
   - Image slightly zooms (scale: 1.05)
3. Click:
   - Modal expands from card position (scale + position transition)
   - Backdrop blur fades in
   - Interactive preview loads with skeleton loader
```

**Filter Category Chips**
```
1. Inactive state: Ghost button style
2. Hover: Border glow (accent color)
3. Active:
   - Filled background (accent color)
   - Icon appears (checkmark)
   - Gentle bounce animation (elastic ease)
4. Deselect: Reverse animation
```

**Search Input**
```
1. Empty: Placeholder with blinking cursor animation
2. Focus:
   - Width expands from 300px to 500px
   - Border glow (cyan)
   - Clear button fades in
3. Typing:
   - Results count badge appears above
   - Grid items animate out (fade + scale down) if filtered out
4. Clear: All items animate back in (stagger)
```

---

## 4. Theme System (Dark + Light Mode)

### Dark Mode (Default)

**Base Colors**:
```css
--bg-primary: #0a0e1a;
--bg-secondary: #181c24;
--bg-tertiary: #212730;

--text-primary: #e2e8f0;
--text-secondary: #cbd5e1;
--text-tertiary: #94a3b8;
--text-muted: #64748b;

--border-subtle: rgba(255, 255, 255, 0.05);
--border-default: rgba(255, 255, 255, 0.1);
--border-strong: rgba(255, 255, 255, 0.2);
```

**Category Accent Colors** (Dark Mode):
```css
--accent-buttons: #facc15; /* Yellow */
--accent-cards: #a855f7; /* Purple */
--accent-inputs: #06b6d4; /* Cyan */
--accent-navigation: #ec4899; /* Pink */
--accent-feedback: #f97316; /* Orange */
--accent-data: #ffffff; /* White */
--accent-advanced: linear-gradient(135deg, #ff006e, #8338ec, #3a86ff);
```

**Shadow System (Dark)**:
```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.5);
--shadow-md: 0 4px 8px rgba(0, 0, 0, 0.4);
--shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.35);
--shadow-xl: 0 16px 48px rgba(0, 0, 0, 0.3);

--shadow-glow-cyan: 0 0 20px rgba(6, 182, 212, 0.4);
--shadow-glow-purple: 0 0 20px rgba(168, 85, 247, 0.4);
--shadow-glow-pink: 0 0 20px rgba(236, 72, 153, 0.4);
```

### Light Mode

**Base Colors**:
```css
--bg-primary: #f8fafc;
--bg-secondary: #ffffff;
--bg-tertiary: #f1f5f9;

--text-primary: #0f172a;
--text-secondary: #334155;
--text-tertiary: #64748b;
--text-muted: #94a3b8;

--border-subtle: rgba(0, 0, 0, 0.05);
--border-default: rgba(0, 0, 0, 0.1);
--border-strong: rgba(0, 0, 0, 0.2);
```

**Category Accent Colors** (Light Mode - adjusted for contrast):
```css
--accent-buttons: #eab308; /* Darker yellow */
--accent-cards: #9333ea; /* Darker purple */
--accent-inputs: #0891b2; /* Darker cyan */
--accent-navigation: #db2777; /* Darker pink */
--accent-feedback: #ea580c; /* Darker orange */
--accent-data: #0f172a; /* Near black */
--accent-advanced: linear-gradient(135deg, #db2777, #7c3aed, #2563eb);
```

**Shadow System (Light)**:
```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.08);
--shadow-md: 0 4px 8px rgba(0, 0, 0, 0.12);
--shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.15);
--shadow-xl: 0 16px 48px rgba(0, 0, 0, 0.18);

--shadow-glow-cyan: 0 0 20px rgba(6, 182, 212, 0.2);
--shadow-glow-purple: 0 0 20px rgba(168, 85, 247, 0.2);
--shadow-glow-pink: 0 0 20px rgba(236, 72, 153, 0.2);
```

**Style Adjustments for Light Mode**:

- **Neumorphism**: Flip shadow direction (light from top-left instead of top-right)
- **Brutalism**: Invert colors (white bg, black borders becomes black bg, white borders)
- **Cyberpunk**: Reduce glow intensity by 50% (too harsh in light mode)
- **Claymorphism**: Use lighter gradients, reduce inner shadow depth

### Theme Toggle Animation

```javascript
// On theme switch:
1. Fade out current content (opacity: 0, duration: 150ms)
2. Swap CSS variables
3. Fade in new content (opacity: 1, duration: 150ms)
4. Optional: Circular reveal animation from toggle button position
```

---

## 5. Performance Optimization Strategy (The Smart Stuff)

### Core Philosophy: **GPU-Accelerated CSS > JavaScript Animations**

#### Optimization Tier System

**Tier 1: Always On** (Minimal cost)
- CSS transforms (translate, scale, rotate)
- Opacity transitions
- Border/background color changes
- Static clip-paths

**Tier 2: On Hover** (Triggered, limited scope)
- Box-shadow transitions
- Backdrop-filter effects (blur)
- GSAP micro-animations (individual card)
- Pseudo-element animations

**Tier 3: On Interaction** (User-initiated)
- Canvas particle effects (click bursts)
- Complex GSAP sequences (modal open)
- Morph animations (SVG)

**Tier 4: Expensive, Use Sparingly**
- Continuous CSS animations (gradients, blobs)
- Cursor tracking (mousemove listeners)
- WebGL effects (if any 3D)

#### Performance Rules

1. **Use `will-change` Sparingly**
   ```css
   /* Only on hover, not persistent */
   .card:hover {
     will-change: transform, opacity;
   }

   /* Remove after animation */
   .card:not(:hover) {
     will-change: auto;
   }
   ```

2. **Debounce Expensive Operations**
   ```javascript
   // Mousemove events (cursor effects)
   const handleMouseMove = debounce((e) => {
     updateSpotlight(e);
   }, 16); // ~60fps

   // Search filtering
   const handleSearch = debounce((query) => {
     filterComponents(query);
   }, 300); // 300ms delay
   ```

3. **Lazy Load Preview Images**
   ```javascript
   // Use Intersection Observer
   const observer = new IntersectionObserver((entries) => {
     entries.forEach(entry => {
       if (entry.isIntersecting) {
         const img = entry.target;
         img.src = img.dataset.src;
         observer.unobserve(img);
       }
     });
   });
   ```

4. **Virtual Scrolling for Large Lists**
   ```javascript
   // If component count > 100, use react-window or react-virtuoso
   // Only render visible cards + buffer
   ```

5. **CSS Containment**
   ```css
   .component-card {
     contain: layout style paint;
     /* Isolates card rendering from rest of page */
   }
   ```

6. **Reduce Backdrop-Blur Usage**
   ```css
   /* Expensive: backdrop-filter on many elements */
   /* Solution: Only on modals and sticky headers */

   .modal-backdrop {
     backdrop-filter: blur(12px);
   }

   /* Cards use solid colors with transparency instead */
   .card {
     background: rgba(24, 28, 36, 0.95); /* Fake blur with opacity */
   }
   ```

7. **Optimize GSAP Animations**
   ```javascript
   // Use GSAP's special properties for performance
   gsap.to(element, {
     x: 100, // Better than left: 100px
     scale: 1.1, // Better than width/height
     autoAlpha: 0, // Better than visibility + opacity
     force3D: true, // Force GPU acceleration
   });

   // Batch DOM reads/writes
   gsap.ticker.add(() => {
     // All DOM reads here
     const bounds = element.getBoundingClientRect();

     // Then all DOM writes
     gsap.set(element, { x: bounds.x });
   });
   ```

8. **Code Splitting by Category**
   ```javascript
   // Lazy load category-specific effects
   const loadCyberpunkEffects = () => import('./effects/cyberpunk');
   const loadVaporwaveEffects = () => import('./effects/vaporwave');

   // Only load when category is visible
   ```

9. **Memoization for React Components**
   ```javascript
   // Prevent unnecessary re-renders
   const ComponentCard = memo(({ component }) => {
     // Card content
   }, (prev, next) => prev.component.id === next.component.id);
   ```

10. **RequestAnimationFrame for Smooth Animations**
    ```javascript
    // Instead of setInterval
    function animate() {
      updateParticles();
      updateCursorTrail();
      requestAnimationFrame(animate);
    }
    animate();
    ```

#### Performance Budget

- **Initial Load**: < 3s on 4G
- **Time to Interactive**: < 4s
- **First Contentful Paint**: < 1.5s
- **Animation FPS**: Consistent 60fps (no jank)
- **Hover Response**: < 100ms
- **Search Filter**: < 200ms

#### Monitoring

```javascript
// Track performance metrics
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log('Animation frame took:', entry.duration, 'ms');
    if (entry.duration > 16.67) {
      console.warn('Frame drop detected!');
    }
  }
});
observer.observe({ entryTypes: ['measure'] });
```

---

## Component Categories - Detailed Breakdown

### 1. Buttons (Neo-Brutalism)

**Variants to Include**:
- Primary (yellow bg, black text, pink shadow)
- Secondary (white bg, black border, black shadow)
- Ghost (transparent, black border on hover)
- Danger (red bg, black text, red-dark shadow)
- Icon-only (square, icon centered)
- Icon + Text (icon left, text right)
- Split button (button + dropdown)
- Button group (3 connected buttons)
- Loading state (spinner icon, disabled)
- Success state (checkmark icon, green accent)

**Interaction Details**:
- Press animation: Shadow reduces, button moves toward shadow
- Release: Elastic bounce back
- Disabled: Grayscale filter + 50% opacity
- Focus: 2px dotted outline, 4px offset

**Code Structure**:
```tsx
<Button
  variant="primary"
  size="md"
  icon={<IconName />}
  loading={false}
  disabled={false}
  onClick={() => {}}
>
  Click Me
</Button>
```

---

### 2. Cards (Claymorphism)

**Variants to Include**:
- Basic card (title, description, footer)
- Image card (image top, content below)
- Horizontal card (image left, content right)
- Stat card (large number, label, trend indicator)
- Interactive card (hover reveals actions)
- Expandable card (click to show more content)
- Pricing card (price, features list, CTA button)
- Profile card (avatar, name, bio, social links)

**Interaction Details**:
- Hover: Glossy highlight shifts position
- Click: Gentle scale down (0.98) then back
- Expandable: Height animates smoothly with GSAP
- Drag: Can be reordered in grid (react-grid-layout)

**Visual Features**:
- Gradient background (purple spectrum)
- Rounded blob shape (32px radius with slight variation)
- Multi-layered shadows (outer + inset)
- Subtle noise texture overlay (low opacity)

---

### 3. Inputs (Dark Neumorphism)

**Variants to Include**:
- Text input (single line)
- Text area (multi-line)
- Number input (with increment/decrement buttons)
- Search input (magnifying glass icon, clear button)
- Password input (show/hide toggle)
- Select dropdown (custom styled)
- Multi-select (chips inside input)
- Date picker (calendar popup)
- Color picker (swatch grid)
- Slider (range input)
- Toggle switch (on/off)
- Checkbox (individual + checkbox group)
- Radio buttons (group)

**Interaction Details**:
- Focus: Cyan glow ring animates in
- Invalid: Red glow ring + shake animation
- Valid: Green checkmark icon appears right
- Disabled: Darker inset, no glow on focus
- Floating label: Label moves up and shrinks on focus/fill

**Visual Features**:
- Inset appearance (looks pressed into surface)
- Dark background (#0e1219)
- Inner shadows (top-left dark, bottom-right light)
- Outer glow ring on focus (cyan)
- Monospace font for input text

---

### 4. Navigation (Cyberpunk)

**Variants to Include**:
- Horizontal tabs (underline indicator)
- Vertical tabs (side highlight bar)
- Pills (filled background indicator)
- Breadcrumbs (with chevron separators)
- Pagination (prev, numbers, next)
- Stepper (multi-step progress)
- Sidebar menu (collapsible sections)
- Navbar (logo, links, actions)
- Command bar (keyboard shortcut hints)
- Context menu (right-click dropdown)

**Interaction Details**:
- Tab switch: Indicator slides smoothly to new position (GSAP)
- Hover: Holographic border intensifies
- Active state: Filled with gradient
- Keyboard navigation: Arrow keys move between tabs
- Notched corner: Clips to cyberpunk shape

**Visual Features**:
- Animated holographic border (gradient flows around edge)
- Notched corners (clip-path polygon)
- Dark translucent background
- Pink/cyan accent colors
- Scanline overlay (subtle)

---

### 5. Feedback (Skeuomorphic)

**Variants to Include**:
- Modal dialog (centered, backdrop blur)
- Alert dialog (confirm/cancel actions)
- Drawer (slide from side)
- Toast notification (corner pop-up)
- Snackbar (bottom banner)
- Tooltip (hover info box)
- Popover (click to show extra info)
- Progress bar (linear, with percentage)
- Progress circle (radial, with percentage)
- Skeleton loader (animated pulse)
- Spinner (rotating icon)
- Empty state (illustration + message)
- Error state (icon + message + action)

**Interaction Details**:
- Modal: Scale in from center + backdrop fade
- Toast: Slide in from corner, auto-dismiss after 5s
- Progress: Smooth animation of fill (GSAP)
- Tooltip: Follows cursor with slight delay (300ms)
- Drawer: Slide from edge with spring ease

**Visual Features**:
- Brushed metal texture (repeating linear gradient)
- Embossed text (text-shadow for depth)
- Beveled edges (border highlight top, shadow bottom)
- Leather texture option (background image)
- Stitching detail (dashed border on pseudo-element)

---

### 6. Data Display (Brutalism)

**Variants to Include**:
- Table (sortable columns, row hover)
- Data grid (editable cells)
- List (bullet, numbered, definition)
- Timeline (vertical, horizontal)
- Stats grid (KPI tiles)
- Chart card (mini chart + value)
- Badge (count, status)
- Tag (removable chip)
- Code block (syntax highlighted)
- Keyboard shortcut (key visual)
- Metric card (big number, label, trend)

**Interaction Details**:
- Table row hover: Instant background switch (no transition)
- Sort: Column header click, arrow flips instantly
- List item: Hard shadow appears on hover
- Code block: Copy button in top-right corner
- Badge: No animations, purely functional

**Visual Features**:
- Black background, white text (or inverse)
- Thick borders (4px solid)
- Hard drop shadows (no blur, solid color)
- Hexagonal or octagonal shapes
- Monospace font for all text
- No rounded corners (0px border-radius)

---

### 7. Advanced/3D (Vaporwave + Organic)

**Variants to Include**:
- 3D card tilt (parallax on hover)
- Particle button (click explosion)
- Morphing blob background
- Liquid button (SVG morph)
- Text scramble effect
- Glitch effect (on hover)
- Holographic card (iridescent)
- Floating elements (subtle drift)
- Ripple effect (click spreads rings)
- Mouse trail (colored particles)
- Spotlight card (light follows cursor)
- Parallax layers (background moves slower)

**Interaction Details**:
- 3D tilt: Card rotates based on cursor position (Three.js or CSS 3D)
- Particle burst: 20 particles fly outward from click point
- Blob morph: Border-radius animates continuously
- Glitch: RGB split + transform jitter on trigger
- Text scramble: Characters cycle through random letters then resolve

**Visual Features**:
- Rainbow gradient backgrounds
- Animated gradients (position shifts)
- Morphing shapes (border-radius keyframes)
- Scanline overlay (CRT screen effect)
- Chromatic aberration (RGB color split)
- Glow effects (multiple box-shadows)
- Irregular blob shapes (complex border-radius)

---

## Page Layout Structure

### A. Header (Sticky)
```
┌─────────────────────────────────────────────────────────┐
│ Logo    [Search Bar ]      [Category Filters]   [Theme] │
└─────────────────────────────────────────────────────────┘
```

**Components**:
- Logo: DevNexus text + icon (left)
- Search: Expandable input (center-left)
- Category filters: Chip toggles (center-right)
- Theme toggle: Sun/moon icon (right)
- Height: 80px
- Background: Backdrop blur + gradient border bottom
- Z-index: 100 (always on top)

### B. Main Content Area

```
┌─────┬─────────────────────────────────────────────────┐
│     │                                                   │
│     │  [ Card ] [ Card ] [ Card ] [ Card ]            │
│ S   │                                                   │
│ i   │  [ Card ] [ Card ] [ Card ]                      │
│ d   │                                                   │
│ e   │  [ Card ] [ Card ] [ Card ] [ Card ]            │
│ b   │                                                   │
│ a   │  [ Card ] [ Card ]                               │
│ r   │                                                   │
│     │  [ Card ] [ Card ] [ Card ]                      │
│     │                                                   │
└─────┴─────────────────────────────────────────────────┘
```

**Sidebar** (250px wide, sticky):
- Quick links (jump to category)
- Stats (component count per category)
- Sort options (newest, popular, alphabetical)
- View mode toggle (grid, list, compact)

**Grid Area** (Flex: 1):
- Masonry layout (react-masonry-css)
- Responsive columns (1-4 based on viewport)
- 24px gap between cards
- Cards: 320px-800px height (varies by content)

### C. Component Card Structure

```
┌─────────────────────────────────────┐
│ [Category Badge]           [❤ Save] │
│                                      │
│         [Preview Image]              │
│                                      │
│  Component Name                      │
│  Short description text here...     │
│                                      │
│  [View Code] [Copy] [Live Demo]     │
└─────────────────────────────────────┘
```

**Card Sections**:
1. **Header**: Category badge (top-left), Save icon (top-right)
2. **Preview**: Static image or interactive demo (60% of card height)
3. **Content**: Name (20px, bold), Description (14px, 2 lines max)
4. **Actions**: 3 buttons (view code, copy, live demo)

**Card Dimensions**:
- Width: 100% of column (auto-responsive)
- Height: Auto (based on content)
- Padding: 24px
- Border radius: Varies by category style

### D. Modal (Expanded View)

```
┌────────────────────────────────────────────────────────┐
│  ← Back                    Component Name          ✕   │
├────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┬──────────────┬────────────────────┐ │
│  │              │              │                     │ │
│  │   Preview    │   Props      │   Code              │ │
│  │   (live)     │   Controls   │   (syntax           │ │
│  │              │              │   highlighted)      │ │
│  │              │              │                     │ │
│  └──────────────┴──────────────┴────────────────────┘ │
│                                                         │
│  Dependencies: react, clsx                             │
│  Tailwind config: colors.sky-500                       │
│                                                         │
│  [Copy Component Code] [Copy to Stackblitz]           │
└────────────────────────────────────────────────────────┘
```

**Modal Features**:
- Opens with scale animation from card position
- Backdrop blur (12px)
- 3-column layout (desktop), stacked (mobile)
- **Preview**: Live interactive component with mock data
- **Props**: Knobs to adjust component props in real-time
- **Code**: Syntax highlighted, copy button, language tabs (TSX, CSS)
- Close with ESC key or click backdrop

---

## Implementation Priority

### Phase 1: Foundation (Week 1)
- [ ] Set up Tailwind variables for themes
- [ ] Create base grid layout (masonry)
- [ ] Build component data schema
- [ ] Implement basic card structure (no effects yet)
- [ ] Add search filtering
- [ ] Add category filtering

### Phase 2: Style System (Week 2)
- [ ] Implement all 7 category styles
- [ ] Add dark/light theme toggle
- [ ] Test theme switching on all components
- [ ] Ensure consistent spacing/typography

### Phase 3: Animations (Week 3)
- [ ] GSAP entrance animations (stagger)
- [ ] Hover effects per category
- [ ] Click interactions (button press, card expand)
- [ ] Modal open/close animations
- [ ] Cursor trail effect

### Phase 4: Advanced Features (Week 4)
- [ ] Live component preview in modal
- [ ] Props playground
- [ ] Code copy functionality
- [ ] Spotlight effect (cursor glow)
- [ ] Particle effects (click bursts)

### Phase 5: Performance & Polish (Week 5)
- [ ] Lazy load images
- [ ] Optimize animations (debounce, RAF)
- [ ] Virtual scrolling (if needed)
- [ ] Accessibility audit (keyboard nav, ARIA)
- [ ] Mobile responsiveness
- [ ] Cross-browser testing

### Phase 6: Package Setup (Week 6)
- [ ] Create component package structure
- [ ] Generate installation instructions
- [ ] Build Stackblitz integration
- [ ] Write component documentation
- [ ] Create usage examples

---

## Technical Stack

**Core**:
- Next.js 16 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS 4

**Animation**:
- GSAP 3 (ScrollTrigger, MorphSVG plugins)
- Framer Motion (if needed for complex sequences)

**Layout**:
- react-masonry-css (masonry grid)
- react-grid-layout (drag-drop reorder)

**Code Display**:
- Prism.js or Shiki (syntax highlighting)
- react-simple-code-editor (editable code)

**3D/Canvas** (optional for Advanced category):
- Three.js + React Three Fiber (3D card tilt)
- HTML Canvas API (particle effects, cursor trail)

**Utilities**:
- clsx (conditional classes)
- zustand (state management)
- date-fns (if showing component publish dates)

---

## Accessibility Checklist

- [ ] Keyboard navigation (Tab, Enter, Arrow keys)
- [ ] Focus indicators (visible outlines)
- [ ] ARIA labels (buttons, links, modals)
- [ ] Color contrast (WCAG AA: 4.5:1 for text)
- [ ] Reduced motion (prefers-reduced-motion media query)
- [ ] Screen reader support (semantic HTML)
- [ ] Alt text for preview images
- [ ] Skip links (skip to main content)

---

## File Structure

```
src/app/(authenticated)/moodboard/
├── page.tsx                          # Main page
├── layout.tsx                        # Moodboard layout
├── components/
│   ├── MoodboardGrid.tsx             # Masonry grid container
│   ├── ComponentCard/
│   │   ├── index.tsx                 # Card wrapper
│   │   ├── CardButtons.tsx           # Neo-brutalist style
│   │   ├── CardCards.tsx             # Claymorphism style
│   │   ├── CardInputs.tsx            # Neumorphism style
│   │   ├── CardNavigation.tsx        # Cyberpunk style
│   │   ├── CardFeedback.tsx          # Skeuomorphic style
│   │   ├── CardData.tsx              # Brutalism style
│   │   └── CardAdvanced.tsx          # Vaporwave style
│   ├── ComponentModal.tsx            # Expanded view
│   ├── FilterToolbar.tsx             # Search + category filters
│   ├── ThemeToggle.tsx               # Dark/light switch
│   ├── CategoryBadge.tsx             # Colored chips
│   ├── CodeBlock.tsx                 # Syntax highlighted code
│   └── CursorEffects.tsx             # Canvas effects
├── hooks/
│   ├── useComponentFilter.ts         # Filter logic
│   ├── useGSAPAnimations.ts          # Animation utilities
│   ├── useCopyToClipboard.ts         # Copy functionality
│   ├── useTheme.ts                   # Theme switching
│   └── useCursorTrail.ts             # Cursor particle trail
├── data/
│   ├── components.ts                 # Component registry
│   └── categories.ts                 # Category definitions
├── styles/
│   ├── animations.css                # GSAP/keyframe animations
│   ├── neo-brutalism.css             # Brutalist styles
│   ├── claymorphism.css              # Clay styles
│   ├── neumorphism.css               # Neomorphic styles
│   ├── cyberpunk.css                 # Cyberpunk styles
│   ├── skeuomorphism.css             # Skeuomorphic styles
│   ├── brutalism.css                 # Pure brutalist styles
│   └── vaporwave.css                 # Vaporwave styles
└── utils/
    ├── gsap-presets.ts               # Reusable GSAP configs
    ├── theme-variables.ts            # CSS variable definitions
    └── performance.ts                # Optimization utilities
```

---

## Additional Notes

### Why This Design Works

1. **Consistency Through Contrast**: Each category has a unique style, but they share typography, spacing, and interaction timing. This creates visual interest without chaos.

2. **Organized Chaos**: The masonry layout feels organic, but the grid system constrains it. Subtle rotations add personality without hindering usability.

3. **Maximalist with Purpose**: Every animation and effect serves a purpose (feedback, delight, clarity). Nothing is decorative without function.

4. **Performance First**: GPU-accelerated CSS does the heavy lifting. JavaScript only handles complex interactions. Lazy loading and debouncing prevent jank.

5. **Accessible Boldness**: High contrast, keyboard navigation, and reduced motion options ensure the maximalist design doesn't exclude anyone.

### Design Inspirations

- **Neo-Brutalism**: Gumroad, Figma Community
- **Claymorphism**: Stripe Dashboard, Apple Design Awards
- **Neumorphism**: Dribbble concepts (2020 trend)
- **Cyberpunk**: CD Projekt Red UI, Blade Runner aesthetics
- **Vaporwave**: Aesthetic subreddits, 80s-90s media
- **Brutalism**: Balenciaga website, Yale School of Art

### Future Expansion Ideas

- **User Submissions**: Allow devs to submit their own components
- **Remix Feature**: Fork a component and modify it in-browser
- **Collections**: Users can save favorite components to collections
- **Figma Export**: Generate Figma components from code
- **A11y Score**: Each component gets an accessibility rating
- **Dark Patterns Warning**: Flag components with UX issues

---

## Next Steps (When You're Ready to Build)

1. Read through this entire document
2. Decide on any modifications to the design direction
3. Set up the file structure
4. Start with Phase 1 (foundation)
5. Build one category style at a time (test thoroughly)
6. Add animations incrementally (measure performance)
7. Polish and optimize before adding more features

**Estimated Timeline**: 6 weeks for full implementation (working part-time)

---

**Document Status**: Ready for Implementation
**Last Updated**: 2026-01-16
**Approved By**: (Pending your review)
