import { FormEvent, useEffect, useState } from "react";
import {
  createClientRecord,
  fetchClientLinkProfiles,
  fetchClients,
  type ClientRow,
  type ProfileRow,
} from "../../lib/projectData";
import { hasPermission } from "../../lib/rbac";
import { useDashboardContext } from "./AdminLayout";

const initialForm = {
  user_id: "",
  name: "",
  email: "",
  phone: "",
  address: "",
};

export function AdminClients() {
  const { role } = useDashboardContext();
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const canView = hasPermission(role, "clients:view");
  const canCreate = hasPermission(role, "clients:create");

  const loadClients = async () => {
    if (!canView) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const [clientRows, profileRows] = await Promise.all([fetchClients(), fetchClientLinkProfiles()]);
      setClients(clientRows);
      setProfiles(profileRows);
    } catch {
      setError("Data client belum dapat dimuat. Periksa koneksi atau konfigurasi RLS.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canView]);

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name.trim() || !form.email.trim()) {
      setError("Nama dan email client wajib diisi.");
      return;
    }

    setSaving(true);
    try {
      await createClientRecord({
        user_id: form.user_id || null,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        address: form.address.trim() || null,
      });
      setForm(initialForm);
      setSuccess("Client record berhasil dibuat.");
      await loadClients();
    } catch {
      setError("Client belum dapat disimpan. Pastikan role memiliki akses dan data sudah benar.");
    } finally {
      setSaving(false);
    }
  };

  if (!canView) {
    return (
      <main className="dashboard-content">
        <section className="dashboard-panel">
          <p className="section-label">Akses terbatas</p>
          <h1 className="mt-4 font-serif text-4xl">Role ini tidak dapat mengelola client.</h1>
          <p>Client record dikelola oleh super admin dan sales pada fase MVP ini.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="dashboard-content">
      <div className="dashboard-heading">
        <div>
          <p className="section-label">Clients</p>
          <h1>Client records untuk proyek AMBARA.</h1>
        </div>
      </div>

      <section className="dashboard-grid">
        <article className="dashboard-panel">
          <h2>Daftar Client</h2>
          {loading && <p className="dashboard-muted">Memuat client...</p>}
          {error && <p className="dashboard-alert">{error}</p>}
          {!loading && !error && clients.length === 0 && (
            <div className="dashboard-empty">
              <span>Belum ada client</span>
              <p>Client record akan tampil setelah dibuat oleh tim sales atau super admin.</p>
            </div>
          )}
          {!loading && clients.map((client) => (
            <div key={client.id} className="dashboard-row">
              <span>{client.address ?? "Alamat belum diisi"}</span>
              <p>
                <strong>{client.name}</strong> - {client.email}
              </p>
              <p>{client.phone ?? "Nomor telepon belum diisi"} {client.user_id ? "/ Terhubung ke auth user" : "/ Belum terhubung ke auth user"}</p>
            </div>
          ))}
        </article>

        <article className="dashboard-panel">
          <h2>Buat Client</h2>
          {canCreate ? (
            <form className="dashboard-form compact" onSubmit={handleSubmit}>
              {success && <p className="dashboard-success">{success}</p>}
              <label>
                Link ke auth user
                <select value={form.user_id} onChange={(event) => updateField("user_id", event.target.value)}>
                  <option value="">Tidak dihubungkan dulu</option>
                  {profiles.map((profile) => (
                    <option key={profile.id} value={profile.id}>
                      {profile.full_name} - {profile.email} ({profile.role})
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Nama
                <input value={form.name} onChange={(event) => updateField("name", event.target.value)} placeholder="Nama client" />
              </label>
              <label>
                Email
                <input type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} placeholder="client@email.com" />
              </label>
              <label>
                Phone
                <input value={form.phone} onChange={(event) => updateField("phone", event.target.value)} placeholder="+62..." />
              </label>
              <label>
                Address
                <textarea value={form.address} onChange={(event) => updateField("address", event.target.value)} placeholder="Alamat client atau lokasi utama" />
              </label>
              <button type="submit" disabled={saving}>
                {saving ? "Menyimpan..." : "Simpan Client"}
              </button>
            </form>
          ) : (
            <p>Role ini dapat melihat client, tetapi tidak dapat membuat client record baru.</p>
          )}
        </article>
      </section>
    </main>
  );
}
