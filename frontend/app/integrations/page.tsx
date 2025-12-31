import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Plug } from "lucide-react";

export default function IntegrationsPage() {
    const integrations = [
        "WordPress", "Shopify", "Webflow", "HubSpot",
        "Salesforce", "Wix", "Squarespace", "Framer",
        "Ghost", "Drupal", "Joomla", "Next.js"
    ];

    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />

            <section className="bg-[#224034] text-white pt-48 pb-20 px-6 text-center relative overflow-hidden">
                {/* Background Grid Accent */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#224034] via-transparent to-transparent pointer-events-none" />

                <h1 className="font-serif text-5xl mb-6 relative z-10">Integration Support</h1>
                <p className="text-xl text-white/80 max-w-2xl mx-auto relative z-10">
                    CheckSite AEO is optimized to test and improve visibility on any platform.
                </p>
            </section>

            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {integrations.map((tool, i) => (
                            <div key={i} className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center text-center group cursor-pointer relative overflow-hidden hover:border-emerald-400/30">

                                <div className="w-16 h-16 bg-slate-100 rounded-full mb-4 flex items-center justify-center text-slate-400 group-hover:bg-[#8cd9b8]/20 group-hover:text-[#224034] transition-colors">
                                    <Plug className="w-8 h-8" />
                                </div>
                                <h3 className="font-semibold text-lg text-slate-800">{tool}</h3>
                                <p className="text-sm text-slate-500 mt-2">Optimize {tool} Sites</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-20 text-center">
                        <h3 className="text-2xl font-serif text-[#224034] mb-4">Don't see your platform?</h3>
                        <p className="text-slate-600 mb-8">We're constantly adding support for new CMSs and frameworks. Let us know what you use.</p>
                        <a href="/contact" className="font-semibold text-[#224034] hover:underline">Request Platform Support →</a>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
