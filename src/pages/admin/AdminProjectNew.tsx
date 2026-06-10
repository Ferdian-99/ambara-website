export function AdminProjectNew() {
  return (
    <main className="dashboard-content">
      <div className="dashboard-heading">
        <div>
          <p className="section-label">New Project</p>
          <h1>Buat record proyek atau order baru.</h1>
        </div>
      </div>
      <form className="dashboard-form">
        {["Project code", "Project name", "Project type", "Location", "Estimated completion"].map((label) => (
          <label key={label}>
            {label}
            <input placeholder={label} />
          </label>
        ))}
        <label>
          Notes
          <textarea placeholder="Catatan awal proyek" />
        </label>
        <button type="button">Simpan Draft</button>
      </form>
    </main>
  );
}
