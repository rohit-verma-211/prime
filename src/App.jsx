import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { PortfolioProvider } from "./context/PortfolioContext";
import { EmployeeAuthProvider } from "./context/EmployeeAuthContext";
import Home from "./pages/Home";
import Careers from "./pages/Careers";
import Stocks from "./pages/Stocks";
import StockDetail from "./pages/StockDetail";
import Login from "./pages/Login";
import SipCalculator from "./pages/SipCalculator";
import Portfolio from "./pages/Portfolio";
import ContactUs from "./pages/ContactUs";
import PartnerWithUs from "./pages/PartnerWithUs";
import EmployeeLogin from "./pages/EmployeeLogin";
import EmployeeSignup from "./pages/EmployeeSignup";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
  return (
    <AuthProvider>
      <PortfolioProvider>
        <EmployeeAuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/stocks" element={<Stocks />} />
              <Route path="/stocks/:symbol" element={<StockDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/sip-calculator" element={<SipCalculator />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/contact-us" element={<ContactUs />} />
              <Route path="/partner-with-us" element={<PartnerWithUs />} />
              <Route path="/employee-login" element={<EmployeeLogin />} />
              <Route path="/employee-signup" element={<EmployeeSignup />} />
              <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </BrowserRouter>
        </EmployeeAuthProvider>
      </PortfolioProvider>
    </AuthProvider>
  );
}
