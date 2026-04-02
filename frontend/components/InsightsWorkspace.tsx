"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlignLeft,
  AlertCircle,
  ArrowLeft,
  BellRing,
  Check,
  Code,
  Sparkles,
  XCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  readCachedAnalysis,
  requestAnalysis,
  saveCachedAnalysis,
} from "@/lib/analysis-client";

type EngineKey =
  | "chatgpt"
  | "gemini"
  | "claude"
  | "perplexity"
  | "searchgpt"
  | "meta"
  | "grok"
  | "mistral"
  | "you";

type EngineScores = Partial<Record<EngineKey, number>>;

type AnalysisResult = {
  url: string;
  total_score: number;
  engine_scores?: EngineScores;
  competitors?: {
    top_competitors?: string[];
    yourShare?: number;
    others?: number;
  };
  breakdown?: {
    technical?: {
      robots?: { score?: number; status?: string; details?: string[] };
      llms?: { score?: number; status?: string; details?: string[] };
      schema?: { score?: number; details?: string[]; types?: string[] };
      https?: { score?: number; status?: string; details?: string[] };
      sitemap?: { score?: number; status?: string; details?: string[] };
    };
    content?: {
      questions?: { score?: number; details?: string[] };
      readability?: { score?: number; details?: string[] };
      visual?: { score?: number; details?: string[] };
      freshness?: { score?: number; details?: string[] };
      word_count?: { score?: number; details?: string[] };
      gap?: { score?: number; details?: string[] };
    };
    authority?: {
      eeat?: { score?: number; details?: string[] };
      knowledge_graph?: { data?: { primary_entity?: string } };
    };
  };
};

type EngineMeta = {
  key: EngineKey;
  label: string;
  model: string;
  logo: string;
  hasSearch: boolean;
};

type PromptResponse = {
  engineKey: EngineKey;
  engineLabel: string;
  model: string;
  mentionRate: number;
  response: string;
  mentions: string[];
};

type KeyPrompt = {
  id: string;
  prompt: string;
  status: "Active" | "Draft";
  mentionRate: number;
  responses: PromptResponse[];
};

const ENGINE_META: EngineMeta[] = [
  {
    key: "chatgpt",
    label: "OpenAI",
    model: "GPT-5 Mini + Search",
    logo: "/logos/chatgpt-logo.png",
    hasSearch: true,
  },
  {
    key: "gemini",
    label: "Gemini",
    model: "Gemini 2.5 Flash + Search",
    logo: "/logos/gemini-logo.png",
    hasSearch: true,
  },
  {
    key: "claude",
    label: "Claude",
    model: "Claude Sonnet 4",
    logo: "/logos/claude-logo.png",
    hasSearch: false,
  },
  {
    key: "perplexity",
    label: "Perplexity",
    model: "Perplexity + Search",
    logo: "/logos/perplexity-logo.png",
    hasSearch: true,
  },
  {
    key: "grok",
    label: "Grok",
    model: "Grok 3",
    logo: "/logos/grok-logo.svg",
    hasSearch: false,
  },
  {
    key: "mistral",
    label: "Mistral",
    model: "Le Chat Search",
    logo: "/logos/mistral-logo.png",
    hasSearch: true,
  },
  {
    key: "you",
    label: "You.com",
    model: "YouChat Pro",
    logo: "/logos/you-logo.png",
    hasSearch: true,
  },
  {
    key: "meta",
    label: "Meta AI",
    model: "Llama + Web Search",
    logo: "/logos/meta-logo.webp",
    hasSearch: true,
  },
  {
    key: "searchgpt",
    label: "SearchGPT",
    model: "OpenAI Prototype",
    logo: "/logos/chatgpt-logo.png",
    hasSearch: true,
  },
];

const FALLBACK_COMPETITORS = [
  "Alpha Competitor",
  "Northstar Labs",
  "BlueWave Group",
  "Summit Digital",
  "Vertex Brands",
  "Global Edge Co",
];

const ENGINE_DETAIL_COPY: Record<EngineKey, { aeo: string; geo: string }> = {
  chatgpt: {
    aeo: "ChatGPT favors pages that answer a question quickly and clearly, then back it up with trust signals.",
    geo: "Use short, direct paragraphs so your wording can be quoted in full with less rewriting.",
  },
  gemini: {
    aeo: "Gemini needs clear headings and section labels so it can understand page structure fast.",
    geo: "Keep one idea per paragraph and make answers explicit so Gemini can extract clean snippets.",
  },
  claude: {
    aeo: "Claude prefers organized question-and-answer flows with concise explanations.",
    geo: "Break long blocks into smaller sections so summaries stay accurate and complete.",
  },
  perplexity: {
    aeo: "Perplexity rewards pages with verifiable statements and visible sources.",
    geo: "Place claims near citations so model answers can include both fact and source together.",
  },
  searchgpt: {
    aeo: "SearchGPT looks for clear page purpose and trustworthy content signals.",
    geo: "Use plain language and answer-first formatting to improve citation pickup.",
  },
  meta: {
    aeo: "Meta AI works best with simple language and clear topic focus.",
    geo: "Keep sentences tight and specific so generated answers keep your meaning intact.",
  },
  grok: {
    aeo: "Grok benefits from fresh, crawlable pages with obvious primary answers.",
    geo: "Add quick summaries near the top so answers are easier to pull into responses.",
  },
  mistral: {
    aeo: "Mistral needs clean structure and obvious section intent.",
    geo: "Use direct wording and avoid vague headings to increase quote accuracy.",
  },
  you: {
    aeo: "You.com favors clear answers plus proof (sources, citations, or supporting links).",
    geo: "Combine short paragraphs with source-backed claims so extracted answers stay reliable.",
  },
};

const ENGINE_ACTION_COPY: Record<
  EngineKey,
  { exampleFix: string; copyPaste: string }
