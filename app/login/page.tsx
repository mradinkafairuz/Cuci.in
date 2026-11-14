import { LoginForm } from "@/components/auth/LoginForm";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  const { role } = await searchParams;
  return <LoginForm initialRole={role === "petugas" ? "petugas" : "admin"} />;
}
