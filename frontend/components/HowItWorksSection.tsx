
const steps = [
    { number: "1", title: "Upload URL", description: "Selected documents from the contact" },
    { number: "2", title: "Audit Run", description: "Reap checks them for completeness" },
    { number: "3", title: "See Progress", description: "Stay in sync with built-in AI case assistant" }
];

export function HowItWorksSection() {
    return (
        <section id="how-it-works" className="py-24 bg-[#F9FBFA]">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <div className="inline-block px-4 py-1 rounded-full border border-slate-200 text-xs font-bold tracking-widest uppercase text-slate-500 mb-6 bg-white">
                        Process
                    </div>
                    <h2 className="font-serif text-4xl text-[#224034]">How It Works Today</h2>
                </div>

                {/* Process Timeline */}
                <div className="relative flex flex-col md:flex-row justify-center items-start gap-8 md:gap-0 max-w-4xl mx-auto">
                    {/* Dashed Line (hidden on mobile) */}
                    <div className="hidden md:block absolute top-[28px] left-0 w-full h-[2px] border-t-2 border-dashed border-slate-200 -z-0" />

                    {/* Step 1 */}
                    <div className="flex-1 flex flex-col items-center text-center relative z-10">
                        <div className="w-14 h-14 rounded-full bg-[#224034] text-white flex items-center justify-center font-bold text-xl mb-6 shadow-xl shadow-[#224034]/20 border-4 border-[#F9FBFA]">
                            1
                        </div>
                        <h3 className="font-semibold text-slate-800 mb-2">Scan URL</h3>
                        <p className="text-sm text-slate-500 max-w-[150px]">Enter your domain for instant analysis.</p>
                    </div>

                    {/* Step 2 */}
                    <div className="flex-1 flex flex-col items-center text-center relative z-10">
                        <div className="w-14 h-14 rounded-full bg-[#224034] text-white flex items-center justify-center font-bold text-xl mb-6 shadow-xl shadow-[#224034]/20 border-4 border-[#F9FBFA]">
                            2
                        </div>
                        <h3 className="font-semibold text-slate-800 mb-2">AI Checks</h3>
                        <p className="text-sm text-slate-500 max-w-[150px]">We parse robots.txt, schema, and content.</p>
                    </div>

                    {/* Step 3 */}
                    <div className="flex-1 flex flex-col items-center text-center relative z-10">
                        <div className="w-14 h-14 rounded-full bg-[#224034] text-white flex items-center justify-center font-bold text-xl mb-6 shadow-xl shadow-[#224034]/20 border-4 border-[#F9FBFA]">
                            3
                        </div>
                        <h3 className="font-semibold text-slate-800 mb-2">Get Report</h3>
                        <p className="text-sm text-slate-500 max-w-[150px]">View actionable insights and fixes.</p>
                    </div>
                </div>

                {/* Testimonial Quote */}
                <div className="max-w-2xl mx-auto text-center mt-24">
                    <div className="text-[#224034] text-6xl font-serif opacity-20 mb-4">"</div>
                    <h3 className="text-2xl md:text-3xl text-slate-600 font-medium leading-relaxed">
                        Before AEO Audit, I used to guess if my site was readable. Now my content gets cited the first time.
                    </h3>
                    <div className="mt-8 flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-slate-200 mb-2" />
                        <p className="font-bold text-slate-800">Stephanie</p>
                        <p className="text-xs text-slate-500">SEO Manager, Tech Co</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