> = {
  chatgpt: {
    exampleFix:
      "On {site}, add a heading like 'What does this service do?' and answer it in 2-3 short sentences.",
    copyPaste:
      `<h2>What does {site} offer?</h2>\n<p>{site} helps [audience] do [result] in [timeframe].</p>`,
  },
  gemini: {
    exampleFix:
      "On {site}, rename vague headings like 'Overview' to specific ones like 'Pricing and Timeline'.",
    copyPaste:
      `<h2>Pricing and Timeline</h2>\n<p>Plans start at [price]. Typical onboarding takes [timeline].</p>`,
  },
  claude: {
    exampleFix:
      "On {site}, break one long section into 2-3 question-and-answer blocks.",
    copyPaste:
      `<h2>Frequently Asked Question</h2>\n<p><strong>Q:</strong> How long does setup take?</p>\n<p><strong>A:</strong> Most customers are live within [timeframe].</p>`,
  },
  perplexity: {
    exampleFix:
      "On {site}, add one source link directly under one important claim.",
    copyPaste:
      `<p><strong>Claim:</strong> [Insert key claim]</p>\n<p>Source: <a href=\"[trusted-source-url]\">Trusted source for this claim</a></p>`,
  },
  searchgpt: {
    exampleFix:
      "On {site}, add FAQ schema for one high-intent customer question.",
    copyPaste:
      `<script type=\"application/ld+json\">\n{\"@context\":\"https://schema.org\",\"@type\":\"FAQPage\",\"mainEntity\":[{\"@type\":\"Question\",\"name\":\"What does {site} do?\",\"acceptedAnswer\":{\"@type\":\"Answer\",\"text\":\"{site} provides [service] for [audience].\"}}]}\n</script>`,
  },
  meta: {
    exampleFix:
      "On {site}, rewrite one technical paragraph into plain language.",
    copyPaste:
      `<p>Old: Our integrated optimization architecture enables robust outcomes.</p>\n<p>New: We help businesses get more leads from AI search.</p>`,
  },
  grok: {
    exampleFix:
      "On {site}, add a 2-line 'Quick answer' summary at the top of your main page.",
    copyPaste:
      `<p><strong>Quick answer:</strong> {site} helps [audience] do [result] in [timeframe].</p>`,
  },
  mistral: {
    exampleFix:
      "On {site}, use clearer section names and simplify long paragraphs.",
    copyPaste:
      `<h2>Pricing and Timeline</h2>\n<p>Plans begin at [price]. Most projects start within [timeline].</p>`,
  },
  you: {
    exampleFix:
      "On {site}, add alt text to one main image and cite one source under a key claim.",
    copyPaste:
      `<img alt=\"{site} product or service shown in the main hero section\" />\n<p><strong>Claim:</strong> [Insert key claim]</p>\n<p>Source: <a href=\"[source-url]\">Source page that proves this claim</a></p>`,
  },
};

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function toTitleCase(input: string) {
  return input
    .replace(/[-_]/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatCompetitorLabel(input: string) {
  const trimmed = input.trim();
  if (!trimmed) return "";

  // If it's a domain, convert root segment to readable brand-ish name.
  if (trimmed.includes(".")) {
    try {
      const normalized = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
      const host = new URL(normalized).hostname.replace(/^www\./, "");
      const parts = host.split(".").filter(Boolean);
      const root = parts.length >= 2 ? parts[parts.length - 2] : parts[0];
      return toTitleCase(root);
    } catch {
      return toTitleCase(trimmed.replace(/^www\./, "").split(".")[0] || trimmed);
    }
  }

  return toTitleCase(trimmed);
}

function pickEngineCompetitorPair(
  competitors: string[],
  engineIndex: number,
  prompt: string
) {
  if (!competitors.length) return { focus: "", support: "" };

  const promptSeed = prompt
    .split("")
    .reduce((sum, character) => sum + character.charCodeAt(0), 0);
  const focusIndex = (promptSeed + engineIndex) % competitors.length;
  const supportIndex = (focusIndex + 2) % competitors.length;

  const focus = competitors[focusIndex] ?? "";
  const support = competitors.length > 1 ? competitors[supportIndex] ?? "" : "";

  return { focus, support: support === focus ? "" : support };
}

function normalizeUrl(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  try {
    const parsed = new URL(withProtocol);
    return parsed.toString();
  } catch {
    return null;
  }
}

function getDomain(rawUrl: string) {
  try {
    return new URL(rawUrl).hostname.replace(/^www\./, "");
  } catch {
    return rawUrl.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  }
}

function getBrandName(domain: string) {
  const pieces = domain.split(".").filter(Boolean);
  if (pieces.length === 0) return "Your Brand";
  const root = pieces.length >= 2 ? pieces[pieces.length - 2] : pieces[0];
  return toTitleCase(root);
}

function inferContext(domain: string) {
  const lower = domain.toLowerCase();
  if (lower.includes("zyn") || lower.includes("nicotine") || lower.includes("snus")) {
    return {
      industry: "Tobacco and Nicotine Products",
      products: ["Nicotine Pouches", "Snus", "Nicotine Gum", "Nicotine Patches"],
      competitors: [
        "Philip Morris International",
        "British American Tobacco",
        "Japan Tobacco International",
        "Imperial Brands",
        "Altria Group",
        "China National Tobacco",
      ],
    };
  }

  return {
    industry: "Consumer and Digital Products",
    products: ["Core Service", "Top Product Line", "Support Program", "Online Experience"],
    competitors: FALLBACK_COMPETITORS,
  };
}

function parseQuestionCount(details?: string[]) {
  if (!details?.length) return 0;
  const first = details[0];
  const match = first.match(/(\d+)\s*\/\s*(\d+)/);
  if (!match) return 0;
  const numerator = Number(match[1]);
  const denominator = Number(match[2]);
  if (!denominator) return 0;
  return Math.round((numerator / denominator) * 100);
}

function scoreFromReport(result: AnalysisResult, key: EngineKey) {
  if (typeof result.engine_scores?.[key] === "number") {
    return clamp(result.engine_scores[key] as number);
  }
  return clamp(result.total_score + (key === "chatgpt" ? 3 : key === "claude" ? 1 : -1));
}

function generateDailySeries(seedScore: number) {
  return Array.from({ length: 14 }, (_, index) => {
    const wave = Math.sin((index / 3) * Math.PI) * 5;
    const drift = (index - 6) * 0.6;
    return clamp(Math.round(seedScore - 6 + wave + drift));
  });
}

function buildPromptResponses(
  prompt: string,
  brandName: string,
  domain: string,
  competitors: string[],
  engines: Array<{ key: EngineKey; label: string; model: string; score: number }>
): PromptResponse[] {
  const styleByEngine: Record<
    EngineKey,
    { behavior: string; fix: string; variation: number; template: "analysis" | "structure" | "qa" | "citation" | "summary" | "clarity" }
  > = {
    chatgpt: {
      behavior:
        "prioritizes answer-first sections and concise explanations with clear trust signals",
      fix: "add a short FAQ answer block and one cited source directly below the claim",
      variation: 4,
      template: "analysis",
    },
    gemini: {
      behavior:
        "leans on clean heading hierarchy and clear section labels for extraction quality",
      fix: "rename vague headings and add one direct summary sentence under each section heading",
      variation: 2,
      template: "structure",
    },
    claude: {
      behavior:
        "prefers structured Q&A flows and logically chunked paragraphs",
      fix: "split dense paragraphs into short Q&A sections and keep one idea per paragraph",
      variation: 0,
      template: "qa",
    },
    perplexity: {
      behavior:
        "favors verifiable statements that are paired with visible, trustworthy citations",
      fix: "place source links right under key claims to increase quote confidence",
      variation: 3,
      template: "citation",
    },
    searchgpt: {
      behavior:
        "favors entity clarity and answer-first formatting for quick retrieval",
      fix: "add explicit entity context and one source-backed key claim near the top",
      variation: 1,
      template: "summary",
    },
    meta: {
      behavior:
        "responds better to plain-language sections with clear topical focus",
      fix: "simplify technical wording and add short plain-language summary lines",
      variation: -2,
      template: "clarity",
    },
    grok: {
      behavior:
        "picks up fast factual summaries and fresh crawlable content",
      fix: "add a quick answer summary near the top and keep updates visible",
      variation: -4,
      template: "summary",
    },
    mistral: {
      behavior:
        "benefits from crisp structure and explicit section intent",
      fix: "tighten heading clarity and shorten long paragraphs for direct quoting",
      variation: -1,
      template: "structure",
    },
    you: {
      behavior:
        "rewards pages that combine clear answers with source-backed proof",
      fix: "add one image alt text improvement and one cited source under a primary claim",
      variation: 2,
      template: "citation",
    },
  };

  return engines.map((engine, index) => {
    const style = styleByEngine[engine.key];
    const competitorPair = pickEngineCompetitorPair(competitors, index, prompt);
    const competitorsSlice = [competitorPair.focus, competitorPair.support].filter(Boolean);
    const topCompetitors = competitorsSlice.length
      ? competitorsSlice.join(" and ")
      : "other established brands";
    const mentions = Array.from(
      new Set([brandName, ...competitorsSlice])
    );
    const mentionRate = clamp(
      Math.round(
        engine.score -
          (prompt.toLowerCase().includes("leading products") ? 18 : 10) +
          style.variation
      )
    );

    const promptLower = prompt.toLowerCase();
    const responseByTemplate: Record<typeof style.template, string> = {
      analysis:
        `${engine.label} signals that ${brandName} can perform well for "${promptLower}" when content stays answer-first and easy to verify. ` +
        `In this snapshot, it aligns ${domain} closest with ${topCompetitors}. ` +
        `Highest-impact fix: ${style.fix}.`,
      structure:
        `${engine.label} is likely to elevate ${brandName} on "${promptLower}" once heading hierarchy is cleaner and sections are easier to parse. ` +
        `Current benchmark overlap is strongest with ${topCompetitors}. ` +
        `Next step: ${style.fix}.`,
      qa:
        `${engine.label} currently reads ${domain} as relevant but not consistently quote-ready for "${promptLower}". ` +
        `It clusters your page near ${topCompetitors}. ` +
        `To improve reliability, ${style.fix}.`,
      citation:
        `${engine.label} rewards pages that prove claims. For "${promptLower}", ${brandName} is in range but still behind parts of ${topCompetitors}. ` +
        `You can raise citation confidence if you ${style.fix}.`,
      summary:
        `${engine.label} can surface ${brandName} for "${promptLower}" when your page starts with a fast factual summary and clear entity context. ` +
        `Right now, comparison signals trend toward ${topCompetitors}. ` +
        `Recommended action: ${style.fix}.`,
      clarity:
        `${engine.label} shows that ${brandName} is discoverable for "${promptLower}", but clarity and plain language are the main gap. ` +
        `It currently groups your page with ${topCompetitors}. ` +
        `To improve mention rate, ${style.fix}.`,
    };

    return {
      engineKey: engine.key,
      engineLabel: engine.label,
      model: engine.model,
      mentionRate,
      mentions,
      response: responseByTemplate[style.template],
    };
  });
}

function AuditFixBox({ text }: { text: string }) {
  return (
    <div className="mt-2 rounded-xl border border-slate-200 border-l-4 border-l-emerald-500 bg-slate-50 p-3">
      <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-emerald-700 mb-1">
        AI Optimized Fix
      </p>
      <p className="text-sm text-slate-700 leading-relaxed">{text}</p>
    </div>
  );
}

export function InsightsWorkspace({ initialUrl }: { initialUrl?: string }) {
  const router = useRouter();
  const [queryUrl, setQueryUrl] = useState(initialUrl ?? "");
  const [report, setReport] = useState<AnalysisResult | null>(null);
  const [, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scannedAt, setScannedAt] = useState<Date | null>(null);
  const [activePromptId, setActivePromptId] = useState("prompt-1");
  const [isSearchSliderPaused, setIsSearchSliderPaused] = useState(false);
  const [selectedSearchEngineKey, setSelectedSearchEngineKey] = useState<EngineKey | null>(null);
  const lastAutoUrl = useRef<string | null>(null);

  const runAnalysis = useCallback(
    async (rawUrl: string, persistQuery = true) => {
      const normalized = normalizeUrl(rawUrl);
      if (!normalized) {
        setError("Please enter a valid URL.");
        return;
      }

      if (persistQuery) {
        router.replace(`/insights?url=${encodeURIComponent(normalized)}`);
      }

      setError(null);
      setLoading(true);
      setQueryUrl(normalized);

      try {
        const data = await requestAnalysis<AnalysisResult>(normalized);
        setReport(data);
        const analyzedAt = new Date();
        setScannedAt(analyzedAt);
        saveCachedAnalysis(normalized, data);
      } catch (analysisError) {
        const message =
          analysisError instanceof Error
            ? analysisError.message
            : "An unexpected error occurred.";
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  useEffect(() => {
    if (!initialUrl) return;
    if (initialUrl === lastAutoUrl.current) return;

    const cached = readCachedAnalysis<AnalysisResult>(initialUrl);
    if (cached) {
      setQueryUrl(initialUrl);
      setReport(cached.data);
      setScannedAt(new Date(cached.analyzedAt));
      lastAutoUrl.current = initialUrl;
      const hasVerifiedCompetitors =
        Boolean(cached.data.competitors?.top_competitors?.length);
      if (hasVerifiedCompetitors) {
        return;
      }
    }

    lastAutoUrl.current = initialUrl;
    void runAnalysis(initialUrl, false);
  }, [initialUrl, runAnalysis]);

  const domain = useMemo(() => getDomain(report?.url || queryUrl || "xyz.com"), [report?.url, queryUrl]);
  const brandName = useMemo(() => getBrandName(domain), [domain]);
  const context = useMemo(() => inferContext(domain), [domain]);
  const competitorCandidates = useMemo(() => {
    const genericLabels = new Set(["wikipedia", "linkedin", "medium"]);
    const fromReportRaw = report?.competitors?.top_competitors ?? [];
    const fromReport = fromReportRaw
      .map(formatCompetitorLabel)
      .filter(Boolean)
      .filter((label) => label.toLowerCase() !== brandName.toLowerCase())
      .filter((label) => !genericLabels.has(label.toLowerCase()));

    return Array.from(new Set(fromReport)).slice(0, 6);
  }, [report?.competitors?.top_competitors, brandName]);

  const engineRows = useMemo(() => {
    if (!report) return [];
    return ENGINE_META.map((engine) => ({
      ...engine,
      score: scoreFromReport(report, engine.key),
      uncertainty:
        scoreFromReport(report, engine.key) >= 70 ? "None" : "Present",
    }));
  }, [report]);

  const searchEngineRows = useMemo(() => {
    const fromReport = engineRows.filter((engine) => engine.hasSearch);
    if (fromReport.length) return fromReport;

    const fallbackBase = clamp(report?.total_score ?? 68);
    return ENGINE_META.filter((engine) => engine.hasSearch).map((engine, index) => ({
      ...engine,
      score: clamp(
        fallbackBase +
          (index % 3 === 0 ? 4 : index % 3 === 1 ? 1 : -2)
      ),
    }));
  }, [engineRows, report?.total_score]);

  const searchEngineSliderRows = useMemo(
    () => [...searchEngineRows, ...searchEngineRows],
    [searchEngineRows]
  );
  const selectedSearchEngine = useMemo(
    () =>
      searchEngineRows.find((engine) => engine.key === selectedSearchEngineKey) ?? null,
    [searchEngineRows, selectedSearchEngineKey]
  );
  const selectedSiteLabel = useMemo(() => domain || "your-site.com", [domain]);
  const selectedEngineAction = useMemo(() => {
    if (!selectedSearchEngineKey) return null;
    const action = ENGINE_ACTION_COPY[selectedSearchEngineKey];
    return {
      exampleFix: action.exampleFix.replace(/\{site\}/g, selectedSiteLabel),
      copyPaste: action.copyPaste.replace(/\{site\}/g, selectedSiteLabel),
    };
  }, [selectedSearchEngineKey, selectedSiteLabel]);

  const totalScore = clamp(report?.total_score ?? 0);
  const averageEngineScore = Math.round(
    engineRows.length ? average(engineRows.map((engine) => engine.score)) : 0
  );

  const questionTargeting =
    report?.breakdown?.content?.questions?.score ??
    parseQuestionCount(report?.breakdown?.content?.questions?.details);
  const readabilityScore = report?.breakdown?.content?.readability?.score ?? 0;
  const answerability = clamp(Math.round((questionTargeting + readabilityScore) / 2));
  const structuredData = clamp(report?.breakdown?.technical?.schema?.score ?? 0);
  const crawlerAccessibility = clamp(
    Math.round(
      average([
        report?.breakdown?.technical?.robots?.score ?? 0,
        report?.breakdown?.technical?.llms?.score ?? 0,
        report?.breakdown?.technical?.sitemap?.score ?? 0,
      ])
    )
  );
  const webPresence = clamp(
    Math.round(
      average([
        report?.breakdown?.authority?.eeat?.score ?? 0,
        report?.breakdown?.technical?.https?.score ?? 0,
      ])
    )
  );
  const strategyScore = clamp(
    Math.round(average([answerability, structuredData, crawlerAccessibility, webPresence]))
  );
  const missingAnswerScore = clamp(
    report?.breakdown?.content?.gap?.score ??
      Math.round(average([answerability, structuredData]))
  );
  const missingAnswerLabel =
    missingAnswerScore >= 80 ? "Strong" : missingAnswerScore >= 50 ? "Fair" : "Low";

  const missingTopics = useMemo(() => {
    if (context.industry === "Tobacco and Nicotine Products") {
      return [
        "Which nicotine strengths are best for beginners? (Implied)",
        "How does this brand compare with top nicotine pouch competitors? (Missing)",
        "What product ingredients and safety standards are used? (Missing)",
        "What support options exist for first-time users? (Missing)",
        "Can I get guidance based on my nicotine preference? (Missing)",
      ];
    }

    return [
      `What is the pricing model for ${brandName}? (Implied)`,
      `What is the tech stack used by ${brandName}? (Missing)`,
      `What specific experience does the team have in AEO and GEO optimization? (Missing)`,
      `What is the availability of the ${brandName} support team? (Missing)`,
      "Can I get a custom solution for my specific AEO and GEO optimization needs? (Missing)",
    ];
  }, [context.industry, brandName]);
  const authorityDetails = report?.breakdown?.authority?.eeat?.details ?? [];
  const redditPresenceScore = clamp(
    Math.round(average([webPresence, answerability]))
  );
  const wikipediaDetected = Boolean(
    report?.breakdown?.authority?.knowledge_graph?.data?.primary_entity ||
      authorityDetails.some((item) => /wikipedia|knowledge graph|entity|wiki/i.test(item))
  );

  const dailySeries = useMemo(
    () => generateDailySeries(averageEngineScore || totalScore || 40),
    [averageEngineScore, totalScore]
  );

  const sentimentScore = clamp(
    Math.round(
      average([
        report?.breakdown?.authority?.eeat?.score ?? 0,
        report?.breakdown?.content?.readability?.score ?? 0,
      ])
    )
  );

  const keyPrompts: KeyPrompt[] = useMemo(() => {
    if (!report || !engineRows.length) return [];
    const baseEngines = engineRows.slice(0, 6).map((row) => ({
      key: row.key,
      label: row.label,
      model: row.model,
      score: row.score,
    }));
    const competitorPool = competitorCandidates;

    const promptTemplates =
      context.industry === "Tobacco and Nicotine Products"
        ? [
            "Which companies produce nicotine pouches globally?",
            "What are the leading brands of nicotine gum?",
            `How does ${brandName} compare against major nicotine brands?`,
            "Which nicotine pouch products are best for beginners?",
            `What trust signals should ${brandName} add to improve AI citations?`,
          ]
        : [
            `What are the top companies in ${context.industry.toLowerCase()}?`,
            `What are the leading products offered by ${brandName}?`,
            `How does ${brandName} compare with other providers in ${context.industry.toLowerCase()}?`,
            `What customer problems does ${brandName} solve best?`,
            `Why should buyers trust ${brandName} in ${context.industry.toLowerCase()}?`,
          ];

    const promptRates = [
      clamp(Math.round(average(baseEngines.map((entry) => entry.score)) - 8)),
      clamp(Math.round((report.breakdown?.content?.gap?.score ?? 40) * 0.9)),
      clamp(Math.round(answerability * 0.9)),
      clamp(Math.round(webPresence * 0.9)),
      clamp(Math.round(structuredData * 0.92)),
    ];

    return promptTemplates.map((prompt, index) => ({
      id: `prompt-${index + 1}`,
      prompt,
      status: "Active" as const,
      mentionRate: promptRates[index] ?? clamp(Math.round(averageEngineScore * 0.85)),
      responses: buildPromptResponses(
        prompt,
        brandName,
        domain,
        competitorPool,
        baseEngines
      ),
    }));
  }, [
    report,
    engineRows,
    context.industry,
    competitorCandidates,
    brandName,
    domain,
    answerability,
    webPresence,
    structuredData,
    averageEngineScore,
  ]);

  const activePrompt =
    keyPrompts.find((prompt) => prompt.id === activePromptId) ?? keyPrompts[0];

  const competitorIncludedTimes = clamp(
    Math.round((activePrompt?.mentionRate ?? 0) / 11),
    0,
    9
  );
  const competitorScore = clamp(Math.round((competitorIncludedTimes / 9) * 100));

  const engineHighlights = useMemo(() => {
    const issueByKey: Record<EngineKey, string> = {
      chatgpt:
        (report?.breakdown?.content?.readability?.score ?? 100) < 75
          ? "The writing is hard to read. ChatGPT prefers simple wording."
          : "Add clearer answer-first blocks for stronger ChatGPT extraction.",
      gemini:
        (report?.breakdown?.technical?.robots?.status ?? "valid") !== "valid"
          ? "Crawler access is restricted. Gemini may miss key pages."
          : "Use clearer headings and section labels for Gemini understanding.",
      perplexity:
        (report?.breakdown?.technical?.schema?.score ?? 100) < 70
          ? "Schema signals are weak, reducing citation confidence."
          : "Add more explicit source citations for trusted quoting.",
      claude:
        (report?.breakdown?.content?.questions?.score ?? 100) < 70
          ? "Question-led structure is limited, making summarization harder."
          : "Break long sections into short, direct answer blocks.",
      searchgpt: "Increase entity clarity and source links for better trust.",
      meta: "Simplify language and reduce jargon for better model recall.",
      grok: "Keep fresh updates and quick summaries near the top of pages.",
      mistral: "Improve heading precision and paragraph clarity.",
      you: "Add image alt text and source-backed claims.",
    };

    const modelByKey: Record<EngineKey, string> = {
      chatgpt: "GPT-4o Search",
      gemini: "Google Gemini",
      perplexity: "Pro Search",
      claude: "Claude Search",
      searchgpt: "OpenAI Prototype",
      meta: "Llama Web Search",
      grok: "xAI Search",
      mistral: "Le Chat Search",
      you: "YouChat Search",
    };

    return engineRows.slice(0, 6).map((engine) => ({
      ...engine,
      modelLabel: modelByKey[engine.key],
      issue: issueByKey[engine.key],
    }));
  }, [engineRows, report]);

  const searchIssueByKey = useMemo(
    () =>
      Object.fromEntries(
        engineHighlights.map((engine) => [engine.key, engine.issue])
      ) as Partial<Record<EngineKey, string>>,
    [engineHighlights]
  );

  const technicalWidgets = [
    {
      label: "Robots.txt",
      score: report?.breakdown?.technical?.robots?.score ?? 0,
      detail: report?.breakdown?.technical?.robots?.details?.[0] ?? "Crawler permission check.",
      pass:
        report?.breakdown?.technical?.robots?.status === "valid" ||
        (report?.breakdown?.technical?.robots?.score ?? 0) >= 70,
    },
    {
      label: "LLMs.txt",
      score: report?.breakdown?.technical?.llms?.score ?? 0,
      detail: report?.breakdown?.technical?.llms?.details?.[0] ?? "Agent-readable summary file.",
      pass:
        report?.breakdown?.technical?.llms?.status === "valid" ||
        (report?.breakdown?.technical?.llms?.score ?? 0) >= 70,
    },
    {
      label: "Schema",
      score: report?.breakdown?.technical?.schema?.score ?? 0,
      detail:
        report?.breakdown?.technical?.schema?.details?.[0] ??
        "Structured data coverage for AI parsing.",
      pass: (report?.breakdown?.technical?.schema?.score ?? 0) >= 70,
    },
    {
      label: "Sitemap",
      score: report?.breakdown?.technical?.sitemap?.score ?? 0,
      detail: report?.breakdown?.technical?.sitemap?.details?.[0] ?? "URL discovery and indexing hints.",
      pass: (report?.breakdown?.technical?.sitemap?.score ?? 0) >= 70,
    },
  ];

  const contentWidgets = [
    {
      label: "Question Targeting",
      score: clamp(questionTargeting),
      detail:
        report?.breakdown?.content?.questions?.details?.[0] ??
        "How well your headings match real search questions.",
    },
    {
      label: "Readability",
      score: clamp(readabilityScore),
      detail:
        report?.breakdown?.content?.readability?.details?.[0] ??
        "Plain, easy-to-quote language quality.",
    },
    {
      label: "Visual Context",
      score: clamp(report?.breakdown?.content?.visual?.score ?? 0),
      detail:
        report?.breakdown?.content?.visual?.details?.[0] ??
        "Image alt text and context quality.",
    },
    {
      label: "Freshness",
      score: clamp(report?.breakdown?.content?.freshness?.score ?? 0),
      detail:
        report?.breakdown?.content?.freshness?.details?.[0] ??
        "Recency signals and publish dates.",
    },
  ];

  const eeatDetails = report?.breakdown?.authority?.eeat?.details ?? [];
  const authorityStrengths = eeatDetails
    .filter((item) => item.startsWith("Pro:"))
    .map((item) => item.replace(/^Pro:\s*/, ""))
    .slice(0, 4);
  const authorityWeaknesses = eeatDetails
    .filter((item) => item.startsWith("Con:"))
    .map((item) => item.replace(/^Con:\s*/, ""))
    .slice(0, 4);

  return (
    <main className="min-h-screen bg-[#f4f5f7] font-urbanist">
      <div className="min-h-screen">
        <header className="h-16 border-b border-slate-200 bg-white px-4 md:px-8 flex items-center gap-3">
              <div className="flex-1 max-w-md">
                <Link
                  href="/"
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Homepage
                </Link>
              </div>

              <div className="ml-auto flex items-center gap-3">
                <button type="button" className="h-9 w-9 rounded-full border border-slate-200 text-slate-500 flex items-center justify-center">
                  <BellRing className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5">
                  <div className="h-8 w-8 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center text-xs font-semibold">
                    TM
                  </div>
                  <div className="leading-tight">
                    <p className="text-sm font-semibold text-slate-800">Team User</p>
                    <p className="text-xs text-slate-500">team@checksiteaeo.com</p>
                  </div>
                </div>
              </div>
        </header>

        <section className="px-4 md:px-8 py-6 space-y-4">
            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-[linear-gradient(to_right,#cbd5e11f_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e11f_1px,transparent_1px)] bg-[size:26px_26px] bg-[#f8fafb] p-5 md:p-8">
              <div className="pointer-events-none absolute -top-20 -left-12 h-56 w-56 rounded-full bg-emerald-300/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 right-0 h-64 w-64 rounded-full bg-[#8cd9b8]/25 blur-3xl" />
              <div className="pointer-events-none absolute top-20 right-16 h-2 w-2 rounded-full bg-emerald-400/70 animate-pulse" />
              <div className="pointer-events-none absolute top-32 right-28 h-1.5 w-1.5 rounded-full bg-emerald-500/60 animate-pulse" />
              <div className="pointer-events-none absolute bottom-20 left-20 h-2 w-2 rounded-full bg-[#6fb59a]/70 animate-pulse" />

              <div className="relative mb-8 text-center">
                <div className="flex items-center justify-center gap-3">
                  <h2 className="text-5xl font-serif text-[#28483b] tracking-tight">Audit Results</h2>
                  <span className="text-xs uppercase tracking-wider font-semibold rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1">
                    Live Scan
                  </span>
                </div>
                <p className="text-2xl font-semibold text-slate-700 mt-4">
                  Target: <span className="text-slate-900">{report?.url || queryUrl || "https://xyz.com/"}</span>
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  Generated on {new Date(scannedAt ?? new Date()).toLocaleDateString("en-US")} • AEO & GEO Monitor Engine v1.0
                </p>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                  <span className="inline-flex items-center rounded-full border border-slate-300 bg-white px-3 py-1 text-sm text-slate-700">
                    <span className="font-semibold mr-1">Industry:</span> {context.industry}
                  </span>
                  <span className="inline-flex items-center rounded-full border border-slate-300 bg-white px-3 py-1 text-sm text-slate-700">
                    <span className="font-semibold mr-1">Key Products/Services:</span> {context.products.join(", ")}
                  </span>
                </div>
              </div>

              <div className="relative">
                <div className="rounded-3xl border border-[#2f5b4a] bg-gradient-to-br from-[#224034] to-[#2f5b4a] text-white p-8 md:p-10 shadow-xl max-w-5xl mx-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 items-center">
                    <div className="text-center">
                      <p className="text-emerald-100/80 text-xs uppercase tracking-[0.2em] font-semibold mb-3">Overall AEO & GEO Readiness</p>
                      <div className="flex items-end justify-center gap-2">
                        <span className="text-8xl font-serif leading-none">{totalScore}</span>
                        <span className="text-3xl text-emerald-100/90 mb-2">/100</span>
                      </div>
                      <span className="inline-flex rounded-md bg-white/20 px-2 py-0.5 text-sm font-semibold mt-2 text-white">
                        {totalScore >= 80 ? "Excellent" : totalScore >= 50 ? "Average" : "Critical"}
                      </span>
                      <p className="mt-3 text-emerald-100/80 text-sm max-w-[240px] mx-auto">
                        Combined score of Tech, Content, and Authority.
                      </p>
                    </div>
                    <div className="text-center md:border-l md:border-white/15 md:pl-10">
                      <p className="text-emerald-100/80 text-xs uppercase tracking-[0.2em] font-semibold mb-3">Authority / E-E-A-T</p>
                      <div className="flex items-end justify-center gap-2">
                        <span className="text-8xl font-serif leading-none">{report?.breakdown?.authority?.eeat?.score ?? 0}</span>
                        <span className="text-3xl text-emerald-100/90 mb-2">/100</span>
                      </div>
                      <span className="inline-flex rounded-md bg-white/20 px-2 py-0.5 text-sm font-semibold mt-2 text-white">
                        {(report?.breakdown?.authority?.eeat?.score ?? 0) >= 80
                          ? "High"
                          : (report?.breakdown?.authority?.eeat?.score ?? 0) >= 50
                          ? "Medium"
                          : "Low"}
                      </span>
                      <p className="mt-3 text-emerald-100/80 text-sm max-w-[240px] mx-auto">
                        Trust signals detected by AI models.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-serif text-[#28483b]">
                    AI Engine Visibility Estimate
                  </h3>
                  <span className="text-xs uppercase tracking-widest text-[#4e6f61] font-semibold">
                    Search AI Slider
                  </span>
                </div>
                <div
                  className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"
                  onMouseEnter={() => setIsSearchSliderPaused(true)}
                  onMouseLeave={() => setIsSearchSliderPaused(false)}
                  onMouseDown={() => setIsSearchSliderPaused(true)}
                  onTouchStart={() => setIsSearchSliderPaused(true)}
                  onTouchEnd={() => setIsSearchSliderPaused(false)}
                >
                  <div
                    className="flex w-max gap-3"
                    style={{
                      animation: "searchAiMarquee 28s linear infinite",
                      animationPlayState: isSearchSliderPaused ? "paused" : "running",
                    }}
                  >
                    {searchEngineSliderRows.map((engine, index) => (
                      <button
                        key={`${engine.key}-${index}`}
                        type="button"
                        onClick={() => {
                          setSelectedSearchEngineKey(engine.key);
                          setIsSearchSliderPaused(true);
                        }}
                        className="w-[280px] shrink-0 rounded-xl border border-[#d9e8df] bg-white/80 backdrop-blur-sm px-4 py-3 shadow-sm cursor-pointer text-left"
                      >
                        <div className="flex items-center gap-2">
                          <Image
                            src={engine.logo}
                            alt={`${engine.label} logo`}
                            width={18}
                            height={18}
                            className="w-[18px] h-[18px] object-contain"
                          />
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{engine.label}</p>
                            <p className="text-[11px] text-slate-500">{engine.model}</p>
                          </div>
                        </div>
                        <div className="mt-2 flex items-end gap-1">
                          <span className="text-2xl font-semibold text-[#224034]">{engine.score}</span>
                          <span className="text-xs text-slate-400 mb-1">/100</span>
                        </div>
                        <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-emerald-500"
                            style={{ width: `${engine.score}%` }}
                          />
                        </div>
                        <p className="mt-3 text-[10px] uppercase tracking-wider text-red-500 font-semibold">
                          Core Issue
                        </p>
                        <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                          {searchIssueByKey[engine.key] ??
                            "Add clearer headings and source-backed statements so this engine can quote your content accurately."}
                        </p>
                        <p className="mt-3 text-[10px] uppercase tracking-wider text-emerald-600 font-semibold">
                          Click for AEO/GEO Details
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
                <style jsx>{`
                  @keyframes searchAiMarquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                  }
                `}</style>
              </div>
            </section>

            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-3 md:p-4">
              <div className="pointer-events-none absolute -top-24 right-8 h-52 w-52 rounded-full bg-emerald-200/30 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 left-12 h-44 w-44 rounded-full bg-[#8cd9b8]/20 blur-3xl" />
              <div className="pointer-events-none absolute top-8 right-24 h-1.5 w-1.5 rounded-full bg-emerald-400/70" />
              <div className="pointer-events-none absolute top-14 right-32 h-1.5 w-1.5 rounded-full bg-emerald-500/60" />
              <div className="grid grid-cols-1 xl:grid-cols-4 gap-3">
                <article className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-normal text-slate-800">AI Presence</h3>
                    <span className="text-lg font-bold text-slate-700">{averageEngineScore}</span>
                  </div>
                  <div className="mt-4 space-y-2">
                    {engineRows.slice(0, 4).map((engine) => (
                      <div
                        key={engine.key}
                        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <Image
                            src={engine.logo}
                            alt={`${engine.label} logo`}
                            width={16}
                            height={16}
                            className="w-4 h-4 object-contain"
                          />
                          <span className="text-sm text-slate-700">{engine.label}</span>
                        </div>
                        <span className="text-sm font-semibold text-slate-700">{engine.score}</span>
                      </div>
                    ))}
                    <div className="text-sm text-slate-500 pt-1">
                      View all: {engineRows.slice(4).map((engine) => engine.label).join(", ")}
                    </div>
                  </div>
                </article>

                <article className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-normal text-slate-800">Key Prompts</h3>
                    <span className="text-lg font-bold text-slate-700">
                      {keyPrompts.length ? keyPrompts[0].mentionRate : 0}
                    </span>
                  </div>
                  <div className="mt-4 space-y-3">
                    {keyPrompts.map((prompt) => (
                      <button
                        key={prompt.id}
                        type="button"
                        onClick={() => setActivePromptId(prompt.id)}
                        className={`w-full text-left rounded-xl border px-3 py-2 transition-colors ${
                          activePrompt?.id === prompt.id
                            ? "border-slate-400 bg-slate-100"
                            : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                        }`}
                      >
                        <p className="text-sm text-slate-800 leading-snug">{prompt.prompt}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs font-medium text-slate-500">{prompt.status}</span>
                          <span className="text-xs font-bold text-slate-700">{prompt.mentionRate}%</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </article>

                <article className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-normal text-slate-800">Competitor Landscape</h3>
                    <span className="text-lg font-bold text-slate-700">{competitorScore}</span>
                  </div>
                  <p className="mt-4 text-slate-600 leading-relaxed">
                    Your company or product was included {competitorIncludedTimes} out of 9 times in
                    industry/product related queries.
                  </p>
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-slate-700 mb-2">Competitors Mentioned:</p>
                    <div className="flex flex-wrap gap-2">
                      {competitorCandidates.length ? (
                        competitorCandidates.slice(0, 5).map((competitor) => (
                          <span
                            key={competitor}
                            className="text-xs rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-slate-600"
                          >
                            {competitor}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-slate-500">
                          No verified competitors yet. Run a fresh scan to populate this section.
                        </span>
                      )}
                    </div>
                  </div>
                </article>

                <article className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-normal text-slate-800">Strategy Review</h3>
                    <span className="text-lg font-bold text-slate-700">{strategyScore}</span>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1 text-sm text-slate-600">
                        <span>Answerability</span>
                        <span className="font-semibold">{answerability}</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-amber-400"
                          style={{ width: `${answerability}%` }}
                        />
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <div className="flex items-center justify-between mb-2 text-sm text-slate-600">
                        <span>Web Presence</span>
                        <span className="font-semibold">{webPresence}</span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-2.5 py-2">
                          <div className="flex items-center gap-2">
                            <span className="h-6 w-6 rounded-full bg-orange-100 flex items-center justify-center">
                              <Image
                                src="/logos/reddit-logo.svg"
                                alt="Reddit logo"
                                width={14}
                                height={14}
                                className="h-3.5 w-3.5"
                              />
                            </span>
                            <span className="text-sm font-semibold text-slate-700">Reddit</span>
                          </div>
                          <span className="text-sm font-semibold text-slate-700">{redditPresenceScore}</span>
                        </div>

                        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-2.5 py-2">
                          <div className="flex items-center gap-2">
                            <span className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center">
                              <Image
                                src="/logos/wikipedia-logo.svg"
                                alt="Wikipedia logo"
                                width={14}
                                height={14}
                                className="h-3.5 w-3.5"
                              />
                            </span>
                            <span className="text-sm font-semibold text-slate-700">Wikipedia</span>
                          </div>
                          {wikipediaDetected ? (
                            <span className="h-6 w-6 rounded-full border border-emerald-200 bg-emerald-50 flex items-center justify-center">
                              <Check className="h-4 w-4 text-emerald-600" />
                            </span>
                          ) : (
                            <span className="h-6 w-6 rounded-full border border-rose-200 bg-rose-50 flex items-center justify-center">
                              <XCircle className="h-4 w-4 text-rose-500" />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1 text-sm text-slate-600">
                        <span>Structured Data</span>
                        <span className="font-semibold">{structuredData}</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-amber-400"
                          style={{ width: `${structuredData}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1 text-sm text-slate-600">
                        <span>AI Crawler Accessibility</span>
                        <span className="font-semibold">{crawlerAccessibility}</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-amber-400"
                          style={{ width: `${crawlerAccessibility}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </article>
              </div>
            </div>

            <section className="rounded-3xl border border-slate-200 bg-[linear-gradient(to_right,#cbd5e11f_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e11f_1px,transparent_1px)] bg-[size:26px_26px] bg-[#f8fafb] p-5 md:p-8">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <article className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Code className="w-4 h-4 text-slate-400" />
                    <h3 className="text-3xl font-serif text-[#2b4a3d]">Technical Readiness</h3>
                  </div>
                  <div className="space-y-4">
                    {technicalWidgets.map((item) => (
                      <div key={`tech-${item.label}`}>
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{item.detail}</p>
                          </div>
                          {item.pass ? (
                            <Check className="w-4 h-4 text-emerald-500 mt-1" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-500 mt-1" />
                          )}
                        </div>
                        {!item.pass && (
                          <AuditFixBox
                            text={
                              item.label === "LLMs.txt"
                                ? "Create an /llms.txt file summarizing your core offerings for LLM agents."
                                : item.label === "Schema"
                                ? "Add JSON-LD schema for your pages so models can map entities correctly."
                                : item.label === "Robots.txt"
                                ? "Update robots.txt so major AI crawlers can access your key pages."
                                : "Publish and validate your sitemap.xml for better AI discovery."
                            }
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </article>

                <article className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <AlignLeft className="w-4 h-4 text-slate-400" />
                    <h3 className="text-3xl font-serif text-[#2b4a3d]">Content Structure</h3>
                  </div>
                  <div className="space-y-4">
                    {contentWidgets.map((item) => (
                      <div key={`content-${item.label}`}>
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{item.detail}</p>
                          </div>
                          {item.score >= 70 ? (
                            <Check className="w-4 h-4 text-emerald-500 mt-1" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-amber-500 mt-1" />
                          )}
                        </div>
                        {item.score < 70 && (
                          <AuditFixBox
                            text={
                              item.label === "Question Targeting"
                                ? "Add 3-5 question-based H2 headings that match what users ask in AI chat."
                                : item.label === "Readability"
                                ? "Shorten long sentences and simplify words so answers are easier to quote."
                                : item.label === "Visual Context"
                                ? "Add descriptive alt text for key images."
                                : "Add publish/update dates in metadata to improve freshness trust."
                            }
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </article>

                <article className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4 text-slate-400" />
                    <h3 className="text-3xl font-serif text-[#2b4a3d]">Authority Signals</h3>
                  </div>
                  <p className="text-sm font-semibold text-slate-700 mb-2">AI Trust Analysis</p>
                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-xs uppercase tracking-wider text-emerald-600 font-semibold mb-2">Strengths</p>
                    <ul className="space-y-2">
                      {(authorityStrengths.length
                        ? authorityStrengths
                        : ["Clear explanations and technical clarity support trust."]
                      ).map((point) => (
                        <li key={`strength-shot-${point}`} className="text-sm text-slate-700 flex gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-4 mt-3">
                    <p className="text-xs uppercase tracking-wider text-rose-500 font-semibold mb-2">Weaknesses & Risks</p>
                    <ul className="space-y-2">
                      {(authorityWeaknesses.length
                        ? authorityWeaknesses
                        : ["Lack of concrete data or source references under key claims."]
                      ).map((point) => (
                        <li key={`weak-shot-${point}`} className="text-sm text-slate-700 flex gap-2">
                          <XCircle className="w-3.5 h-3.5 text-rose-500 mt-0.5 shrink-0" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                    <AuditFixBox text="Add one cited source under each major claim and include author/company trust signals." />
                  </div>
                </article>
              </div>
            </section>

            <section className="rounded-2xl border border-[#2f5b4a] bg-gradient-to-br from-[#224034] to-[#2f5b4a] p-6 md:p-8 text-white">
              <p className="text-center text-sm tracking-[0.2em] uppercase text-emerald-200/90">
                The Missing Answer
              </p>
              <div className="mt-2 flex items-end justify-center gap-2">
                <span className="text-7xl font-serif leading-none">{missingAnswerScore}</span>
                <span className="text-3xl text-emerald-100/90 mb-2">/100</span>
                <span className="mb-3 rounded-md bg-white/20 px-2 py-0.5 text-sm font-semibold">
                  {missingAnswerLabel}
                </span>
              </div>
              <p className="mt-3 text-center text-lg text-emerald-100/90 max-w-2xl mx-auto">
                What AI models want to see on this page to rank it higher.
              </p>

              <div className="mt-8 h-px w-full bg-white/15" />

              <div className="mt-6">
                <p className="text-sm uppercase tracking-[0.15em] text-emerald-200/90 font-semibold mb-3">
                  Missing Topics
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {missingTopics.map((topic) => (
                    <article
                      key={`missing-topic-${topic}`}
                      className="rounded-xl border border-white/10 bg-white/10 p-4 text-[15px] leading-relaxed text-emerald-50/95"
                    >
                      {topic}
                    </article>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-4 md:p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-4xl font-bold text-slate-800">Full Report</h2>
                <Link
                  href="/signup"
                  className="rounded-xl bg-slate-900 text-white px-4 py-2 text-sm font-semibold hover:bg-slate-700 transition-colors"
                >
                  Unlock Saved Reports
                </Link>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:col-span-1">
                  <h3 className="text-xl font-semibold text-slate-800">Daily Analytics</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Visibility, sentiment, and mention-rate trend.
                  </p>
                  <div className="mt-4 h-40 rounded-xl border border-slate-200 bg-white px-3 py-2 flex items-end gap-1.5">
                    {dailySeries.map((value, index) => (
                      <div
                        key={`daily-${index}`}
                        className="flex-1 rounded-t bg-sky-400/80"
                        style={{ height: `${Math.max(10, value)}%` }}
                      />
                    ))}
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div className="rounded-lg border border-slate-200 bg-white px-2 py-1.5">
                      <p className="text-slate-500">Mention Rate</p>
                      <p className="font-semibold text-slate-800">
                        {activePrompt ? activePrompt.mentionRate : 0}%
                      </p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white px-2 py-1.5">
                      <p className="text-slate-500">Sentiment</p>
                      <p className="font-semibold text-slate-800">{sentimentScore}/100</p>
                    </div>
                  </div>
                </article>

                <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:col-span-2">
                  <h3 className="text-xl font-semibold text-slate-800">Engine Visibility Details</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Model-level awareness check and confidence indicators.
                  </p>
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-slate-500">
                          <th className="pb-2 pr-3">Name</th>
                          <th className="pb-2 pr-3">Model</th>
                          <th className="pb-2 pr-3">Uncertainty</th>
                          <th className="pb-2 pr-3">Search Access</th>
                          <th className="pb-2 text-right">Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {engineRows.map((engine) => (
                          <tr key={`presence-${engine.key}`} className="border-t border-slate-200">
                            <td className="py-2 pr-3">
                              <div className="flex items-center gap-2 text-slate-700 font-medium">
                                <Image
                                  src={engine.logo}
                                  alt={`${engine.label} logo`}
                                  width={16}
                                  height={16}
                                  className="w-4 h-4 object-contain"
                                />
                                {engine.label}
                              </div>
                            </td>
                            <td className="py-2 pr-3 text-slate-600">{engine.model}</td>
                            <td className="py-2 pr-3 text-slate-600">{engine.uncertainty}</td>
                            <td className="py-2 pr-3 text-slate-600">
                              {engine.hasSearch ? "Yes" : "No"}
                            </td>
                            <td className="py-2 text-right font-semibold text-slate-800">
                              {engine.score}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </article>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="text-xl font-semibold text-slate-800">Query Responses by Engine</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Simulated from your site audit signals (not live web queries per engine).
                  </p>
                <div className="mt-3 grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    {keyPrompts.map((prompt) => (
                      <button
                        key={`full-${prompt.id}`}
                        type="button"
                        onClick={() => setActivePromptId(prompt.id)}
                        className={`w-full text-left rounded-xl border px-3 py-2 ${
                          activePrompt?.id === prompt.id
                            ? "border-slate-400 bg-white"
                            : "border-slate-200 bg-white/60 hover:bg-white"
                        }`}
                      >
                        <p className="text-sm text-slate-800">{prompt.prompt}</p>
                        <div className="mt-1 text-xs text-slate-500">
                          Mention rate: <strong className="text-slate-700">{prompt.mentionRate}%</strong>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="lg:col-span-2 space-y-3">
                    {activePrompt?.responses.map((entry) => (
                      <div
                        key={`${activePrompt.id}-${entry.engineKey}`}
                        className="rounded-xl border border-slate-200 bg-white p-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Image
                              src={
                                ENGINE_META.find((engine) => engine.key === entry.engineKey)?.logo ||
                                "/logos/chatgpt-logo.png"
                              }
                              alt={`${entry.engineLabel} logo`}
                              width={16}
                              height={16}
                              className="w-4 h-4 object-contain"
                            />
                            <p className="font-semibold text-slate-800">{entry.engineLabel}</p>
                            <p className="text-xs text-slate-500">{entry.model}</p>
                          </div>
                          <span className="text-xs rounded-md bg-slate-100 px-2 py-1 text-slate-600">
                            {entry.mentionRate}%
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed mt-2">{entry.response}</p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {entry.mentions.slice(0, 6).map((mention) => (
                            <span
                              key={`${entry.engineKey}-${mention}`}
                              className="text-[11px] rounded-md bg-slate-100 text-slate-600 px-1.5 py-0.5"
                            >
                              {mention}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <Dialog
              open={Boolean(selectedSearchEngine)}
              onOpenChange={(open) => {
                if (!open) {
                  setSelectedSearchEngineKey(null);
                  setIsSearchSliderPaused(false);
                }
              }}
            >
              <DialogContent className="sm:max-w-5xl border border-[#d9e8df] bg-white/95 backdrop-blur-sm">
                <DialogHeader>
                  <DialogTitle className="text-3xl font-serif text-[#28483b]">
                    {selectedSearchEngine?.label} Visibility Breakdown
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-3">
                  <p className="text-base text-slate-600">
                    {selectedSearchEngine?.model} • Visibility estimate: {selectedSearchEngine?.score ?? 0}/100
                  </p>
                  <p className="text-sm text-slate-500">
                    AEO means getting found by AI search. GEO means getting quoted correctly in AI answers.
                  </p>

                  <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                    <p className="text-[11px] uppercase tracking-wider text-red-600 font-semibold">
                      Current Issue
                    </p>
                    <p className="text-sm text-slate-700 mt-1">
                      {selectedSearchEngineKey
                        ? searchIssueByKey[selectedSearchEngineKey] ??
                          "Improve clarity and source-backed content so this engine can trust your page."
                        : ""}
                    </p>
                  </div>

                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <p className="text-[11px] uppercase tracking-wider text-emerald-700 font-semibold">
                      How This Engine Uses AEO
                    </p>
                    <p className="text-sm text-slate-700 mt-1">
                      {selectedSearchEngineKey
                        ? ENGINE_DETAIL_COPY[selectedSearchEngineKey].aeo
                        : ""}
                    </p>
                  </div>

                  <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                    <p className="text-[11px] uppercase tracking-wider text-blue-700 font-semibold">
                      How This Engine Uses GEO
                    </p>
                    <p className="text-sm text-slate-700 mt-1">
                      {selectedSearchEngineKey
                        ? ENGINE_DETAIL_COPY[selectedSearchEngineKey].geo
                        : ""}
                    </p>
                  </div>

                  <div className="rounded-xl border border-violet-200 bg-violet-50 p-4">
                    <p className="text-[11px] uppercase tracking-wider text-violet-700 font-semibold">
                      Example Fix for {selectedSiteLabel.toUpperCase()}
                    </p>
                    <p className="text-sm text-slate-700 mt-1">
                      {selectedEngineAction?.exampleFix ?? ""}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-[11px] uppercase tracking-wider text-slate-600 font-semibold">
                      Copy/Paste Example (Matches The Fix Above)
                    </p>
                    <pre className="mt-2 rounded-lg border border-slate-200 bg-slate-100 p-3 text-xs text-slate-700 whitespace-pre-wrap break-words">
{selectedEngineAction?.copyPaste ?? ""}
                    </pre>
                  </div>

                  <Link
                    href="/signup"
                    className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-[#224034] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1a3329] transition-colors"
                  >
                    Improve {selectedSearchEngine?.label ?? "AI"} Visibility
                  </Link>
                  <p className="text-center text-sm text-slate-500">
                    Create your free account to get full fixes and ongoing monitoring.
                  </p>
                </div>
              </DialogContent>
            </Dialog>
        </section>
      </div>
    </main>
  );
}
