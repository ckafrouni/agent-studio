import type { Metadata } from "next";
import "./globals.css";
import { NavBar } from "@/components/layout/navbar/NavBar";

export const metadata: Metadata = {
  title: "My RAG App",
  description: "Chat with your documents",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <NavBar />
        <main className="">{children}</main>
      </body>
    </html>
  );
}
