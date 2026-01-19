import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-10 min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight">页面不存在</h1>
      <p className="text-muted-foreground mt-2">换个地址试试。</p>
      <Link className="mt-4 text-primary hover:underline" to="/">
        回到首页
      </Link>
    </div>
  );
}
