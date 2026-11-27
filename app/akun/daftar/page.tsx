import { CustomerAuthForm } from "@/components/auth/CustomerAuthForm";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

export default function CustomerRegistrationPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-[70vh] bg-soft/35 px-4 py-12 sm:px-6 sm:py-16">
        <CustomerAuthForm mode="register" />
      </main>
      <Footer />
    </>
  );
}
