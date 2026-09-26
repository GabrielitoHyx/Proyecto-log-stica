import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [datos, setDatos] = useState({ viajes: [], camiones: [], choferes: [], clientes: [] });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargar = async () => {
      try {
        const [viajes, camiones, choferes, clientes] = await Promise.all([
          api("/api/vviajes"),
          api("/api/vcamiones"),
          api("/api/vchoferes"),
          api("/api/vclientes"),
        ]);
        setDatos({ viajes, camiones, choferes, clientes });
      } catch (e) {
        setError(e.message || "No se pudieron cargar los datos del dashboard.");
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  const activos = useMemo(
    () => datos.viajes.filter(v => ["Programado", "En tránsito"].includes(v.Estado)).length,
    [datos.viajes]
  );

  const completados = useMemo(
    () => datos.viajes.filter(v => v.Estado === "Completado").length,
    [datos.viajes]
  );

  const recientes = useMemo(() => [...datos.viajes].slice(-5).reverse(), [datos.viajes]);

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="dashboard-main">
        <header className="topbar">
          <div>
            <p className="eyebrow">TRANSPORTES MX</p>
            <h1>Dashboard</h1>
            <p className="subtitle">Resumen general de la operación.</p>
          </div>
          <div className="user-pill">
            <span className="avatar">A</span>
            <div><strong>Administrador</strong><small>{usuario?.correo}</small></div>
          </div>
        </header>

        {error && <div className="dashboard-error">⚠️ {error}</div>}

        <section className="stats-grid">
          <StatCard icon="🚛" label="Viajes activos" value={cargando ? "—" : activos} tone="blue" />
          <StatCard icon="📦" label="Viajes completados" value={cargando ? "—" : completados} tone="green" />
          <StatCard icon="🚚" label="Camiones" value={cargando ? "—" : datos.camiones.length} tone="orange" />
          <StatCard icon="👥" label="Clientes" value={cargando ? "—" : datos.clientes.length} tone="purple" />
        </section>

        <section className="dashboard-grid">
          <div className="panel recent-panel">
            <div className="panel-heading">
              <div><h2>Viajes recientes</h2><p>Últimos registros de la operación</p></div>
              <button className="text-button" onClick={() => navigate("/viajes")}>Ver todos →</button>
            </div>
            {recientes.length === 0 ? <div className="empty-state">No hay viajes registrados todavía.</div> : (
              <div className="trip-list">
                {recientes.map(v => <TripRow key={v.ID_Viaje} viaje={v} />)}
              </div>
            )}
          </div>

          <div className="panel actions-panel">
            <div className="panel-heading"><div><h2>Acciones rápidas</h2><p>Accesos frecuentes</p></div></div>
            <button className="quick-action" onClick={() => navigate("/viajes")}><span>➕</span><div><strong>Gestionar viajes</strong><small>Crear y consultar rutas</small></div><b>→</b></button>
            <button className="quick-action" onClick={() => navigate("/camiones")}><span>🚚</span><div><strong>Camiones</strong><small>Consultar unidades</small></div><b>→</b></button>
            <button className="quick-action" onClick={() => navigate("/clientes")}><span>👤</span><div><strong>Clientes</strong><small>Administrar clientes</small></div><b>→</b></button>
          </div>
        </section>

        <section className="panel overview-panel">
          <div className="panel-heading"><div><h2>Resumen de recursos</h2><p>Información disponible en el sistema</p></div></div>
          <div className="resource-grid">
            <Resource label="Choferes registrados" value={datos.choferes.length} />
            <Resource label="Camiones registrados" value={datos.camiones.length} />
            <Resource label="Clientes registrados" value={datos.clientes.length} />
            <Resource label="Viajes totales" value={datos.viajes.length} />
          </div>
        </section>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, tone }) {
  return <div className={`stat-card ${tone}`}><div className="stat-icon">{icon}</div><div><span>{label}</span><strong>{value}</strong></div></div>;
}

function TripRow({ viaje }) {
  const estado = (viaje.Estado || "Sin estado").toLowerCase().replace(" ", "-");
  return <div className="trip-row"><div className="route-icon">↗</div><div className="trip-info"><strong>{viaje.Origen} → {viaje.Destino}</strong><span>Folio {viaje.Folio_ruta || viaje.ID_Viaje} · {viaje.Cliente || "Cliente sin nombre"}</span></div><span className={`status ${estado}`}>{viaje.Estado || "Sin estado"}</span></div>;
}

function Resource({ label, value }) { return <div className="resource"><span>{label}</span><strong>{value}</strong></div>; }

export default Dashboard;
