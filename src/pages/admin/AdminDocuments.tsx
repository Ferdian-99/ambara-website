export function AdminDocuments() {
  return (
    <main className="dashboard-content">
      <div className="dashboard-heading">
        <div>
          <p className="section-label">Documents</p>
          <h1>Struktur dokumen proyek.</h1>
        </div>
      </div>
      <section className="dashboard-grid">
        {["Quotation", "Desain Final", "Invoice", "Progress Photo"].map((item) => (
          <article key={item} className="dashboard-panel">
            <h2>{item}</h2>
            <p>Upload dan pengelolaan file dilakukan dari halaman detail proyek agar setiap dokumen tetap terhubung dengan project record yang tepat.</p>
          </article>
        ))}
      </section>
    </main>
  );
}
