# PaperCode CN Full Clone Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild the full PaperCode site in React/Vite with local assets and short Chinese copy, matching layout, motion, and interactions 1:1.

**Architecture:** Client-only SPA with React Router, shared Layout, and page components backed by static data modules. Styling imports the original compiled CSS with local fonts/assets. Interactions use React state and localStorage.

**Tech Stack:** Vite, React, TypeScript, React Router, Vitest + React Testing Library, Playwright.

## References / Prep
- Design doc: `docs/plans/2026-01-19-papercode-cn-clone-design.md`
- Capture rendered HTML for each route (manual or script) and save in `docs/reference/` for 1:1 DOM alignment.
- Use `curl -L https://papercode.vercel.app/<route>` to compare class names and hierarchy.
- Use `@superpowers:test-driven-development` during execution.

---

### Task 1: Add React Testing Library + test helpers

**Files:**
- Modify: `package.json`
- Modify: `vitest.config.ts`
- Create: `src/setupTests.ts`
- Create: `src/test-utils.tsx`
- Create: `src/__tests__/test-utils.test.tsx`

**Step 1: Write the failing test**

```tsx
import { screen } from "@testing-library/react";
import { renderWithRouter } from "../test-utils";

it("renderWithRouter renders children", () => {
  renderWithRouter(<div>OK</div>, { route: "/demo" });
  expect(screen.getByText("OK")).toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/__tests__/test-utils.test.tsx`
Expected: FAIL due to missing `renderWithRouter` and jest-dom matchers.

**Step 3: Write minimal implementation**

`package.json` (add devDependencies):

```json
{
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.2",
    "@testing-library/react": "^14.2.1",
    "@testing-library/user-event": "^14.5.2"
  }
}
```

`vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    environment: "jsdom",
    setupFiles: ["src/setupTests.ts"],
  },
});
```

`src/setupTests.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

`src/test-utils.tsx`:

```tsx
import { render } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

export function renderWithRouter(
  ui: React.ReactElement,
  { route = "/", path = "/" } = {},
) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path={path} element={ui} />
      </Routes>
    </MemoryRouter>,
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- src/__tests__/test-utils.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add package.json vitest.config.ts src/setupTests.ts src/test-utils.tsx src/__tests__/test-utils.test.tsx
git commit -m "test: add react testing setup"
```

---

### Task 2: Add localStorage helpers

**Files:**
- Create: `src/utils/storage.ts`
- Create: `src/hooks/useLocalStorageState.ts`
- Create: `src/__tests__/storage.test.ts`

**Step 1: Write the failing test**

```ts
import { loadJson, saveJson } from "../utils/storage";

it("loadJson returns default on bad JSON", () => {
  localStorage.setItem("pc.bad", "{");
  expect(loadJson("pc.bad", "fallback")).toBe("fallback");
});

