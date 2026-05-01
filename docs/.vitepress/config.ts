import { defineConfig } from "vitepress";
import { fileURLToPath } from "node:url";
import { statSync, writeFileSync } from "node:fs";
import type MarkdownIt from "markdown-it";
import tailwindcss from "@tailwindcss/vite";
import pkg from "../../package.json";
import { enLocale, ruLocale, zhLocale, jaLocale, ptLocale, koLocale, esLocale } from "./locales";

const SITE_URL  = "https://nestelia.dev";
const SITE_DESC = "A modular, decorator-driven framework built on top of Elysia and Bun";
const OG_IMAGE  = `${SITE_URL}/og.png`;

function externalLinkPlugin(md: MarkdownIt) {
  const defaultRender = md.renderer.rules.link_open || function(tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
  };

  md.renderer.rules.link_open = function(tokens, idx, options, env, self) {
    const token = tokens[idx];
    const hrefAttr = token.attrGet("href");
    if (hrefAttr && /^https?:\/\//.test(hrefAttr)) {
      token.attrSet("rel", "nofollow noopener noreferrer");
      token.attrSet("target", "_blank");
    }
    return defaultRender(tokens, idx, options, env, self);
  };
}

interface RssItem {
  title: string;
  url: string;
  description: string;
  date: string;
}

const rssItems: RssItem[] = [];
const sitemapLastmod = new Map<string, string>();

function toRfc822(date: Date): string {
  return date.toUTCString();
}

