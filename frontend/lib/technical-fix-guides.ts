export type TechnicalFixKey =
  | "robots"
  | "llms"
  | "payload"
  | "sitemap"
  | "schema"
  | "https"
  | "indexability"
  | "canonical"

export interface TechnicalFixGuide {
  key: TechnicalFixKey
  title: string
  simpleSummary: string
  technicalSummary: string
  whyItMatters: string
  fixSteps: string[]
  validationSteps: string[]
  snippet?: string
  docs: Array<{ label: string; href: string }>
}

export const TECHNICAL_FIX_GUIDES: Record<TechnicalFixKey, TechnicalFixGuide> = {
  robots: {
    key: "robots",
    title: "Fix robots.txt agent access",
    simpleSummary:
      "Your robots.txt file controls which bots can read your site. If AI crawlers are blocked, they may never see your content.",
    technicalSummary:
      "Ensure robots.txt includes permissive directives for AI user agents so retrieval crawlers can access important URLs.",
    whyItMatters:
      "When crawlers are blocked at robots.txt level, even great content cannot be indexed or cited by AI systems.",
    fixSteps: [
      "Open or create /robots.txt at your domain root.",
      "Allow GPTBot, CCBot, and Google-Extended to crawl content paths.",
      "Avoid broad Disallow rules that hide key docs, blog pages, and landing pages.",
      "Deploy and verify robots.txt is reachable at https://yourdomain.com/robots.txt.",
    ],
    validationSteps: [
      "Confirm robots.txt returns HTTP 200.",
      "Check user-agent directives are present and not overridden by conflicting rules.",
      "Run a fresh scan from this page and confirm the check switches to Done.",
    ],
    snippet: `User-agent: GPTBot
Disallow:

User-agent: CCBot
Disallow:

User-agent: Google-Extended
Disallow:`,
    docs: [{ label: "Google robots.txt docs", href: "https://developers.google.com/search/docs/crawling-indexing/robots/intro" }],
  },
  llms: {
    key: "llms",
    title: "Publish llms.txt summary file",
    simpleSummary:
      "An llms.txt file is a quick guide for AI tools, so they can find your best pages without guessing.",
    technicalSummary:
      "Provide a machine-readable llms.txt manifest that prioritizes core URLs and concise domain context for model retrieval.",
    whyItMatters:
      "AI systems often benefit from curated entry points. llms.txt reduces discovery friction and improves answer consistency.",
    fixSteps: [
      "Create /llms.txt in your site root.",
      "Add a short domain summary and list your most important URLs.",
      "Keep entries updated when URLs or core pages change.",
      "Make sure the file is publicly accessible (HTTP 200).",
    ],
    validationSteps: [
      "Open https://yourdomain.com/llms.txt and verify it loads.",
      "Confirm links in llms.txt point to live pages.",
      "Run a fresh scan from this page and confirm the check switches to Done.",
    ],
    snippet: `# example.com
> Machine-readable summary for AI assistants.

## Key pages
- /
- /pricing
- /about
- /contact`,
    docs: [{ label: "llms.txt spec", href: "https://llmstxt.org/" }],
  },
  payload: {
    key: "payload",
    title: "Reduce code-to-text bloat",
    simpleSummary:
      "Your pages contain too much code before the useful text. AI has to spend effort parsing code instead of reading your answers.",
    technicalSummary:
      "Improve code-to-text ratio by reducing JS/CSS payload and exposing primary content in initial server-rendered HTML.",
    whyItMatters:
      "Lower bloat improves crawl efficiency, reduces processing cost, and increases the chance AI systems extract the right information.",
    fixSteps: [
      "Move key content to server-rendered HTML (SSR/SSG where possible).",
      "Reduce large JS bundles, unused CSS, and heavy client-side hydration.",
      "Prioritize meaningful text above fold and early in the DOM.",
      "Re-check lighthouse/bundle reports after optimization.",
    ],
    validationSteps: [
      "Compare before/after bundle sizes.",
      "Verify primary page copy appears without waiting for client hydration.",
      "Run a fresh scan from this page and confirm this item switches to Done.",
    ],
    docs: [{ label: "Next.js rendering strategies", href: "https://nextjs.org/docs/app/building-your-application/rendering" }],
  },
  sitemap: {
    key: "sitemap",
    title: "Ensure sitemap.xml discoverability",
    simpleSummary:
      "A sitemap helps crawlers find all important pages quickly. Missing sitemap means pages can be missed.",
    technicalSummary:
      "Publish a valid sitemap.xml and ensure robots.txt includes a sitemap directive for reliable URL discovery.",
    whyItMatters:
      "Without a sitemap, discovery depends on link depth and crawl budget. That can delay indexing of important pages.",
    fixSteps: [
      "Generate /sitemap.xml including canonical indexable pages.",
      "Add a Sitemap: line in /robots.txt pointing to the full sitemap URL.",
      "Exclude duplicate, blocked, or noindex URLs from the sitemap.",
      "Re-deploy and confirm sitemap is reachable via HTTPS.",
    ],
    validationSteps: [
      "Open https://yourdomain.com/sitemap.xml and confirm valid XML.",
      "Ensure robots.txt references sitemap URL.",
      "Run a fresh scan from this page and confirm the check switches to Done.",
    ],
    snippet: `Sitemap: https://example.com/sitemap.xml`,
    docs: [{ label: "Sitemaps.org", href: "https://www.sitemaps.org/protocol.html" }],
  },
  schema: {
    key: "schema",
    title: "Increase schema coverage depth",
    simpleSummary:
      "Schema markup helps AI understand what your page is about, who you are, and what entities you mention.",
    technicalSummary:
      "Expand JSON-LD coverage for high-value schema types (Organization, FAQPage, Article, BreadcrumbList) across key templates.",
    whyItMatters:
      "Structured data improves entity comprehension and can strengthen relevance and confidence in AI-generated recommendations.",
    fixSteps: [
      "Add JSON-LD to your core templates (home, docs/blog, and key landing pages).",
      "Cover Organization, FAQPage, Article, and BreadcrumbList where relevant.",
      "Keep schema fields accurate and synced with visible page content.",
      "Validate output after deployment and after template edits.",
    ],
    validationSteps: [
      "Run each key page through Rich Results Test and Schema Validator.",
      "Fix warnings that affect required fields first.",
      "Run a fresh scan from this page and confirm this item switches to Done.",
    ],
    snippet: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Example Inc",
  "url": "https://example.com"
}
</script>`,
    docs: [
      { label: "Google structured data docs", href: "https://developers.google.com/search/docs/appearance/structured-data" },
      { label: "Schema validator", href: "https://validator.schema.org/" },
    ],
  },
  https: {
    key: "https",
    title: "Enforce HTTPS across the site",
    simpleSummary:
      "HTTPS keeps your site secure and trusted. Search engines and AI systems prefer secure pages.",
    technicalSummary:
      "Enforce HTTPS with canonical secure URLs, redirect HTTP to HTTPS, and avoid mixed-content resources.",
    whyItMatters:
      "Insecure endpoints can reduce trust, create duplicate URL versions, and weaken crawl consistency.",
    fixSteps: [
      "Set a permanent redirect from http:// to https:// for every route.",
      "Use HTTPS links internally (navigation, canonical tags, sitemaps, structured data).",
      "Fix mixed content (scripts, styles, images) so all assets load over HTTPS.",
      "Verify TLS certificate is valid and auto-renewed.",
    ],
    validationSteps: [
      "Open several HTTP URLs and verify they redirect to HTTPS.",
      "Check browser security lock and no mixed-content warnings.",
      "Run Scan This Fix Again and confirm this check stays healthy.",
    ],
    docs: [{ label: "Google HTTPS guidance", href: "https://developers.google.com/search/docs/crawling-indexing/https-sites" }],
  },
  indexability: {
    key: "indexability",
    title: "Improve indexability baseline",
    simpleSummary:
      "Indexability means crawlers can reach and understand your important pages.",
    technicalSummary:
      "Establish a reliable crawl/index baseline by validating robots rules and reducing accidental crawl blockers.",
    whyItMatters:
      "If indexability is weak, your best pages may not appear in search systems consistently.",
    fixSteps: [
      "Review robots.txt and remove unintended Disallow rules.",
      "Ensure key pages are not noindex unless intentional.",
      "Keep important pages linked from navigation and sitemap.",
      "Avoid soft-404 pages for core content URLs.",
    ],
    validationSteps: [
      "Confirm robots.txt is reachable and permissive for important bots.",
      "Spot-check key pages for indexability signals.",
      "Run Scan This Fix Again and confirm baseline remains healthy.",
    ],
    docs: [{ label: "Google indexing docs", href: "https://developers.google.com/search/docs/crawling-indexing" }],
  },
  canonical: {
    key: "canonical",
    title: "Improve canonical consistency",
    simpleSummary:
      "Canonical tags tell search engines which URL is the main version of each page.",
    technicalSummary:
      "Implement consistent rel=canonical tags across templates and ensure sitemap URLs match canonical targets.",
    whyItMatters:
      "If canonical tags are missing or inconsistent, engines may index duplicate versions of the same content and split trust across URLs.",
    fixSteps: [
      "Add one canonical tag on every important template (home, landing pages, blog, docs).",
      "Always point canonical to the final preferred HTTPS URL (not HTTP, not redirecting URLs).",
      "Ensure sitemap URLs exactly match canonical URLs.",
      "Avoid conflicts like multiple canonical tags or canonical-to-canonical chains.",
    ],
    validationSteps: [
      "Open page source and confirm each page has one rel=canonical tag.",
      "Compare canonical URLs with sitemap entries and make sure they are identical.",
      "After deployment, run Scan This Fix Again to verify the update.",
    ],
    docs: [{ label: "Google canonicalization docs", href: "https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls" }],
  },
}

export function isTechnicalFixKey(value: string): value is TechnicalFixKey {
  return value in TECHNICAL_FIX_GUIDES
}

type ChecklistLike = {
  technical?: {
    robots?: { status?: string }
    llms?: { status?: string }
    sitemap?: { url?: string | null }
    https?: { status?: string } | boolean
    schema?: { types?: string[] }
    agent_economics?: { html_ratio?: number | string }
  }
}

type ReportLike = {
  technical?: {
    robotsTxt?: boolean
    llmsTxt?: boolean
    sitemap?: string | null
    https?: boolean
    schema?: string[]
  }
  agentEconomics?: {
    codeToTextRatio?: number | string
  }
}

export function getFixStatusFromChecklist(fixKey: TechnicalFixKey, checklist: ChecklistLike | null | undefined): boolean {
  const technical = checklist?.technical || {}
  const schemaTypes = Array.isArray(technical?.schema?.types)
    ? technical.schema.types.map((item: string) => String(item).toLowerCase())
    : []

  if (fixKey === "robots") return technical?.robots?.status === "valid"
  if (fixKey === "llms") return technical?.llms?.status === "valid"
  if (fixKey === "sitemap") return Boolean(technical?.sitemap?.url)
  if (fixKey === "https") {
    if (technical?.https === true) return true
    if (technical?.https && typeof technical.https === "object") {
      return technical.https.status === "valid"
    }
    return false
  }
  if (fixKey === "indexability") return technical?.robots?.status === "valid"
  if (fixKey === "canonical") return false
  if (fixKey === "payload") {
    const ratio = Number(technical?.agent_economics?.html_ratio || 0) * 100
    return Number.isFinite(ratio) && ratio >= 15
  }

  const requiredSchema = ["organization", "faqpage", "article", "breadcrumblist"]
  const coverage = Math.round(
    (requiredSchema.filter((schema) => schemaTypes.includes(schema)).length / requiredSchema.length) * 100
  )
  return coverage >= 75
}

export function getFixStatusFromReport(fixKey: TechnicalFixKey, report: ReportLike | null | undefined): boolean {
  if (!report) return false
  if (fixKey === "robots") return Boolean(report?.technical?.robotsTxt)
  if (fixKey === "llms") return Boolean(report?.technical?.llmsTxt)
  if (fixKey === "sitemap") return Boolean(report?.technical?.sitemap)
  if (fixKey === "https") return Boolean(report?.technical?.https)
  if (fixKey === "indexability") return Boolean(report?.technical?.robotsTxt)
  if (fixKey === "canonical") return false
  if (fixKey === "payload") {
    const ratio = Number(report?.agentEconomics?.codeToTextRatio || 0) * 100
    return Number.isFinite(ratio) && ratio >= 15
  }

  const schemaTypes = Array.isArray(report?.technical?.schema)
    ? report.technical.schema.map((item: string) => String(item).toLowerCase())
    : []
  const requiredSchema = ["organization", "faqpage", "article", "breadcrumblist"]
  const coverage = Math.round(
    (requiredSchema.filter((schema) => schemaTypes.includes(schema)).length / requiredSchema.length) * 100
  )
  return coverage >= 75
}
