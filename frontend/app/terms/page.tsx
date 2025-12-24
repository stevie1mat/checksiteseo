import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-white">
            <Navbar />

            <div className="bg-[#224034] text-white pt-32 pb-12 px-6">
                <div className="max-w-4xl mx-auto">
                    <h1 className="font-serif text-4xl mb-4">Terms of Service</h1>
                    <p className="text-white/60">Last updated: December 24, 2025</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-16 prose prose-slate lg:prose-lg hover:prose-a:text-[#8cd9b8] prose-a:transition-colors prose-headings:font-serif prose-headings:text-[#224034]">
                <p className="lead text-xl text-slate-600">
                    Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the CheckSite AEO website and services (the "Service") operated by CheckSite AEO ("us", "we", or "our").
                </p>

                <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 my-8 text-sm text-slate-600 not-prose">
                    <strong>Summary:</strong> These terms establish the agreement between you and CheckSite AEO. They cover your rights and responsibilities, our liability limitations, and how we handle subscriptions and content. effectively using our service means agreeing to these rules.
                </div>

                <br />
                <h3>1. Acceptance of Terms</h3>
                <p>
                    By accessing or using the Service you agree to be bound by these Terms. If you disagree with any part of the terms then you may not access the Service. These Terms apply to all visitors, users, and others who access or use the Service.
                </p>

                <br />
                <h3>2. Description of Service</h3>
                <p>
                    CheckSite AEO provides an AI-powered Answer Engine Optimization analysis tool that helps content creators and businesses understand how their content is perceived and cited by Large Language Models (LLMs) and Answer Engines. The Service includes analysis reports, scoring metrics, and optimization suggestions.
                </p>

                <br />
                <h3>3. Accounts and Registration</h3>
                <p>
                    When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
                </p>
                <p>
                    You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password, whether your password is with our Service or a third-party service. You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
                </p>

                <br />
                <h3>4. Subscriptions and Billing</h3>
                <p>
                    Some parts of the Service are billed on a subscription basis ("Subscription(s)"). You will be billed in advance on a recurring and periodic basis ("Billing Cycle"). Billing cycles are set either on a monthly or annual basis, depending on the type of subscription plan you select when purchasing a Subscription.
                </p>
                <ul>
                    <li><strong>Automatic Renewal:</strong> At the end of each Billing Cycle, your Subscription will automatically renew under the exact same conditions unless you cancel it or CheckSite AEO cancels it.</li>
                    <li><strong>Payment Methods:</strong> A valid payment method, including credit card, is required to process the payment for your Subscription. You shall provide CheckSite AEO with accurate and complete billing information.</li>
                    <li><strong>Fee Changes:</strong> CheckSite AEO, in its sole discretion and at any time, may modify the Subscription fees. Any Subscription fee change will become effective at the end of the then-current Billing Cycle.</li>
                </ul>
                <br />
                <h3>5. Intellectual Property</h3>
                <p>
                    The Service and its original content (excluding Content provided by users), features, and functionality are and will remain the exclusive property of CheckSite AEO and its licensors. The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of CheckSite AEO.
                </p>

                <br />
                <h3>6. User Content</h3>
                <p>
                    Our Service allows you to input URLs and other data for analysis ("User Content"). You retain any and all of your rights to any User Content you submit, post or display on or through the Service and you are responsible for protecting those rights.
                </p>

                <br />
                <h3>7. Links To Other Web Sites</h3>
                <p>
                    Our Service may contain links to third-party web sites or services that are not owned or controlled by CheckSite AEO. CheckSite AEO has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third-party web sites or services. You further acknowledge and agree that CheckSite AEO shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with use of or reliance on any such content, goods or services available on or through any such web sites or services.
                </p>

                <br />
                <h3>8. Limitation of Liability</h3>
                <p>
                    In no event shall CheckSite AEO, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service; (iii) any content obtained from the Service; and (iv) unauthorized access, use or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence) or any other legal theory, whether or not we have been informed of the possibility of such damage.
                </p>

                <br />
                <h3>9. Disclaimer</h3>
                <p>
                    Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and "AS AVAILABLE" basis. The Service is provided without warranties of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, non-infringement or course of performance. CheckSite AEO does not warrant that a) the Service will function uninterrupted, secure or available at any particular time or location; b) any errors or defects will be corrected; or c) the results of using the Service will meet your requirements.
                </p>

                <br />
                <h3>10. Governing Law</h3>
                <p>
                    These Terms shall be governed and construed in accordance with the laws of Delaware, United States, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
                </p>

                <br />
                <h3>11. Contact Us</h3>
                <p>
                    If you have any questions about these Terms, please contact us at <a href="mailto:legal@checksiteaeo.com">legal@checksiteaeo.com</a>.
                </p>
            </div>

            <Footer />
        </main>
    );
}
