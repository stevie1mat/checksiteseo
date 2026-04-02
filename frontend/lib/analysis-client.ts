const DEFAULT_API_CANDIDATES = [
  "http://localhost:8000",
  "https://checksiteseo.onrender.com",
];

export const INSIGHTS_ANALYSIS_CACHE_KEY = "checksiteaeo:insights-analysis";

type CachedAnalysis<T> = {
  url: string;
  analyzedAt: string;
  data: T;
};

function normalizeForCache(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl);
    parsed.hash = "";
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return rawUrl.trim().replace(/\/$/, "");
  }
}

function getApiCandidates(): string[] {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL?.trim();
  return Array.from(
    new Set([fromEnv, ...DEFAULT_API_CANDIDATES].filter(Boolean) as string[])
  );
}

export async function requestAnalysis<T>(url: string): Promise<T> {
  let lastError: Error | null = null;

  for (const apiBase of getApiCandidates()) {
    try {
      const response = await fetch(`${apiBase}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, sync: true }),
      });

      if (!response.ok) {
        throw new Error(`Analysis failed at ${apiBase} (status ${response.status})`);
      }

      return (await response.json()) as T;
    } catch (error) {
      lastError =
        error instanceof Error
          ? error
          : new Error("An unexpected analysis error occurred.");
    }
  }

  throw lastError ?? new Error("Analysis failed on all configured backends.");
}

export function saveCachedAnalysis<T>(url: string, data: T) {
  if (typeof window === "undefined") return;
  const payload: CachedAnalysis<T> = {
    url: normalizeForCache(url),
    analyzedAt: new Date().toISOString(),
    data,
  };
  window.sessionStorage.setItem(INSIGHTS_ANALYSIS_CACHE_KEY, JSON.stringify(payload));
}

export function readCachedAnalysis<T>(url: string): CachedAnalysis<T> | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(INSIGHTS_ANALYSIS_CACHE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as CachedAnalysis<T>;
    if (!parsed?.url || !parsed?.data) return null;
    if (parsed.url !== normalizeForCache(url)) return null;
    return parsed;
  } catch {
    return null;
  }
}
