import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function ChangelogPage() {
    const updates = [
        {
            version: "v2.2.0",
            date: "December 31, 2025",
            title: "Pro Integrations & Sync API",
            description: "Launched support for 12+ major platform integrations including WordPress, Shopify, and Webflow. Introduced synchronous API analysis for real-time results.",
            tags: ["Integrations", "API"],
        },
        {
            version: "v2.1.5",
            date: "December 25, 2025",
            title: "Performance Optimization",
            description: "Holiday update focused on speed. Reduced analysis latency by 40% and improved concurrent request handling for high-volume users.",
            tags: ["Performance", "Backend"],
        },
        {
            version: "v2.1.0",
            date: "December 20, 2025",
            title: "Enhanced Answer Engine Analysis",
            description: "We've upgraded our core analysis engine to better simulate Perplexity and ChatGPT search behaviors. This update provides more accurate 'Missing Answer' predictions.",
            tags: ["Core", "AI"],
        },
        {
            version: "v2.0.5",
            date: "December 10, 2025",
            title: "New Dashboard UI",
            description: "A complete overhaul of the user dashboard. Cleaner layout, faster load times, and better data visualization for your historical reports.",
            tags: ["UI/UX", "Dashboard"],
        },
        {
            version: "v2.0.0",
            date: "November 28, 2025",
            title: "Major Release: Competitor Comparison",
            description: "You can now compare your AEO score directly against up to 3 competitors. See exactly where you're winning and losing in the AI search landscape.",
            tags: ["Feature", "Major"],
        },
        {
            version: "v1.5.0",
            date: "November 1, 2025",
            title: "Real-time Site Monitoring",
            description: "Added background workers for continuous site monitoring. Get alerted immediately when your AEO score drops below a set threshold.",
            tags: ["Monitoring", "Workers"],
        },
        {
            version: "v1.0.0",
            date: "October 15, 2025",
            title: "Public Beta Launch",
            description: "CheckSite AEO is live! The first comprehensive tool for Optimizing for Answer Engines. Start analyzing your site's visibility on Perplexity, ChatGPT, and Claude.",
            tags: ["Launch", "Beta"],
        },
    ];

    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />

            <section className="bg-[#224034] text-white pt-32 pb-20 px-6 text-center">
                <h1 className="font-serif text-5xl mb-6">Changelog</h1>
                <p className="text-xl text-white/80 max-w-2xl mx-auto">
                    See what's new and improved in CheckSite AEO.
                </p>
            </section>

            <section className="py-20 px-6">
                <div className="max-w-3xl mx-auto space-y-12">
                    {updates.map((update, i) => (
                        <div key={i} className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-[#8cd9b8]"></div>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                <div className="flex items-center gap-3">
                                    <span className="font-mono text-sm bg-slate-100 px-2 py-1 rounded text-slate-600 font-medium">{update.version}</span>
                                    <span className="text-slate-400 text-sm">{update.date}</span>
                                </div>
                                <div className="flex gap-2">
                                    {update.tags.map((tag, t) => (
                                        <span key={t} className="text-xs font-semibold bg-[#e6f7ef] text-[#224034] px-2 py-1 rounded-full">{tag}</span>
                                    ))}
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-[#224034] mb-3">{update.title}</h2>
                            <p className="text-slate-600 leading-relaxed">
                                {update.description}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            <Footer />
        </main>
    );
}
