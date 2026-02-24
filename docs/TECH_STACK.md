# GeeksforGeeks SRMIST Chapter - Tech Stack Documentation v2

> **Audience:** Future Maintainers  
> **Version:** 2.0  
> **Last Updated:** December 2025

---

## Table of Contents

1. [The "Headless" Philosophy](#the-headless-philosophy)
2. [The Governance Proxy Pattern](#the-governance-proxy-pattern)
3. [Authentication Flow](#authentication-flow)
4. [Styling Strategy](#styling-strategy)
5. [Technology Overview](#technology-overview)

---

## The "Headless" Philosophy

### What is Headless Architecture?

A "headless" architecture **decouples** the content management layer (where content is stored and edited) from the presentation layer (where content is displayed). In our stack:

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Content** | Contentful CMS | Store and manage team profiles, events |
| **Data** | Supabase (PostgreSQL) | Store form submissions, handle auth |
| **Presentation** | Next.js 14+ (App Router) | Render the website, handle API routes |

### Why We Chose This

#### ❌ Traditional (Monolithic) Approach
```
WordPress/PHP → Tightly coupled theme + database + content
└── Changing the frontend requires touching the backend
└── Content locked in one system
└── Security vulnerabilities from plugins
```

#### ✅ Our Headless Approach
```
Contentful (Content) ──API──┐
                            ├──► Next.js (Frontend) ──► Users
Supabase (Data) ────API─────┘
```

### Benefits

1. **Omnichannel Ready**  
   The same content from Contentful can power:
   - This Next.js website
   - A future mobile app
   - Digital signage displays
   - Third-party integrations
   
2. **Cleaner Frontend Code**  
   - No database queries mixed with UI code
   - Clear separation of concerns
   - Easier to test and maintain

3. **Scalability**  
   - Contentful handles content delivery at scale
   - Supabase provides managed PostgreSQL with real-time capabilities
   - Next.js can be deployed on Vercel's edge network

4. **Security**  
   - Content editors never touch the codebase
   - API keys are compartmentalized (read vs. write)
   - No PHP/plugin vulnerabilities

5. **Developer Experience**  
   - Modern TypeScript/React stack
   - Hot reloading and fast builds
   - Type-safe content models

---

## The Governance Proxy Pattern

### The Problem

We have **20+ team leads** who need to update their own profiles (bio, social links). However:

- ❌ We can't give everyone direct access to the **Contentful Dashboard**
- ❌ Sharing the `CONTENTFUL_MANAGEMENT_TOKEN` is a massive security risk
- ❌ One malicious or accidental action could delete/corrupt all content
- ❌ No audit trail of who changed what

### The Solution: Middleware Proxy

We built a **custom API layer** that acts as a controlled gateway to Contentful.

```
┌─────────────────────────────────────────────────────────────────┐
│                        THE GOVERNANCE PROXY                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Team Lead                                                      │
│      │                                                           │
│      │ 1. Login with email (rahul@srmist.edu.in)                │
│      ▼                                                           │
│   ┌──────────────┐                                              │
│   │ Next.js API  │  2. Validate session                         │
│   │   (Proxy)    │  3. Query Contentful for memberProfile       │
│   │              │     WHERE email = "rahul@srmist.edu.in"      │
│   └──────┬───────┘                                              │
│          │                                                       │
│          │ 4. Does email match?                                 │
│          │                                                       │
│    ┌─────┴─────┐                                                │
│    │           │                                                 │
│   YES          NO                                                │
│    │           │                                                 │
│    ▼           ▼                                                 │
│  Update     403 Forbidden                                        │
│  Allowed    "You can only edit your own profile"                │
│    │                                                             │
│    │ 5. Server uses CONTENTFUL_MANAGEMENT_TOKEN                 │
│    │    (never exposed to client)                               │
│    ▼                                                             │
│   ┌──────────────┐                                              │
│   │  Contentful  │  6. Profile updated & published              │
│   │     CMS      │                                              │
│   └──────────────┘                                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Implementation Details

**Location:** `/app/api/admin/update-profile/route.ts`

```typescript
// 1. Get authenticated user's email
const userEmail = request.headers.get('x-mock-user-email');

// 2. Query Contentful for matching profile
const entries = await environment.getEntries({
  content_type: 'memberProfile',
  'fields.email': userEmail,  // The KEY check
  limit: 1,
});

// 3. If no match → user trying to edit someone else's profile
if (entries.total === 0) {
  return NextResponse.json(
    { error: 'Forbidden: Profile not found' },
    { status: 403 }
  );
}

// 4. Only now do we allow the update
const entry = entries.items[0];
entry.fields.bio = { 'en-US': newBio };
await entry.update();
await entry.publish();
```

### The "God Mode" Exception

For Chair/Vice-Chair who need full admin access:

**Location:** `/app/api/admin/god-mode/route.ts`

```typescript
const SUPER_ADMINS = ['admin@club.com', 'chairperson@club.com'];

if (!SUPER_ADMINS.includes(mockEmail)) {
  return NextResponse.json(
    { error: 'Forbidden: God Mode Access Denied' },
    { status: 403 }
  );
}

// Full CRUD operations allowed
switch (action) {
  case 'create': ...
  case 'update': ...
  case 'delete': ...
  case 'publish': ...
}
```

### Key Security Properties

| Property | How It's Achieved |
|----------|-------------------|
| **Least Privilege** | Leads can only edit their own profile |
| **Token Protection** | Management token only on server |
| **Audit Trail** | Contentful tracks all changes with timestamps |
| **Fail-Safe** | No match = denied (whitelist approach) |

---

## Authentication Flow

### Why We Removed Passwords

1. **Security**
   - Passwords are frequently reused across sites
   - Password databases are breach targets
   - Users forget passwords → support burden
   
2. **Simplicity**
   - No password reset flow needed
   - No password strength validation
   - No "forgot password" emails

3. **Modern UX**
   - Magic links/OTP are becoming standard
   - Faster than typing passwords
   - Works seamlessly on mobile

### Why Resend Instead of Default Supabase SMTP

| Issue | Supabase Default | Resend |
|-------|-----------------|--------|
| **Latency** | 5-30 seconds | < 1 second |
| **Deliverability** | Shared IP reputation | Dedicated infrastructure |
| **Customization** | Limited templates | Full HTML templates |
| **Rate Limits** | Restrictive free tier | Generous free tier |

### The Complete Auth Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                     AUTHENTICATION FLOW                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. User enters email at /login                                  │
│         │                                                         │
│         ▼                                                         │
│  ┌─────────────────┐                                             │
│  │ sendOtp()       │  Server Action                              │
│  │ /login/actions  │                                             │
│  └────────┬────────┘                                             │
│           │                                                       │
│           ▼                                                       │
│  2. Check ALLOWED_ADMIN_EMAILS env var                           │
│           │                                                       │
│      ┌────┴────┐                                                 │
│      │         │                                                  │
│    Found    Not Found → "Not authorized" error                   │
│      │                                                            │
│      ▼                                                            │
│  3. supabase.auth.signInWithOtp({ email })                       │
│           │                                                       │
│           ▼                                                       │
│  4. Supabase calls Resend API                                    │
│           │                                                       │
│           ▼                                                       │
│  5. User receives 6-digit OTP in email                           │
│           │                                                       │
│           ▼                                                       │
│  ┌─────────────────┐                                             │
│  │ verifyOtp()     │  Server Action                              │
│  │ /login/actions  │                                             │
│  └────────┬────────┘                                             │
│           │                                                       │
│           ▼                                                       │
│  6. supabase.auth.verifyOtp({ email, token, type: 'email' })     │
│           │                                                       │
│      ┌────┴────┐                                                 │
│      │         │                                                  │
│    Valid    Invalid → "Invalid OTP" error                        │
│      │                                                            │
│      ▼                                                            │
│  7. Session cookie set automatically                             │
│           │                                                       │
│           ▼                                                       │
│  8. Redirect to /admin                                           │
│           │                                                       │
│           ▼                                                       │
│  9. Middleware checks session on all /admin/* routes             │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### Middleware Protection

**Location:** `/middleware.ts`

```typescript
// Protect all /admin routes
if (request.nextUrl.pathname.startsWith('/admin') && !user) {
  return NextResponse.redirect(new URL('/login', request.url));
}

// Redirect authenticated users away from /login
if (request.nextUrl.pathname.startsWith('/login') && user) {
  return NextResponse.redirect(new URL('/admin', request.url));
}
```

### Environment Setup for Auth

```bash
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Allowlist (comma-separated emails)
ALLOWED_ADMIN_EMAILS=chair@club.com,vicechair@club.com,lead1@club.com

# Upstash Redis (optional — enables rate limiting & Contentful caching)
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AX...
```

---

## Styling Strategy

### The "Glassmorphism" Approach

Our design uses a modern glass-like aesthetic achieved with CSS backdrop filters and semi-transparent backgrounds.

#### Core Technique

```css
/* The Glassmorphism Recipe */
.glass-card {
  background: rgba(255, 255, 255, 0.05);  /* bg-white/5 */
  backdrop-filter: blur(12px);             /* backdrop-blur-xl */
  border: 1px solid rgba(255, 255, 255, 0.1); /* border-white/10 */
  border-radius: 1rem;
}
```

#### Tailwind CSS Implementation

We use Tailwind's utility classes for consistency:

```jsx
<div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl">
  {/* Glass card content */}
</div>
```

#### Common Patterns

| Effect | Tailwind Classes |
|--------|-----------------|
| **Glass Panel** | `backdrop-blur-xl bg-white/5 border border-white/10` |
| **Hover Glow** | `hover:bg-white/10 transition-all duration-300` |
| **Gradient Text** | `bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60` |
| **Shadow Depth** | `shadow-2xl` |
| **Blur Background** | `blur-[128px]` (for ambient blobs) |

### Ambient Background Effects

```jsx
{/* Purple glow blob */}
<div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px]" />

{/* Blue glow blob */}
<div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px]" />
```

### Color Palette

| Purpose | Color | Tailwind |
|---------|-------|----------|
| **Primary (GFG Green)** | `#46b94e` | Custom or `green-500` |
| **Background** | `#000000` | `bg-black` |
| **Text Primary** | `#ffffff` | `text-white` |
| **Text Muted** | `rgba(255,255,255,0.4)` | `text-white/40` |
| **Borders** | `rgba(255,255,255,0.1)` | `border-white/10` |
| **Accent (Purple)** | `#9333ea` | `purple-600` |

### Icon System: Lucide React

We use **[lucide-react](https://lucide.dev/)** for consistent, lightweight iconography.

#### Why Lucide?

1. **Tree-shakeable** - Only imports icons you use
2. **Consistent Design** - All icons follow the same visual language
3. **Lightweight** - ~0.5KB per icon
4. **React Native Ready** - Same icons work on mobile

#### Usage Pattern

```jsx
import { Mail, Loader2, ArrowRight, KeyRound } from 'lucide-react';

// Standard icon
<Mail size={18} />

// Animated loading spinner
<Loader2 size={18} className="animate-spin" />

// With hover color change
<Github size={18} className="text-white hover:text-green-500" />
```

#### Commonly Used Icons

| Icon | Import | Usage |
|------|--------|-------|
| 📧 | `Mail` | Email links, login form |
| 🔐 | `KeyRound` | OTP input field |
| ➡️ | `ArrowRight` | Submit buttons, CTAs |
| ⏳ | `Loader2` | Loading states (with `animate-spin`) |
| 🔗 | `Linkedin`, `Github`, `Instagram` | Social links |
| ⬆️⬇️ | `ChevronUp`, `ChevronDown` | Accordion toggles |

---

## Technology Overview

### Frontend Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Next.js** | 14+ | React framework with App Router |
| **React** | 18+ | UI component library |
| **TypeScript** | 5+ | Type safety |
| **Tailwind CSS** | 3.4+ | Utility-first styling |
| **Motion (Framer)** | Latest | Animation library |
| **Moment.js** | 2.x | Date manipulation |

### Backend/Infrastructure

| Technology | Purpose |
|-----------|---------|
| **Contentful** | Headless CMS for structured content |
| **Supabase** | PostgreSQL database + Auth |
| **Resend** | Transactional email delivery |
| **Upstash Redis** | Serverless Redis for API rate limiting and Contentful response caching |
| **Vercel** | Deployment platform (recommended) |

### Key Dependencies

```json
{
  "contentful": "^10.x",
  "contentful-management": "^11.x",
  "@supabase/supabase-js": "^2.x",
  "@supabase/ssr": "^0.x",
  "lucide-react": "^0.x",
  "moment": "^2.x"
}
```

### Project Structure

```
/app
├── admin/                 # Protected admin pages
│   ├── events/           # Event management
│   ├── recruitment/      # Recruitment portal
│   └── page.tsx          # Admin dashboard
├── api/
│   └── admin/            # API routes
│       ├── god-mode/     # Super admin endpoints
│       └── update-profile/ # Proxy for profile updates
├── components/           # Reusable UI components
├── login/               # Authentication pages
├── pages/               # Public pages
│   ├── events/          # Public events page
│   ├── team/            # Team directory
│   └── recruitment/     # Recruitment form
└── globals.css          # Tailwind imports & custom styles

/lib
├── contentful.js        # Contentful Delivery client
├── contentful-admin.ts  # Contentful Management client
├── supabase.js          # Browser Supabase client
└── supabase-server.js   # Server Supabase client + Admin client
```

---

## Maintenance Checklist

When onboarding as a new maintainer:

- [ ] Get added to `ALLOWED_ADMIN_EMAILS` for admin access
- [ ] Request Contentful space access (read-only is fine for most)
- [ ] Get access to Supabase dashboard
- [ ] Review this documentation and `API_REFERENCE.md`
- [ ] Test the login flow with your email
- [ ] Understand the Governance Proxy before making auth changes

---

## Service & Repository Layer

### Service Layer

All external-integration and business logic lives in `lib/services/`:

| Service | File | Responsibility |
|---------|------|----------------|
| **AuthService** | `lib/services/auth.service.ts` | Session validation, `requireAuth`, `requireAdmin`, `isSuperAdmin` |
| **ContentfulService** | `lib/services/contentful.service.ts` | Typed Contentful reads, React `cache()` deduplication |
| **GradingService** | `lib/services/grading.service.ts` | Pure-TS port of the Python grading algorithm — `countEffectiveLOC`, `calculateScore` |
| **ExecutionService** | `lib/services/execution.service.ts` | Piston API integration, test-case verification |

### Repository Layer

Database access is isolated in `lib/repositories/`:

| Repository | File | Responsibility |
|------------|------|----------------|
| **SubmissionRepository** | `lib/repositories/submission.repository.ts` | Create / find / update user code submissions |
| **ProfileRepository** | `lib/repositories/profile.repository.ts` | Read / update user total_points |
| **NewsletterRepository** | `lib/repositories/newsletter.repository.ts` | Subscriber CRUD, token management |

### Middleware HOFs

Route handlers are composed using Higher-Order Functions in `lib/middleware/`:

| HOF | Requirement |
|-----|-------------|
| `withAuth` | Valid Supabase session |
| `withAdmin` | Session + email in `ALLOWED_ADMIN_EMAILS` |
| `withSuperAdmin` | Session + email in `SUPER_ADMINS` |

Error handling is centralised in `lib/middleware/error.middleware.ts` — `AuthError`, `ValidationError`, and `NotFoundError` map to structured JSON responses.

### Rate Limiting

Upstash Redis is used for sliding-window rate limiting via `lib/middleware/rate-limit.ts`.  
Code-execution endpoints are protected by a dedicated `codeRatelimit` limiter.  
All other sensitive routes use the default limiter. Limits are enforced per user email.

### Circuit Breaker

`lib/utils/circuit-breaker.ts` wraps Piston API calls to prevent cascading failures.  
Default: 5 failures open the circuit for 30 s. Throws `CircuitOpenError` when open.

### Caching Strategy

| Layer | Technology | TTL |
|-------|-----------|-----|
| React render deduplication | `React.cache()` | Per-request |
| Contentful problem data | Upstash Redis | 300 s |
| Contentful member profiles | Upstash Redis | 600 s |

Cache misses fall back to Contentful transparently (graceful degradation).

### Validation

All API route bodies are validated with **Zod** before processing:

| Schema | File | Covers |
|--------|------|--------|
| `codeRequestSchema` | `lib/validation/code.schema.ts` | Code execution/submission payload (language whitelist, 50 KB limit, slug format) |
| `updateProfileSchema` | `lib/validation/admin.schema.ts` | Profile bio + social links |
| `godModeSchema` | `lib/validation/admin.schema.ts` | Super-admin CRUD actions |
| `subscribeSchema` | `lib/validation/newsletter.schema.ts` | Newsletter email address |

---

*Document maintained by Ayaan Mirza Baig*
