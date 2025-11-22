"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Company {
  id: string;
  name: string;
  logoUrl?: string | null;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selecting, setSelecting] = useState<string | null>(null);
  const router = useRouter();

  async function loadCompanies() {
    try {
      const res = await fetch("/api/companies");

      if (!res.ok) {
        toast.error("Erro ao carregar empresas");
        return;
      }

      const data = await res.json();
      setCompanies(data.companies);
    } catch {
      toast.error("Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  async function selectCompany(id: string) {
    try {
      setSelecting(id);

      const res = await fetch("/api/companies/select", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId: id }),
      });

      if (!res.ok) {
        toast.error("Erro ao selecionar empresa");
        return;
      }

      toast.success("Empresa selecionada!");
    } catch {
      toast.error("Erro inesperado");
    } finally {
      setSelecting(null);
    }
  }

  async function handleLogout() {
    await fetch("http://localhost:4000/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    router.push("/login");
  }

  useEffect(() => {
    loadCompanies();
  }, []);

  return (
    <div className="w-full min-h-screen bg-muted/40">
      <header className="w-full px-6 py-4 bg-white border-b flex items-center justify-between">
        <h1 className="text-xl font-semibold">Dashboard</h1>

        <Button variant="destructive" onClick={handleLogout}>
          Logout
        </Button>
      </header>

      <main className="p-6">
        <h1 className="text-3xl font-semibold mb-6">Suas Empresas</h1>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        ) : companies.length === 0 ? (
          <p className="text-muted-foreground">
            Você ainda não pertence a nenhuma empresa.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.map((c) => (
              <Card key={c.id} className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    {c.logoUrl ? (
                      <img
                        src={c.logoUrl}
                        alt={c.name}
                        className="h-10 w-10 rounded-md object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 bg-muted rounded-md" />
                    )}
                    <span>{c.name}</span>
                  </CardTitle>
                </CardHeader>

                <CardContent className="pt-0">
                  <Button
                    className="w-full"
                    disabled={selecting === c.id}
                    onClick={() => selectCompany(c.id)}
                  >
                    {selecting === c.id ? "Selecionando..." : "Selecionar empresa"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
