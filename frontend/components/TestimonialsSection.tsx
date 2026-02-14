import { Star } from "lucide-react";

export function TestimonialsSection() {
    const testimonials = [
        {
            quote: "CheckSite AEO transformed how we approach content optimization. Our citations increased 300% in just two months.",
            name: "Sarah Chen",
            role: "Head of Content",
            company: "TechVision AI",
            rating: 5,
            metric: "+300% Citations"
        },
        {
            quote: "The AI-powered content gap analysis is a game-changer. We now know exactly what to add to rank higher in answer engines.",
            name: "Michael Rodriguez",
            role: "SEO Director",
            company: "Growth Labs",
            rating: 5,
            metric: "Top 3 Rankings"
        },
        {
            quote: "Finally, a tool that understands E-E-A-T. The detailed authority breakdown helped us identify and fix trust issues.",
            name: "Emily Watson",
            role: "Marketing Manager",
            company: "HealthTech Co",
            rating: 5,
            metric: "+85% Trust Score"
        },
        {
            quote: "The real-time monitoring saved us from algorithmic penalties. We caught issues before they impacted our visibility.",
            name: "David Kim",
            role: "Founder",
            company: "StartupHub",
            rating: 5,
            metric: "Zero Penalties"
        },
        {
            quote: "Best investment we made this year. The ROI from improved AEO readiness paid for itself in the first month.",
            name: "Lisa Thompson",
            role: "CMO",
            company: "E-commerce Plus",
            rating: 5,
            metric: "1st Month ROI"
        },
        {
            quote: "Their support team is exceptional. They helped us understand AEO and implement best practices across all our content.",
            name: "James Park",
            role: "Content Lead",
            company: "Media Group",
            rating: 5,
            metric: "100% Support"
        }
    ];

    return (
        <section className="py-24 bg-white" aria-labelledby="testimonials-title">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <div className="inline-block px-4 py-1 rounded-full border border-emerald-200 text-xs font-bold tracking-widest uppercase text-emerald-700 mb-6 bg-emerald-50">
                        Testimonials
                    </div>
                    <h2 id="testimonials-title" className="font-serif text-4xl md:text-5xl text-[#224034] max-w-2xl mx-auto leading-tight">
                        Trusted by teams worldwide.
                    </h2>
                    <p className="text-slate-500 mt-6 max-w-xl mx-auto text-lg">
                        See how companies are winning with AEO optimization.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <figure
                            key={testimonial.name}
                            className={`rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 ${index % 2 === 0 ? "bg-white" : "bg-emerald-50/30"
                                }`}
                        >
                            <div className="flex gap-1 mb-4" aria-label={`${testimonial.rating} out of 5 stars`}>
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star key={`${testimonial.name}-${i}`} className="w-4 h-4 fill-[#8cd9b8] text-[#8cd9b8]" />
                                ))}
                            </div>

                            <blockquote className="mb-6">
                                <span className="text-4xl text-[#224034] font-serif opacity-20 leading-none">&ldquo;</span>
                                <p className="text-slate-600 leading-relaxed italic mt-2">
                                    {testimonial.quote}
                                </p>
                            </blockquote>

                            <figcaption className="flex items-center justify-between pt-4 border-t border-gray-100">
                                <div>
                                    <p className="font-semibold text-[#224034]">{testimonial.name}</p>
                                    <p className="text-xs text-slate-500">{testimonial.role}</p>
                                    <p className="text-xs text-slate-400">{testimonial.company}</p>
                                </div>
                                <div className="bg-[#224034] text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                                    {testimonial.metric}
                                </div>
                            </figcaption>
                        </figure>
                    ))}
                </div>
            </div>
        </section>
    );
}
