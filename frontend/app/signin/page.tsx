import { SignInForm } from "@/components/SignInForm";
import { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
    title: "Sign In",
    description: "Sign in to your CheckSiteAEO account.",
    path: "/signin",
    noIndex: true,
});

export default function SignInPage() {
    return <SignInForm />;
}
