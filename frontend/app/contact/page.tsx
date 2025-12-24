import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MessageSquare, Phone } from "lucide-react";

export default function ContactPage() {
    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />

            <div className="bg-[#224034] text-white pt-32 pb-12 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="font-serif text-4xl md:text-5xl mb-4">Get in touch</h1>
                    <p className="text-white/80">We'd love to hear from you. Our team is always here to chat.</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-16 -mt-12">
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Contact Info Cards */}
                    <div className="md:col-span-1 space-y-4">
                        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-100">
                            <MessageSquare className="w-6 h-6 text-[#224034] mb-4" />
                            <h3 className="font-semibold text-[#224034]">Chat with us</h3>
                            <p className="text-sm text-slate-500 mb-2">Speak to our friendly team.</p>
                            <a href="#" className="text-[#224034] font-medium hover:underline">Start a live chat</a>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-100">
                            <Mail className="w-6 h-6 text-[#224034] mb-4" />
                            <h3 className="font-semibold text-[#224034]">Email us</h3>
                            <p className="text-sm text-slate-500 mb-2">We'll respond within 24 hours.</p>
                            <a href="mailto:hello@checksiteaeo.com" className="text-[#224034] font-medium hover:underline">hello@checksiteaeo.com</a>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-100">
                            <Phone className="w-6 h-6 text-[#224034] mb-4" />
                            <h3 className="font-semibold text-[#224034]">Call us</h3>
                            <p className="text-sm text-slate-500 mb-2">Mon-Fri from 8am to 5pm.</p>
                            <a href="tel:+15550000000" className="text-[#224034] font-medium hover:underline">+1 (555) 000-0000</a>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="md:col-span-2 bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
                        <form className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">First name</label>
                                    <Input placeholder="First name" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Last name</label>
                                    <Input placeholder="Last name" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Email</label>
                                <Input type="email" placeholder="you@company.com" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Message</label>
                                <Textarea placeholder="Leave us a message..." className="min-h-[150px]" />
                            </div>
                            <Button className="w-full bg-[#224034] hover:bg-[#1a332a] text-white">
                                Send Message
                            </Button>
                        </form>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
