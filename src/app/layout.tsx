import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource/instrument-serif";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "MoPA · Legislative Monitoring Dashboard",
    template: "%s · MoPA",
  },
  description:
    "Ministry of Parliamentary Affairs — Legislative Monitoring Dashboard. Track Official Bills, Private Members' Bills and Joint Sitting cases from registration to Gazette notification.",
  applicationName: "MoPA Legislative Monitoring",
  authors: [{ name: "National Information Technology Board" }],
  keywords: [
    "MoPA",
    "Parliamentary Affairs",
    "legislative monitoring",
    "Pakistan",
    "NITB",
    "bills",
  ],
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f6f2" },
    { media: "(prefers-color-scheme: dark)", color: "#070c0a" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          // Apply the stored theme before paint to avoid a flash of the wrong palette.
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('mopa-theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
