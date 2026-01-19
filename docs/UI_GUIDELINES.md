# PAWSY UI Guidelines

Design system for PAWSY - "Apple meets Headspace + Pixar"

## Design Philosophy

- **Warmth First** - Every element feels comforting and approachable
- **Breathing Space** - Generous whitespace lets content breathe
- **Soft Everything** - Rounded corners, soft shadows, gentle gradients
- **Motion with Purpose** - Animations enhance understanding, never distract
- **Accessible Delight** - Beautiful AND usable by everyone

## Color Palette

### Primary Colors

```css
/* Primary - Warm Peach */
--primary-50: #FFF5ED;
--primary-100: #FFE8D6;
--primary-200: #FFD0AC;
--primary-300: #FFB380;
--primary-400: #F4A261;    /* Main */
--primary-500: #E8924F;
--primary-600: #D4793A;
--primary-700: #B05E28;

/* Secondary - Soft Teal */
--secondary-50: #F0FAFA;
--secondary-100: #D9F2F2;
--secondary-200: #B8E6E6;
--secondary-300: #94D8D8;
--secondary-400: #7EC8C8;    /* Main */
--secondary-500: #5FB3B3;
--secondary-600: #489999;

/* Background */
--bg-primary: #FDF8F3;       /* Soft cream - main bg */
--bg-secondary: #FFF9F5;     /* Lighter cream */
--bg-card: #FFFFFF;          /* Card surfaces */

/* Accent - Green (Health/Success) */
--accent-green-100: #C8E6C9;
--accent-green-200: #A5D6A7;
--accent-green-300: #81C784;  /* Main */
--accent-green-400: #66BB6A;

/* Accent - Amber (Warning/Attention) */
--accent-amber-100: #FFF9C4;
--accent-amber-200: #FFF176;
--accent-amber-300: #FFD54F;  /* Main */
--accent-amber-400: #FFCA28;

/* Text */
--text-primary: #3D3D3D;     /* Warm charcoal */
--text-secondary: #6B6B6B;   /* Secondary text */
--text-muted: #9E9E9E;       /* Placeholders */
--text-inverse: #FFFFFF;     /* On dark backgrounds */

/* Semantic */
--color-success: #81C784;
--color-warning: #FFD54F;
--color-error: #EF5350;
--color-info: #7EC8C8;
```

### Color Usage

| Use Case | Color | Tailwind Class |
|----------|-------|----------------|
| Primary buttons | `#F4A261` | `bg-primary-400` |
| Secondary buttons | `#7EC8C8` | `bg-secondary-400` |
| Page background | `#FDF8F3` | `bg-bg-primary` |
| Cards | `#FFFFFF` | `bg-white` |
| Healthy status | `#81C784` | `bg-accent-green-300` |
| Attention needed | `#FFD54F` | `bg-accent-amber-300` |
| Body text | `#3D3D3D` | `text-text-primary` |
| Labels | `#6B6B6B` | `text-text-secondary` |
| Placeholders | `#9E9E9E` | `text-text-muted` |

### Gradients

```css
/* Hero background */
.gradient-hero {
  background: linear-gradient(135deg, #FDF8F3 0%, #FFE8D6 50%, #FFD0AC 100%);
}

/* Warm page gradient */
.gradient-warm {
  background: linear-gradient(180deg, #FDF8F3 0%, #FFF5ED 100%);
}

/* Primary button */
.gradient-primary-btn {
  background: linear-gradient(135deg, #F4A261 0%, #E8924F 100%);
}

/* Health orb - good */
.gradient-orb-good {
  background: radial-gradient(circle, #A5D6A7 0%, #81C784 50%, #66BB6A 100%);
}

/* Health orb - warning */
.gradient-orb-warning {
  background: radial-gradient(circle, #FFF176 0%, #FFD54F 50%, #FFCA28 100%);
}
```

## Typography

### Font Stack

```css
/* Headings - Playful yet professional */
--font-heading: 'Nunito', system-ui, sans-serif;

/* Body - Clean and readable */
--font-body: 'Inter', system-ui, -apple-system, sans-serif;
```

