import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono, Space_Grotesk } from "next/font/google";

import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { ThemeProvider } from "@/components/layout/ThemeProvider";

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
});

const codeFont = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-code",
});

const bodyFont = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "ShadowFlowBTC++",
  description: "Zero-knowledge private Bitcoin strategy execution system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${displayFont.variable} ${codeFont.variable} ${bodyFont.variable} min-h-screen bg-background text-foreground antialiased`}
      >
        <ThemeProvider>
          <div className="min-h-screen bg-background">
            <Sidebar />
            <div className="ml-[220px] min-h-screen">
              <Topbar />
              <main className="min-h-[calc(100vh-56px)]">{children}</main>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}