export default defineConfig({
  title: "Nestelia",
  titleTemplate: ":title | Nestelia",
  description: SITE_DESC,
  base: "/",
  ignoreDeadLinks: true,

  sitemap: {
    hostname: SITE_URL,
    transformItems(items) {
      return items.map((item) => {
        const urlPath = item.url.replace(`${SITE_URL}/`, "").replace(/\.html$/, "");
        const relPath = urlPath ? `${urlPath}.md` : "index.md";
        const lastmod = sitemapLastmod.get(relPath);
        return lastmod ? { ...item, lastmod } : item;
      });
    },
  },

  head: [
    // Anti-FOUC: apply dark class and background before CSSOM is built.
    // Runs while the render-blocking stylesheet is still downloading, so when
    // CSS is finally parsed the .dark class is already on <html> and dark-mode
    // variables resolve correctly — no white flash on Cmd+R / hard reload.
    ["script", {}, `(function(){try{var p=localStorage.getItem("vitepress-theme-appearance")||"auto";var d=p==="dark"||(p==="auto"&&matchMedia("(prefers-color-scheme:dark)").matches);if(d){var e=document.documentElement;e.classList.add("dark");e.style.colorScheme="dark";e.style.setProperty("background-color","#121113","important")}}catch(e){}})();`],

    // Favicon — ICO/PNG for search engines & legacy browsers, SVG for modern ones
    ["link", { rel: "icon", href: "/favicon.ico", sizes: "32x32" }],
    ["link", { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" }],
    ["link", { rel: "apple-touch-icon", href: "/apple-touch-icon.png" }],

    // Fonts — Inter is self-hosted via @fontsource-variable/inter (no external requests)
    ["link", { rel: "preload", href: "/assets/GeistMono-Regular.woff2", as: "font", type: "font/woff2", crossorigin: "" }],

    // PWA manifest
    ["link", { rel: "manifest", href: "/manifest.json" }],

    // Open Graph
    ["meta", { property: "og:type",        content: "website" }],
    ["meta", { property: "og:site_name",   content: "Nestelia" }],
    ["meta", { property: "og:url",         content: SITE_URL }],
    ["meta", { property: "og:title",       content: "Nestelia" }],
    ["meta", { property: "og:description", content: SITE_DESC }],
    ["meta", { property: "og:image",       content: OG_IMAGE }],

    // Twitter / X
    ["meta", { name: "twitter:card",        content: "summary_large_image" }],
    ["meta", { name: "twitter:title",       content: "Nestelia" }],
    ["meta", { name: "twitter:description", content: SITE_DESC }],
    ["meta", { name: "twitter:image",       content: OG_IMAGE }],
    ["meta", { name: "twitter:site",        content: "@nesteliajs" }],

    // Crawler directives
    ["meta", { name: "robots",      content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" }],
    ["meta", { name: "googlebot",   content: "index, follow" }],
    ["meta", { name: "bingbot",     content: "index, follow" }],
    ["meta", { name: "author",      content: "Nestelia" }],
    ["meta", { name: "theme-color", content: "#121113", media: "(prefers-color-scheme: dark)" }],
    ["meta", { name: "theme-color", content: "#ffffff", media: "(prefers-color-scheme: light)" }],

    // Sitemap & AI discovery
    ["link", { rel: "sitemap",    type: "application/xml", title: "Sitemap", href: "/sitemap.xml" }],
    ["link", { rel: "alternate",  type: "text/plain",      title: "llms.txt",      href: "/llms.txt" }],
    ["link", { rel: "alternate",  type: "text/plain",      title: "llms-full.txt", href: "/llms-full.txt" }],

    // RSS feed
    ["link", { rel: "alternate", type: "application/rss+xml", title: "Nestelia Documentation RSS", href: "/rss.xml" }],

    // Preconnect / DNS-prefetch for external domains
    ["link", { rel: "preconnect", href: "https://github.com" }],
    ["link", { rel: "dns-prefetch", href: "https://elysiajs.com" }],
    ["link", { rel: "dns-prefetch", href: "https://bun.sh" }],

    // JSON-LD: Organization
    ["script", { type: "application/ld+json" }, JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Nestelia",
      "url": SITE_URL,
      "logo": `${SITE_URL}/logo/light.svg`,
      "sameAs": [
        "https://github.com/nestelia/nestelia",
      ],
    })],

    // JSON-LD: WebSite (enables Google Sitelinks Searchbox)
    ["script", { type: "application/ld+json" }, JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Nestelia",
      "url": SITE_URL,
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${SITE_URL}/search.html?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    })],

    // JSON-LD: SoftwareApplication
    ["script", { type: "application/ld+json" }, JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Nestelia",
      "description": SITE_DESC,
      "url": SITE_URL,
      "applicationCategory": "DeveloperApplication",
      "operatingSystem": "Any",
      "programmingLanguage": "TypeScript",
      "softwareVersion": pkg.version,
      "license": "https://opensource.org/licenses/MIT",
      "codeRepository": "https://github.com/nestelia/nestelia",
      "documentation": `${SITE_URL}/introduction`,
      "downloadUrl": "https://github.com/nestelia/nestelia",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
      },
      "keywords": [
        "elysia", "bun", "typescript", "framework", "dependency injection",
        "decorators", "nestjs", "modules", "controllers", "graphql", "microservices",
        "websocket", "realtime", "api", "backend", "server",
      ],
    })],
  ],

  // Inject per-page canonical URL, dynamic og:title, and hreflang alternates
  transformPageData(pageData) {
    const canonical = `${SITE_URL}/${pageData.relativePath}`
      .replace(/index\.md$/, "")
      .replace(/\.md$/, "");

    pageData.frontmatter.head ??= [];
    const pageTitle = pageData.title ? `${pageData.title} | Nestelia` : "Nestelia";
    const pageDesc  = pageData.frontmatter.description ?? SITE_DESC;
    const locale    = pageData.frontmatter.lang ?? "en";

    // Real file modification time for sitemap lastmod
    let mtime: string;
    try {
      mtime = statSync(pageData.filePath).mtime.toISOString();
    } catch {
      mtime = new Date().toISOString();
    }
    pageData.frontmatter.lastmod = mtime;
    sitemapLastmod.set(pageData.relativePath, mtime);

    pageData.frontmatter.head.push(
      ["link", { rel: "canonical", href: canonical }],
      ["meta", { property: "og:url",         content: canonical }],
      ["meta", { property: "og:title",       content: pageTitle }],
      ["meta", { property: "og:description", content: pageDesc }],
      ["meta", { property: "og:locale",      content: locale === "zh" ? "zh-CN" : locale }],
      ["meta", { name: "twitter:title",       content: pageTitle }],
      ["meta", { name: "twitter:description", content: pageDesc }],
      ["meta", { name: "description",         content: pageDesc }],
    );

    // hreflang alternate links for multilingual SEO
    const localePrefixes: Array<{ lang: string; prefix: string }> = [
      { lang: "en",    prefix: ""    },
      { lang: "zh-CN", prefix: "zh/" },
      { lang: "ru",    prefix: "ru/" },
      { lang: "ja",    prefix: "ja/" },
      { lang: "pt-BR", prefix: "pt/" },
      { lang: "ko",    prefix: "ko/" },
      { lang: "es",    prefix: "es/" },
    ];

    // Strip any locale prefix to get the base path
    let basePath = pageData.relativePath;
    for (const { prefix } of localePrefixes.filter(l => l.prefix)) {
      if (basePath.startsWith(prefix)) {
        basePath = basePath.slice(prefix.length);
        break;
      }
    }
    basePath = basePath.replace(/index\.md$/, "").replace(/\.md$/, "");

    for (const { lang, prefix } of localePrefixes) {
      const href = `${SITE_URL}/${prefix}${basePath}`.replace(/\/$/, "") || SITE_URL;
      pageData.frontmatter.head.push(["link", { rel: "alternate", hreflang: lang, href }]);
    }
    // x-default points to the English version
    const defaultHref = `${SITE_URL}/${basePath}`.replace(/\/$/, "") || SITE_URL;
    pageData.frontmatter.head.push(["link", { rel: "alternate", hreflang: "x-default", href: defaultHref }]);

    // BreadcrumbList JSON-LD for non-home, non-api-reference pages
    const sectionLabels: Record<string, string> = {
      "getting-started": "Getting Started",
      "core-concepts":   "Core Concepts",
      "features":        "Features",
      "packages":        "Packages",
      "advanced":        "Advanced",
    };
    const pathParts = basePath.split("/").filter(Boolean);
    if (pathParts.length >= 1 && pathParts[0] !== "api-reference" && basePath !== "") {
      const items: object[] = [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      ];
      if (pathParts.length >= 2) {
        const section = sectionLabels[pathParts[0]] ?? pathParts[0];
        items.push({ "@type": "ListItem", position: 2, name: section, item: `${SITE_URL}/${pathParts[0]}` });
        items.push({ "@type": "ListItem", position: 3, name: pageData.title || pathParts[1], item: canonical });
      } else {
        items.push({ "@type": "ListItem", position: 2, name: pageData.title || pathParts[0], item: canonical });
      }
      pageData.frontmatter.head.push(["script", { type: "application/ld+json" }, JSON.stringify({
        "@context": "https://schema.org",
        "@type":    "BreadcrumbList",
        itemListElement: items,
      })]);
    }

    // TechArticle JSON-LD for documentation pages
    if (basePath !== "" && basePath !== "404") {
      pageData.frontmatter.head.push(["script", { type: "application/ld+json" }, JSON.stringify({
        "@context": "https://schema.org",
        "@type": "TechArticle",
        headline: pageData.title || "Nestelia",
        description: pageDesc,
        url: canonical,
        author: { "@type": "Organization", name: "Nestelia" },
        publisher: {
          "@type": "Organization",
          name: "Nestelia",
          logo: { "@type": "ImageObject", url: `${SITE_URL}/logo/light.svg` },
        },
        dateModified: mtime,
        inLanguage: locale === "zh" ? "zh-CN" : locale,
      })]);
    }

    // Collect data for RSS feed
    rssItems.push({
      title: pageData.title || "Nestelia",
      url: canonical,
      description: pageDesc,
      date: mtime,
    });
  },

  locales: {
    root: enLocale,
    zh:   zhLocale,
    ru:   ruLocale,
    ja:   jaLocale,
    pt:   ptLocale,
    ko:   koLocale,
    es:   esLocale,
  },

  themeConfig: {
    logo: {
      light: "/logo/light.svg",
      dark:  "/logo/dark.svg",
      alt:   "Nestelia",
    },
    siteTitle: false,
    socialLinks: [{ icon: "github", link: "https://github.com/nestelia/nestelia" }],
    search: { provider: "local" },
  },

  vite: {
    define: { __PKG_VERSION__: JSON.stringify(pkg.version) },
    plugins: [tailwindcss()],
    resolve: {
      alias: [{
        find: /^.*\/VPNavBarSearch\.vue$/,
        replacement: fileURLToPath(new URL("./theme/navbar-search.vue", import.meta.url)),
      }],
    },
  },

  markdown: {
    theme: { light: "github-light", dark: "github-dark" },
    config(md) {
      md.use(externalLinkPlugin);
    },
  },

  buildEnd() {
    const now = new Date();
    const itemsXml = rssItems
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 100)
      .map(item => `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${item.url}</link>
      <guid isPermaLink="true">${item.url}</guid>
      <description>${escapeXml(item.description)}</description>
      <pubDate>${toRfc822(new Date(item.date))}</pubDate>
    </item>`)
      .join("\n");

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Nestelia Documentation</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESC)}</description>
    <language>en</language>
    <lastBuildDate>${toRfc822(now)}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
${itemsXml}
  </channel>
</rss>`;

    writeFileSync(".vitepress/dist/rss.xml", rss, "utf-8");
  },
});

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
