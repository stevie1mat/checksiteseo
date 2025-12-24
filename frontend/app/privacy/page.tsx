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

            <div className="max-w-4xl mx-auto px-6 py-16 prose prose-slate lg:prose-lg hover:prose-a:text-[#8cd9b8] prose-a:transition-colors prose-headings:font-serif prose-headings:text-[#224034]">
                <p className="lead text-xl text-slate-600">
                    At CheckSite AEO, we value your privacy and are committed to protecting your personal data. This Privacy Policy details how we handle your information when you access our services.
                </p>

                <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 my-8 text-sm text-slate-600 not-prose">
                    <strong>Summary:</strong> We collect only the data necessary to provide our services, such as your email for account management and URLs you submit for analysis. We do not sell your personal data. We use industry-standard security to protect your information.
                </div>

                <br />
                <h3>1. Information We Collect</h3>
                <p>
                    We collect several different types of information for various purposes to provide and improve our Service to you.
                </p>
                <ul>
                    <li><strong>Personal Data:</strong> While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you ("Personal Data"). Personally identifiable information may include, but is not limited to: Email address, First name and last name, Cookies and Usage Data.</li>
                    <li><strong>Usage Data:</strong> We may also collect information how the Service is accessed and used ("Usage Data"). This Usage Data may include information such as your computer's Internet Protocol address (e.g. IP address), browser type, browser version, the pages of our Service that you visit, the time and date of your visit, the time spent on those pages, unique device identifiers and other diagnostic data.</li>
                </ul>

                <br />
                <h3>2. Use of Data</h3>
                <p>
                    CheckSite AEO uses the collected data for various purposes:
                </p>
                <ul>
                    <li>To provide and maintain the Service</li>
                    <li>To notify you about changes to our Service</li>
                    <li>To provide customer care and support</li>
                    <li>To provide analysis or valuable information so that we can improve the Service</li>
                    <li>To monitor the usage of the Service</li>
                    <li>To detect, prevent and address technical issues</li>
                </ul>

                <br />
                <h3>3. Data Retention</h3>
                <p>
                    CheckSite AEO will retain your Personal Data only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use your Personal Data to the extent necessary to comply with our legal obligations (for example, if we are required to retain your data to comply with applicable laws), resolve disputes, and enforce our legal agreements and policies.
                </p>
                <p>
                    We will also retain Usage Data for internal analysis purposes. Usage Data is generally retained for a shorter period of time, except when this data is used to strengthen the security or to improve the functionality of our Service, or we are legally obligated to retain this data for longer time periods.
                </p>

                <br />
                <h3>4. Transfer Of Data</h3>
                <p>
                    Your information, including Personal Data, may be transferred to — and maintained on — computers located outside of your state, province, country or other governmental jurisdiction where the data protection laws may differ than those from your jurisdiction.
                </p>
                <p>
                    CheckSite AEO will take all steps reasonably necessary to ensure that your data is treated securely and in accordance with this Privacy Policy and no transfer of your Personal Data will take place to an organization or a country unless there are adequate controls in place including the security of your data and other personal information.
                </p>

                <br />
                <h3>5. Security Of Data</h3>
                <p>
                    The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
                </p>

                <br />
                <h3>6. Your Data Protection Rights</h3>
                <p>
                    In certain circumstances, you have the following data protection rights:
                </p>
                <ul>
                    <li><strong>The right to access, update or to delete the information we have on you.</strong></li>
                    <li><strong>The right of rectification.</strong> You have the right to have your information rectified if that information is inaccurate or incomplete.</li>
                    <li><strong>The right to object.</strong> You have the right to object to our processing of your Personal Data.</li>
                    <li><strong>The right of restriction.</strong> You have the right to request that we restrict the processing of your personal information.</li>
                    <li><strong>The right to data portability.</strong> You have the right to be provided with a copy of the information we have on you in a structured, machine-readable and commonly used format.</li>
                    <li><strong>The right to withdraw consent.</strong> You also have the right to withdraw your consent at any time where CheckSite AEO relied on your consent to process your personal information.</li>
                </ul>

                <br />
                <h3>7. Service Providers</h3>
                <p>
                    We may employ third party companies and individuals to facilitate our Service ("Service Providers"), to provide the Service on our behalf, to perform Service-related services or to assist us in analyzing how our Service is used. These third parties have access to your Personal Data only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.
                </p>

                <br />
                <h3>8. Changes To This Privacy Policy</h3>
                <p>
                    We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. We will let you know via email and/or a prominent notice on our Service, prior to the change becoming effective and update the "effective date" at the top of this Privacy Policy.
                </p>

                <br />
                <h3>9. Contact Us</h3>
                <p>
                    If you have any questions about this Privacy Policy, please contact us at <a href="mailto:hello@checksiteseo.com">hello@checksiteseo.com</a>.
                </p>
            </div>

            <Footer />
        </main>
    );
}
