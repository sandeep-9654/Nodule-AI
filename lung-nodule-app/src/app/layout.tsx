import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SidebarData } from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Volumetric CT Analysis",
  description: "Lung Nodule Detection & Classification System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <div className="flex h-screen w-full bg-slate-950 text-slate-100 overflow-hidden">
          <SidebarData />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
