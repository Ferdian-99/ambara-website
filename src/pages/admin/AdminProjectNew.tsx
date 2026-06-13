import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { trackingStages } from "../../data";
import {
  createProjectRecord,
  fetchClients,
  normalizeProgress,
  type ClientRow,
} from "../../lib/projectData";
import { hasPermission } from "../../lib/rbac";
import type { ProjectStage, ProjectStatus } from "../../lib/supabase";
import { useDashboardContext } from "./AdminLayout";

const projectStatuses: ProjectStatus[] = ["draft", "active", "on_hold", "completed", "cancelled"];

const initialForm = {
  client_id: "",
  project_code: "",
  project_name: "",
  project_type: "",
  location: "",
  budget_range: "",
  current_stage: "Konsultasi" as ProjectStage,
  progress_percentage: "0",
  status: "active" as ProjectStatus,
  estimated_completion: "",
  notes: "",
};

export function AdminProjectNew() {
  const { role } = useDashboardContext();
  const navigate = useNavigate();
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const canCreate = hasPermission(role, "projects:create");

  useEffect(() => {
    if (!canCreate) {
      setLoading(false);
      return;
    }

    let mounted = true;
    fetchClients()
      .then((rows) => {
        if (mounted) setClients(rows);
      })
      .catch(() => {
        if (mounted) setError("Daftar client belum dapat dimuat.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [canCreate]);

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.client_id || !form.project_code.trim() || !form.project_name.trim() || !form.project_type.trim()) {
      setError("Client, kode proyek, nama proyek, dan tipe proyek wajib diisi.");
      return;
    }

    setSaving(true);
    try {
      const project = await createProjectRecord({
        client_id: form.client_id,
        project_code: form.project_code.trim().toUpperCase(),
        project_name: form.project_name.trim(),
        project_type: form.project_type.trim(),
        location: form.location.trim() || null,
        budget_range: form.budget_range.trim() || null,
        current_stage: form.current_stage,
        progress_percentage: normalizeProgress(Number(form.progress_percentage)),
        status: form.status,
        estimated_completion: form.estimated_completion || null,
        notes: form.notes.trim() || null,
      });
      setSuccess("Data proyek berhasil dibuat.");
      navigate(`/admin/projects/${project.id}`);
    } catch {
      setError("Data proyek belum dapat disimpan. Pastikan kode proyek unik dan data sudah benar.");
    } finally {
      setSaving(false);
    }
  };

  if (!canCreate) {
    return (
      <main className="dashboard-content">
        <section className="dashboard-panel">
          <p className="section-label">Akses terbatas</p>
          <h1 className="mt-4 font-serif text-4xl">Role ini tidak dapat membuat proyek.</h1>
          <p>Silakan gunakan akun super admin, project manager, atau sales untuk membuat record proyek.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="dashboard-content">
      <div className="dashboard-heading">
        <div>
          <p className="section-label">Proyek Baru</p>
          <h1>Buat data proyek atau order baru.</h1>
        </div>
      </div>

      <section className="dashboard-panel">
        {loading ? (
          <p className="dashboard-muted">Memuat client...</p>
        ) : (
          <>
            {clients.length === 0 && (
              <div className="dashboard-empty mb-6">
                <span>Client belum tersedia</span>
                <p>Buat data client terlebih dahulu sebelum membuat proyek.</p>
                <Link className="btn-secondary mt-5 inline-flex" to="/admin/clients">
                  Buka Clients
                </Link>
              </div>
            )}
            {error && <p className="dashboard-alert">{error}</p>}
            {success && <p className="dashboard-success">{success}</p>}
            <form className="dashboard-form" onSubmit={handleSubmit}>
              <label>
                Client
                <select value={form.client_id} onChange={(event) => updateField("client_id", event.target.value)}>
                  <option value="">Pilih client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name} - {client.email}
                    </option>
                  ))}
                </select>
              </label>
              <div className="form-grid">
                <label>
                  Kode proyek
                  <input value={form.project_code} onChange={(event) => updateField("project_code", event.target.value)} placeholder="AMB-2026-002" />
                </label>
                <label>
                  Nama proyek
                  <input value={form.project_name} onChange={(event) => updateField("project_name", event.target.value)} placeholder="Nama proyek" />
                </label>
              </div>
              <div className="form-grid">
                <label>
                  Tipe proyek
                  <input value={form.project_type} onChange={(event) => updateField("project_type", event.target.value)} placeholder="Built-in Furniture" />
                </label>
                <label>
                  Lokasi
                  <input value={form.location} onChange={(event) => updateField("location", event.target.value)} placeholder="Jakarta Selatan" />
                </label>
              </div>
              <label>
                Rentang budget
                <input value={form.budget_range} onChange={(event) => updateField("budget_range", event.target.value)} placeholder="IDR 25-50 juta" />
              </label>
              <div className="form-grid three">
                <label>
                  Tahap saat ini
                  <select value={form.current_stage} onChange={(event) => updateField("current_stage", event.target.value as ProjectStage)}>
                    {trackingStages.map((stage) => (
                      <option key={stage} value={stage}>
                        {stage}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Persentase progress
                  <input
                    type="number"
                    value={form.progress_percentage}
                    onChange={(event) => updateField("progress_percentage", event.target.value)}
                    min={0}
                    max={100}
                  />
                </label>
                <label>
                  Status
                  <select value={form.status} onChange={(event) => updateField("status", event.target.value as ProjectStatus)}>
                    {projectStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label>
                Estimasi selesai
                <input type="date" value={form.estimated_completion} onChange={(event) => updateField("estimated_completion", event.target.value)} />
              </label>
              <label>
                Catatan
                <textarea value={form.notes} onChange={(event) => updateField("notes", event.target.value)} placeholder="Catatan awal proyek" />
              </label>
              <button type="submit" disabled={saving || clients.length === 0}>
                {saving ? "Menyimpan..." : "Simpan Proyek"}
              </button>
            </form>
          </>
        )}
      </section>
    </main>
  );
}
