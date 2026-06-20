import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Tarot — Look Inward",
  description:
    "A tender, story-driven AI tarot reading experience. The true answers always lie within your heart.",
  keywords: ["tarot", "AI", "reading", "spiritual", "塔羅", "辛西亞"],
  openGraph: {
    title: "AI Tarot — Look Inward",
    description: "A tender, story-driven AI tarot reading experience.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@300;400;500&family=Noto+Serif+TC:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-mystic-deep text-cream-100 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
