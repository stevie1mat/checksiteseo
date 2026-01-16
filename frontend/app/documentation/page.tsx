import { Documentation } from "@/components/Documentation";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Documentation | CheckSiteAEO",
    description: "Detailed documentation for CheckSite AEO. Learn how to use our tools, interpret your scores, and optimize for AI search.",
    openGraph: {
        title: "Documentation | CheckSiteAEO",
        description: "Detailed documentation for CheckSite AEO. Learn how to use our tools, interpret your scores, and optimize for AI search.",
    },
    twitter: {
        card: "summary_large_image",
        title: "Documentation | CheckSiteAEO",
        description: "Read the docs. Learn how to optimize.",
    },
};

export default function DocumentationPage() {
    return <Documentation />;
}
