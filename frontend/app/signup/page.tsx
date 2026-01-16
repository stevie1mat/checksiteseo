import { SignUpForm } from "@/components/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sign Up | CheckSiteAEO",
    description: "Create your free CheckSiteAEO account and start optimizing your site for answer engines.",
    openGraph: {
        title: "Sign Up | CheckSiteAEO",
        description: "Create your free CheckSiteAEO account and start optimizing your site for answer engines.",
    },
    twitter: {
        card: "summary_large_image",
        title: "Sign Up | CheckSiteAEO",
        description: "Join CheckSiteAEO today.",
    },
};

export default function SignUpPage() {
    return <SignUpForm />;
}
