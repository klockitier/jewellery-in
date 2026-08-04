/**
 * Root route — HTML shell: fonts (self-hosted via CSS), default meta, global
 * header + footer around the page outlet.
 */

import { HeadContent, Outlet, Scripts, createRootRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import appCss from "~/styles/app.css?url";
import { Footer } from "~/components/Footer";
import { Header } from "~/components/Header";
import { siteConfig } from "~/config/site";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#201b14" },
      { title: `${siteConfig.name} — Fine Gold & Silver Jewellery` },
      {
        name: "description",
        content: siteConfig.description,
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "preload", as: "font", type: "font/woff2", href: "/fonts/cormorant-var.woff2", crossOrigin: "anonymous" },
      { rel: "preload", as: "font", type: "font/woff2", href: "/fonts/jost-var.woff2", crossOrigin: "anonymous" },
    ],
  }),
  notFoundComponent: () => (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <p className="eyebrow">Error 404</p>
      <h1 className="mt-4 text-5xl text-ink">Page not found</h1>
      <p className="mt-3 text-muted">The page you&rsquo;re looking for doesn&rsquo;t exist.</p>
      <a href="/" className="btn btn-outline mt-8">
        Back to home
      </a>
    </main>
  ),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en-IN">
      <head>
        <HeadContent />
      </head>
      <body>
        <Header />
        <main id="main-content">{children}</main>
        <Footer />
        <Scripts />
      </body>
    </html>
  );
}
