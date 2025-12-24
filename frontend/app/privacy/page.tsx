import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-white">
            <Navbar />

            <div className="bg-[#224034] text-white pt-32 pb-12 px-6">
                <div className="max-w-4xl mx-auto">
                    <h1 className="font-serif text-4xl mb-4">Privacy Policy</h1>
                    <p className="text-white/60">Last updated: December 24, 2025</p>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-6 py-16 prose prose-slate lg:prose-lg">
                <p>
                    At CheckSite AEO, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclosure, and safeguard your information when you visit our website or use our services.
                </p>

                <h3>1. Information We Collect</h3>
                <p>
                    We collect information that you strictly provide to us when you register an account, purchase a subscription, or communicate with us. This may include your name, email address, and payment information.
                </p>

                <h3>2. Use of Your Information</h3>
                <p>
                    We use the information we collect to:
                </p>
                <ul>
                    <li>Provide, operate, and maintain our website</li>
                    <li>Improve, personalize, and expand our website</li>
                    <li>Understand and analyze how you use our website</li>
                    <li>Develop new products, services, features, and functionality</li>
                    <li>Send you emails</li>
                    <li>Find and prevent fraud</li>
                </ul>

                <h3>3. Data Security</h3>
                <p>
                    We implement a variety of security measures to maintain the safety of your personal information. However, no method of transmission over the Internet or method of electronic storage is 100% secure.
                </p>

                <h3>4. Contact Us</h3>
                <p>
                    If you have any questions about this Privacy Policy, please contact us at <a href="mailto:privacy@checksiteaeo.com">privacy@checksiteaeo.com</a>.
                </p>
            </div>

            <Footer />
        </main>
    );
}
