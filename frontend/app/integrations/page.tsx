import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Plug } from "lucide-react";

export default function IntegrationsPage() {
    const integrations = [
        "WordPress", "Shopify", "Webflow", "HubSpot",
        "Salesforce", "Slack", "Zapier", "Google Analytics",
        "Semrush", "Ahrefs", "Wix", "Squarespace"
    ];

    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />

            <section className="bg-[#224034] text-white pt-32 pb-20 px-6 text-center">
                <h1 className="font-serif text-5xl mb-6">Integrations</h1>
                <p className="text-xl text-white/80 max-w-2xl mx-auto">
                    Connect CheckSite AEO with your favorite tools and workflows.
                </p>
            </section>

            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {integrations.map((tool, i) => (
                            <div key={i} className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center text-center group cursor-pointer">
                                <div className="w-16 h-16 bg-slate-100 rounded-full mb-4 flex items-center justify-center text-slate-400 group-hover:bg-[#8cd9b8]/20 group-hover:text-[#224034] transition-colors">
                                    <Plug className="w-8 h-8" />
                                </div>
                                <h3 className="font-semibold text-lg text-slate-800">{tool}</h3>
                                <p className="text-sm text-slate-500 mt-2">Connect to {tool}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-20 text-center">
                        <h3 className="text-2xl font-serif text-[#224034] mb-4">Don't see your tool?</h3>
                        <p className="text-slate-600 mb-8">We're constantly adding new integrations. Let us know what you need.</p>
                        <a href="/contact" className="font-semibold text-[#224034] hover:underline">Request an Integration →</a>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
