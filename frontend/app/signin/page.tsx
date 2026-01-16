import { SignInForm } from "@/components/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sign In | CheckSiteAEO",
    description: "Sign in to your CheckSiteAEO account to access your AEO audits and reports.",
    openGraph: {
        title: "Sign In | CheckSiteAEO",
        description: "Sign in to your CheckSiteAEO account to access your AEO audits and reports.",
    },
    twitter: {
        card: "summary_large_image",
        title: "Sign In | CheckSiteAEO",
        description: "Welcome back. Sign in to your account.",
    },
};

export default function SignInPage() {
    return <SignInForm />;
}
