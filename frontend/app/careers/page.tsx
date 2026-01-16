import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Clock } from "lucide-react";
import { ApplicationDialog } from "@/components/careers/ApplicationDialog";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Careers | CheckSiteAEO",
    description: "Join the CheckSiteAEO team and help us shape the future of Answer Engine Optimization. Explore our open positions.",
    openGraph: {
        title: "Careers | CheckSiteAEO",
        description: "Join the CheckSiteAEO team and help us shape the future of Answer Engine Optimization. Explore our open positions.",
    },
    twitter: {
        card: "summary_large_image",
        title: "Careers | CheckSiteAEO",
        description: "Join the CheckSiteAEO team and help us shape the future of Answer Engine Optimization.",
    },
};

export default function CareersPage() {
    const jobs = [
        {
            title: "Senior Full Stack Engineer",
            department: "Engineering",
            location: "Canada - Remote",
            type: "Full-time",
        },
        {
            title: "AI Research Scientist",
            department: "Research",
            location: "Canada - Remote",
            type: "Full-time",
        },
        {
            title: "Product Designer",
            department: "Design",
            location: "Canada - Remote",
            type: "Full-time",
        },
        {
            title: "SEO Specialist",
            department: "Marketing",
            location: "Canada - Remote",
            type: "Full-time",
        },
    ];

    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />

            {/* Hero */}
            <section className="bg-[#224034] text-white pt-32 pb-20 px-6 text-center">
                <h1 className="font-serif text-5xl md:text-6xl mb-6">Join the AEO Revolution</h1>
                <p className="text-xl text-white/80 max-w-2xl mx-auto">
                    We're building the future of search optimization. Help us shape how information is discovered in the AI age.
                </p>
            </section>

            {/* Benefits Grid */}
            <section className="py-20 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl font-serif text-[#224034] text-center mb-12">Why join us?</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { title: "Remote-First", desc: "Work from anywhere in the world. We believe in talent, not locations." },
                            { title: "Competitive Pay", desc: "Top-tier salary and equity packages. We value your contribution." },
                            { title: "Health & Wellness", desc: "Comprehensive health coverage and wellness stipends for you and your family." },
                        ].map((benefit, i) => (
                            <div key={i} className="p-6 bg-slate-50 rounded-xl">
                                <h3 className="font-semibold text-lg text-[#224034] mb-2">{benefit.title}</h3>
                                <p className="text-slate-600">{benefit.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Open Roles */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-serif text-[#224034] mb-8">Open Positions</h2>
                    <div className="space-y-4">
                        {jobs.map((job, i) => (
                            <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex flex-col md:flex-row items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-xl font-semibold text-[#224034] mb-2">{job.title}</h3>
                                    <div className="flex items-center gap-4 text-sm text-slate-500">
                                        <span className="bg-slate-100 px-3 py-1 rounded-full">{job.department}</span>
                                        <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.location}</span>
                                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {job.type}</span>
                                    </div>
                                </div>
                                <ApplicationDialog jobTitle={job.title}>
                                    <Button variant="outline" className="border-[#224034] text-[#224034] hover:bg-[#224034] hover:text-white">
                                        Apply Now <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </ApplicationDialog>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
