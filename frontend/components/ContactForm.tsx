"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { analytics } from "@/lib/analytics";

export function ContactForm() {
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const data = {
            first_name: formData.get("first_name"),
            last_name: formData.get("last_name"),
            email: formData.get("email"),
            message: formData.get("message"),
        };

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/contact`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) throw new Error("Failed to send message");

            // Track contact form submission
            analytics.trackContactFormSubmitted();
            
            alert("Message sent successfully!");
            (e.target as HTMLFormElement).reset();
        } catch (error) {
            alert("Failed to send message. Please try again.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-emerald-200">First name</label>
                    <Input name="first_name" placeholder="First name" required className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:bg-white/10 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50 transition-all h-12" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-emerald-200">Last name</label>
                    <Input name="last_name" placeholder="Last name" required className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:bg-white/10 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50 transition-all h-12" />
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-emerald-200">Email</label>
                <Input name="email" type="email" placeholder="you@company.com" required className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:bg-white/10 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50 transition-all h-12" />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-emerald-200">Message</label>
                <Textarea name="message" placeholder="Leave us a message..." required className="min-h-[150px] bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:bg-white/10 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50 transition-all resize-none" />
            </div>
            <Button disabled={loading} className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white py-6 text-lg font-medium shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all duration-300 border border-white/10">
                {loading ? "Sending..." : "Send Message"}
            </Button>
        </form>
    );
}
