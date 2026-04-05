import { api } from "./client";

export type User = {
  id: number;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: "patient" | "doctor" | "admin";
  is_admin: boolean;
};

export async function register(payload: {
  email: string;
  password: string;
  full_name?: string;
  phone?: string;
  role: "patient" | "doctor" | "admin";
}) {
  const { data } = await api.post("/api/auth/register", payload);
  return data as { success: true; user: User; access_token: string; refresh_token: string };
}

export async function login(payload: { email: string; password: string }) {
  const { data } = await api.post("/api/auth/login", payload);
  return data as { success: true; user: User; access_token: string; refresh_token: string };
}

export async function me() {
  const { data } = await api.get("/api/auth/me");
  return data as { success: true; user: User };
}

