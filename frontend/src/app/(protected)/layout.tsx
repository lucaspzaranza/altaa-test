import HeaderNavbar from "@/components/header-navbar";
import { CompanyProvider } from "@/context/CompanyContext";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <CompanyProvider>
      <div className="w-full min-h-screen bg-muted/40">
        <HeaderNavbar />

        <main className="flex-1 bg-muted/30">
          {children}
        </main>
      </div>
    </CompanyProvider>
  );
}
