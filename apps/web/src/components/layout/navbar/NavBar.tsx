import Link from "next/link";
import { NavLink } from "./NavLink";

export function NavBar() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 border-b bg-background">
      <nav className="container mx-auto flex items-center justify-between pt-2 pb-2">
        <Link href="/chat" className="text-lg font-semibold">
          LangGraph Demo
        </Link>
        <div className="space-x-2">
          <NavLink href="/chat" label="Chat" />
          <NavLink href="/admin" label="Admin" />
        </div>
      </nav>
    </div>
  );
}
