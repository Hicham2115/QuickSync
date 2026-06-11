# QuickSync — CLAUDE.md

## Project Overview

Next.js (App Router) project built with TypeScript and Tailwind CSS v4.

**Root app directory:** `app/`  
**Dev server:** `npm run dev` (port 3000)

---

## MANDATORY TECH STACK

Every command must use **all** of the following technologies where applicable. No substitutions.

| Concern | Library |
|---|---|
| HTTP client | `axios` |
| Server state / data fetching | `@tanstack/react-query` (`useQuery`) |
| Mutations | `@tanstack/react-query` (`useMutation`) |
| Global state management | `zustand` |
| Smooth scroll | `lenis` |
| Icons | `lucide-react` |
| Animations | `gsap` + `@gsap/react` |
| Styling | Tailwind CSS v4 |
| UI components | `shadcn/ui` |

Install all before using:

```bash
npm install axios @tanstack/react-query zustand lenis gsap @gsap/react lucide-react
npx shadcn@latest init
```

---

## Data Fetching — Axios + TanStack Query

### QueryClient provider

Wrap the app in `app/providers.tsx` (a `"use client"` component) and import it in `app/layout.tsx`.

```tsx
// app/providers.tsx
"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 60_000, retry: 2 } },
  }));
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
```

### Axios instance

Create `lib/axios.ts` — all requests go through this instance.

```ts
// lib/axios.ts
import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10_000,
});
```

### useQuery pattern

```tsx
const { data, isLoading, isError, error } = useQuery({
  queryKey: ["resource", id],
  queryFn: async () => {
    try {
      const res = await api.get(`/resource/${id}`);
      return res.data;
    } catch (err) {
      if (axios.isAxiosError(err)) throw new Error(err.response?.data?.message ?? "Request failed");
      throw err;
    }
  },
});
```

### useMutation pattern

```tsx
const mutation = useMutation({
  mutationFn: async (payload: Payload) => {
    try {
      const res = await api.post("/endpoint", payload);
      return res.data;
    } catch (err) {
      if (axios.isAxiosError(err)) throw new Error(err.response?.data?.message ?? "Mutation failed");
      throw err;
    }
  },
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ["resource"] }),
  onError: (err) => console.error(err),
});
```

---

## Error Handling

- Every `useQuery` / `useMutation` must handle `isError` / `onError`.
- Always wrap async logic in `try/catch` — never let errors propagate silently.
- Use an `<ErrorBoundary>` at the page level to catch render errors.
- Show a user-visible error UI — never silently swallow errors.
- Axios errors: use `axios.isAxiosError(err)` to extract `err.response?.data?.message`.

```tsx
if (isError) return <ErrorState message={(error as Error).message} />;
```

### Try/Catch pattern — required everywhere

```ts
// Server actions / API routes / utility functions
export async function fetchData(id: string) {
  try {
    const res = await api.get(`/items/${id}`);
    return { data: res.data, error: null };
  } catch (err) {
    const message = axios.isAxiosError(err)
      ? (err.response?.data?.message ?? "Network error")
      : "Unexpected error";
    return { data: null, error: message };
  }
}
```

---

## Skeleton Loading

- Show `<Skeleton />` while `isLoading === true`.
- Match skeleton shape to real content (same height, width, border-radius).
- Use Tailwind's `animate-pulse` for the shimmer effect.
- Prefer shadcn's built-in `<Skeleton />` from `components/ui/skeleton.tsx`.

```tsx
import { Skeleton } from "@/components/ui/skeleton";

if (isLoading) return <ProjectCardSkeleton />;

function ProjectCardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-48 w-full rounded-xl" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}
```

---

## Loading Screen

- Full-screen overlay shown on initial page load / route transitions.
- Lives at `components/LoadingScreen.tsx`.
- Use GSAP to animate it out once content is ready.
- Unmount (not just hide) the loading screen after the exit animation completes.

```tsx
"use client";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

export function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const el = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    gsap.to(el.current, { opacity: 0, duration: 0.6, delay: 1.2, onComplete });
  }, []);
  return (
    <div ref={el} className="fixed inset-0 z-[9999] flex items-center justify-center bg-black">
      {/* logo / spinner */}
    </div>
  );
}
```

---

## Zustand — Global State Management