it("saveJson writes JSON", () => {
  saveJson("pc.ok", { ok: true });
  expect(localStorage.getItem("pc.ok")).toBe("{\"ok\":true}");
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/__tests__/storage.test.ts`
Expected: FAIL because storage helpers do not exist.

**Step 3: Write minimal implementation**

`src/utils/storage.ts`:

```ts
const memoryStore = new Map<string, string>();

function getStore() {
  if (typeof window === "undefined") return memoryStore;
  try {
    return window.localStorage;
  } catch {
    return memoryStore;
  }
}

export function loadJson<T>(key: string, fallback: T): T {
  const store = getStore();
  const raw = store.getItem ? store.getItem(key) : store.get(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveJson<T>(key: string, value: T) {
  const store = getStore();
  const raw = JSON.stringify(value);
  if (store.setItem) {
    store.setItem(key, raw);
    return;
  }
  store.set(key, raw);
}
```

`src/hooks/useLocalStorageState.ts`:

```ts
import { useEffect, useState } from "react";
import { loadJson, saveJson } from "../utils/storage";

export function useLocalStorageState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => loadJson(key, initial));

  useEffect(() => {
    saveJson(key, value);
  }, [key, value]);

  return [value, setValue] as const;
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- src/__tests__/storage.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/utils/storage.ts src/hooks/useLocalStorageState.ts src/__tests__/storage.test.ts
git commit -m "feat: add localStorage helpers"
```

---

### Task 3: Add routing + layout skeleton

**Files:**
- Modify: `package.json`
- Modify: `src/main.tsx`
- Replace: `src/App.tsx`
- Create: `src/components/Layout.tsx`
- Create: `src/components/PageTransition.tsx`
- Create: `src/pages/Home.tsx`
- Create: `src/pages/Papers.tsx`
- Create: `src/pages/Roadmap.tsx`
- Create: `src/pages/Reviews.tsx`
- Create: `src/pages/Sponsors.tsx`
- Create: `src/pages/About.tsx`
- Create: `src/pages/NotFound.tsx`
- Create: `src/__tests__/routes.test.tsx`

**Step 1: Write the failing test**

```tsx
import { screen } from "@testing-library/react";
import App from "../App";
import { renderWithRouter } from "../test-utils";

it("routes render Chinese headings", () => {
  renderWithRouter(<App />, { route: "/papers", path: "/*" });
  expect(screen.getByRole("heading", { name: "论文" })).toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/__tests__/routes.test.tsx`
Expected: FAIL due to old App and missing router.

**Step 3: Write minimal implementation**

`package.json` (add dependency):

```json
{
  "dependencies": {
    "react-router-dom": "^6.28.0"
  }
}
```

`src/main.tsx`:

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles.css";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element #root not found");

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
```

`src/App.tsx`:

```tsx
import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Papers from "./pages/Papers";
import Roadmap from "./pages/Roadmap";
import Reviews from "./pages/Reviews";
import Sponsors from "./pages/Sponsors";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="papers" element={<Papers />} />
        <Route path="roadmap" element={<Roadmap />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="sponsors" element={<Sponsors />} />
        <Route path="about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
```

`src/components/Layout.tsx`:

```tsx
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import PageTransition from "./PageTransition";

export default function Layout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <PageTransition>
        <Outlet />
      </PageTransition>
      <Footer />
    </div>
  );
}
```

`src/components/PageTransition.tsx`:

```tsx
import { useEffect, useState } from "react";

type Props = { children: React.ReactNode };

export default function PageTransition({ children }: Props) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      className="flex-1 w-full transition-all duration-500"
      style={{ opacity: ready ? 1 : 0, transform: ready ? "none" : "translateY(10px)" }}
    >
      {children}
    </div>
  );
}
```

`src/pages/Papers.tsx` (others similar placeholder):

```tsx
export default function Papers() {
  return (
    <div className="container mx-auto px-4 py-6 md:py-8 min-h-screen">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight">论文</h1>
      <p className="text-muted-foreground mt-1 text-sm md:text-base">选择一篇开始实现。</p>
    </div>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- src/__tests__/routes.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add package.json src/main.tsx src/App.tsx src/components/Layout.tsx src/components/PageTransition.tsx src/pages
git commit -m "feat: add routing and layout skeleton"
```

---

### Task 4: Build Navbar + Footer and mobile menu

**Files:**
- Create: `src/components/Navbar.tsx`
- Create: `src/components/Footer.tsx`
- Create: `src/data/site.ts`
- Create: `src/__tests__/navbar.test.tsx`

**Step 1: Write the failing test**

```tsx
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Navbar from "../components/Navbar";
import { renderWithRouter } from "../test-utils";

it("shows brand and toggles mobile menu", async () => {
  renderWithRouter(<Navbar />);
  expect(screen.getByText("论文代码")).toBeInTheDocument();
  const toggle = screen.getByRole("button", { name: "切换菜单" });
  await userEvent.click(toggle);
  expect(screen.getByText("论文"))
    .toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/__tests__/navbar.test.tsx`
Expected: FAIL because Navbar not implemented.

**Step 3: Write minimal implementation**

`src/data/site.ts`:

```ts
export const navItems = [
  { label: "论文", href: "/papers" },
  { label: "ML150", href: "/roadmap" },
  { label: "评测", href: "/reviews" },
  { label: "赞助", href: "/sponsors" },
  { label: "关于", href: "/about" },
];
```

`src/components/Navbar.tsx`:

```tsx
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { navItems } from "../data/site";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto flex h-14 items-center px-4">
        <Link className="flex items-center gap-2 font-bold text-xl hover:opacity-80 transition-opacity" to="/">
          <img
            alt="论文代码 Logo"
            className="rounded"
            width={24}
            height={24}
            src="/assets/logo.jpeg"
          />
          <span>论文代码</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground ml-8">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              className={({ isActive }) =>
                `hover:text-foreground transition-colors ${isActive ? "text-foreground" : ""}`
              }
              to={item.href}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button
          className="ml-auto md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
          aria-label="切换菜单"
          onClick={() => setOpen((value) => !value)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 5h16" />
            <path d="M4 12h16" />
            <path d="M4 19h16" />
          </svg>
        </button>
      </div>
      {open ? (
        <div className="md:hidden border-t bg-background/95">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-3">
            {navItems.map((item) => (
              <NavLink key={item.href} className="text-sm" to={item.href} onClick={() => setOpen(false)}>
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}
```

`src/components/Footer.tsx`:

```tsx
export default function Footer() {
  return (
    <footer className="border-t py-6 md:py-0 relative z-10 glass mt-16 md:mt-24">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row px-4">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          由 neuralnets 与 Supritam 打造。
        </p>
      </div>
    </footer>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- src/__tests__/navbar.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/Navbar.tsx src/components/Footer.tsx src/data/site.ts src/__tests__/navbar.test.tsx
git commit -m "feat: add navbar and footer"
```

---

### Task 5: Apply global theme classes + import original CSS

**Files:**
- Modify: `src/components/Layout.tsx`
- Replace: `src/styles.css`
- Create: `src/__tests__/theme.test.tsx`

**Step 1: Write the failing test**

```tsx
import { renderWithRouter } from "../test-utils";
import Layout from "../components/Layout";

it("sets dark theme classes", () => {
  renderWithRouter(<Layout />);
  expect(document.documentElement.classList.contains("dark")).toBe(true);
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/__tests__/theme.test.tsx`
Expected: FAIL because dark class is not set.

**Step 3: Write minimal implementation**

`src/components/Layout.tsx` (add theme class effect):

```tsx
import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import PageTransition from "./PageTransition";

export default function Layout() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
    document.body.classList.add("antialiased", "min-h-screen", "bg-background", "text-foreground");
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <PageTransition>
        <Outlet />
      </PageTransition>
      <Footer />
    </div>
  );
}
```

`src/styles.css`:
- Replace contents with the concatenated CSS from:
  - `https://papercode.vercel.app/_next/static/chunks/911c2be42a6fe28c.css`
  - `https://papercode.vercel.app/_next/static/chunks/24873148c303fd35.css`
- Update all `@font-face` URLs to `/assets/fonts/<file>.woff2`.
- Replace the remote noise SVG with `/assets/noise.svg`.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/__tests__/theme.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/Layout.tsx src/styles.css src/__tests__/theme.test.tsx
git commit -m "feat: apply theme classes and base styles"
```

---

### Task 6: Download and localize assets

**Files:**
- Create: `scripts/download-assets.mjs`
- Create: `public/assets/logo.jpeg`
- Create: `public/assets/logo.ico`
- Create: `public/assets/favicon.ico`
- Create: `public/assets/noise.svg`
- Create: `public/assets/fonts/*.woff2`
- Create: `src/__tests__/assets.test.ts`

**Step 1: Write the failing test**

```ts
import fs from "node:fs";
import path from "node:path";

it("key assets exist", () => {
  const root = path.resolve(__dirname, "../../public/assets");
  expect(fs.existsSync(path.join(root, "logo.jpeg"))).toBe(true);
  expect(fs.existsSync(path.join(root, "noise.svg"))).toBe(true);
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/__tests__/assets.test.ts`
Expected: FAIL because assets are missing.

**Step 3: Write minimal implementation**

`scripts/download-assets.mjs`:

```js
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import https from "node:https";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..", "public", "assets");
const fontsDir = path.join(root, "fonts");

fs.mkdirSync(fontsDir, { recursive: true });

const download = (url, dest) =>
  new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on("finish", () => file.close(resolve));
    }).on("error", reject);
  });

const base = "https://papercode.vercel.app";
const assets = [
  `${base}/logo.jpeg`,
  `${base}/logo.ico`,
  `${base}/favicon.ico?favicon.104d8097.ico`,
  "https://grainy-gradients.vercel.app/noise.svg",
];

for (const url of assets) {
  const name = url.includes("noise.svg") ? "noise.svg" : url.split("/").pop().split("?")[0];
  await download(url, path.join(root, name));
}

const css = await fetch(`${base}/_next/static/chunks/911c2be42a6fe28c.css`).then((r) => r.text());
const fontMatches = [...css.matchAll(/media\/([a-z0-9-]+\.woff2)/g)].map((m) => m[1]);

for (const file of new Set(fontMatches)) {
  await download(`${base}/_next/static/media/${file}`, path.join(fontsDir, file));
}
```

Run: `node scripts/download-assets.mjs`
Expected: assets saved under `public/assets`.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/__tests__/assets.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add scripts/download-assets.mjs public/assets src/__tests__/assets.test.ts
git commit -m "chore: localize assets"
```

---

### Task 7: Home hero + backdrop canvas

**Files:**
- Modify: `src/pages/Home.tsx`
- Create: `src/components/BackdropCanvas.tsx`
- Create: `src/components/home/Hero.tsx`
- Create: `src/data/home.ts`
- Create: `src/__tests__/home-hero.test.tsx`

**Step 1: Write the failing test**

```tsx
import { screen } from "@testing-library/react";
import Home from "../pages/Home";
import { renderWithRouter } from "../test-utils";

it("renders home hero", () => {
  renderWithRouter(<Home />);
  expect(screen.getByRole("heading", { name: "别只读论文。" })).toBeInTheDocument();
  expect(screen.getByText("开始动手")).toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/__tests__/home-hero.test.tsx`
Expected: FAIL because Home hero is not implemented.

**Step 3: Write minimal implementation**

`src/data/home.ts`:

```ts
export const hero = {
  title: "别只读论文。",
  accent: "把它跑起来。",
  subtitle: "把理论落到代码。逐行实现前沿模型。",
  primaryCta: { label: "开始动手", href: "/papers" },
  secondaryCta: { label: "免费注册", href: "#" },
};
```

`src/components/BackdropCanvas.tsx`:

```tsx
import { useEffect, useRef } from "react";

export default function BackdropCanvas() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  return <canvas ref={ref} className="fixed inset-0 z-0 pointer-events-none opacity-40" />;
}
```

`src/components/home/Hero.tsx`:

```tsx
import { hero } from "../../data/home";

export default function Hero() {
  return (
    <section className="relative w-full min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center overflow-hidden">
      <div className="container px-4 z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12 py-8 md:py-12">
        <div className="flex-1 space-y-6 md:space-y-8 max-w-xl">
          <div className="text-center md:text-left space-y-4 md:space-y-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent leading-tight">
              {hero.title}
              <br />
              <span className="text-primary font-mono">{hero.accent}</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground">{hero.subtitle}</p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center md:justify-start">
              <a href={hero.primaryCta.href}>
                <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6 md:px-8 text-base md:text-lg h-11 md:h-12 w-full sm:w-auto">
                  {hero.primaryCta.label}
                </button>
              </a>
              <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all border shadow-xs hover:bg-accent hover:text-accent-foreground rounded-full px-6 md:px-8 text-base md:text-lg h-11 md:h-12 backdrop-blur-sm bg-background/30 w-full sm:w-auto">
                {hero.secondaryCta.label}
              </button>
            </div>
          </div>
        </div>
        <div className="flex-1 w-full h-[300px] md:h-[400px] lg:h-[600px] flex items-center justify-center relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>
        </div>
      </div>
    </section>
  );
}
```

`src/pages/Home.tsx`:

```tsx
import BackdropCanvas from "../components/BackdropCanvas";
import Hero from "../components/home/Hero";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col relative">
      <BackdropCanvas />
      <Hero />
    </main>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- src/__tests__/home-hero.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/pages/Home.tsx src/components/BackdropCanvas.tsx src/components/home/Hero.tsx src/data/home.ts src/__tests__/home-hero.test.tsx
git commit -m "feat: build home hero"
```

---

### Task 8: Home timeline + feature grid + system online block

**Files:**
- Modify: `src/pages/Home.tsx`
- Create: `src/components/home/Timeline.tsx`
- Create: `src/components/home/FeatureGrid.tsx`
- Create: `src/components/home/SystemOnline.tsx`
- Modify: `src/data/home.ts`
- Create: `src/__tests__/home-sections.test.tsx`

**Step 1: Write the failing test**

```tsx
import { screen } from "@testing-library/react";
import Home from "../pages/Home";
import { renderWithRouter } from "../test-utils";

it("renders timeline and feature grid", () => {
  renderWithRouter(<Home />);
  expect(screen.getByText("研究阶段")).toBeInTheDocument();
  expect(screen.getByText("实现阶段")).toBeInTheDocument();
  expect(screen.getByText("实现注意力"))
    .toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/__tests__/home-sections.test.tsx`
Expected: FAIL because sections are missing.

**Step 3: Write minimal implementation**

`src/data/home.ts` (add sections):

```ts
export const timeline = {
  researchTitle: "研究阶段",
  researchSubtitle: "密集、抽象、难懂。",
  buildTitle: "实现阶段",
  buildSubtitle: "拆解、编码、验证。",
};

export const features = [
  { title: "实现注意力", code: "def scaled_dot_product(q, k, v):" },
  { title: "通过单测", code: "assert output.shape == (B, T, D)" },
  { title: "优化梯度", code: "loss.backward()" },
];

export const systemOnline = {
  title: "系统上线",
  subtitle: "你不只是写代码，你在构建智能。",
  cta: "现在试试",
};
```

`src/components/home/Timeline.tsx`:

```tsx
import { timeline } from "../../data/home";

export default function Timeline() {
  return (
    <div className="relative h-[300vh] w-full">
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col items-center justify-center">
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-max text-center">
          <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
            {timeline.researchTitle}
          </h3>
          <p className="text-sm text-muted-foreground">{timeline.researchSubtitle}</p>
        </div>
      </div>
      <div className="absolute flex flex-col items-center" style={{ pointerEvents: "none" }}>
        <div className="mt-8 text-center">
          <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            {timeline.buildTitle}
          </h3>
          <p className="text-muted-foreground mt-2 max-w-xs mx-auto mb-6">{timeline.buildSubtitle}</p>
        </div>
      </div>
    </div>
  );
}
```

`src/components/home/FeatureGrid.tsx`:

```tsx
import { features } from "../../data/home";

export default function FeatureGrid() {
  return (
    <div className="absolute z-20 w-full max-w-5xl px-4 grid grid-cols-1 md:grid-cols-3 gap-6 pointer-events-none">
      {features.map((feature) => (
        <div key={feature.title} className="glass p-6 rounded-xl relative overflow-hidden border transition-colors duration-300">
          <div className="flex items-center gap-3 mb-3 relative z-10">
            <span className="font-mono text-sm text-muted-foreground">{feature.title}</span>
          </div>
          <div className="relative z-10">
            <div className="bg-black/40 p-3 rounded-lg border border-white/5 font-mono text-xs text-muted-foreground overflow-hidden">
              {feature.code}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
```

`src/components/home/SystemOnline.tsx`:

```tsx
import { systemOnline } from "../../data/home";

export default function SystemOnline() {
  return (
    <div className="absolute flex flex-col items-center" style={{ pointerEvents: "none" }}>
      <div className="mt-8 text-center">
        <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
          {systemOnline.title}
        </h3>
        <p className="text-muted-foreground mt-2 max-w-xs mx-auto mb-6">{systemOnline.subtitle}</p>
        <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all bg-primary text-primary-foreground hover:bg-primary/90 h-10 rounded-full px-8 shadow-lg shadow-purple-500/20">
          {systemOnline.cta}
        </button>
      </div>
    </div>
  );
}
```

`src/pages/Home.tsx` (append sections):

```tsx
import BackdropCanvas from "../components/BackdropCanvas";
import Hero from "../components/home/Hero";
import Timeline from "../components/home/Timeline";
import FeatureGrid from "../components/home/FeatureGrid";
import SystemOnline from "../components/home/SystemOnline";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col relative">
      <BackdropCanvas />
      <Hero />
      <Timeline />
      <FeatureGrid />
      <SystemOnline />
    </main>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- src/__tests__/home-sections.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/pages/Home.tsx src/components/home/Timeline.tsx src/components/home/FeatureGrid.tsx src/components/home/SystemOnline.tsx src/data/home.ts src/__tests__/home-sections.test.tsx
git commit -m "feat: add home timeline and sections"
```

---

### Task 9: Papers list + search + filter

**Files:**
- Replace: `src/pages/Papers.tsx`
- Create: `src/data/papers.ts`
- Create: `src/components/PaperCard.tsx`
- Create: `src/__tests__/papers.test.tsx`

**Step 1: Write the failing test**

```tsx
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Papers from "../pages/Papers";
import { renderWithRouter } from "../test-utils";

it("filters papers by search", async () => {
  renderWithRouter(<Papers />);
  const input = screen.getByPlaceholderText("搜索论文、标签...");
  await userEvent.type(input, "注意力");
  expect(screen.getByText("注意力机制"))
    .toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/__tests__/papers.test.tsx`
Expected: FAIL because Papers page is still placeholder.

**Step 3: Write minimal implementation**

`src/data/papers.ts`:

```ts
export type Paper = {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  difficulty: "入门" | "进阶" | "硬核";
};

export const papers: Paper[] = [
  {
    id: "attention",
    title: "注意力机制",
    summary: "从打分到权重，完整复现核心公式。",
    tags: ["NLP", "Transformer"],
    difficulty: "入门",
  },
];

export const allTags = ["NLP", "Transformer", "CV", "RL"];
```

`src/components/PaperCard.tsx`:

```tsx
import type { Paper } from "../data/papers";

export default function PaperCard({ paper }: { paper: Paper }) {
  return (
    <div className="glass p-6 rounded-xl border border-white/10 hover-lift">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">{paper.title}</h3>
        <span className="text-xs text-muted-foreground">{paper.difficulty}</span>
      </div>
      <p className="text-sm text-muted-foreground">{paper.summary}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {paper.tags.map((tag) => (
          <span key={tag} className="text-xs text-muted-foreground border border-white/10 rounded-full px-2 py-1">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
```

`src/pages/Papers.tsx`:

```tsx
import { useMemo } from "react";
import PaperCard from "../components/PaperCard";
import { allTags, papers } from "../data/papers";
import { useLocalStorageState } from "../hooks/useLocalStorageState";

export default function Papers() {
  const [query, setQuery] = useLocalStorageState("pc.search", "");
  const [activeTags, setActiveTags] = useLocalStorageState<string[]>("pc.filters", []);

  const filtered = useMemo(() => {
    return papers.filter((paper) => {
      const matchesQuery = query
        ? paper.title.includes(query) || paper.summary.includes(query) || paper.tags.some((tag) => tag.includes(query))
        : true;
      const matchesTags = activeTags.length
        ? activeTags.every((tag) => paper.tags.includes(tag))
        : true;
      return matchesQuery && matchesTags;
    });
  }, [query, activeTags]);

  const toggleTag = (tag: string) => {
    setActiveTags((current) =>
      current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag],
    );
  };

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 min-h-screen">
      <div className="flex flex-col gap-4 md:gap-6 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">论文</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">挑一篇，边写边学。</p>
        </div>
        <div className="relative w-full">
          <input
            className="w-full rounded-md border px-3 py-1 text-base shadow-xs outline-none pl-10 h-10 bg-muted/30 border-white/10"
            placeholder="搜索论文、标签..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground mr-2">筛选：</span>
          {allTags.map((tag) => (
            <button
              key={tag}
              className={`text-xs rounded-full px-3 py-1 border ${
                activeTags.includes(tag) ? "bg-primary text-primary-foreground" : "border-white/10 text-muted-foreground"
              }`}
              onClick={() => toggleTag(tag)}
              type="button"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filtered.map((paper) => (
          <PaperCard key={paper.id} paper={paper} />
        ))}
      </div>
    </div>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- src/__tests__/papers.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/pages/Papers.tsx src/data/papers.ts src/components/PaperCard.tsx src/__tests__/papers.test.tsx
git commit -m "feat: implement papers page"
```

---

### Task 10: Roadmap page + progress state

**Files:**
- Replace: `src/pages/Roadmap.tsx`
- Create: `src/data/roadmap.ts`
- Create: `src/__tests__/roadmap.test.tsx`

**Step 1: Write the failing test**

```tsx
import { screen } from "@testing-library/react";
import Roadmap from "../pages/Roadmap";
import { renderWithRouter } from "../test-utils";

it("shows roadmap sections", () => {
  renderWithRouter(<Roadmap />);
  expect(screen.getByText("基础 0-10"))
    .toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/__tests__/roadmap.test.tsx`
Expected: FAIL because Roadmap is placeholder.

**Step 3: Write minimal implementation**

`src/data/roadmap.ts`:

```ts
export const roadmap = [
  {
    title: "基础 0-10",
    items: ["线性回归", "Softmax", "反向传播"],
  },
  {
    title: "核心 11-50",
    items: ["CNN", "RNN", "Transformer"],
  },
];
```

`src/pages/Roadmap.tsx`:

```tsx
import { roadmap } from "../data/roadmap";
import { useLocalStorageState } from "../hooks/useLocalStorageState";

export default function Roadmap() {
  const [progress, setProgress] = useLocalStorageState<string[]>("pc.progress", []);

  const toggle = (item: string) => {
    setProgress((current) =>
      current.includes(item) ? current.filter((value) => value !== item) : [...current, item],
    );
  };

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 min-h-screen">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight">ML150 路线</h1>
      <div className="mt-6 space-y-6">
        {roadmap.map((section) => (
          <div key={section.title} className="glass p-6 rounded-xl border border-white/10">
            <h2 className="font-semibold mb-4">{section.title}</h2>
            <div className="flex flex-wrap gap-2">
              {section.items.map((item) => {
                const active = progress.includes(item);
                return (
                  <button
                    key={item}
                    className={`text-xs rounded-full px-3 py-1 border ${
                      active ? "bg-emerald-500/20 text-emerald-300" : "border-white/10 text-muted-foreground"
                    }`}
                    onClick={() => toggle(item)}
                    type="button"
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- src/__tests__/roadmap.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/pages/Roadmap.tsx src/data/roadmap.ts src/__tests__/roadmap.test.tsx
git commit -m "feat: implement roadmap page"
```

---

### Task 11: Reviews page

**Files:**
- Replace: `src/pages/Reviews.tsx`
- Create: `src/data/reviews.ts`
- Create: `src/components/ReviewCard.tsx`
- Create: `src/__tests__/reviews.test.tsx`

**Step 1: Write the failing test**

```tsx
import { screen } from "@testing-library/react";
import Reviews from "../pages/Reviews";
import { renderWithRouter } from "../test-utils";

it("renders review list", () => {
  renderWithRouter(<Reviews />);
  expect(screen.getByText("实现难度"))
    .toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/__tests__/reviews.test.tsx`
Expected: FAIL because Reviews is placeholder.

**Step 3: Write minimal implementation**

`src/data/reviews.ts`:

```ts
export const reviews = [
  {
    id: "1",
    title: "Transformer 复现",
    summary: "从注意力到残差连接的完整拆解。",
    tags: ["NLP", "中阶"],
  },
];
```

`src/components/ReviewCard.tsx`:

```tsx
type Review = {
  title: string;
  summary: string;
  tags: string[];
};

export default function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="glass p-6 rounded-xl border border-white/10">
      <h3 className="font-semibold">{review.title}</h3>
      <p className="text-sm text-muted-foreground mt-2">{review.summary}</p>
      <div className="mt-3 flex gap-2 flex-wrap">
        {review.tags.map((tag) => (
          <span key={tag} className="text-xs text-muted-foreground border border-white/10 rounded-full px-2 py-1">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
```

`src/pages/Reviews.tsx`:

```tsx
import ReviewCard from "../components/ReviewCard";
import { reviews } from "../data/reviews";

export default function Reviews() {
  return (
    <div className="container mx-auto px-4 py-6 md:py-8 min-h-screen">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight">评测</h1>
      <p className="text-muted-foreground mt-1 text-sm md:text-base">实现过程、坑点和评分。</p>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- src/__tests__/reviews.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/pages/Reviews.tsx src/data/reviews.ts src/components/ReviewCard.tsx src/__tests__/reviews.test.tsx
git commit -m "feat: implement reviews page"
```

---

### Task 12: Sponsors page

**Files:**
- Replace: `src/pages/Sponsors.tsx`
- Create: `src/data/sponsors.ts`
- Create: `src/components/SponsorTier.tsx`
- Create: `src/__tests__/sponsors.test.tsx`

**Step 1: Write the failing test**

```tsx
import { screen } from "@testing-library/react";
import Sponsors from "../pages/Sponsors";
import { renderWithRouter } from "../test-utils";

it("renders sponsor tiers", () => {
  renderWithRouter(<Sponsors />);
  expect(screen.getByText("支持者"))
    .toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/__tests__/sponsors.test.tsx`
Expected: FAIL because Sponsors is placeholder.

**Step 3: Write minimal implementation**

`src/data/sponsors.ts`:

```ts
export const sponsorTiers = [
  {
    name: "支持者",
    price: "每月 $5",
    perks: ["路线更新", "模板下载"],
  },
  {
    name: "合作者",
    price: "每月 $25",
    perks: ["优先建议", "专属群"],
  },
];
```

`src/components/SponsorTier.tsx`:

```tsx
type Tier = {
  name: string;
  price: string;
  perks: string[];
};

export default function SponsorTier({ tier }: { tier: Tier }) {
  return (
    <div className="glass p-6 rounded-xl border border-white/10">
      <h3 className="font-semibold text-lg">{tier.name}</h3>
      <p className="text-sm text-muted-foreground mt-1">{tier.price}</p>
      <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
        {tier.perks.map((perk) => (
          <li key={perk}>• {perk}</li>
        ))}
      </ul>
    </div>
  );
}
```

`src/pages/Sponsors.tsx`:

```tsx
import SponsorTier from "../components/SponsorTier";
import { sponsorTiers } from "../data/sponsors";

export default function Sponsors() {
  return (
    <div className="container mx-auto px-4 py-6 md:py-8 min-h-screen">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight">赞助</h1>
      <p className="text-muted-foreground mt-1 text-sm md:text-base">一起把路线做得更完整。</p>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {sponsorTiers.map((tier) => (
          <SponsorTier key={tier.name} tier={tier} />
        ))}
      </div>
    </div>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- src/__tests__/sponsors.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/pages/Sponsors.tsx src/data/sponsors.ts src/components/SponsorTier.tsx src/__tests__/sponsors.test.tsx
git commit -m "feat: implement sponsors page"
```

---

### Task 13: About page

**Files:**
- Replace: `src/pages/About.tsx`
- Create: `src/data/about.ts`
- Create: `src/components/AboutSection.tsx`
- Create: `src/__tests__/about.test.tsx`

**Step 1: Write the failing test**

```tsx
import { screen } from "@testing-library/react";
import About from "../pages/About";
import { renderWithRouter } from "../test-utils";

it("renders about sections", () => {
  renderWithRouter(<About />);
  expect(screen.getByText("我们在做什么"))
    .toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/__tests__/about.test.tsx`
Expected: FAIL because About is placeholder.

**Step 3: Write minimal implementation**

`src/data/about.ts`:

```ts
export const aboutSections = [
  {
    title: "我们在做什么",
    body: "把论文拆成任务，让你能写出真正跑得起来的模型。",
  },
  {
    title: "怎么做到",
    body: "每篇论文配路线、单测、复现提示。",
  },
];
```

`src/components/AboutSection.tsx`:

```tsx
type Section = { title: string; body: string };

export default function AboutSection({ section }: { section: Section }) {
  return (
    <div className="glass p-6 rounded-xl border border-white/10">
      <h3 className="font-semibold text-lg">{section.title}</h3>
      <p className="text-sm text-muted-foreground mt-2">{section.body}</p>
    </div>
  );
}
```

`src/pages/About.tsx`:

```tsx
import AboutSection from "../components/AboutSection";
import { aboutSections } from "../data/about";

export default function About() {
  return (
    <div className="container mx-auto px-4 py-6 md:py-8 min-h-screen">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight">关于</h1>
      <p className="text-muted-foreground mt-1 text-sm md:text-base">我们做的事很简单：帮你实现论文。</p>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {aboutSections.map((section) => (
          <AboutSection key={section.title} section={section} />
        ))}
      </div>
    </div>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- src/__tests__/about.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/pages/About.tsx src/data/about.ts src/components/AboutSection.tsx src/__tests__/about.test.tsx
git commit -m "feat: implement about page"
```

---

### Task 14: 404 page

**Files:**
- Replace: `src/pages/NotFound.tsx`
- Create: `src/__tests__/notfound.test.tsx`

**Step 1: Write the failing test**

```tsx
import { screen } from "@testing-library/react";
import NotFound from "../pages/NotFound";
import { renderWithRouter } from "../test-utils";

it("renders not found message", () => {
  renderWithRouter(<NotFound />);
  expect(screen.getByText("页面不存在"))
    .toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/__tests__/notfound.test.tsx`
Expected: FAIL because NotFound is placeholder.

**Step 3: Write minimal implementation**

`src/pages/NotFound.tsx`:

```tsx
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-10 min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold">页面不存在</h1>
      <p className="text-muted-foreground mt-2">换个地址试试。</p>
      <Link className="mt-4 text-primary hover:underline" to="/">
        回到首页
      </Link>
    </div>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- src/__tests__/notfound.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/pages/NotFound.tsx src/__tests__/notfound.test.tsx
git commit -m "feat: implement 404 page"
```

---

### Task 15: Add reveal/scroll animations

**Files:**
- Create: `src/hooks/useReveal.ts`
- Modify: `src/components/home/Timeline.tsx`
- Modify: `src/components/home/FeatureGrid.tsx`
- Create: `src/__tests__/reveal.test.tsx`

**Step 1: Write the failing test**

```tsx
import { renderHook } from "@testing-library/react";
import { useReveal } from "../hooks/useReveal";

it("useReveal returns hidden state initially", () => {
  const { result } = renderHook(() => useReveal());
  expect(result.current.visible).toBe(false);
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/__tests__/reveal.test.tsx`
Expected: FAIL because hook not implemented.

**Step 3: Write minimal implementation**

`src/hooks/useReveal.ts`:

```ts
import { useEffect, useRef, useState } from "react";

export function useReveal() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.2 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, visible } as const;
}
```

Apply to components by adding `data-visible` and `ref`:

```tsx
const { ref, visible } = useReveal();
<div ref={ref} data-visible={visible} className={visible ? "animate-fade-in" : "opacity-0"}>
  ...
</div>
```

**Step 4: Run test to verify it passes**

Run: `npm test -- src/__tests__/reveal.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/hooks/useReveal.ts src/components/home/Timeline.tsx src/components/home/FeatureGrid.tsx src/__tests__/reveal.test.tsx
git commit -m "feat: add reveal animations"
```

---

### Task 16: Playwright smoke tests

**Files:**
- Create: `tests/smoke.spec.ts`

**Step 1: Write the failing test**

```ts
import { test, expect } from "@playwright/test";

test("can navigate to papers and filter", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "论文" }).click();
  await expect(page.getByRole("heading", { name: "论文" })).toBeVisible();
  await page.getByPlaceholder("搜索论文、标签...").fill("注意力");
  await expect(page.getByText("注意力机制")).toBeVisible();
});
```

**Step 2: Run test to verify it fails**

Run: `npm run e2e -- tests/smoke.spec.ts`
Expected: FAIL until pages and filters are implemented.

**Step 3: Write minimal implementation**

No code changes; verify existing pages satisfy the test. Adjust text if needed.

**Step 4: Run test to verify it passes**

Run: `npm run e2e -- tests/smoke.spec.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add tests/smoke.spec.ts
git commit -m "test: add playwright smoke"
```

---

## Execution Handoff

Plan complete and saved to `docs/plans/2026-01-19-papercode-cn-clone-implementation.md`. Two execution options:

1. Subagent-Driven (this session) - I dispatch a fresh subagent per task, review between tasks, fast iteration
2. Parallel Session (separate) - Open new session with executing-plans, batch execution with checkpoints

Which approach?
