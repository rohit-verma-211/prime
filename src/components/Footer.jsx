import { Link } from "react-router-dom";
import { FaGooglePlay, FaApple, FaLinkedinIn, FaInstagram } from "react-icons/fa";
import { MdEmail, MdPhone, MdLocationOn } from "react-icons/md";

export default function Footer() {
  return (
    <footer className="bg-[#ede7ff] text-ink border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">

          {/* Company */}
          <div className="md:col-span-1">
            <h3 className="text-base font-bold text-ink mb-3">
              Primebulls Financial<br />Services Pvt. Ltd.
            </h3>

            <p className="text-xs font-semibold text-ink-light mt-4">GST</p>
            <p className="text-sm text-gray-600">07BENPV0572A1ZH</p>

            <a
              href="mailto:contact@primebulls.in"
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-brand mt-3"
            >
              <MdEmail className="h-4 w-4 flex-shrink-0" />
              contact@primebulls.in
            </a>
            <a
              href="tel:+918178546213"
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-brand mt-2"
            >
              <MdPhone className="h-4 w-4 flex-shrink-0" />
              +91 8178546213
            </a>

            <p className="text-sm font-semibold text-ink mt-4">Registered Office</p>
            <p className="flex items-start gap-2 text-sm text-gray-600 mt-1">
              <MdLocationOn className="h-4 w-4 flex-shrink-0 mt-0.5" />
              503, 5TH FLOOR, SUNEJA TOWER-II, JANAKPURI DISTRICT CENTER, DELHI - 110058
            </p>
          </div>

          {/* Regulatory */}
          <div className="md:col-span-1">
            <h3 className="text-base font-bold text-ink mb-3">Regulatory Info</h3>
            <p className="text-sm text-gray-600">
              Primebulls is a SEBI-registered stockbroker and depository participant, dealing in
              equities, F&amp;O, mutual funds and IPOs.
            </p>

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
              <a
                href="https://www.linkedin.com/company/primebulls/"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="h-10 w-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:border-brand hover:text-brand transition"
              >
                <FaLinkedinIn className="h-4 w-4" />
              </a>
              <a
                href="#"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="h-10 w-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:border-brand hover:text-brand transition"
              >
                <FaInstagram className="h-4 w-4" />
              </a>
            </div>

            {/* App Download */}
            <p className="text-sm font-semibold text-ink mt-6 mb-3">Download Our App</p>
            <div className="flex flex-col gap-3">
              {/* Google Play */}
              <a
                href="https://play.google.com/store/apps/details?id=YOUR_APP_ID"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 bg-black text-white rounded-lg px-4 py-2 w-44 hover:opacity-90 transition"
              >
                <FaGooglePlay className="h-6 w-6 flex-shrink-0" />
                <div className="leading-tight">
                  <p className="text-[10px] uppercase tracking-wide">Get it on</p>
                  <p className="text-base font-semibold -mt-0.5">Google Play</p>
                </div>
              </a>

              {/* App Store */}
              <a
                href="https://apps.apple.com/in/app/YOUR_APP_NAME/idYOUR_APP_ID"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 bg-black text-white rounded-lg px-4 py-2 w-44 hover:opacity-90 transition"
              >
                <FaApple className="h-7 w-7 flex-shrink-0" />
                <div className="leading-tight">
                  <p className="text-[10px]">Download on the</p>
                  <p className="text-base font-semibold -mt-0.5">App Store</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-100 py-6 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} Primebulls Financial Services Private Limited. All rights reserved.</p>
        <p className="mt-1 text-xs text-gray-400 max-w-3xl mx-auto px-4">
          Investments in securities market are subject to market risks. Read all the related documents carefully before investing.
        </p>
        <p className="mt-3">
          <Link
            to="/employee-login"
            className="text-xs text-gray-400 hover:text-brand underline underline-offset-2"
          >
            Employee &amp; Intern Login
          </Link>
        </p>
      </div>
    </footer>
  );
}