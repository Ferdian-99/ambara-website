import { useEffect, useMemo, useState } from "react";
import {
  archiveContactMessage,
  listContactMessages,
  markContactMessageFollowedUp,
  markContactMessageRead,
  restoreContactMessage,
  type ContactMessageFilter,
  type ContactMessageRow,
} from "../../lib/contactMessagesData";
import { useDashboardContext } from "./AdminLayout";

const filterOptions: { label: string; value: ContactMessageFilter }[] = [
  { label: "Aktif", value: "active" },
  { label: "Baru", value: "new" },
  { label: "Dibaca", value: "read" },
  { label: "Ditindaklanjuti", value: "followed_up" },
  { label: "Arsip", value: "archived" },
];

const statusLabels: Record<ContactMessageRow["status"], string> = {
  new: "Baru",
  read: "Dibaca",
  followed_up: "Ditindaklanjuti",
  archived: "Diarsipkan",
};

function formatDate(value: string | null) {
  if (!value) return "Belum tersedia";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function messagePreview(message: string) {
  return message.length > 140 ? `${message.slice(0, 140)}...` : message;
}

function whatsappUrl(phone: string, name: string) {
  const normalized = phone.replace(/[^\d]/g, "").replace(/^0/, "62");
  const text = encodeURIComponent(`Halo ${name}, terima kasih sudah menghubungi AMBARA. Kami ingin menindaklanjuti kebutuhan proyek interior Anda.`);
  return `https://wa.me/${normalized}?text=${text}`;
}

export function AdminMessages() {
  const { role } = useDashboardContext();
  const [messages, setMessages] = useState<ContactMessageRow[]>([]);
  const [filter, setFilter] = useState<ContactMessageFilter>("active");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const canManageMessages = role === "super_admin" || role === "sales";
  const selectedMessage = useMemo(() => messages.find((item) => item.id === expandedId) ?? null, [expandedId, messages]);

  const loadMessages = async () => {
    if (!canManageMessages) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      setMessages(await listContactMessages(filter));
    } catch {
      setError("Pesan masuk belum dapat dimuat. Coba refresh halaman atau hubungi pengelola sistem.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canManageMessages, filter]);

  const handleOpenMessage = async (message: ContactMessageRow) => {
    setExpandedId((current) => (current === message.id ? null : message.id));
    setError("");
    setSuccess("");

    if (message.status !== "new") return;

    setActionId(message.id);
    try {
      await markContactMessageRead(message.id);
      await loadMessages();
      setExpandedId(message.id);
    } catch {
      setError("Pesan belum dapat ditandai sebagai dibaca.");
    } finally {
      setActionId(null);
    }
  };

  const runAction = async (message: ContactMessageRow, action: "read" | "followed_up" | "archive" | "restore") => {
    if (action === "archive" && !window.confirm("Arsipkan pesan masuk ini?")) return;

    setActionId(message.id);
    setError("");
    setSuccess("");

    try {
      if (action === "read") await markContactMessageRead(message.id);
      if (action === "followed_up") await markContactMessageFollowedUp(message.id);
      if (action === "archive") await archiveContactMessage(message.id);
      if (action === "restore") await restoreContactMessage(message.id);
      setSuccess("Status pesan berhasil diperbarui.");
      await loadMessages();
    } catch {
      setError("Status pesan belum dapat diperbarui. Coba ulangi beberapa saat lagi.");
    } finally {
      setActionId(null);
    }
  };

  if (!canManageMessages) {
    return (
      <main className="dashboard-content">
        <section className="dashboard-panel">
          <p className="section-label">Akses terbatas</p>
          <h1 className="mt-4 font-serif text-4xl">Pesan masuk hanya untuk super admin dan sales.</h1>
          <p>Gunakan akun yang memiliki akses sales untuk membaca inquiry dari halaman kontak.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="dashboard-content">
      <div className="dashboard-heading">
        <div>
          <p className="section-label">Pesan Masuk</p>
          <h1>Inquiry dari halaman kontak.</h1>
          <p className="mt-5 max-w-3xl leading-7 text-graphite/70">
            Baca pesan calon client, tindak lanjuti melalui WhatsApp atau email, lalu arsipkan jika sudah selesai.
          </p>
        </div>
      </div>

      <section className="dashboard-panel">
        <div className="dashboard-panel-heading">
          <h2>Inbox</h2>
          <div className="dashboard-filter-toggle">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={filter === option.value ? "is-active" : ""}
                onClick={() => {
                  setFilter(option.value);
                  setExpandedId(null);
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {loading && <p className="dashboard-muted">Memuat pesan masuk...</p>}
        {error && <p className="dashboard-alert">{error}</p>}
        {success && <p className="dashboard-success">{success}</p>}
        {!loading && !error && messages.length === 0 && (
          <div className="dashboard-empty">
            <span>{filter === "archived" ? "Arsip pesan kosong" : "Belum ada pesan"}</span>
            <p>{filter === "archived" ? "Pesan yang diarsipkan akan tampil di sini." : "Inquiry dari halaman kontak akan tampil di sini."}</p>
          </div>
        )}

        {!loading && messages.map((message) => (
          <article key={message.id} className="dashboard-row">
            <div className="dashboard-item-topline">
              <span>{formatDate(message.created_at)} / {message.project_type ?? "Jenis proyek belum dipilih"}</span>
              <span className="dashboard-status-pill">{statusLabels[message.status]}</span>
            </div>
            <div className="mt-3 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
              <div className="min-w-0">
                <p><strong>{message.name}</strong></p>
                <p>{messagePreview(message.message)}</p>
                <p className="text-sm text-graphite/60">
                  {message.email ?? "Email belum diisi"} / {message.phone ?? "WhatsApp belum diisi"} / {message.budget_range ?? "Budget belum dipilih"}
                </p>
              </div>
              <div className="dashboard-action-row lg:justify-end">
                <button type="button" className="dashboard-ghost-button" disabled={actionId === message.id} onClick={() => void handleOpenMessage(message)}>
                  {selectedMessage?.id === message.id ? "Tutup" : "Buka Detail"}
                </button>
                {message.status !== "archived" ? (
                  <button type="button" className="dashboard-delete-button" disabled={actionId === message.id} onClick={() => void runAction(message, "archive")}>
                    Arsipkan
                  </button>
                ) : (
                  <button type="button" className="dashboard-ghost-button" disabled={actionId === message.id} onClick={() => void runAction(message, "restore")}>
                    Pulihkan
                  </button>
                )}
              </div>
            </div>

            {selectedMessage?.id === message.id && (
              <div className="mt-5 border border-charcoal/10 bg-ivory p-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-champagne">Kontak</p>
                    <p>{message.email ?? "Email belum diisi"}</p>
                    <p>{message.phone ?? "WhatsApp belum diisi"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-champagne">Kebutuhan</p>
                    <p>{message.project_type ?? "Jenis proyek belum dipilih"}</p>
                    <p>{message.budget_range ?? "Budget belum dipilih"}</p>
                  </div>
                </div>
                <div className="mt-5 border-t border-charcoal/10 pt-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-champagne">Pesan</p>
                  <p className="whitespace-pre-line">{message.message}</p>
                </div>
                <div className="dashboard-action-row mt-6">
                  {message.phone && (
                    <a className="dashboard-ghost-button" href={whatsappUrl(message.phone, message.name)} target="_blank" rel="noreferrer">
                      Chat WhatsApp
                    </a>
                  )}
                  {message.email && (
                    <a className="dashboard-ghost-button" href={`mailto:${message.email}`}>
                      Email
                    </a>
                  )}
                  {message.status !== "read" && message.status !== "archived" && (
                    <button type="button" className="dashboard-ghost-button" disabled={actionId === message.id} onClick={() => void runAction(message, "read")}>
                      Tandai Dibaca
                    </button>
                  )}
                  {message.status !== "followed_up" && message.status !== "archived" && (
                    <button type="button" className="dashboard-ghost-button" disabled={actionId === message.id} onClick={() => void runAction(message, "followed_up")}>
                      Tandai Ditindaklanjuti
                    </button>
                  )}
                </div>
              </div>
            )}
          </article>
        ))}
      </section>
    </main>
  );
}
