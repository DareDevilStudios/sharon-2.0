import Head from 'next/head'
import Link from 'next/link'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const PrivacyPolicy = () => {
  return (
    <>
      <Head>
        <title>Sharon - Privacy Policy</title>
        <meta name="description" content="Privacy Policy for Sharon Industries. Learn how we collect, use, and protect your personal information." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="bg-black min-h-screen text-white">
        <Navbar />
        
        <div className="w-full px-4 md:px-8 py-12 border-b border-gray-800 bg-black">
          <div className="max-w-4xl mx-auto">
            <p className="text-sm uppercase tracking-[0.2em] text-sharon-or mb-4">Legal</p>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">Privacy Policy</h1>
            <p className="text-lg text-gray-300">
              Your privacy is important to us. Learn how we collect and protect your information.
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 md:px-8 py-12">
          {/* Last Updated */}
          <div className="mb-8 pb-6 border-b border-gray-700">
            <p className="text-gray-400">
              <strong>Last Updated:</strong> October 6, 2026
            </p>
          </div>

          {/* Introduction */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-sharon-or mb-4">1. Introduction</h2>
            <p className="text-gray-300 leading-relaxed">
              Sharon Industries ("we," "us," "our," or "Company") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and apply for job positions with us.
            </p>
          </section>

          {/* Information We Collect */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-sharon-or mb-4">2. Information We Collect</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              When you submit a job application through our career portal, we collect the following personal information:
            </p>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start">
                <span className="text-sharon-or mr-3 mt-1">•</span>
                <span><strong>Personal Identification:</strong> Your full name and phone number</span>
              </li>
              <li className="flex items-start">
                <span className="text-sharon-or mr-3 mt-1">•</span>
                <span><strong>Location Information:</strong> Whether you are located in Ernakulam</span>
              </li>
              <li className="flex items-start">
                <span className="text-sharon-or mr-3 mt-1">•</span>
                <span><strong>Work Availability:</strong> Your working hours and availability</span>
              </li>
              <li className="flex items-start">
                <span className="text-sharon-or mr-3 mt-1">•</span>
                <span><strong>Professional Experience:</strong> Your construction and civil engineering experience</span>
              </li>
            </ul>
          </section>

          {/* How We Use Your Information */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-sharon-or mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              We use the information you provide for the following purposes:
            </p>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start">
                <span className="text-sharon-or mr-3 mt-1">•</span>
                <span>To process and evaluate your job application</span>
              </li>
              <li className="flex items-start">
                <span className="text-sharon-or mr-3 mt-1">•</span>
                <span>To contact you regarding your application status</span>
              </li>
              <li className="flex items-start">
                <span className="text-sharon-or mr-3 mt-1">•</span>
                <span>To assess your qualifications for the position</span>
              </li>
              <li className="flex items-start">
                <span className="text-sharon-or mr-3 mt-1">•</span>
                <span>To communicate about employment opportunities</span>
              </li>
              <li className="flex items-start">
                <span className="text-sharon-or mr-3 mt-1">•</span>
                <span>To comply with legal and regulatory requirements</span>
              </li>
            </ul>
          </section>

          {/* Data Security */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-sharon-or mb-4">4. Data Security</h2>
            <p className="text-gray-300 leading-relaxed">
              We take the security of your personal information seriously. Your application is transmitted through a secure email system to our designated recruitment email address (sharonindustries@gmail.com). We implement appropriate technical and organizational measures to protect your data against unauthorized access, alteration, disclosure, or destruction.
            </p>
          </section>

          {/* Data Retention */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-sharon-or mb-4">5. Data Retention</h2>
            <p className="text-gray-300 leading-relaxed">
              We retain your application information for a period of 12 months from the date of submission, or as long as necessary to evaluate your application and communicate with you regarding employment opportunities. After this period, your information will be securely deleted unless you have provided consent for further communication.
            </p>
          </section>

          {/* Sharing Your Information */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-sharon-or mb-4">6. Sharing Your Information</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              We do not sell, trade, or rent your personal information to third parties. Your application information is only shared with:
            </p>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start">
                <span className="text-sharon-or mr-3 mt-1">•</span>
                <span>Our Human Resources and hiring team members who need to review your application</span>
              </li>
              <li className="flex items-start">
                <span className="text-sharon-or mr-3 mt-1">•</span>
                <span>Authorized personnel involved in the recruitment process</span>
              </li>
              <li className="flex items-start">
                <span className="text-sharon-or mr-3 mt-1">•</span>
                <span>Service providers who assist us in our recruitment operations, under strict confidentiality agreements</span>
              </li>
            </ul>
          </section>

          {/* Your Rights */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-sharon-or mb-4">7. Your Rights</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              You have the right to:
            </p>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start">
                <span className="text-sharon-or mr-3 mt-1">•</span>
                <span>Request access to your personal information that we hold</span>
              </li>
              <li className="flex items-start">
                <span className="text-sharon-or mr-3 mt-1">•</span>
                <span>Request correction of inaccurate information</span>
              </li>
              <li className="flex items-start">
                <span className="text-sharon-or mr-3 mt-1">•</span>
                <span>Request deletion of your information (subject to legal obligations)</span>
              </li>
              <li className="flex items-start">
                <span className="text-sharon-or mr-3 mt-1">•</span>
                <span>Withdraw your consent for communication</span>
              </li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              To exercise any of these rights, please contact us at sharonindustries@gmail.com with the subject line "Privacy Request."
            </p>
          </section>

          {/* Cookies */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-sharon-or mb-4">8. Cookies</h2>
            <p className="text-gray-300 leading-relaxed">
              Our website may use cookies to enhance your browsing experience. Cookies are small files stored on your device that help us remember your preferences and improve our website functionality. You can control cookie settings in your browser preferences.
            </p>
          </section>

          {/* External Links */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-sharon-or mb-4">9. External Links</h2>
            <p className="text-gray-300 leading-relaxed">
              Our website may contain links to external websites. We are not responsible for the privacy practices of these external sites. We encourage you to review the privacy policies of any website before providing your personal information.
            </p>
          </section>

          {/* Changes to This Policy */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-sharon-or mb-4">10. Changes to This Privacy Policy</h2>
            <p className="text-gray-300 leading-relaxed">
              We reserve the right to update this Privacy Policy at any time. Changes will be effective immediately upon posting to our website. We encourage you to review this policy regularly to stay informed about how we protect your information.
            </p>
          </section>

          {/* Contact Us */}
          <section className="mb-10 pb-10 border-b border-gray-700">
            <h2 className="text-2xl font-bold text-sharon-or mb-4">11. Contact Us</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              If you have questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact us:
            </p>
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 space-y-3">
              <p className="text-gray-300">
                <strong className="text-white">Company:</strong> Sharon Industries
              </p>
              <p className="text-gray-300">
                <strong className="text-white">Email:</strong>{' '}
                <a href="mailto:sharonindustries@gmail.com" className="text-sharon-or hover:underline">
                  sharonindustries@gmail.com
                </a>
              </p>
              <p className="text-gray-300">
                <strong className="text-white">Location:</strong> Kanjiramattom, Ernakulam, Kerala
              </p>
              <p className="text-gray-300">
                <strong className="text-white">Phone:</strong>{' '}
                <a href="tel:+919447797308" className="text-sharon-or hover:underline">
                  +91 9447797308
                </a>
              </p>
            </div>
          </section>

          {/* Consent */}
          <section>
            <h2 className="text-2xl font-bold text-sharon-or mb-4">12. Consent</h2>
            <p className="text-gray-300 leading-relaxed">
              By submitting your application through our career portal, you acknowledge that you have read and understood this Privacy Policy and consent to the collection, use, and retention of your personal information as described herein.
            </p>
          </section>
        </div>

        <Footer />
      </main>
    </>
  )
}

export default PrivacyPolicy
