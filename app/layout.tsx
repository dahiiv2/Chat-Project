import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Chat Groups",
  description: "Create your own chat groups!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={cn(
          spaceGrotesk.variable, "antialiased",
          "bg-white text-slate-900 dark:bg-[#1b1b1b] dark:text-slate-50"

        )} suppressHydrationWarning>
          <ThemeProvider 
          attribute="class" 
          defaultTheme="dark" 
          enableSystem={false} 
          storageKey="theme">
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
