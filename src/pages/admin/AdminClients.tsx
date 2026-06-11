import { FormEvent, useEffect, useState } from "react";
import {
  createClientRecord,
  fetchClientLinkProfiles,
  fetchClients,
  inviteClientToPortal,
  updateClientPortalUser,
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
  const [linkingId, setLinkingId] = useState<string | null>(null);
  const [invitingId, setInvitingId] = useState<string | null>(null);
  const [linkInputs, setLinkInputs] = useState<Record<string, string>>({});
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
      setLinkInputs(Object.fromEntries(clientRows.map((client) => [client.id, client.user_id ?? ""])));
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

  const updateLinkInput = (clientId: string, value: string) => {
    setLinkInputs((current) => ({ ...current, [clientId]: value }));
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

  const handleLinkSubmit = async (event: FormEvent, client: ClientRow) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLinkingId(client.id);

    try {
      const nextUserId = linkInputs[client.id]?.trim() || null;
      await updateClientPortalUser(client.id, nextUserId);
      setSuccess(nextUserId ? `Portal client ${client.name} berhasil dihubungkan.` : `Portal client ${client.name} dilepas dari User UID.`);
      await loadClients();
    } catch {
      setError("User UID belum dapat disimpan. Pastikan UID valid dan role memiliki akses update client.");
    } finally {
      setLinkingId(null);
    }
  };

  const handleInviteClient = async (client: ClientRow) => {
    setError("");
    setSuccess("");

    if (!client.email?.trim()) {
      setError("Email client wajib diisi sebelum mengirim undangan portal.");
      return;
    }

    setInvitingId(client.id);
    try {
      const result = await inviteClientToPortal(client.id);
      setSuccess(result.message ?? "Undangan portal berhasil dikirim.");
      setLinkInputs((current) => ({ ...current, [client.id]: result.user_id }));
      await loadClients();
    } catch (inviteError) {
      setError(inviteError instanceof Error ? inviteError.message : "Undangan portal belum dapat dikirim.");
    } finally {
      setInvitingId(null);
    }
  };

  const getAccountMeta = (client: ClientRow) => {
    if (client.user_id) {
      return {
        status: "Portal aktif",
        detail: "Linked account",
      };
    }

    if (!client.email?.trim()) {
      return {
        status: "Email belum tersedia",
        detail: "Missing email",
      };
    }

    return {
      status: "Belum terhubung",
      detail: "Email available",
    };
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
          <p className="mt-5 max-w-3xl leading-7 text-graphite/70">
            Data client menyimpan informasi proyek. Akun portal dibuat melalui Supabase Auth dan harus dihubungkan dengan User UID client.
            Undangan portal memungkinkan client membuat password sendiri melalui email.
          </p>
        </div>
      </div>

      <section className="dashboard-grid">
        <article className="dashboard-panel">
          <h2>Daftar Client</h2>
          {loading && <p className="dashboard-muted">Memuat client...</p>}
          {error && <p className="dashboard-alert">{error}</p>}
          {success && <p className="dashboard-success">{success}</p>}
          {!loading && !error && clients.length === 0 && (
            <div className="dashboard-empty">
              <span>Belum ada client</span>
              <p>Client record akan tampil setelah dibuat oleh tim sales atau super admin.</p>
            </div>
          )}
          {!loading && clients.map((client) => (
            <div key={client.id} className="dashboard-row">
              {(() => {
                const account = getAccountMeta(client);
                return (
                  <div className="mb-4 flex flex-wrap items-center gap-3">
                    <span className="dashboard-status-pill">{account.status}</span>
                    <span>{account.detail}</span>
                  </div>
                );
              })()}
              <span>{client.address ?? "Alamat belum diisi"}</span>
              <p>
                <strong>{client.name}</strong> - {client.email}
              </p>
              <p>{client.phone ?? "Nomor telepon belum diisi"}</p>
              {canCreate && !client.user_id && client.email?.trim() && (
                <button
                  type="button"
                  className="dashboard-invite-button"
                  onClick={() => void handleInviteClient(client)}
                  disabled={invitingId === client.id}
                >
                  {invitingId === client.id ? "Mengirim undangan..." : "Kirim Undangan Portal"}
                </button>
              )}
              {client.user_id && <p className="dashboard-muted compact">Portal aktif. Client dapat login dan melihat semua proyek yang terhubung ke client record ini.</p>}
              {canCreate && (
                <form className="dashboard-link-form" onSubmit={(event) => handleLinkSubmit(event, client)}>
                  <label>
                    Supabase User UID
                    <input
                      value={linkInputs[client.id] ?? ""}
                      onChange={(event) => updateLinkInput(client.id, event.target.value)}
                      placeholder="00000000-0000-0000-0000-000000000000"
                    />
                  </label>
                  <p>Isi dengan User UID dari Supabase Authentication agar client dapat login ke portal.</p>
                  <button type="submit" disabled={linkingId === client.id}>
                    {linkingId === client.id ? "Menyimpan..." : "Simpan UID"}
                  </button>
                </form>
              )}
            </div>
          ))}
        </article>

        <article className="dashboard-panel">
          <h2>Buat Client</h2>
          <p>
            Data client menyimpan informasi proyek. Akun portal dibuat melalui Supabase Auth dan harus dihubungkan dengan User UID client.
          </p>
          {canCreate ? (
            <form className="dashboard-form compact" onSubmit={handleSubmit}>
              {success && <p className="dashboard-success">{success}</p>}
              <label>
                Supabase User UID
                <input
                  list="client-profile-uids"
                  value={form.user_id}
                  onChange={(event) => updateField("user_id", event.target.value)}
                  placeholder="Kosongkan jika akun portal belum dibuat"
                />
                <datalist id="client-profile-uids">
                  {profiles.map((profile) => (
                    <option key={profile.id} value={profile.id} label={`${profile.full_name} - ${profile.email} (${profile.role})`} />
                  ))}
                </datalist>
                <small>Isi dengan User UID dari Supabase Authentication agar client dapat login ke portal.</small>
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
