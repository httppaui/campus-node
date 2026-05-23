# Design System & UI/UX Guidelines - CampusNode

## 1. Design Philosophy
CampusNode is designed with a **"Premium Executive Dark"** aesthetic, transitioning away from standard flat, dull university portals. The design is modern, engaging, and alive, featuring:
* **Glassmorphism:** Frosted-glass container styles overlaying deep, slow-moving radial gradient backdrops to give a sense of depth.
* **Cyber-Campus Accents:** Electric Violet/Indigo as the primary brand colors, accented by vibrant Mint/Teal for successes, and Amber/Rose for alerts.
* **Micro-Animations:** Fluid button scaling, smooth state transitions, hover elevations, and interactive dashboard elements.

---

## 2. Color Palette (Design Tokens)

### CSS Variables (`index.css` / `globals.css`)
```css
@theme {
  --color-background: #090a0f;
  --color-foreground: #f8fafc;
  
  --color-card: rgba(17, 18, 28, 0.65);
  --color-card-border: rgba(255, 255, 255, 0.08);

  --color-primary: #6366f1;         /* Indigo 500 */
  --color-primary-hover: #4f46e5;   /* Indigo 600 */
  --color-primary-glow: rgba(99, 102, 241, 0.15);

  --color-secondary: #0ea5e9;       /* Sky 500 */
  --color-accent: #14b8a6;          /* Teal 500 */
  
  --color-muted: #64748b;           /* Slate 500 */
  --color-border: #1e293b;          /* Slate 800 */
  
  --color-success: #10b981;         /* Emerald 500 */
  --color-warning: #f59e0b;         /* Amber 500 */
  --color-error: #ef4444;           /* Red 500 */
}
```

### Tailwind Config Extensions (`tailwind.config.js`)
If Tailwind v3 is used, add these tokens to your `theme.extend` block:
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        foreground: 'var(--color-foreground)',
        card: {
          DEFAULT: 'var(--color-card)',
          border: 'var(--color-card-border)',
        },
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
          glow: 'var(--color-primary-glow)',
        },
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
        muted: 'var(--color-muted)',
        border: 'var(--color-border)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        error: 'var(--color-error)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.01))',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glow-primary': '0 0 15px var(--color-primary-glow)',
      }
    }
  }
}
```

---

## 3. Typography
* **Primary Headers:** **Outfit** (Google Fonts). Highly geometric, sleek, modern.
* **Body Copy:** **Inter** (Google Fonts). Optimal readability in data-dense layouts, dashboards, and tables.
* **Weights:** Light (300), Regular (400), Medium (500), SemiBold (600), Bold (700).

---

## 4. Key UI Layouts & Mockup Guidelines

### The Glassmorphic Container (`GlassCard`)
All interactive dashboard items, task lists, and information modules should be enclosed in a GlassCard:
```tsx
import React from 'react';

export const GlassCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  return (
    <div className={`
      bg-card backdrop-blur-md 
      border border-[var(--color-card-border)] 
      rounded-2xl p-6 shadow-glass 
      hover:border-indigo-500/20 transition-all duration-300
      ${className}
    `}>
      {children}
    </div>
  );
};
```

### Kanban Board Interactions
* **Structure:** Flex row with overflow-x-auto, containing columns for columns: `Todo`, `In Progress`, `Under Review`, `Done`.
* **Cards:** Embedded inside a `GlassCard`, featuring:
  * Top bar: Task Title + priority pill badge (Rose for High, Amber for Medium, Slate for Low).
  * Center: Truncated description + project tags.
  * Footer: Assigned user avatar, due date flag, deliverable attachment link indicator.
* **Micro-interactions:** Dragging changes scale slightly (`scale-102`) and drops highlight target columns with a subtle electric border pulse.

### Dynamic QR Check-in Page
* **Layout:** Centered card with absolute black background.
* **QR Display:** High contrast dark-mode compatible white-on-black QR code with a subtle electric teal boundary glow.
* **Indicator:** Underneath, show a status indicator:
  * A circular progress spinner countdown bar (15s duration).
  * A pulsing live status dot: "● LIVE SECURE SESSION".
* **Success State:** When scanned, the card flips with a 3D perspective effect (using Framer Motion) to show a success checkmark and the text: `"Checked in successfully at [Time] (+10 points gained)"`.

---

## 5. Transitions & Framer Motion Guidelines
To make the application feel responsive and alive:
1. **Route Transitions:** Fade pages in and slide up slightly.
   ```javascript
   const pageVariants = {
     initial: { opacity: 0, y: 15 },
     animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
     exit: { opacity: 0, y: -15, transition: { duration: 0.3 } }
   };
   ```
2. **Hover States:** Scale down interactive buttons slightly on click (`whileTap={{ scale: 0.97 }}`), and scale up slightly on hover (`whileHover={{ scale: 1.02, y: -2 }}`).
3. **Skeleton Loaders:** Soft, pulsing slate gradient masks to avoid sudden layout shifts during React Query loading states.