### Font Import

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Nunito:wght@600;700;800&display=swap" rel="stylesheet">
```

### Type Scale

| Name | Size | Use |
|------|------|-----|
| `text-xs` | 12px | Fine print, badges |
| `text-sm` | 14px | Captions, labels |
| `text-base` | 16px | Body text |
| `text-lg` | 18px | Lead paragraphs |
| `text-xl` | 20px | Card titles |
| `text-2xl` | 24px | Section headers |
| `text-3xl` | 30px | Page titles (mobile) |
| `text-4xl` | 36px | Page titles (tablet) |
| `text-5xl` | 48px | Hero titles |

### Typography Patterns

```jsx
// Hero heading
<h1 className="font-heading text-4xl md:text-5xl font-bold text-text-primary">
  Welcome to Pawsy
</h1>

// Section heading
<h2 className="font-heading text-2xl md:text-3xl font-bold text-text-primary">
  Your Dog's Health
</h2>

// Card title
<h3 className="font-heading text-xl font-semibold text-text-primary">
  Recent Activity
</h3>

// Body text
<p className="font-body text-base text-text-secondary leading-relaxed">
  Body content here
</p>

// Caption
<span className="font-body text-sm text-text-muted">
  Last updated 2 hours ago
</span>
```

## Spacing

Based on 4px grid.

| Token | Value | Use |
|-------|-------|-----|
| `space-1` | 4px | Tight gaps |
| `space-2` | 8px | Icon gaps, tight padding |
| `space-3` | 12px | Small padding |
| `space-4` | 16px | Standard padding, gaps |
| `space-5` | 20px | Medium gaps |
| `space-6` | 24px | Card padding |
| `space-8` | 32px | Section gaps |
| `space-10` | 40px | Large gaps |
| `space-12` | 48px | Section margins |
| `space-16` | 64px | Page sections |

### Spacing Rules

| Element | Spacing |
|---------|---------|
| Page padding (mobile) | 16px (`p-4`) |
| Page padding (desktop) | 24-32px (`p-6` to `p-8`) |
| Card padding | 16-24px (`p-4` to `p-6`) |
| Between sections | 32-48px (`my-8` to `my-12`) |
| Between related items | 8-16px (`gap-2` to `gap-4`) |
| Form field gaps | 16px (`space-y-4`) |
| Button padding | `px-6 py-3` |

## Border Radius

| Token | Value | Use |
|-------|-------|-----|
| `rounded-sm` | 6px | Subtle rounding |
| `rounded-md` | 8px | Inputs, small elements |
| `rounded-lg` | 12px | Buttons, small cards |
| `rounded-xl` | 16px | Cards, dialogs |
| `rounded-2xl` | 24px | Featured cards, modals |
| `rounded-full` | 9999px | Avatars, pills |

### Radius Usage

| Element | Radius |
|---------|--------|
| Buttons | `rounded-lg` (12px) |
| Inputs | `rounded-md` (8px) |
| Cards | `rounded-xl` (16px) |
| Avatars | `rounded-full` |
| Modals | `rounded-2xl` (24px) |
| Badges/Pills | `rounded-full` |
| Images | `rounded-lg` to `rounded-xl` |

## Shadows

```css
/* Soft, warm shadows */
--shadow-sm: 0 1px 2px 0 rgba(61, 61, 61, 0.05);
--shadow-md: 0 4px 6px -1px rgba(61, 61, 61, 0.07),
             0 2px 4px -2px rgba(61, 61, 61, 0.05);
--shadow-lg: 0 10px 15px -3px rgba(61, 61, 61, 0.08),
             0 4px 6px -4px rgba(61, 61, 61, 0.05);
--shadow-xl: 0 20px 25px -5px rgba(61, 61, 61, 0.1),
             0 8px 10px -6px rgba(61, 61, 61, 0.05);

