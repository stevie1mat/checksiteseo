"use client"

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { HOME_FAQ_ITEMS } from "@/lib/home-faq";

export function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section id="faq" className="py-24 bg-[#F9FBFA]">
            <div className="max-w-6xl mx-auto px-6">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {HOME_FAQ_ITEMS.map((faq, index) => (
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
                    <Link
                        href="/contact"
                        className="inline-block px-6 py-3 bg-[#224034] text-white font-semibold rounded-lg hover:bg-[#1a3329] transition-colors"
                    >
                        Contact Support
                    </Link>
                </div>
            </div>
        </section>
    );
}
