import { AeoGuide } from "@/components/AeoGuide";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "AEO Guide | Answer Engine Optimization Handbook",
    description: "The complete handbook for Answer Engine Optimization (AEO). Learn how to optimize your content for AI search engines like Perplexity, ChatGPT, and Gemini.",
    openGraph: {
        title: "AEO Guide | Answer Engine Optimization Handbook",
        description: "The complete handbook for Answer Engine Optimization (AEO). Learn how to optimize your content for AI search engines.",
    },
    twitter: {
        card: "summary_large_image",
        title: "AEO Guide | Answer Engine Optimization Handbook",
        description: "Master the art of Answer Engine Optimization.",
    },
};

export default function AeoGuidePage() {
    return <AeoGuide />;
}
