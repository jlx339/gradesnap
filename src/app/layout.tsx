import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GradeSnap - Pokemon Card Grader",
  description: "Snap a photo, get an instant PSA grade estimate for your Pokemon cards using AI",
  manifest: "/manifest.json",
  keywords: ["pokemon", "card", "grading", "PSA", "estimate", "AI", "collector"],
  authors: [{ name: "GradeSnap" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#1e3a8a",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen min-h-[-webkit-fill-available] bg-gradient-to-b from-blue-900 to-blue-950" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
