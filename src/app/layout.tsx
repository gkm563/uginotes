import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { MobileNav } from "@/components/mobile-nav";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "UgiNotes | Official Academic Resource Library & Notes Hub for UGI",
    template: "%s | UgiNotes"
  },
  description: "UgiNotes (NotesBazi) is the central digital academic library for United Group of Institutions (UIT, UCER, UIP, UIM). Access and share lecture notes, previous year question papers (PYQs), study guides, and assignments.",
  keywords: [
    "UgiNotes", 
    "NotesBazi", 
    "UGI Notes", 
    "United Group of Institutions", 
    "UIT Prayagraj", 
    "UCER Prayagraj", 
    "UIP", 
    "UIM", 
    "Engineering Notes", 
    "PYQ", 
    "Assignments", 
    "Study Material", 
    "United College", 
    "Computer Science Notes", 
    "UGI Student Portal"
  ],
  authors: [{ name: "UgiNotes Community" }],
  openGraph: {
    title: "UgiNotes | Official Academic Resource Library & Notes Hub for UGI",
    description: "The digital library for United Group of Institutions. Access verified notes, PYQs, and assignments shared by your peers.",
    url: "https://uginotes.vercel.app",
    siteName: "UgiNotes",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "UgiNotes | Official Academic Resource Library & Notes Hub for UGI",
    description: "The digital library for United Group of Institutions. Access verified notes, PYQs, and assignments shared by your peers.",
  }
};

import { UploadProvider } from "@/components/providers/upload-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={`${inter.className} antialiased selection:bg-indigo-100 selection:text-indigo-900 bg-background text-foreground transition-colors`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
          disableTransitionOnChange
        >
          <UploadProvider>
            <Navbar />
            <div className="pb-16 md:pb-0">
              {children}
            </div>
            <Footer />
            <MobileNav />
            <Toaster position="top-center" richColors closeButton />
          </UploadProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
