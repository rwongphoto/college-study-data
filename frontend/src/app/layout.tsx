import type { Metadata, Viewport } from "next";
import Script from "next/script";

import { BackToTop } from "@/components/site/BackToTop";
import { ThemeProvider } from "@/components/site/ThemeProvider";

import "./globals.css";

const GTM_ID = "GTM-NKNDSQQP";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.collegegradanalyst.com";

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="gtm-init" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
        </Script>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body>
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <BackToTop />
        </ThemeProvider>
      </body>
    </html>
  );
}
