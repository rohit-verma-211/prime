import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import WhatsAppFAB from "../components/WhatsAppFAB";

const STATS = [
  { value: "50L+", label: "New demat accounts opened in India every year" },
  { value: "₹500Cr+", label: "Traded daily on the Primebulls platform" },
  { value: "100%", label: "Of your payouts tracked in real time" },
];

function PhoneMock() {
  return (
    <div className="relative mx-auto w-[280px] sm:w-[320px]">
      <div className="rounded-[2.5rem] border-[10px] border-ink bg-white shadow-2xl overflow-hidden">
        <div className="h-6 flex items-center justify-between px-5 pt-2 text-[10px] font-semibold text-ink">
          <span>9:41</span>
          <span className="h-4 w-20 rounded-full bg-ink" />
        </div>
        <div className="px-5 pb-6 pt-3">
          <p className="font-bold text-ink text-sm mb-4">Referral Dashboard</p>

          <div className="bg-brand-light rounded-2xl p-4 mb-4">
            <p className="text-[11px] text-brand-dark font-semibold uppercase tracking-wide">This month</p>
            <p className="text-2xl font-extrabold text-ink mt-1">₹12,450</p>
            <p className="text-xs text-gray-500 mt-0.5">earned from 18 active referrals</p>
          </div>

          <div className="space-y-3">
            {[
              { name: "Ananya R.", note: "First trade completed", amt: "+₹350" },
              { name: "Karan S.", note: "Account activated", amt: "+₹150" },
            ].map(r => (
              <div key={r.name} className="flex items-center justify-between border border-gray-100 rounded-xl px-3 py-2.5">
                <div>
                  <p className="text-sm font-semibold text-ink">{r.name}</p>
                  <p className="text-[11px] text-gray-500">{r.note}</p>
                </div>
                <span className="text-sm font-bold text-emerald-600">{r.amt}</span>
              </div>
            ))}
          </div>

          <button className="w-full mt-5 bg-brand text-white text-sm font-semibold py-3 rounded-full">
            Withdraw earnings
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PartnerWithUs() {
  return (
    <div className="bg-white font-sans min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 pt-16 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left — pitch */}
          <div>
            <span className="inline-block border border-gray-200 rounded-full px-3 py-1 text-xs font-medium text-gray-500 mb-6">
              For creators &amp; finance communities
            </span>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-ink leading-tight">
              Turn <span className="italic font-light text-gray-400">your audience</span>
              <br />
              into <span className="text-brand">active traders.</span>
            </h1>

            <p className="text-gray-600 mt-6 max-w-md">
              Millions of Indians open a new trading account every year. Primebulls lets you
              earn on every trade your referrals place — not just a one-time sign-up bonus.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Link to="/contact-us" className="px-6 py-3 bg-brand text-white rounded-full font-semibold text-sm hover:bg-brand-dark transition text-center">
                Become a Partner
              </Link>
              <Link to="/contact-us" className="px-6 py-3 border-2 border-brand text-brand rounded-full font-semibold text-sm hover:bg-brand-light transition text-center">
                Talk to us
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-gray-100">
              {STATS.map(s => (
                <div key={s.value}>
                  <p className="text-2xl sm:text-3xl font-extrabold text-brand">{s.value}</p>
                  <p className="text-xs text-gray-500 mt-1 leading-snug">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — phone mock */}
          <div>
            <PhoneMock />
          </div>
        </div>

        {/* How the partner program works */}
        <div className="mt-24">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-ink text-center mb-10">
            How the partner program works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { n: "01.", title: "Share your link", desc: "Get a unique referral link to share with your audience or community." },
              { n: "02.", title: "They open an account", desc: "Your referral signs up and completes KYC on Primebulls in minutes." },
              { n: "03.", title: "You earn, ongoing", desc: "Earn a share of brokerage every time they trade — paid out monthly." },
            ].map(s => (
              <div key={s.n} className="border border-gray-200 rounded-2xl p-6">
                <p className="text-2xl font-extrabold text-brand mb-2">{s.n}</p>
                <h3 className="font-semibold text-ink mb-1.5">{s.title}</h3>
                <p className="text-gray-500 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
      <WhatsAppFAB />
    </div>
  );
}
