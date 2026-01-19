import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Footer from "./Footer";
import Navbar from "./Navbar";
import PageTransition from "./PageTransition";

export default function Layout() {
  const location = useLocation();
  const hideFooter = location.pathname.includes("/problems/");

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
      {hideFooter ? null : <Footer />}
    </div>
  );
}
