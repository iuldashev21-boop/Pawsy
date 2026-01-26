# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pawsy is a dog health app built with React and Vite. Target users are dog owners who may be anxious about their pet's health.

## Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Tech Stack

- **React 19** with Vite 7
- **Tailwind CSS v4** - configured via `@tailwindcss/vite` plugin (no tailwind.config.js)
- **Framer Motion** - animations with `useReducedMotion()` support
- **Lucide React** - icons
- **Google Gemini AI** - health analysis

## Architecture

- `src/main.jsx` - App entry point
- `src/App.jsx` - Root component with lazy-loaded routes
- `src/index.css` - Global styles (Tailwind import, focus rings, grain texture, shimmer)
- `vite.config.js` - Vite config with React and Tailwind plugins
- `src/context/` - React Context providers (Auth, Dog, Chat, Usage, Onboarding)
- `src/components/` - Reusable UI components organized by feature
- `src/pages/` - Full page components
- `src/constants/` - Shared data (breeds, usage limits)
- `src/services/` - External API integrations (Gemini)

## Project Structure

```
src/components/
├── auth/          # Social login icons
├── chat/          # ChatBubble, ChatInput, PawTypingIndicator, RichHealthResponse
├── common/        # EmptyState, ErrorMessage, InlinePremiumHint, PawsyIcon, PremiumIcon, SkeletonLoader
├── dashboard/     # DailyHealthTip, DashboardPremiumCard, HealthStreak, ProfileCompletionCard, RecentActivityFeed, UsageStatsCard
├── dog/           # HealthOrb
├── emergency/     # EmergencyOverlay
├── feedback/      # CelebrationToast, SuccessCelebration
├── health/        # HealthTimeline
├── layout/        # BottomNav (mobile-only)
├── mascot/        # PawsyMascot (video/SVG), PawsyMascotSVG, PawsyMascotVideo
├── onboarding/    # OnboardingChecklist, WelcomeModal
├── photo/         # AnalysisResult, PhotoUploader, ScanAnimation
└── usage/         # UsageCounter, UsageLimitModal
```

---

# MCP Servers

## Figma MCP Server Rules

### Design System Tokens

#### Color Palette

| Role | Value | Usage |
|------|-------|-------|
| Primary Orange | `#F4A261` | CTAs, active states, focus rings |
| Primary Orange Dark | `#E8924F` | Hover/pressed states, gradients |
| Teal | `#7EC8C8` | Secondary accent, assistant messages |
| Teal Dark | `#5FB3B3` | Hover/gradient pairs |
| Charcoal | `#3D3D3D` | Primary text, headings |
| Gray Medium | `#6B6B6B` | Secondary text |
| Gray Light | `#9E9E9E` | Tertiary text, disabled |
| Warm BG | `#FAF6F1` | Dashboard background |
| Cream | `#FDF8F3` | Hero backgrounds |
| Peach | `#FFF5ED` | Card backgrounds |
| Warm Accent | `#FFE8D6` | Gradient accents |
| Border | `#E8E8E8` | Subtle borders |
| Error Red | `#EF5350` | Emergency, errors |
| Success Green | `#66BB6A` / `#A5D6A7` | Health good status |
| Warning Yellow | `#FFCA28` / `#FFF176` | Attention status |
| Premium Gold | `#FFD54F` | Premium badges |

#### Gradient Patterns

- Primary CTA: `from-[#F4A261] to-[#E8924F]`
- Teal accent: `from-[#7EC8C8] to-[#5FB3B3]`
- Premium card: `from-[#FFF8E7] via-[#FFE4B5] to-[#FFD699]`
- Health tip: `from-[#FFF9E6] to-[#FFF3CD]`

#### Typography

| Role | Font | Usage |
|------|------|-------|
| Headings | `font-family: 'Nunito, sans-serif'` (inline style) | All headings, titles, nav labels |
| Body | `font-family: 'DM Sans', system-ui, sans-serif` (CSS default) | Body text, descriptions |
| Hero accent | `font-family: 'Fraunces', 'Nunito', serif` (inline style) | Hero CTA headings |

