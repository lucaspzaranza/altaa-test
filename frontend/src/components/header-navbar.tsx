"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Mail } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";;
import { Company, Invite, User } from "@/interfaces";
import { api } from "@/lib/api";
import { useCompanies } from "@/context/CompanyContext";

export default function HeaderNavbar() {
  const [createOpen, setCreateOpen] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [invitesOpen, setInvitesOpen] = useState(false);
  const [invites, setInvites] = useState<any[]>([]);

  const pathname = usePathname();
  const isDashboard = pathname === "/dashboard";

  const router = useRouter();
  const { user } = useAuth();
  const { companies, setCompanies } = useCompanies();

  async function handleLogout() {
    await fetch(api("/auth/logout"), {
      method: "POST",
      credentials: "include",
    });

    router.push("/login");
  }

  async function handleCreateCompany() {
    if (!companyName.trim()) {
      toast.error("Nome da empresa é obrigatório");
      return;
    }

    const body = {
      name: companyName,
      logoUrl,
    };

    try {
      const res = await fetch(api("/company"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include"
      });

      if (!res.ok) {
        toast.error("Erro ao criar empresa");
        return;
      }

      const data = await res.json();
      const newCompany: Company = {
        id: data.id,
        name: companyName,
        logoUrl: logoUrl || null,
      };

      toast.success("Empresa criada!");
      setCreateOpen(false);
      setCompanies([...companies, newCompany]);
    } catch {
      toast.error("Erro inesperado");
    }
  }

  async function loadInvites() {
    try {
      const res = await fetch(api("/invites/my"), {
        credentials: "include",
      });

      if (!res.ok) {
        toast.error("Erro ao carregar convites");
        return;
      }

      const data = await res.json();
      setInvites(data.invites || []);
    } catch {
      toast.error("Erro inesperado");
    }
  }

  async function acceptInvite(invite: Invite) {
    try {
      const res = await fetch(api(`/invites/${invite.id}/accept`), {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        toast.error("Erro ao aceitar convite");
        return;
      }

      toast.success("Convite aceito!");

      loadInvites();
      router.refresh();
      setCompanies([...companies, invite.company]);
    } catch {
      toast.error("Erro inesperado");
    }
  }

  async function rejectInvite(id: string) {
    try {
      const res = await fetch(api(`/invites/${id}`), {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        toast.error("Erro ao recusar convite");
        return;
      }

      toast.success("Convite recusado");
      loadInvites();
    } catch {
      toast.error("Erro inesperado");
    }
  }

  return (
    <div className="w-full bg-muted/40">
      <header className="w-full px-6 py-4 bg-white border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="link" className="hover:pointer-none" onClick={() => router.push("/dashboard")}>
            <h1 className="text-xl font-semibold">Dashboard {user && <>| {user.name}</>}</h1>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            {isDashboard && (
              <>
                <DialogTrigger asChild>
                  <Button variant="default">Criar Empresa</Button>
                </DialogTrigger>

                <Dialog open={invitesOpen} onOpenChange={(open) => {
                  setInvitesOpen(open);
                  if (open) loadInvites();
                }}>
                  <DialogTrigger asChild>
                    <Button variant="default" className="flex items-center gap-2">
                      <Mail size={16} />
                      Convites
                    </Button>
                  </DialogTrigger>

                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Convites Recebidos</DialogTitle>
                    </DialogHeader>

                    {invites.length === 0 ? (
                      <p className="text-muted-foreground">Nenhum convite recebido.</p>
                    ) : (
                      <div className="space-y-4">
                        {invites.map(inv => (
                          <Card key={inv.id}>
                            <CardHeader>
                              <CardTitle>{inv.company.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <p><strong>Papel:</strong> {inv.role}</p>
                              <p className="text-sm text-muted-foreground">
                                Expira: {new Date(inv.expiresAt).toLocaleDateString()}
                              </p>

                              <div className="flex gap-2">
                                <Button onClick={() => acceptInvite(inv)}>
                                  Aceitar
                                </Button>

                                <Button variant="destructive" onClick={() => rejectInvite(inv.id)}>
                                  Recusar
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </>
            )}

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar nova empresa</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label className="mb-3">Nome da Empresa</Label>
                  <Input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>

                <div>
                  <Label className="mb-3">Logo URL</Label>
                  <Input
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button onClick={handleCreateCompany}>Criar Empresa</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </header>
    </div>
  );
}
