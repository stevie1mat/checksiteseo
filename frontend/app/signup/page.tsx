import { SignUpForm } from "@/components/SignUpForm";
import { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
    title: "Create Account",
    description: "Create your CheckSiteAEO account to run AEO audits and track AI search visibility.",
    path: "/signup",
    noIndex: true,
});

export default function SignUpPage() {
    return <SignUpForm />;
}
