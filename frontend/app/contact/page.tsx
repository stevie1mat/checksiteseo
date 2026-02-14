import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Mail, MessageSquare } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";
import { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
    title: "Contact CheckSiteAEO",
    description: "Contact the CheckSiteAEO team for product questions, support, and enterprise AEO needs.",
    path: "/contact",
    keywords: ["contact CheckSiteAEO", "AEO support", "AI SEO support"],
});

export default function ContactPage() {
    return (
        <main className="min-h-screen bg-[#224034] relative overflow-hidden" style={{ backgroundColor: '#224034' }}>
            <Navbar />

            <div className="relative z-10 text-white pt-48 pb-12 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="font-serif text-4xl md:text-5xl mb-4">Get in touch</h1>
                    <p className="text-white/80">We would love to hear from you. Our team is always here to chat.</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-24 -mt-12">
                <div className="grid md:grid-cols-3 gap-12">
                    {/* Contact Info Cards */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 group hover:bg-white/10 hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-900/20">
                            <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors">
                                <MessageSquare className="w-6 h-6 text-emerald-400" />
                            </div>
                            <h3 className="font-semibold text-lg text-white mb-1">Chat with us</h3>
                            <p className="text-sm text-white/60 mb-4">Speak to our friendly team.</p>
                            <a href="#" className="inline-flex items-center text-emerald-400 font-medium hover:text-emerald-300 transition-colors group/link">
                                Start a live chat <span className="ml-2 group-hover/link:translate-x-1 transition-transform">→</span>
                            </a>
                        </div>
                        <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 group hover:bg-white/10 hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-900/20">
                            <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors">
                                <Mail className="w-6 h-6 text-emerald-400" />
                            </div>
                            <h3 className="font-semibold text-lg text-white mb-1">Email us</h3>
                            <p className="text-sm text-white/60 mb-4">We will respond within 24 hours.</p>
                            <a href="mailto:hello@checksiteaeo.com" className="inline-flex items-center text-emerald-400 font-medium hover:text-emerald-300 transition-colors group/link">
                                hello@checksiteaeo.com <span className="ml-2 group-hover/link:translate-x-1 transition-transform">→</span>
                            </a>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="md:col-span-2 bg-white/5 backdrop-blur-md rounded-2xl p-8 md:p-12 border border-white/10 relative z-10 shadow-2xl">
                        <ContactForm />
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