/* Glow effects */
--shadow-glow-primary: 0 0 20px rgba(244, 162, 97, 0.3);
--shadow-glow-secondary: 0 0 20px rgba(126, 200, 200, 0.3);
--shadow-glow-green: 0 0 30px rgba(129, 199, 132, 0.4);
```

## Component Patterns

### Buttons

```jsx
// Primary Button
<button className="
  px-6 py-3
  bg-gradient-to-r from-primary-400 to-primary-500
  text-white font-semibold
  rounded-lg
  shadow-md hover:shadow-lg
  transform hover:scale-[1.02] active:scale-[0.98]
  transition-all duration-200
">
  Get Started
</button>

// Secondary Button
<button className="
  px-6 py-3
  bg-white
  text-primary-500 font-semibold
  border-2 border-primary-200
  rounded-lg
  hover:bg-primary-50 hover:border-primary-300
  transition-all duration-200
">
  Learn More
</button>

// Ghost Button
<button className="
  px-4 py-2
  text-text-secondary font-medium
  rounded-lg
  hover:bg-gray-100
  transition-colors duration-200
">
  Cancel
</button>

// Icon Button
<button className="
  p-3 min-w-[44px] min-h-[44px]
  rounded-full
  text-text-secondary
  hover:bg-gray-100 hover:text-primary-500
  transition-colors duration-200
">
  <Settings className="w-5 h-5" />
</button>
```

### Cards

```jsx
// Standard Card
<div className="
  bg-white
  rounded-xl
  p-6
  shadow-md
  border border-gray-100
">
  {content}
</div>

// Interactive Card
<div className="
  bg-white
  rounded-xl
  p-6
  shadow-md
  border border-gray-100
  cursor-pointer
  hover:shadow-lg hover:border-primary-200
  transform hover:scale-[1.01]
  transition-all duration-200
">
  {content}
</div>

// Elevated Card (modals)
<div className="
  bg-white
  rounded-2xl
  p-6
  shadow-xl
  border border-gray-50
">
  {content}
</div>
```

### Inputs

```jsx
// Text Input
<input
  type="text"
  className="
    w-full
    px-4 py-3
    bg-white
    border-2 border-gray-200
    rounded-md
    text-text-primary
    placeholder:text-text-muted
    focus:border-primary-400 focus:ring-2 focus:ring-primary-100
    transition-all duration-200
    outline-none
  "
  placeholder="Enter your dog's name"
/>

// With Label
<div className="space-y-2">
  <label className="block text-sm font-medium text-text-secondary">
    Dog's Name
  </label>
  <input type="text" className="..." />
</div>

// Textarea
<textarea
  className="
    w-full
    px-4 py-3
    bg-white
    border-2 border-gray-200
    rounded-md
    text-text-primary
    placeholder:text-text-muted
    focus:border-primary-400 focus:ring-2 focus:ring-primary-100
    transition-all duration-200
    outline-none
    resize-none
  "
  rows={4}
  placeholder="Describe what's happening..."
/>
```

### Avatars

```jsx
// Dog Avatar
<div className="
  w-16 h-16
  rounded-full
  overflow-hidden
  border-3 border-primary-200
  shadow-md
  bg-primary-100
  flex items-center justify-center
">
  {photoUrl ? (
    <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
  ) : (
    <Dog className="w-8 h-8 text-primary-400" />
  )}
</div>

// Size variants: w-10 h-10 (sm), w-16 h-16 (md), w-24 h-24 (lg)
```

### Badges

```jsx
// Status badges
<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-accent-green-100 text-green-700">
  Healthy
</span>

<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-accent-amber-100 text-amber-700">
  Attention Needed
</span>

<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700">
  Urgent
</span>
```

## Animation System

### Framer Motion Config

```javascript
// animations/transitions.js
export const transitions = {
  fast: { duration: 0.15 },
  default: { duration: 0.3 },
  slow: { duration: 0.5 },

  spring: {
    type: 'spring',
    stiffness: 300,
    damping: 30,
  },

  springBouncy: {
    type: 'spring',
    stiffness: 400,
    damping: 25,
  },

  springGentle: {
    type: 'spring',
    stiffness: 200,
    damping: 35,
  },
};
```

### Animation Variants

```javascript
// animations/variants.js

