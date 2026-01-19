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
          type="button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
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
              <NavLink
                key={item.href}
                className="text-sm"
                to={item.href}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}
