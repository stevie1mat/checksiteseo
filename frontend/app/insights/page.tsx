import type { Metadata } from "next";
import { InsightsWorkspace } from "@/components/InsightsWorkspace";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "AI Visibility Insights Report",
  description:
    "View your AI visibility insights report with technical, content, and authority breakdowns across major AI engines.",
  path: "/insights",
  keywords: [
    "AI visibility report",
    "AEO insights",
    "AI search audit results",
    "AEO report",
    "GEO report",
  ],
});

type InsightsPageProps = {
  searchParams?: {
    url?: string | string[];
  };
};

export default function InsightsPage({ searchParams }: InsightsPageProps) {
  const initialUrl =
    typeof searchParams?.url === "string" ? searchParams.url : "";

  return <InsightsWorkspace initialUrl={initialUrl} />;
}