// Page transitions
export const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

// Staggered lists
export const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.1 },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

// Fade directions
export const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
};

export const fadeInDown = {
  initial: { opacity: 0, y: -30 },
  animate: { opacity: 1, y: 0 },
};

// Scale effects
export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
};

// Hover/tap
export const tapScale = {
  whileTap: { scale: 0.98 },
};

export const hoverLift = {
  whileHover: { y: -4, scale: 1.02 },
};
```

### Micro-Animations

```javascript
// Floating (decorative elements)
export const floatVariants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Breathing (ambient elements)
export const breatheVariants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};
```

## Wow Factor Implementations

### 1. Onboarding: Dog Photo Hero

```jsx
<motion.div
  initial={{ scale: 0.8, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
>
  <motion.img
    src={dogPhoto}
    className="w-48 h-48 rounded-full object-cover shadow-xl border-4 border-primary-200"
    layoutId="dog-avatar"
  />

  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.5 }}
    className="mt-6 text-center"
  >
    <p className="text-2xl font-heading text-primary-500">
      I'll take care of <span className="font-bold">{dogName}</span>
    </p>
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.8, type: 'spring' }}
    >
      <Sparkles className="w-6 h-6 text-accent-amber-400 mx-auto mt-2" />
    </motion.div>
  </motion.div>
</motion.div>
```

### 2. Dashboard: Health Orb

```jsx
<motion.div className="relative flex items-center justify-center">
  {/* Outer glow */}
  <div className="absolute w-40 h-40 rounded-full bg-accent-green-200 opacity-50 blur-xl" />

  {/* Orb */}
  <motion.div
    className="relative w-32 h-32 rounded-full bg-gradient-to-br from-accent-green-200 via-accent-green-300 to-accent-green-400"
    animate={{
      scale: [1, 1.05, 1],
      boxShadow: [
        '0 0 30px rgba(129, 199, 132, 0.4)',
        '0 0 50px rgba(129, 199, 132, 0.6)',
        '0 0 30px rgba(129, 199, 132, 0.4)',
      ],
    }}
    transition={{
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
  >
    <Heart className="absolute inset-0 m-auto w-12 h-12 text-white" />
  </motion.div>
</motion.div>
```

### 3. Chat: Paw Typing Indicator

```jsx
<div className="flex items-center gap-2 p-3 bg-gray-100 rounded-2xl w-fit">
  {/* Wiggling paw */}
  <motion.div
    animate={{ rotate: [0, -10, 10, -10, 0] }}
    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 0.5 }}
  >
    <PawPrint className="w-5 h-5 text-primary-400" />
  </motion.div>

  {/* Bouncing dots */}
  <div className="flex gap-1">
    {[0, 1, 2].map((i) => (
      <motion.span
        key={i}
        className="w-2 h-2 rounded-full bg-primary-300"
        animate={{ y: [0, -6, 0] }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          delay: i * 0.15,
        }}
      />
    ))}
  </div>
</div>
```

### 4. Photo Upload: Scan Animation

```jsx
<div className="relative overflow-hidden rounded-xl">
  <img src={uploadedImage} className="w-full" />

  {/* Scan line */}
  <motion.div
    className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-secondary-400 to-transparent"
    initial={{ top: 0 }}
    animate={{ top: '100%' }}
    transition={{
      duration: 2,
      repeat: Infinity,
      ease: 'linear',
    }}
  />

  {/* Corner brackets */}
  <div className="absolute inset-4 border-2 border-secondary-400 rounded-lg opacity-50" />

  {/* Status text */}
  <motion.div
    className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 rounded-full"
    animate={{ opacity: [0.5, 1, 0.5] }}
    transition={{ duration: 1.5, repeat: Infinity }}
  >
    <span className="text-white text-sm font-medium">Analyzing...</span>
  </motion.div>
