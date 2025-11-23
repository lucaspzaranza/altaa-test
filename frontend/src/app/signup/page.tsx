"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { api } from "@/lib/api";

const SignupSchema = z.object({
  name: z.string().min(2, "Nome muito curto"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

type SignupValues = z.infer<typeof SignupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<SignupValues>({
    resolver: zodResolver(SignupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: SignupValues) {
    try {
      setLoading(true);

      const res = await fetch(api("/auth/signup"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const error = await res.json();
        toast.error(error.message || "Erro ao criar conta");
        return;
      }

      toast.success("Conta criada com sucesso!");
      router.push("/login");

    } catch (err) {
      toast.error("Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4 bg-muted/40">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-center">
            Criar Conta
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input placeholder="seu@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Criando..." : "Criar Conta"}
              </Button>

            </form>
          </Form>

          <p className="text-sm text-center mt-4 text-muted-foreground">
            Já tem uma conta?{" "}
            <a href="/login" className="underline">
              Fazer login
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
