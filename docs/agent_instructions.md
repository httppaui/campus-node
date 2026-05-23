# AI Agent System Instructions - CampusNode

## 1. Introduction & Context
This guide outlines the development protocols, architectures, and expectations for all AI agents collaborating on the **CampusNode** student organization workspace codebase. Every agent must adhere to these guidelines to maintain design cohesion, database type safety, clean separation of concerns, and security.

---

## 2. Directory Structure Conventions
All source code must follow Next.js App Router guidelines. Structure your files as follows:

```text
├── docs/                      # System design, PRD, branding documentation
├── prisma/
│   ├── schema.prisma          # Database schema (as defined in system_design_architecture.md)
│   └── seed.ts                # Database seed scripts
├── src/
│   ├── app/                   # Next.js App Router folders
│   │   ├── (auth)/            # Auth group (login page, etc.)
│   │   ├── (dashboard)/       # Main layout, sidebar navigation
│   │   │   ├── admin/         # Admin screens (RBAC protected)
│   │   │   ├── officer/       # Officer screens (RBAC protected)
│   │   │   ├── member/        # Member screens
│   │   │   └── page.tsx       # Main dashboard router
│   │   ├── api/               # API Router endpoints
│   │   ├── layout.tsx         # Root layout with providers
│   │   └── page.tsx           # Landing page
│   ├── components/            # Reusable UI Components
│   │   ├── ui/                # Shadcn UI base components
│   │   ├── dashboard/         # Dashboard widgets
│   │   ├── kanban/            # Project boards
│   │   └── qr/                # QR Generator and Scanners
│   ├── hooks/                 # Custom React query hooks & hooks logic
│   ├── lib/                   # Config libraries (db.ts, auth.ts, utils.ts)
│   ├── store/                 # Zustand global UI states
│   └── types/                 # Custom TypeScript interfaces
```

---

## 3. Core Development Rules

### Rule 1: Use Server & Client Components Correctly
* **Server Components (Default):** Use for page files, fetching initial data from database using Prisma, rendering non-interactive markup. Never import client state hooks (Zustand, React Query) or standard state hooks (useState, useEffect) in Server Components.
* **Client Components:** Mark with `"use client"` at the top. Use for interactive wrappers (forms, tabs, search inputs, modal triggers, drag-and-drop lists, and live QR code timers). Keep Client Components leaf-level to maximize server-side rendering performance.

### Rule 2: Access & Permission (RBAC) Validation
* Every API endpoint under `src/app/api/` must validate the user's active session and their role before executing database operations:
  ```typescript
  import { getServerSession } from "next-auth";
  import { authOptions } from "@/lib/auth";
  import { NextResponse } from "next/server";
  
  export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Check role capabilities (e.g. Officer and Admin only)
    const allowedRoles = ["ADMIN", "OFFICER"];
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    // Proceed with logic...
  }
  ```

### Rule 3: Maintain Design Integrity
* Do not write custom inline tailwind color configurations with arbitrary hex values (e.g., `bg-[#0b0c10]`). Always use the custom CSS variables configured in `docs/design_system_branding.md`.
* Ensure responsiveness (using `sm:`, `md:`, `lg:`, `xl:` media queries).
* Embed `Framer Motion` elements for fluid page entries and drag-and-drop transitions.

### Rule 4: Data Validation and Prisma
* All incoming client payloads (POST/PUT/PATCH request bodies) must be parsed and verified using a **Zod** schema.
* Keep DB relations optimized. Make sure you fetch only the fields required (`select` block in Prisma) to prevent massive payloads.

---

## 4. Specific Agent Personas

### 🎨 Persona 1: Front-End UI/UX Developer Agent
* **Focus:** Visual excellence, responsive templates, client routing, state hooks, animations.
* **Special Instructions:**
  1. Initialize the layout using Tailwind grids/flex layouts. Use the `GlassCard` wrapper for dashboard sections.
  2. Implement state management using Zustand for application UI toggle variables (e.g., sidebar status, filters) and React Query for caching database inputs.
  3. Ensure standard accessibility (aria attributes on models, keyboard navigation on dropdown lists).

### ⚙️ Persona 2: Back-End & Database Architect Agent
* **Focus:** NextAuth integration, DB structure (Prisma), secure API endpoints, performance tuning, token generators.
* **Special Instructions:**
  1. Build the authentication middleware checking email domain restrictions (`.edu`).
  2. Implement the Anti-Exploit QR Code rotation API utilizing HMAC-SHA256 validation (as specified in `docs/system_design_architecture.md`).
  3. Ensure transactional safety: when checking in an attendance or assigning points, verify it operates inside a database transaction to prevent concurrent point-doubling errors.

### 🧪 Persona 3: QA & Test Automation Agent
* **Focus:** Unit tests (Jest), component tests, E2E tests (Cypress), security/permissions auditing.
* **Special Instructions:**
  1. Write tests ensuring standard users cannot call endpoints labeled as `ADMIN`/`OFFICER`.
  2. Write unit tests validating the time-slice grace period matching in the QR check-in endpoint.
  3. Setup mockup seed scenarios verifying leaderboards compute totals correctly.
