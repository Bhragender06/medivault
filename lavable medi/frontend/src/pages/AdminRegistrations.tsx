import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

type RegistrationRow = Record<string, unknown>;

export default function AdminRegistrations() {
  const q = useQuery({
    queryKey: ["admin-registrations"],
    queryFn: async () => {
      const { data } = await api.get("/api/admin/registrations");
      return data as { success: true; registrations: RegistrationRow[] };
    },
  });

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold">Registrations Export</h1>
        {q.isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : null}
        {q.isError ? <p className="text-sm text-destructive">Failed to load.</p> : null}
        {q.data ? (
          <pre className="card-medical overflow-auto text-xs p-4">{JSON.stringify(q.data.registrations, null, 2)}</pre>
        ) : null}
      </div>
    </DashboardLayout>
  );
}

