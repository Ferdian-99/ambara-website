import { FormEvent, useEffect, useState } from "react";
import {
  archiveClient,
  createClientRecord,
  fetchClients,
  inviteClientToPortal,
  restoreClient,
  updateClient,
  type ArchiveFilter,
  type ClientRow,
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
  const [form, setForm] = useState(initialForm);
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "", address: "" });
  const [filter, setFilter] = useState<ArchiveFilter>("active");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [archivingId, setArchivingId] = useState<string | null>(null);
  const [invitingId, setInvitingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const canView = hasPermission(role, "clients:view");
  const canCreate = hasPermission(role, "clients:create");
  const canArchive = role === "super_admin";

  const loadClients = async () => {
    if (!canView) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const clientRows = await fetchClients(filter);
      setClients(clientRows);
    } catch {
      setError("Data client belum dapat dimuat. Coba refresh halaman atau hubungi pengelola sistem.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canView, filter]);

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
    setSuccess("");
  };

  const startEdit = (client: ClientRow) => {
    setEditingId(client.id);
    setEditForm({
      name: client.name,
      email: client.email,
      phone: client.phone ?? "",
      address: client.address ?? "",
    });
    setError("");
    setSuccess("");
  };

  const updateEditField = (field: keyof typeof editForm, value: string) => {
    setEditForm((current) => ({ ...current, [field]: value }));
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
      setError("Client belum dapat disimpan. Periksa data dan coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  const handleEditClient = async (event: FormEvent) => {
    event.preventDefault();
    if (!editingId) return;

    setError("");
    setSuccess("");

    if (!editForm.name.trim() || !editForm.email.trim()) {
      setError("Nama dan email client wajib diisi.");
      return;
    }

    setSavingEdit(true);
    try {
      await updateClient(editingId, {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        phone: editForm.phone.trim() || null,
        address: editForm.address.trim() || null,
      });
      setEditingId(null);
      setSuccess("Data client berhasil diperbarui.");
      await loadClients();
    } catch (editError) {
      setError(editError instanceof Error ? editError.message : "Data client belum dapat diperbarui.");
    } finally {
      setSavingEdit(false);
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
      await loadClients();
    } catch (inviteError) {
      setError(inviteError instanceof Error ? inviteError.message : "Undangan portal belum dapat dikirim.");
    } finally {
      setInvitingId(null);
    }
  };

  const handleArchiveClient = async (client: ClientRow) => {
    if (!window.confirm("Arsipkan client ini? Data proyek dan akun portal tidak akan dihapus.")) return;

    setArchivingId(client.id);
    setError("");
    setSuccess("");
    try {
      await archiveClient(client.id);
      setSuccess("Client berhasil diarsipkan.");
      await loadClients();
    } catch (archiveError) {
      setError(archiveError instanceof Error ? archiveError.message : "Client belum dapat diarsipkan.");
    } finally {
      setArchivingId(null);
    }
  };

  const handleRestoreClient = async (client: ClientRow) => {
    if (!window.confirm("Pulihkan client ini ke daftar aktif?")) return;

    setArchivingId(client.id);
    setError("");
    setSuccess("");
    try {
      await restoreClient(client.id);
      setSuccess("Client berhasil dipulihkan.");
      await loadClients();
    } catch (restoreError) {
      setError(restoreError instanceof Error ? restoreError.message : "Client belum dapat dipulihkan.");
    } finally {
      setArchivingId(null);
    }
  };

  const getAccountMeta = (client: ClientRow) => {
    if (!client.email?.trim()) {
      return {
        status: "EMAIL BELUM TERSEDIA",
        canInvite: false,
        canAttemptInvite: true,
      };
    }

    if (!client.user_id) {
      return {
        status: "BELUM TERHUBUNG",
        canInvite: true,
        canAttemptInvite: true,
      };
    }

    if (!client.portal_activated_at) {
      return {
        status: "UNDANGAN TERKIRIM",
        canInvite: false,
        canAttemptInvite: false,
      };
    }

    return {
      status: "PORTAL AKTIF",
      canInvite: false,
      canAttemptInvite: false,
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
          <h1>Data client untuk proyek AMBARA.</h1>
          <p className="mt-5 max-w-3xl leading-7 text-graphite/70">
            Kelola data client, kirim undangan portal, dan pantau status aktivasi akun dengan ringkas.
          </p>
        </div>
      </div>

      <section className="dashboard-grid">
        <article className="dashboard-panel">
          <div className="dashboard-panel-heading">
            <h2>Daftar Client</h2>
            <div className="dashboard-filter-toggle">
              <button type="button" className={filter === "active" ? "is-active" : ""} onClick={() => setFilter("active")}>Aktif</button>
              <button type="button" className={filter === "archived" ? "is-active" : ""} onClick={() => setFilter("archived")}>Arsip</button>
            </div>
          </div>
          {loading && <p className="dashboard-muted">Memuat client...</p>}
          {error && <p className="dashboard-alert">{error}</p>}
          {success && <p className="dashboard-success">{success}</p>}
          {!loading && !error && clients.length === 0 && (
            <div className="dashboard-empty">
              <span>{filter === "archived" ? "Arsip kosong" : "Belum ada client"}</span>
              <p>{filter === "archived" ? "Client yang diarsipkan akan tampil di sini." : "Data client akan tampil setelah dibuat oleh tim sales atau super admin."}</p>
            </div>
          )}
          {!loading && clients.map((client) => (
            <div key={client.id} className="dashboard-client-card">
              {(() => {
                const account = getAccountMeta(client);
                return (
                  <div className="dashboard-client-main">
                    <div className="dashboard-client-profile">
                      <span>Client</span>
                      <h3>{client.name}</h3>
                      {client.archived_at && <span className="dashboard-status-pill mt-3">DIARSIPKAN</span>}
                      <div className="dashboard-client-meta">
                        <p>{client.email || "Email belum diisi"}</p>
                        <p>{client.phone ?? "Nomor telepon belum diisi"}</p>
                        <p>{client.address ?? "Alamat belum diisi"}</p>
                      </div>
                    </div>

                    <div className="dashboard-portal-panel">
                      <span className="dashboard-status-pill">{account.status}</span>
                      {canCreate && account.canAttemptInvite && (
                        <button
                          type="button"
                          className="dashboard-invite-button"
                          onClick={() => void handleInviteClient(client)}
                          disabled={!account.canInvite || invitingId === client.id}
                        >
                          {invitingId === client.id ? "Mengirim undangan..." : "Kirim Undangan Portal"}
                        </button>
                      )}
                      <div className="dashboard-action-row">
                        {canCreate && (
                          <button type="button" className="dashboard-ghost-button" onClick={() => startEdit(client)}>
                            Edit
                          </button>
                        )}
                        {canArchive && !client.archived_at && (
                          <button
                            type="button"
                            className="dashboard-delete-button"
                            onClick={() => void handleArchiveClient(client)}
                            disabled={archivingId === client.id}
                          >
                            {archivingId === client.id ? "Mengarsipkan..." : "Arsipkan"}
                          </button>
                        )}
                        {canArchive && client.archived_at && (
                          <button
                            type="button"
                            className="dashboard-ghost-button"
                            onClick={() => void handleRestoreClient(client)}
                            disabled={archivingId === client.id}
                          >
                            {archivingId === client.id ? "Memulihkan..." : "Pulihkan"}
                          </button>
                        )}
                      </div>
                    </div>
                    {editingId === client.id && (
                      <form className="dashboard-link-form dashboard-client-edit" onSubmit={handleEditClient}>
                        <div className="form-grid">
                          <label>
                            Nama
                            <input value={editForm.name} onChange={(event) => updateEditField("name", event.target.value)} />
                          </label>
                          <label>
                            Email
                            <input type="email" value={editForm.email} onChange={(event) => updateEditField("email", event.target.value)} />
                          </label>
                        </div>
                        <div className="form-grid">
                          <label>
                            Phone
                            <input value={editForm.phone} onChange={(event) => updateEditField("phone", event.target.value)} />
                          </label>
                          <label>
                            Address
                            <input value={editForm.address} onChange={(event) => updateEditField("address", event.target.value)} />
                          </label>
                        </div>
                        <div className="dashboard-action-row">
                          <button type="submit" disabled={savingEdit}>{savingEdit ? "Menyimpan..." : "Simpan Perubahan"}</button>
                          <button type="button" onClick={() => setEditingId(null)}>Batal</button>
                        </div>
                      </form>
                    )}
                  </div>
                );
              })()}
            </div>
          ))}
        </article>

        <article className="dashboard-panel">
          <h2>Buat Client</h2>
          <p>
            Buat data client terlebih dahulu, lalu kirim undangan portal melalui daftar client setelah email tersedia.
          </p>
          {canCreate ? (
            <form className="dashboard-form compact" onSubmit={handleSubmit}>
              {success && <p className="dashboard-success">{success}</p>}
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