#### Border Radius

- Small elements: `rounded-xl` (12px)
- Cards: `rounded-2xl` (16px)
- Large containers: `rounded-3xl` (24px) on desktop
- Circular: `rounded-full`

### Component Rules

- IMPORTANT: Always check `src/components/` for existing components before creating new ones
- Place new UI components in the appropriate feature directory under `src/components/`
- Use function declarations (not arrow functions) for component exports
- Export components as `export default ComponentName`
- All components must respect `prefers-reduced-motion` using Framer Motion's `useReducedMotion()`

### Styling Rules

- Use Tailwind utility classes for styling
- IMPORTANT: Never hardcode colors that aren't in the token palette above
- Heading fonts applied via inline `style={{ fontFamily: 'Nunito, sans-serif' }}`
- Body fonts are the CSS default — no inline style needed
- Responsive: mobile-first with `md:` breakpoint (768px) for desktop
- Mobile components use `md:hidden`, desktop-only use `hidden md:block` or `hidden md:flex`
- Focus rings: `focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2`
- Minimum touch target: 44x44px for interactive elements
- Cards use subtle shadows: `boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.02)'`

### Icon Rules

- IMPORTANT: Use `lucide-react` for all icons — do not add other icon packages
- Custom SVG icons: PawsyIcon, PremiumIcon (crown), PawsyMascot
- Icon buttons must have `aria-label` and decorative icons must have `aria-hidden="true"`

### Animation Rules

- Use Framer Motion for all animations
- IMPORTANT: Always check `useReducedMotion()` and provide reduced/no animation fallback
- Spring animations: `type: 'spring', stiffness: 260-300, damping: 20-24`
- Stagger children: `staggerChildren: 0.08, delayChildren: 0.15`
- Entry animations: `initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}`

### State Management

- Use React Context API (no Redux/Zustand)
- Contexts: `useAuth()`, `useDog()`, `useChat()`, `useUsage()`, `useOnboarding()`
- localStorage keys prefixed with `pawsy_{userId}_` for user isolation
- Cross-tab sync via storage events

### Figma MCP Integration Rules

These rules define how to translate Figma inputs into code for this project.

#### Required Flow (do not skip)

1. Run `get_design_context` first to fetch the structured representation for the exact node(s)
2. If the response is too large or truncated, run `get_metadata` to get the high-level node map, then re-fetch only the required node(s) with `get_design_context`
3. Run `get_screenshot` for a visual reference of the node variant being implemented
4. Only after you have both `get_design_context` and `get_screenshot`, download any assets needed and start implementation
5. Translate the output into this project's conventions: React function components, Tailwind CSS, Framer Motion, inline font-family styles
6. Validate against Figma for 1:1 look and behavior before marking complete

#### Implementation Rules

- Treat the Figma MCP output as a representation of design and behavior, not as final code style
- Map Figma colors to the token palette above — do not use arbitrary hex values from Figma output
- Reuse existing components from `src/components/` instead of duplicating functionality
- Use the project's spacing scale (Tailwind defaults) consistently
- Respect existing routing (`react-router-dom`), state management (Context API), and data-fetch patterns
- Strive for 1:1 visual parity with the Figma design

### Asset Handling

- IMPORTANT: If the Figma MCP server returns a localhost source for an image or SVG, use that source directly
- IMPORTANT: DO NOT import or add new icon packages — all assets should come from Figma payload or lucide-react
- IMPORTANT: DO NOT use or create placeholders if a localhost source is provided
- Store downloaded image assets in `src/assets/` or `public/`
- Mascot videos are in `src/assets/mascot/`

### Accessibility Standards

- All interactive elements must have aria-labels
- Focus-visible rings on all focusable elements (`outline: 2px solid #F4A261`)
- Skip link in `index.css` for keyboard navigation
- `prefers-reduced-motion` respected globally in CSS and per-component with `useReducedMotion()`
- Semantic HTML: proper heading hierarchy, button vs link usage
- Minimum 44x44px touch targets
