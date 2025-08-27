import type { Metadata } from "next";
import "./ui/global.css";
import { SidebarDemo } from "./ui/components/sidebar/sidebar-demo.jsx";
import { Providers } from "./provider";

export const metadata: Metadata = {
  title: "Astrae | Portal de inversión en Startups",
  description: "Portal de inversión en startups",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className="dark">
      <head>
        <meta charSet="UTF-8" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="stylesheet" href="https://use.typekit.net/dur8atw.css" />
      </head>
      <body>
        <Providers>
          <SidebarDemo />
          {children}
        </Providers>
      </body>
    </html>
  );
}
