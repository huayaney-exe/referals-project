# Seya Frontend - Dashboard

Modern dashboard frontend for Seya loyalty platform with sophisticated design system.

## Features

- ✅ **Modern Design System** - Gradient-first color system, sophisticated neutrals, glassmorphism effects
- ✅ **Authentication** - Supabase auth with login/register flows
- ✅ **Dashboard Layout** - Sidebar navigation, responsive design
- ✅ **Primitive Components** - Button, Input, Card, Badge, Progress with modern aesthetics
- ✅ **TypeScript** - Full type safety
- ✅ **Tailwind CSS** - Custom configuration with Seya brand colors

## Tech Stack

- **Framework**: Next.js 15.1.4 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design tokens
- **Auth**: Supabase Auth
- **Icons**: Lucide React
- **State**: React Query (planned)
- **Charts**: Recharts (planned)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your Supabase credentials
```

### Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Development

```bash
# Run development server
npm run dev

# Open http://localhost:3000
```

### Build

```bash
# Type check
npm run type-check

# Build for production
npm run build

# Start production server
npm start
```

## Design System

### Color System

Seya uses a modern gradient-first color system:

- **Primary**: Purple gradient (#A855F7 to #C084FC)
- **Accent**: Warm orange gradient (#F97316 to #FB923C)
- **Neutrals**: Warm purple-tinted grays (not generic)
- **Semantic**: Success, error, warning, info with gradients

### Component Library

Located in `src/design-system/primitives/`:

- **Button**: Primary, CTA, Secondary, Ghost variants
- **Input**: With labels, icons, error states
- **Card**: Default, glass, neumorphic variants
- **Badge**: Status badges with semantic colors
- **Progress**: Gradient progress bars with animation

### Design Tokens

All design tokens in `src/design-system/tokens/`:

- `colors.tokens.ts` - Full color system with gradients
- `spacing.tokens.ts` - 4px base spacing scale
- `motion.tokens.ts` - Animation durations and easing

## Project Structure

```
frontend/
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── dashboard/            # Dashboard pages
│   │   ├── login/                # Login page
│   │   ├── register/             # Register page
│   │   └── layout.tsx            # Root layout
│   ├── design-system/            # Seya Design System
│   │   ├── tokens/               # Design tokens
│   │   └── primitives/           # UI components
│   └── lib/                      # Utilities
│       ├── auth-context.tsx      # Auth provider
│       ├── supabase.ts           # Supabase client
│       └── utils.ts              # Helpers
├── tailwind.config.ts            # Tailwind + Seya tokens
└── package.json
```

## Authentication Flow

1. User visits `/` → redirects to `/login` or `/dashboard`
2. Login/Register pages use Supabase Auth
3. AuthProvider wraps app, manages user state
4. Dashboard layout protects routes, redirects if not authenticated

## Design Philosophy

Seya's frontend follows these principles:

- **Gradient-first** - Not flat colors, sophisticated gradients
- **Warm neutrals** - Purple-tinted grays tie to brand
- **Physics-based motion** - Spring animations, not linear
- **Contextual semantics** - Colors adapt to usage context
- **Accessibility first** - WCAG 2.2 compliant from start

## Next Steps

### Phase 6 Remaining Features

- [ ] Customer list page with search/pagination
- [ ] Campaign creation page with form builder
- [ ] Analytics dashboard with KPIs and charts
- [ ] Supabase Realtime integration
- [ ] E2E tests with Playwright (8 tests)

### Deployment

- Configure Vercel project
- Add environment variables
- Deploy to production

## License

Private - Seya Platform
