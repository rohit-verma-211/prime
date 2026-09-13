import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import WhatsAppFAB from "../components/WhatsAppFAB";

export default function ContactUs() {
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "", company: "", subject: "", message: "",
  });
  const [status, setStatus] = useState(null);

  const update = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.subject || !form.message) {
      setStatus({ type: "error", msg: "Please fill in all required fields." });
      return;
    }
    const body = encodeURIComponent(
      `Name: ${form.firstName} ${form.lastName}\nEmail: ${form.email}\nPhone: ${form.phone}\nCompany: ${form.company}\n\n${form.message}`
    );
    window.location.href = `mailto:contact@primebulls.live?subject=${encodeURIComponent(form.subject)}&body=${body}`;
    setStatus({ type: "success", msg: "Thanks for reaching out — your email app should now open with your message ready to send." });
    setForm({ firstName: "", lastName: "", email: "", phone: "", company: "", subject: "", message: "" });
  };

  return (
    <div className="bg-white font-sans min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 pt-10 pb-20">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-center text-ink">Contact Us</h1>
        <p className="text-gray-500 text-center mt-4 max-w-xl mx-auto">
          We value your feedback and are committed to providing excellent service.
          Reach out to us with any questions, concerns, or suggestions.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 mt-14">
          {/* Left — Get in touch */}
          <div>
            <h2 className="text-2xl font-bold text-ink mb-3">Get in Touch</h2>
            <p className="text-gray-600 mb-10">
              Have questions about trading, your portfolio, or opening an account? We're here to help!
              Whether you're a first-time investor or an experienced trader, we'd love to hear from you.
            </p>

            <h2 className="text-2xl font-bold text-ink mb-4">Let's connect</h2>
            <p className="text-gray-600 mb-6">
              We're here to help and answer any question you might have. We look forward to hearing from you.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M4.98 3.5a2.5 2.5 0 11-.02 5.001A2.5 2.5 0 014.98 3.5zM.5 8.98h4v14.02h-4zM8.5 8.98h3.83v1.92h.05c.53-1 1.84-2.06 3.79-2.06 4.06 0 4.81 2.67 4.81 6.14v8.02h-4v-7.11c0-1.7-.03-3.88-2.36-3.88-2.36 0-2.73 1.85-2.73 3.75v7.24h-4z"/></svg>
                </div>
                <h3 className="font-semibold text-ink">Connect with us on LinkedIn</h3>
                <p className="text-sm text-gray-600">Stay updated with our latest news, professional updates, and company insights.</p>
                <a href="https://www.linkedin.com/company/primebulls/" target="_blank" rel="noreferrer" className="text-brand text-sm font-medium hover:underline mt-1">
                  Follow us on LinkedIn →
                </a>
              </div>
              <div className="flex flex-col gap-2">
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.97.24 2.43.4a4.9 4.9 0 011.77 1.15 4.9 4.9 0 011.15 1.77c.16.46.35 1.26.4 2.43.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.24 1.97-.4 2.43a4.9 4.9 0 01-1.15 1.77 4.9 4.9 0 01-1.77 1.15c-.46.16-1.26.35-2.43.4-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.97-.24-2.43-.4a4.9 4.9 0 01-1.77-1.15 4.9 4.9 0 01-1.15-1.77c-.16-.46-.35-1.26-.4-2.43-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.24-1.97.4-2.43a4.9 4.9 0 011.15-1.77A4.9 4.9 0 015.55 1.8c.46-.16 1.26-.35 2.43-.4C9.25 1.34 9.63 1.33 12 1.33m0 2.16c-3.15 0-3.5.01-4.74.07-1.15.05-1.78.24-2.19.4-.55.21-.95.47-1.36.88-.41.41-.67.81-.88 1.36-.16.41-.35 1.04-.4 2.19-.06 1.24-.07 1.59-.07 4.74s.01 3.5.07 4.74c.05 1.15.24 1.78.4 2.19.21.55.47.95.88 1.36.41.41.81.67 1.36.88.41.16 1.04.35 2.19.4 1.24.06 1.59.07 4.74.07s3.5-.01 4.74-.07c1.15-.05 1.78-.24 2.19-.4.55-.21.95-.47 1.36-.88.41-.41.67-.81.88-1.36.16-.41.35-1.04.4-2.19.06-1.24.07-1.59.07-4.74s-.01-3.5-.07-4.74c-.05-1.15-.24-1.78-.4-2.19a3.6 3.6 0 00-.88-1.36 3.6 3.6 0 00-1.36-.88c-.41-.16-1.04-.35-2.19-.4-1.24-.06-1.59-.07-4.74-.07M12 6.87A5.13 5.13 0 1012 17.13 5.13 5.13 0 0012 6.87m0 8.46a3.33 3.33 0 110-6.66 3.33 3.33 0 010 6.66m5.34-8.67a1.2 1.2 0 11-2.4 0 1.2 1.2 0 012.4 0"/></svg>
                </div>
                <h3 className="font-semibold text-ink">Follow us on Instagram</h3>
                <p className="text-sm text-gray-600">Get daily updates, behind-the-scenes content, and join our community.</p>
                <a href="#" target="_blank" rel="noreferrer" className="text-brand text-sm font-medium hover:underline mt-1">
                  Follow us on Instagram →
                </a>
              </div>
            </div>
          </div>

          {/* Right — form */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
            <h2 className="text-xl font-bold text-ink mb-6">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name <span className="text-red-500">*</span></label>
                  <input value={form.firstName} onChange={update("firstName")} placeholder="John"
                    className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name <span className="text-red-500">*</span></label>
                  <input value={form.lastName} onChange={update("lastName")} placeholder="Doe"
                    className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address <span className="text-red-500">*</span></label>
                  <input type="email" value={form.email} onChange={update("email")} placeholder="john.doe@example.com"
                    className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                  <input value={form.phone} onChange={update("phone")} placeholder="+91 98765 43210"
                    className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Company (Optional)</label>
                <input value={form.company} onChange={update("company")} placeholder="Acme Corporation"
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject <span className="text-red-500">*</span></label>
                <input value={form.subject} onChange={update("subject")} placeholder="How can we help you?"
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Message <span className="text-red-500">*</span></label>
                <textarea value={form.message} onChange={update("message")} placeholder="Please provide details about your inquiry..." rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition resize-none" />
              </div>

              {status && (
                <p className={`text-sm ${status.type === "success" ? "text-emerald-600" : "text-red-500"}`}>{status.msg}</p>
              )}

              <button type="submit" className="w-full bg-brand text-white font-semibold py-3 rounded-lg hover:bg-brand-dark transition">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
      <WhatsAppFAB />
    </div>
  );
}
