const clients = [
  ["Nadia Pramana", "nadia@example.com", "Jakarta Selatan"],
  ["Arga Wicaksana", "arga@example.com", "Bali"],
  ["Studio Nara", "hello@studionara.example", "Bandung"],
];

export function AdminClients() {
  return (
    <main className="dashboard-content">
      <div className="dashboard-heading">
        <div>
          <p className="section-label">Clients</p>
          <h1>Client records untuk proyek AMBARA.</h1>
        </div>
      </div>
      <section className="dashboard-panel">
        {clients.map(([name, email, location]) => (
          <div key={email} className="dashboard-row">
            <span>{location}</span>
            <p>
              <strong>{name}</strong> - {email}
            </p>
          </div>
        ))}
      </section>
    </main>
  );
}
