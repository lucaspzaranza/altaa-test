"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Company, User } from "@/interfaces";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selecting, setSelecting] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [members, setMembers] = useState<
    { userId: string; role: "OWNER" | "ADMIN" | "MEMBER" }[]
  >([{ userId: "", role: "MEMBER" }]);

  const router = useRouter();
  const { user } = useAuth();

  async function loadCompanies() {
    try {
      const res = await fetch("http://localhost:4000/company/companies", { credentials: "include" });

      if (!res.ok) {
        toast.error("Erro ao carregar empresas");
        return;
      }

      const data = await res.json();
      console.log(data.companies);
      setCompanies(data.companies);
    } catch {
      toast.error("Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  async function loadUsers() {
    try {
      const res = await fetch("http://localhost:4000/users");

      if (!res.ok) return;

      const data = await res.json();
      setAllUsers(data.users);
    } catch { }
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

  async function handleCreateCompany() {
    if (!companyName.trim()) {
      toast.error("Nome da empresa é obrigatório");
      return;
    }

    const body = {
      name: companyName,
      logoUrl,
      // members: members.filter((m) => m.userId !== ""),
    };

    try {
      const res = await fetch("http://localhost:4000/company/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include"
      });

      if (!res.ok) {
        toast.error("Erro ao criar empresa");
        return;
      }

      toast.success("Empresa criada!");
      setCreateOpen(false);
      loadCompanies();
    } catch {
      toast.error("Erro inesperado");
    }
  }

  useEffect(() => {
    loadCompanies();
    loadUsers();
  }, []);

  function addMemberField() {
    setMembers([...members, { userId: "", role: "MEMBER" }]);
  }

  function handleMemberChange(
    index: number,
    field: "userId" | "role",
    value: string
  ) {
    setMembers((prev) =>
      prev.map((m, i) =>
        i === index ? { ...m, [field]: value } : m
      )
    );
  }

  function removeMember(idx: number) {
    setMembers((prev) => prev.filter((_, i) => i !== idx));
  }

  return (
    <div className="w-full min-h-screen bg-muted/40">
      <header className="w-full px-6 py-4 bg-white border-b flex items-center justify-between">
        <h1 className="text-xl font-semibold">
          Dashboard
        </h1>

        <div className="flex items-center gap-4">
          {user && (
            <span className="text-sm text-muted-foreground">
              Logado como: <strong>{user.name}</strong>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button variant="default">Criar Empresa</Button>
            </DialogTrigger>

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

                {/* <div className="space-y-3">
                  <Label>Membros</Label>

                  {members.map((member, index) => (
                    <div key={index} className="flex gap-3 items-center">

                      <Select
                        value={member.userId}
                        onValueChange={(v) => {
                          handleMemberChange(index, "userId", v);
                        }}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Usuário" />
                        </SelectTrigger>
                        <SelectContent>
                          {allUsers.map((u) => (
                            <SelectItem key={u.id} value={u.id}>
                              {u.name} ({u.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={member.role}
                        onValueChange={(v: "OWNER" | "ADMIN" | "MEMBER") =>
                          handleMemberChange(index, "role", v)
                        }
                      >
                        <SelectTrigger className="w-36">
                          <SelectValue placeholder="Papel" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="OWNER">Owner</SelectItem>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                          <SelectItem value="MEMBER">Member</SelectItem>
                        </SelectContent>
                      </Select>

                      {index > 0 && (
                        <button
                          className="text-red-600 hover:text-red-800 hover:outline-2 outline-offset-1 px-2"
                          onClick={() => removeMember(index)}
                        >
                          <Image
                            className="dark:invert"
                            src="/trash.png"
                            alt="Next.js logo"
                            width={20}
                            height={20}
                            unoptimized
                          />
                        </button>
                      )}
                    </div>
                  ))}

                  <Button variant="secondary" onClick={addMemberField}>
                    Adicionar Membro
                  </Button>
                </div> */}
              </div>

              <DialogFooter>
                <Button onClick={handleCreateCompany}>Criar Empresa</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button variant="destructive" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </header>

      <main className="p-6">
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
