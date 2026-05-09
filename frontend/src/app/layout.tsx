import type { Metadata, Viewport } from "next";

import { BackToTop } from "@/components/site/BackToTop";

import "./globals.css";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.collegeoutcomeanalyst.com";

const SITE_DESCRIPTION =
  "College outcome intelligence built from federal public data — Treasury earnings, IPEDS, College Scorecard. Per-program and per-institution earnings, debt, and completion at every Title-IV school.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "College Grad Analyst",
  description: SITE_DESCRIPTION,
  applicationName: "College Grad Analyst",
  openGraph: {
    type: "website",
    siteName: "College Grad Analyst",
    locale: "en_US",
    title: "College Grad Analyst",
    description: SITE_DESCRIPTION,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "College Grad Analyst",
    description: SITE_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body>
        {children}
        <BackToTop />
      </body>
    </html>
  );
}
