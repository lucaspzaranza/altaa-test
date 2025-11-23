"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useCompanies } from "@/context/CompanyContext";
import Image from "next/image";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { companies, setCompanies } = useCompanies();

  async function loadCompanies() {
    try {
      const res = await fetch(api("/company/companies"), { credentials: "include" });

      if (!res.ok) {
        toast.error("Erro ao carregar empresas");
        return;
      }

      const data = await res.json();
      setCompanies(data.companies);
    } catch {
      toast.error("Erro inesperado");
    }
  }

  function goToCompany(id: string) {
    router.push(`/company/${id}`);
  }

  useEffect(() => {
    loadCompanies().finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold mb-6">Suas Empresas</h1>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : companies?.length === 0 ? (
        <p className="text-muted-foreground">
          Você ainda não pertence a nenhuma empresa.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies?.map((c) => (
            <Card key={c.id} className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  {c.logoUrl ? (
                    <Image
                      src={c.logoUrl.toString()}
                      alt={c.name}
                      className="h-10 w-10 rounded-md object-cover"
                      width={50}
                      height={50}
                      unoptimized
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
                  onClick={() => goToCompany(c.id)}
                >
                  Selecionar empresa
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
