"use client";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import Link from "next/link";

export function NavLink({ href, label }: { href: string; label: string }) {
  const currentPath = usePathname();
  return (
    <Button
      variant="link"
      className={currentPath === href ? "underline" : ""}
      asChild
    >
      <Link href={href}>{label}</Link>
    </Button>
  );
}
