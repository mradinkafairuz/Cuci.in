import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CustomerDashboard } from "@/components/dashboard/CustomerDashboard";

export default function CustomerDashboardPage() {
  return <><Navbar /><main className="min-h-[70vh] bg-soft/35 px-4 py-10 sm:px-6 sm:py-14"><CustomerDashboard /></main><Footer /></>;
}
