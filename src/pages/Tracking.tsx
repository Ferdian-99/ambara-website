import { FormEvent, useMemo, useState } from "react";
import { PageShell, Reveal, SectionLabel } from "../components";
import { trackingStages } from "../data";
import { isSupabaseConfigured, supabase, type Database } from "../lib/supabase";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
type ProjectUpdateRow = Database["public"]["Tables"]["project_updates"]["Row"];
type ProjectDocumentRow = Database["public"]["Tables"]["project_documents"]["Row"];
type ProjectPhotoRow = Database["public"]["Tables"]["project_photos"]["Row"];
type LookupState = "idle" | "loading" | "real" | "not_found" | "fallback";
const upcomingDocuments = ["Quotation", "Desain Final", "Invoice"];
const workflowPreview = ["Konsultasi", "Konsep Desain", "Produksi", "Finishing", "Instalasi"];

function formatDate(value: string | null) {
  if (!value) return "Menunggu konfirmasi";
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(value));
}

export function Tracking() {
  const [code, setCode] = useState("");
  const [searchedCode, setSearchedCode] = useState("");
  const [project, setProject] = useState<ProjectRow | null>(null);
  const [updates, setUpdates] = useState<ProjectUpdateRow[]>([]);
  const [documents, setDocuments] = useState<ProjectDocumentRow[]>([]);
  const [photos, setPhotos] = useState<ProjectPhotoRow[]>([]);
  const [lookupState, setLookupState] = useState<LookupState>("idle");

  const resetResult = () => {
    setProject(null);
    setUpdates([]);
    setDocuments([]);
    setPhotos([]);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const normalizedCode = code.trim().toUpperCase();
    setSearchedCode(normalizedCode);
    resetResult();

    if (!normalizedCode) {
      setLookupState("idle");
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      setLookupState("fallback");
      return;
    }

    setLookupState("loading");

    try {
      const { data, error } = await supabase.from("projects").select("*").eq("project_code", normalizedCode).maybeSingle();

      if (error) throw error;

      const projectData = data as ProjectRow | null;

      if (!projectData) {
        setLookupState("not_found");
        return;
      }

      const [{ data: updateRows }, { data: documentRows }, { data: photoRows }] = await Promise.all([
        supabase.from("project_updates").select("*").eq("project_id", projectData.id).order("created_at", { ascending: false }),
        supabase.from("project_documents").select("*").eq("project_id", projectData.id).order("created_at", { ascending: false }),
        supabase.from("project_photos").select("*").eq("project_id", projectData.id).order("created_at", { ascending: false }),
      ]);

      setProject(projectData);
      setUpdates(updateRows ?? []);
      setDocuments(documentRows ?? []);
      setPhotos(photoRows ?? []);
      setLookupState("real");
    } catch {
      resetResult();
      setLookupState("fallback");
    }
  };

  const activeIndex = useMemo(() => {
    if (!project) return -1;
    return Math.max(0, trackingStages.indexOf(project.current_stage));
  }, [project]);

  return (
    <PageShell
      eyebrow="Lacak Proyek"
      title="Lihat perkembangan proyek setelah kode diverifikasi."
      intro="Masukkan kode proyek dari tim AMBARA untuk melihat status, timeline, dokumen, dan foto progres yang tersedia."
    >
      <section className="section-wrap">
        <div className="tracking-panel">
          <div>
            <SectionLabel>Project Monitoring</SectionLabel>
            <h2 className="font-serif text-4xl">Masukkan kode proyek</h2>
            <p className="mt-4 leading-7 text-graphite/70">
              Pantau progres pekerjaan secara ringkas dan terarah setelah kode proyek Anda cocok dengan data AMBARA.
            </p>
            <p className="mt-4 text-sm text-graphite/60">Contoh kode: AMB-2026-001</p>
            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-champagne">Data proyek ditampilkan setelah kode diverifikasi.</p>
          </div>
          <form className="tracking-form" onSubmit={handleSubmit}>
            <input
              value={code}
              onChange={(event) => setCode(event.target.value)}
              aria-label="Kode proyek"
              placeholder="Masukkan kode proyek"
            />
            <button type="submit" disabled={lookupState === "loading"}>
              {lookupState === "loading" ? "Mencari..." : "Lacak"}
            </button>
          </form>
        </div>

        {lookupState === "not_found" && (
          <Reveal>
            <section className="timeline-card">
              <p className="text-xs uppercase tracking-[0.24em] text-champagne">Kode tidak ditemukan</p>
              <h2>Kode proyek tidak ditemukan.</h2>
              <p>Periksa kembali kode yang diberikan oleh tim Ambara.</p>
              {searchedCode && <p className="text-sm text-graphite/55">Kode yang dicari: {searchedCode}</p>}
            </section>
          </Reveal>
        )}

        {lookupState === "fallback" && (
          <Reveal>
            <section className="timeline-card">
              <p className="text-xs uppercase tracking-[0.24em] text-champagne">Belum dapat menampilkan data</p>
              <h2>Data proyek belum dapat diverifikasi saat ini.</h2>
              <p>Silakan coba kembali beberapa saat lagi atau hubungi tim Ambara untuk konfirmasi progres proyek.</p>
            </section>
          </Reveal>
        )}

        {lookupState === "real" && project && (
          <>
            <Reveal>
              <article className="mock-project-card">
                <div className="flex flex-col justify-between gap-8 md:flex-row md:items-start">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-champagne">Project Verified</p>
                    <h2 className="mt-3 font-serif text-4xl">{project.project_name}</h2>
                    <p className="mt-3 text-graphite/65">
                      Kode: {project.project_code} / Tipe: {project.project_type}
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 md:items-end">
                    <div className="status-badge">{project.current_stage}</div>
                    <p className="text-sm text-graphite/60">Estimasi selesai: {formatDate(project.estimated_completion)}</p>
                  </div>
                </div>

                <div className="project-monitor-grid">
                  <div><span>Status proyek</span><strong>{project.status}</strong></div>
                  <div><span>Lokasi</span><strong>{project.location ?? "Menunggu konfirmasi"}</strong></div>
                  <div><span>Estimasi selesai</span><strong>{formatDate(project.estimated_completion)}</strong></div>
                </div>

                <div className="mt-10">
                  <div className="mb-3 flex justify-between text-sm"><span>Progress proyek</span><strong>{project.progress_percentage}%</strong></div>
                  <div className="progress-track"><div style={{ width: `${project.progress_percentage}%` }} /></div>
                </div>

                <div className="mt-10 grid gap-3 md:grid-cols-9">
                  {trackingStages.map((stage, index) => (
                    <div key={stage} className={`stage-node ${index <= activeIndex ? "is-done" : ""}`}>
                      <span>{index + 1}</span>
                      <p>{stage}</p>
                    </div>
                  ))}
                </div>

                {project.notes && (
                  <div className="progress-note">
                    <strong>Progress notes</strong>
                    <p>{project.notes}</p>
                  </div>
                )}

                <div className="tracking-result-note">
                  Data berikut mengikuti pembaruan terakhir dari tim Ambara.
                </div>
              </article>
            </Reveal>

            <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <Reveal>
                <section className="timeline-card">
                  <h2>Timeline pembaruan</h2>
                  {updates.length ? (
                    updates.map((item) => (
                      <div key={item.id} className="timeline-row">
                        <span>{formatDate(item.created_at)}</span>
                        <p>{item.description ?? item.title}</p>
                      </div>
                    ))
                  ) : (
                    <div className="tracking-empty-state">
                      <div className="tracking-empty-marker" aria-hidden="true" />
                      <h3>Timeline belum diperbarui</h3>
                      <p>Tim Ambara akan menambahkan pembaruan setelah progress proyek berikutnya tersedia.</p>
                      <div className="workflow-preview" aria-label="Alur kerja proyek">
                        {workflowPreview.map((stage) => (
                          <span key={stage}>Alur kerja: {stage}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              </Reveal>
              <Reveal delay={0.06}>
                <section className="timeline-card">
                  <h2>Dokumen Proyek</h2>
                  {documents.length ? (
                    <div className="placeholder-grid">
                      {documents.map((item) => (
                        <a key={item.id} href={item.file_url} target="_blank" rel="noreferrer">
                          {item.file_name}<span>{item.file_type ?? "Dokumen"}</span>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="tracking-empty-state">
                      <div className="tracking-empty-marker" aria-hidden="true" />
                      <h3>Dokumen belum tersedia</h3>
                      <p>Quotation, desain final, dan invoice akan tampil di sini setelah diunggah oleh tim Ambara.</p>
                      <div className="document-chip-list" aria-label="Dokumen yang akan tersedia">
                        {upcomingDocuments.map((item) => (
                          <span key={item}>{item}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              </Reveal>
            </div>

            <Reveal>
              <section className="timeline-card">
                <h2>Workshop Progress Photo</h2>
                <p className="mb-6 leading-7 text-graphite/70">
                  Foto progres akan muncul saat tim AMBARA mengunggah dokumentasi terbaru dari workshop atau lokasi instalasi.
                </p>
                {photos.length ? (
                  <div className="workshop-grid">
                    {photos.map((item) => (
                      <figure key={item.id} className="overflow-hidden border border-charcoal/10 bg-linen">
                        <img src={item.image_url} alt={item.caption ?? "Foto progres proyek Ambara"} loading="lazy" className="aspect-[4/3] w-full object-cover" />
                        <figcaption className="p-4 text-sm text-graphite/65">{item.caption ?? "Progress proyek"}</figcaption>
                      </figure>
                    ))}
                  </div>
                ) : (
                  <div className="workshop-placeholder">
                    <img src="/assets/workshop-progress.png" alt="Dokumentasi workshop Ambara sebagai placeholder progres" loading="lazy" />
                    <div>
                      <span>Dokumentasi workshop</span>
                      <p>Foto progress akan muncul setelah tim mengunggah pembaruan terbaru.</p>
                    </div>
                  </div>
                )}
              </section>
            </Reveal>
          </>
        )}
      </section>
    </PageShell>
  );
}
