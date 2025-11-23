"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { User } from "@/interfaces";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function CompanyPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [company, setCompany] = useState<any>(null);

  const [allUsers, setAllUsers] = useState<any[]>([]);

  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<"OWNER" | "ADMIN" | "MEMBER">("MEMBER");

  async function getCompanyDetails(id: string) {
    const res = await fetch(api(`/company/${id}`), { credentials: "include" });

    if (!res.ok) return;

    const data = await res.json();
    setCompany(data);
  }

  async function loadUsers() {
    try {
      const res = await fetch(api("/users"), { credentials: "include" });

      if (!res.ok) return;

      const data = await res.json();
      const memberIds = company.members.map((m: any) => m.userId);

      setAllUsers(
        data.users
          .filter((usr: User) => usr.id !== user?.id)
          .filter((usr: User) => !memberIds.includes(usr.id))
      );
    } catch { }
  }

  async function inviteUser() {
    try {
      const userObj = allUsers.find(u => u.id === selectedUser);
      if (!userObj) {
        toast.error("Usuário inválido");
        return;
      }

      const response = await fetch(api(`/company/${id}/invite`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: userObj.email,
          role: selectedRole,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Erro ao enviar convite:", data);
        toast.error(data.message || "Erro ao enviar convite");
        return;
      }

      console.log("Convite enviado com sucesso:", data);
      toast.success("Convite enviado com sucesso!");
    } catch (error) {
      console.error("Erro de rede:", error);
      toast.error("Erro de rede ao enviar convite");
    }
  }

  useEffect(() => {
    if (id) getCompanyDetails(id as string);
  }, [id]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">
        Empresa: {company?.name}
      </h1>

      <div className="mb-6">
        <h2 className="text-xl font-medium">Membros</h2>
        <ul className="list-disc ml-6 mt-2">
          {company?.members?.map((m: any) => (
            <li key={m.id}>{m.user.name}</li>
          ))}
        </ul>
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="default"
            onClick={loadUsers}
          >
            Convidar usuário
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Convidar usuário para a empresa</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Usuário</Label>

              <Select
                value={selectedUser ?? undefined}
                onValueChange={(v) => setSelectedUser(v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um usuário" />
                </SelectTrigger>

                <SelectContent>
                  {allUsers.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Papel</Label>

              <Select
                value={selectedRole}
                onValueChange={(v: any) => setSelectedRole(v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o papel" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="OWNER">Owner</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="MEMBER">Member</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              disabled={!selectedUser}
              onClick={inviteUser}
            >
              Enviar convite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

