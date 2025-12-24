import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import Link from "next/link";

export default function SitemapPage() {
    const sections = [
        {
            title: "Main",
            links: [
                { name: "Home", href: "/" },
                { name: "Sign In", href: "/signin" },
            ]
        },
        {
            title: "Product",
            links: [
                { name: "Features", href: "/#features" },
                { name: "Pricing", href: "/#pricing" },
                { name: "API Access", href: "/api-access" },
                { name: "Integrations", href: "/integrations" },
                { name: "Changelog", href: "/changelog" },
            ]
        },
        {
            title: "Resources",
            links: [
                { name: "Documentation", href: "https://github.com/stevie1mat/checksiteseo" },
                { name: "AEO Guide", href: "/aeo-guide" },
                { name: "Blog", href: "/blog" },
                { name: "Case Studies", href: "/case-studies" },
                { name: "FAQ", href: "/#faq" },
            ]
        },
        {
            title: "Company",
            links: [
                { name: "About Us", href: "/about" },
                { name: "Careers", href: "/careers" },
                { name: "Contact", href: "/contact" },
            ]
        },
        {
            title: "Legal",
            links: [
                { name: "Privacy Policy", href: "/privacy" },
                { name: "Terms of Service", href: "/terms" },
                { name: "Cookie Policy", href: "/cookies" },
            ]
        },
    ];

    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />

            <section className="bg-[#224034] text-white pt-32 pb-20 px-6">
                <div className="max-w-4xl mx-auto">
                    <h1 className="font-serif text-5xl mb-6">Sitemap</h1>
                    <p className="text-xl text-white/80 max-w-2xl">
                        A complete overview of all pages on our site.
                    </p>
                </div>
            </section>

            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-12">
                    {sections.map((section, i) => (
                        <div key={i}>
                            <h2 className="text-xl font-bold text-[#224034] mb-4 border-b border-slate-200 pb-2">{section.title}</h2>
                            <ul className="space-y-3">
                                {section.links.map((link, l) => (
                                    <li key={l}>
                                        <Link href={link.href} className="text-slate-600 hover:text-[#8cd9b8] transition-colors">
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </section>

            <Footer />
        </main>
    );
}
