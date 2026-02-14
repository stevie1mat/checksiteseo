import { AeoGuide } from "@/components/AeoGuide";
import { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
    title: "AEO Guide: Answer Engine Optimization Handbook",
    description: "Learn Answer Engine Optimization with step-by-step guidance for technical setup, content structure, and authority signals.",
    path: "/aeo-guide",
    keywords: ["AEO guide", "answer engine optimization handbook", "AI search optimization guide"],
});

export default function AeoGuidePage() {
    return <AeoGuide />;
}
