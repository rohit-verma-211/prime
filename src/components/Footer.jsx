import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-[#ede7ff] text-ink border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">

          {/* Company */}
          <div className="md:col-span-1">
            <h3 className="text-base font-bold text-ink mb-3">Primebulls Financial<br />Services Pvt. Ltd.</h3>

            <p className="text-xs font-semibold text-ink-light mt-4">GST</p>
            <p className="text-sm text-gray-600">09PBFSX1234K1ZQ</p>

            <p className="text-xs font-semibold text-ink-light mt-3">CIN</p>
            <p className="text-sm text-gray-600">U67190DL2019PTC345678</p>

            <a href="mailto:contact@primebulls.live" className="flex items-center gap-2 text-sm text-gray-600 hover:text-brand mt-3">
              <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              contact@primebulls.live
            </a>
            <a href="tel:+917303323443" className="flex items-center gap-2 text-sm text-gray-600 hover:text-brand mt-2">
              <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              +91 73033 23443
            </a>

            <p className="text-sm font-semibold text-ink mt-4">Registered Office</p>
            <p className="flex items-start gap-2 text-sm text-gray-600 mt-1">
              <svg className="h-4 w-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              2nd Floor, Cyber Hub, Sector 24, Gurugram, Haryana 122002
            </p>
          </div>

          {/* Regulatory */}
          <div className="md:col-span-1">
            <h3 className="text-base font-bold text-ink mb-3">Regulatory Info</h3>
            <p className="text-sm text-gray-600">
              Primebulls is a SEBI-registered stockbroker and depository participant, dealing in equities, F&amp;O, mutual funds and IPOs.
            </p>
            <p className="text-xs font-semibold text-ink-light mt-3">SEBI Registration No.</p>
            <p className="text-sm text-gray-600">INZ000PB0000</p>
            <p className="text-xs font-semibold text-ink-light mt-3">Member Of</p>
            <p className="text-sm text-gray-600">NSE, BSE, MCX &amp; CDSL</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-base font-bold text-ink mb-3">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/stocks" className="text-sm text-gray-600 hover:text-brand">Explore Markets</Link></li>
              <li><Link to="/sip-calculator" className="text-sm text-gray-600 hover:text-brand">SIP Calculator</Link></li>
              <li><Link to="/portfolio" className="text-sm text-gray-600 hover:text-brand">Portfolio</Link></li>
              <li><Link to="/careers" className="text-sm text-gray-600 hover:text-brand">Careers</Link></li>
              <li><Link to="/partner-with-us" className="text-sm text-gray-600 hover:text-brand">Partner With Us</Link></li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-base font-bold text-ink mb-3">Support Links</h3>
            <ul className="space-y-2">
              <li><Link to="/contact-us" className="text-sm text-gray-600 hover:text-brand">Contact Us</Link></li>
              <li><a href="#faqs" className="text-sm text-gray-600 hover:text-brand">FAQ</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-brand">Terms and Conditions</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-brand">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Follow Us */}
          <div>
            <h3 className="text-base font-bold text-ink mb-3">Follow Us</h3>
            <div className="flex gap-3">
              <a href="https://www.linkedin.com/company/primebulls/" target="_blank" rel="noreferrer"
                 className="h-10 w-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:border-brand hover:text-brand transition">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M4.98 3.5a2.5 2.5 0 11-.02 5.001A2.5 2.5 0 014.98 3.5zM.5 8.98h4v14.02h-4zM8.5 8.98h3.83v1.92h.05c.53-1 1.84-2.06 3.79-2.06 4.06 0 4.81 2.67 4.81 6.14v8.02h-4v-7.11c0-1.7-.03-3.88-2.36-3.88-2.36 0-2.73 1.85-2.73 3.75v7.24h-4z"/></svg>
              </a>
              <a href="#" target="_blank" rel="noreferrer"
                 className="h-10 w-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:border-brand hover:text-brand transition">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.97.24 2.43.4a4.9 4.9 0 011.77 1.15 4.9 4.9 0 011.15 1.77c.16.46.35 1.26.4 2.43.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.24 1.97-.4 2.43a4.9 4.9 0 01-1.15 1.77 4.9 4.9 0 01-1.77 1.15c-.46.16-1.26.35-2.43.4-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.97-.24-2.43-.4a4.9 4.9 0 01-1.77-1.15 4.9 4.9 0 01-1.15-1.77c-.16-.46-.35-1.26-.4-2.43C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.24-1.97.4-2.43a4.9 4.9 0 011.15-1.77A4.9 4.9 0 015.55 1.8c.46-.16 1.26-.35 2.43-.4C9.25 1.34 9.63 1.33 12 1.33m0 2.16c-3.15 0-3.5.01-4.74.07-1.15.05-1.78.24-2.19.4-.55.21-.95.47-1.36.88-.41.41-.67.81-.88 1.36-.16.41-.35 1.04-.4 2.19-.06 1.24-.07 1.59-.07 4.74s.01 3.5.07 4.74c.05 1.15.24 1.78.4 2.19.21.55.47.95.88 1.36.41.41.81.67 1.36.88.41.16 1.04.35 2.19.4 1.24.06 1.59.07 4.74.07s3.5-.01 4.74-.07c1.15-.05 1.78-.24 2.19-.4.55-.21.95-.47 1.36-.88.41-.41.67-.81.88-1.36.16-.41.35-1.04.4-2.19.06-1.24.07-1.59.07-4.74s-.01-3.5-.07-4.74c-.05-1.15-.24-1.78-.4-2.19a3.6 3.6 0 00-.88-1.36 3.6 3.6 0 00-1.36-.88c-.41-.16-1.04-.35-2.19-.4-1.24-.06-1.59-.07-4.74-.07M12 6.87A5.13 5.13 0 1012 17.13 5.13 5.13 0 0012 6.87m0 8.46a3.33 3.33 0 110-6.66 3.33 3.33 0 010 6.66m5.34-8.67a1.2 1.2 0 11-2.4 0 1.2 1.2 0 012.4 0"/></svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 py-6 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} Primebulls Financial Services Private Limited. All rights reserved.</p>
        <p className="mt-1 text-xs text-gray-400 max-w-3xl mx-auto px-4">
          Investments in securities market are subject to market risks. Read all the related documents carefully before investing.
        </p>
        <p className="mt-3">
          <Link to="/employee-login" className="text-xs text-gray-400 hover:text-brand underline underline-offset-2">
            Employee &amp; Intern Login
          </Link>
        </p>
      </div>
    </footer>
  );
}