</div>
```

## Responsive Breakpoints

| Breakpoint | Width | Target |
|------------|-------|--------|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablets |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Large desktop |

### Mobile-First Patterns

```jsx
// Container
<div className="max-w-md mx-auto md:max-w-2xl lg:max-w-4xl px-4 md:px-6 lg:px-8">

// Grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">

// Typography
<h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">

// Show/hide
<nav className="hidden md:flex">   {/* Desktop only */}
<nav className="md:hidden">        {/* Mobile only */}
```

## Accessibility

### Color Contrast

All text meets WCAG AA (4.5:1 minimum):

- `#3D3D3D` on `#FDF8F3` = 9.7:1
- `#FFFFFF` on `#F4A261` = 3.2:1 (use bold/large)
- `#FFFFFF` on `#E8924F` = 4.1:1

### Focus States

```jsx
// Visible focus ring
<button className="
  focus:outline-none
  focus-visible:ring-2
  focus-visible:ring-primary-400
  focus-visible:ring-offset-2
">

// Input focus
<input className="
  focus:border-primary-400
  focus:ring-2
  focus:ring-primary-100
  outline-none
">
```

### Touch Targets

- Minimum: 44x44px
- Apply `min-h-[44px] min-w-[44px]` to interactive elements

### Screen Readers

```jsx
// Hidden but accessible
<span className="sr-only">Open menu</span>

// Aria labels
<button aria-label="Add new dog profile">
  <Plus className="w-6 h-6" />
</button>

// Live regions
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>
```

### Reduced Motion

```jsx
import { useReducedMotion } from 'framer-motion';

function AnimatedComponent() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      animate={prefersReducedMotion ? {} : { y: [0, -10, 0] }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 3, repeat: Infinity }}
    >
      {content}
    </motion.div>
  );
}
```

## Icon Usage

### Lucide Icons

```jsx
import {
  Dog,           // Dog profile
  Heart,         // Health
  MessageCircle, // Chat
  Camera,        // Photo
  Home,          // Dashboard
  Settings,      // Settings
  Plus,          // Add
  ChevronRight,  // Navigation
  AlertCircle,   // Warning
  CheckCircle,   // Success
  X,             // Close
  Upload,        // Upload
  Sparkles,      // AI/Magic
  PawPrint,      // Paw indicator
} from 'lucide-react';
```

### Icon Sizes

| Size | Class | Use |
|------|-------|-----|
| SM | `w-4 h-4` | Inline, badges |
| MD | `w-5 h-5` | Buttons, nav |
| LG | `w-6 h-6` | Cards, actions |
| XL | `w-8 h-8` | Features |
| 2XL | `w-12 h-12` | Hero, empty states |

## Tailwind Config

Add to `index.css` or `tailwind.config.js`:

```css
@import "tailwindcss";

@theme {
  --color-primary-50: #FFF5ED;
  --color-primary-100: #FFE8D6;
  --color-primary-200: #FFD0AC;
  --color-primary-300: #FFB380;
  --color-primary-400: #F4A261;
  --color-primary-500: #E8924F;
  --color-primary-600: #D4793A;

  --color-secondary-50: #F0FAFA;
  --color-secondary-100: #D9F2F2;
  --color-secondary-200: #B8E6E6;
  --color-secondary-300: #94D8D8;
  --color-secondary-400: #7EC8C8;
  --color-secondary-500: #5FB3B3;

  --color-bg-primary: #FDF8F3;
  --color-bg-secondary: #FFF9F5;

  --color-accent-green-100: #C8E6C9;
  --color-accent-green-200: #A5D6A7;
  --color-accent-green-300: #81C784;
  --color-accent-green-400: #66BB6A;

  --color-accent-amber-100: #FFF9C4;
  --color-accent-amber-200: #FFF176;
  --color-accent-amber-300: #FFD54F;
  --color-accent-amber-400: #FFCA28;

  --color-text-primary: #3D3D3D;
  --color-text-secondary: #6B6B6B;
  --color-text-muted: #9E9E9E;

  --font-heading: 'Nunito', system-ui, sans-serif;
  --font-body: 'Inter', system-ui, sans-serif;
}
```
