export interface Company {
  id: string;
  name: string;
  logoUrl?: string | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Invite {
  id: string;
  email: string;
  companyId: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  token: string;
  used: boolean;
  userId: string | null;
  createdAt: string;
  expiresAt: string;

  company: {
    id: string;
    name: string;
    logoUrl: string | null;
    createdAt: string;
    updatedAt: string;
  };
}
