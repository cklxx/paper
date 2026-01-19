import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import Navbar from "./Navbar";
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
