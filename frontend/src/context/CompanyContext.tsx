"use client";

import { createContext, useContext, useState } from "react";
import { Company } from "@/interfaces";

type CompanyContextProps = {
  companies: Company[];
  setCompanies: (companies: Company[]) => void;
};

const CompanyContext = createContext<CompanyContextProps | null>(null);

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const [companies, setCompanies] = useState<Company[]>([]);

  return (
    <CompanyContext.Provider value={{ companies, setCompanies }}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompanies() {
  const ctx = useContext(CompanyContext);
  if (!ctx) throw new Error("useCompanies must be used inside <CompanyProvider>");
  return ctx;
}
