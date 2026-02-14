import { Documentation } from "@/components/Documentation";
import { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
    title: "Documentation: How to Use CheckSiteAEO",
    description: "Product documentation for running scans, reading AEO scores, and prioritizing AI search optimization tasks.",
    path: "/documentation",
    keywords: ["AEO documentation", "CheckSiteAEO docs", "AI SEO audit documentation"],
});

export default function DocumentationPage() {
    return <Documentation />;
}
