import { useEffect, useMemo, useState } from "react";
import { PageShell, Reveal, SectionLabel } from "../components";
import { trackingStages } from "../data";
import { isSupabaseConfigured, supabase, type Database } from "../lib/supabase";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
type ProjectUpdateRow = Database["public"]["Tables"]["project_updates"]["Row"];
type ProjectDocumentRow = Database["public"]["Tables"]["project_documents"]["Row"];
type ProjectPhotoRow = Database["public"]["Tables"]["project_photos"]["Row"];

export function Tracking() {
  const [code, setCode] = useState("AMB-2026-001");
  const [submittedCode, setSubmittedCode] = useState("AMB-2026-001");
  const [project, setProject] = useState<ProjectRow | null>(null);
  const [updates, setUpdates] = useState<ProjectUpdateRow[]>([]);
  const [documents, setDocuments] = useState<ProjectDocumentRow[]>([]);
  const [photos, setPhotos] = useState<ProjectPhotoRow[]>([]);
  const [lookupState, setLookupState] = useState<"mock" | "loading" | "real" | "not_found">("mock");

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase || !submittedCode.trim()) {
      setLookupState("mock");
      return;
    }

    let mounted = true;
    setLookupState("loading");

    async function loadProject() {
      const { data } = await supabase!
        .from("projects")
        .select("*")
        .eq("project_code", submittedCode.trim().toUpperCase())
        .maybeSingle();

      const projectData = data as ProjectRow | null;

      if (!mounted) return;

      if (!projectData) {
        setProject(null);
        setUpdates([]);
        setDocuments([]);
        setPhotos([]);
        setLookupState("not_found");
        return;
      }

      const [{ data: updateRows }, { data: documentRows }, { data: photoRows }] = await Promise.all([
        supabase!.from("project_updates").select("*").eq("project_id", projectData.id).order("created_at", { ascending: false }),
        supabase!.from("project_documents").select("*").eq("project_id", projectData.id).order("created_at", { ascending: false }),
        supabase!.from("project_photos").select("*").eq("project_id", projectData.id).order("created_at", { ascending: false }),
      ]);

      if (!mounted) return;
      setProject(projectData);
      setUpdates(updateRows ?? []);
      setDocuments(documentRows ?? []);
      setPhotos(photoRows ?? []);
      setLookupState("real");
    }

    loadProject().catch(() => {
      if (mounted) setLookupState("mock");
    });

    return () => {
      mounted = false;
    };
  }, [submittedCode]);

  const displayProject = useMemo(
    () => ({
      title: project?.project_name ?? "Residensi Senja - Built-in Living Cabinet",
      code: project?.project_code ?? (submittedCode || "AMB-2026-001"),
      stage: project?.current_stage ?? "Produksi",
      progress: project?.progress_percentage ?? 58,
      completion: project?.estimated_completion ?? "28 Juli 2026",
      notes:
        project?.notes ??
        "Panel kabinet utama sudah masuk tahap produksi. Tim workshop sedang menyelesaikan struktur dasar sebelum masuk proses veneer dan finishing akhir.",
    }),
    [project, submittedCode],
  );

  const activeIndex = Math.max(0, trackingStages.indexOf(displayProject.stage));
  const progress = displayProject.progress;

  return (
    <PageShell
      eyebrow="Lacak Proyek"
      title="Preview pelacakan proyek untuk pengalaman klien yang lebih jelas."
      intro="Halaman ini adalah mock frontend publik. Belum ada backend, database, login, atau data proyek sungguhan."
    >
      <section className="section-wrap">
        <div className="tracking-panel">
          <div>
            <SectionLabel>Project Monitoring</SectionLabel>
            <h2 className="font-serif text-4xl">Masukkan kode proyek</h2>
            <p className="mt-4 leading-7 text-graphite/70">
              Gunakan contoh kode <strong>AMB-2026-001</strong> untuk melihat simulasi progres produksi.
            </p>
          </div>
          <form
            className="tracking-form"
            onSubmit={(event) => {
              event.preventDefault();
              setSubmittedCode(code);
            }}
          >
            <input value={code} onChange={(event) => setCode(event.target.value)} aria-label="Kode proyek" />
            <button type="submit">{lookupState === "loading" ? "Mencari..." : "Lacak"}</button>
          </form>
        </div>

        <Reveal>
          <article className="mock-project-card">
            <div className="flex flex-col justify-between gap-8 md:flex-row md:items-start">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-champagne">
                  {lookupState === "real" ? "Real Project" : "Mock Project"}
                </p>
                <h2 className="mt-3 font-serif text-4xl">{displayProject.title}</h2>
                <p className="mt-3 text-graphite/65">Client: Nama Klien / Kode: {displayProject.code}</p>
                {lookupState === "not_found" && (
                  <p className="mt-4 max-w-2xl text-sm leading-6 text-graphite/65">
                    Kode belum ditemukan di database. Preview mock tetap ditampilkan agar pengalaman publik tidak terputus.
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-3 md:items-end">
                <div className="status-badge">{displayProject.stage}</div>
                <p className="text-sm text-graphite/60">Last update: 10 Juni 2026</p>
              </div>
            </div>

            <div className="project-monitor-grid">
              <div><span>Payment status</span><strong>DP diterima / Termin produksi menunggu approval</strong></div>
              <div><span>Project PIC</span><strong>Nadia S. - Project Coordinator</strong></div>
              <div><span>Estimated completion</span><strong>{displayProject.completion}</strong></div>
            </div>

            <div className="mt-10">
              <div className="mb-3 flex justify-between text-sm"><span>Progress proyek</span><strong>{progress}%</strong></div>
              <div className="progress-track"><div style={{ width: `${progress}%` }} /></div>
            </div>

            <div className="mt-10 grid gap-3 md:grid-cols-9">
              {trackingStages.map((stage, index) => (
                <div key={stage} className={`stage-node ${index <= activeIndex ? "is-done" : ""}`}>
                  <span>{index + 1}</span>
                  <p>{stage}</p>
                </div>
              ))}
            </div>

            <div className="progress-note">
              <strong>Progress notes</strong>
              <p>{displayProject.notes}</p>
            </div>
          </article>
        </Reveal>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Reveal>
            <section className="timeline-card">
              <h2>Timeline pembaruan</h2>
              {(updates.length
                ? updates.map((item) => [new Date(item.created_at).toLocaleDateString("id-ID"), item.description ?? item.title])
                : [
                    ["10 Juni 2026", "Produksi kabinet utama dimulai setelah approval material."],
                    ["06 Juni 2026", "Revisi detail handle dan proporsi panel disetujui."],
                    ["31 Mei 2026", "Konsep desain dan material board dikirim ke klien."],
                  ]
              ).map(([date, text]) => <div key={`${date}-${text}`} className="timeline-row"><span>{date}</span><p>{text}</p></div>)}
            </section>
          </Reveal>
          <Reveal delay={0.06}>
            <section className="timeline-card">
              <h2>Dokumen Proyek</h2>
              <div className="placeholder-grid">
                {(documents.length ? documents.map((item) => item.file_name) : ["Quotation", "Desain Final", "Invoice"]).map((item) => <div key={item}>{item}<span>Preview dokumen</span></div>)}
              </div>
            </section>
          </Reveal>
        </div>

        <Reveal>
          <section className="timeline-card">
            <h2>Workshop Progress Photo</h2>
            <p className="mb-6 leading-7 text-graphite/70">
              Fitur monitoring proyek ini akan membantu klien membaca perkembangan workshop secara visual pada fase sistem real berikutnya.
            </p>
            <div className="workshop-visual">
              <img src={photos[0]?.image_url ?? "/assets/workshop-progress.png"} alt="Preview foto progress workshop furnitur Ambara" loading="lazy" />
              <div className="workshop-grid">
                {["Rangka kabinet", "Proses veneer", "Hardware fitting", "Finishing sample"].map((item) => <div key={item}>{item}</div>)}
              </div>
            </div>
          </section>
        </Reveal>
      </section>
    </PageShell>
  );
}
