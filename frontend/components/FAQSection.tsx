"use client"

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const faqs = [
        {
            question: "What is AEO and how is it different from SEO?",
            answer: "AEO (Answer Engine Optimization) focuses on optimizing content for AI-powered answer engines like ChatGPT, Perplexity, and Google's AI Overview. While SEO targets traditional search rankings, AEO ensures your content is properly formatted, cited, and trustworthy for AI models to reference and recommend."
        },
        {
            question: "How does CheckSite AEO analyze my content?",
            answer: "We use advanced AI models to evaluate your content across three key areas: Technical Readiness (robots.txt, schema, HTTPS), Content Structure (readability, visual context, question targeting), and Authority Signals (E-E-A-T indicators). Our platform provides a comprehensive score and actionable recommendations."
        },
        {
            question: "What is the content gap analysis feature?",
            answer: "Our AI analyzes your page content and identifies missing topics that answer engines expect to see. This helps you fill content gaps that could improve your chances of being cited by AI models. It's contextually aware and provides relevant suggestions based on your specific industry and niche."
        },
        {
            question: "Can I try CheckSite AEO before committing?",
            answer: "Yes! We offer a completely free tier with 5 URL scans per month, and all paid plans come with a 14-day free trial. No credit card required to start. You can test the full platform and see results before making any commitment."
        },
        {
            question: "How often should I run AEO audits?",
            answer: "We recommend running audits weekly for active content and after any major content updates. Our Pro plan includes automated weekly reports and real-time monitoring, so you're always aware of your AEO readiness status as algorithms evolve."
        },
        {
            question: "Does CheckSite AEO integrate with my existing tools?",
            answer: "Yes! Our Pro and Enterprise plans include API access for seamless integration with your CMS, analytics platforms, and workflow tools. We support webhooks, REST API, and custom integrations for larger teams."
        },
        {
            question: "What makes your E-E-A-T analysis unique?",
            answer: "We use the same AI models that power answer engines to evaluate your content's expertise, experience, authoritativeness, and trustworthiness. This gives you insights into exactly how AI perceives your brand, helping you identify and address trust issues before they impact visibility."
        },
        {
            question: "Is there a limit to how many URLs I can analyze?",
            answer: "The Free plan allows 5 scans per month. Pro plan includes unlimited scans for any number of domains. Enterprise plans offer bulk domain management and white-label reports for agencies managing multiple clients."
        }
    ];

    return (
        <section id="faq" className="py-24 bg-[#F9FBFA]">
            <div className="max-w-4xl mx-auto px-6">
                <div className="text-center mb-16">
                    <div className="inline-block px-4 py-1 rounded-full border border-emerald-200 text-xs font-bold tracking-widest uppercase text-emerald-700 mb-6 bg-white">
                        FAQ
                    </div>
                    <h2 className="font-serif text-4xl md:text-5xl text-[#224034] leading-tight">
                        Common questions.
                    </h2>
                    <p className="text-slate-500 mt-6 max-w-xl mx-auto text-lg">
                        Everything you need to know about AEO and our platform.
                    </p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:border-[#8cd9b8] transition-all duration-300"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left hover:bg-emerald-50/30 transition-colors"
                            >
                                <h3 className="font-semibold text-[#224034] text-lg pr-4">
                                    {faq.question}
                                </h3>
                                <ChevronDown
                                    className={`w-5 h-5 text-[#224034] shrink-0 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''
                                        }`}
                                />
                            </button>

                            <div
                                className={`overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-96' : 'max-h-0'
                                    }`}
                            >
                                <div className="px-6 pb-5 pt-2">
                                    <p className="text-slate-600 leading-relaxed">
                                        {faq.answer}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <p className="text-slate-500 mb-4">Still have questions?</p>
                    <a
                        href="mailto:support@checksiteaeo.com"
                        className="inline-block px-6 py-3 bg-[#224034] text-white font-semibold rounded-lg hover:bg-[#1a3329] transition-colors"
                    >
                        Contact Support
                    </a>
                </div>
            </div>
        </section>
    );
}