- Create stores in `lib/store/` — one file per domain.
- Never use React Context for global state — use Zustand instead.
- Use `immer` middleware for complex nested updates.
- Expose typed selectors, not the whole store.

```ts
// lib/store/useAppStore.ts
import { create } from "zustand";

interface AppState {
  isMenuOpen: boolean;
  toggleMenu: () => void;
  closeMenu: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  isMenuOpen: false,
  toggleMenu: () => set((s) => ({ isMenuOpen: !s.isMenuOpen })),
  closeMenu: () => set({ isMenuOpen: false }),
}));
```

Usage:

```tsx
const isMenuOpen = useAppStore((s) => s.isMenuOpen);
const toggleMenu = useAppStore((s) => s.toggleMenu);
```

---

## Shadcn UI

- Use shadcn components from `components/ui/` for all base UI elements.
- Add components via CLI — never copy-paste manually.

```bash
npx shadcn@latest add button card dialog sheet skeleton toast
```

- Extend shadcn components with Tailwind variants — never override `className` in ways that break the component API.
- Combine shadcn with Lucide icons and Tailwind for all interactive elements.

```tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

<Button variant="outline" size="sm">
  View project <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
</Button>
```

---

## GSAP Animations

- Import GSAP only in `"use client"` components.
- Always use the `useGSAP` hook from `@gsap/react` — it handles cleanup automatically.
- Register plugins at the top of the file: `gsap.registerPlugin(ScrollTrigger)`.
- Prefer `useGSAP` scope to avoid selector leaks.

```tsx
"use client";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
```

---

## Lenis Smooth Scroll

- Initialize Lenis once in a client component provider.
- Integrate Lenis RAF with GSAP ticker so ScrollTrigger stays in sync.

```tsx
// components/LenisProvider.tsx
"use client";
import Lenis from "lenis";
import { useEffect } from "react";
import gsap from "gsap";

export function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis();
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      lenis.destroy();
      gsap.ticker.remove(tick);
    };
  }, []);
  return <>{children}</>;
}
```

Add `<LenisProvider>` inside `<Providers>` in `app/layout.tsx`.

---

## Metadata

- Every page must export a `metadata` object or a `generateMetadata` function.
- The root layout sets default `title.template` and `description`.

```tsx
// app/layout.tsx
export const metadata: Metadata = {
  title: { default: "QuickSync", template: "%s | QuickSync" },
  description: "QuickSync",
  openGraph: { type: "website" },
};
```

For dynamic routes use `generateMetadata`:

```tsx
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const item = await getItem(params.slug);
    return { title: item.title, description: item.description };
  } catch {
    return { title: "Not Found" };
  }
}
```

---

## Responsive Design

- Mobile-first: base styles target small screens, larger breakpoints override.
- Use Tailwind breakpoints: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px), `2xl` (1536px).
- Never hardcode pixel widths — use Tailwind spacing / sizing scale.
- Test every component at 375px, 768px, and 1440px.

---

## Lucide Icons

```tsx
import { ArrowRight, Github, ExternalLink } from "lucide-react";

<ArrowRight className="h-4 w-4" />
```

- Always set explicit size via `className` — never use `width`/`height` props.
- Mark decorative icons `aria-hidden="true"`.

---

## Project Structure

```
app/
  layout.tsx          — root layout, metadata, providers
  page.tsx            — home page
  globals.css
  providers.tsx       — QueryClient + LenisProvider (client component)
  [section]/
    page.tsx
components/
  ui/                 — shadcn components (button, card, skeleton …)
  LoadingScreen.tsx
  LenisProvider.tsx
lib/
  axios.ts            — shared Axios instance
  queryKeys.ts        — centralised query key factory
  store/
    useAppStore.ts    — Zustand global store(s)
public/
```

---

## Code Conventions

- `"use client"` only when using browser APIs, hooks, GSAP, or Lenis.
- Server Components are the default — prefer them for data fetching when possible.
- No `any` types — use proper TypeScript interfaces.
- No inline styles — Tailwind only.
- Keep components under ~150 lines; split if larger.
- No comments explaining *what* the code does — only *why* when non-obvious.
- Always wrap async calls in `try/catch` — no unhandled promise rejections.
- Prefer shadcn components over building from scratch for UI primitives.
- Use Zustand for all shared/global state — no Context for state that persists across components.
