import { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LogoutButton from "../components/LogoutButton";
import api from "../services/api";
import "./ClienteDashboard.css";

function InicioCliente() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [viajes, setViajes] = useState([]);
  const [cliente, setCliente] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await api("/api/mis-viajes-cliente");
        setViajes(data.viajes || []);
        setCliente(data.cliente || null);
      } catch (e) {
        setError(e.message || "No se pudieron cargar tus viajes.");
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  const activos = useMemo(() => viajes.filter(v => ["Programado", "En tránsito"].includes(v.Estado)).length, [viajes]);
  const completados = useMemo(() => viajes.filter(v => v.Estado === "Completado").length, [viajes]);
  const proximo = viajes.find(v => ["Programado", "En tránsito"].includes(v.Estado));

  return (
    <div className="client-layout">
      <aside className="client-sidebar">
        <div className="client-brand"><div className="brand-icon">🚛</div><div><strong>Transportes MX</strong><span>Portal del cliente</span></div></div>
        <nav className="client-nav">
          <NavLink to="/cliente" end className={({isActive}) => isActive ? "active" : ""}>⌂ <span>Inicio</span></NavLink>
          <NavLink to="/viajes" className={({isActive}) => isActive ? "active" : ""}>🚛 <span>Mis viajes</span></NavLink>
        </nav>
        <div className="client-sidebar-bottom"><div className="mini-profile"><span className="avatar">{(cliente?.Nombre || usuario?.correo || "C").charAt(0).toUpperCase()}</span><div><strong>{cliente?.Nombre || "Cliente"}</strong><small>{usuario?.correo}</small></div></div><LogoutButton /></div>
      </aside>

      <main className="client-main">
        <header className="client-header"><div><p className="eyebrow">PORTAL DEL CLIENTE</p><h1>Hola, {cliente?.Nombre?.split(" ")[0] || "bienvenido"} 👋</h1><p className="subtitle">Consulta el estado de tus envíos y viajes.</p></div><button className="outline-btn" onClick={() => navigate("/viajes")}>Ver mis viajes</button></header>

        {error && <div className="dashboard-error">⚠️ {error}</div>}

        <section className="client-stats">
          <ClientStat icon="🚛" title="Viajes activos" value={cargando ? "—" : activos} />
          <ClientStat icon="✓" title="Completados" value={cargando ? "—" : completados} />
          <ClientStat icon="📋" title="Viajes totales" value={cargando ? "—" : viajes.length} />
        </section>

        <section className="client-content-grid">
          <div className="client-panel featured-trip">
            <div className="panel-heading"><div><h2>Próximo viaje</h2><p>Seguimiento de tu envío</p></div></div>
            {proximo ? <div className="featured-content"><div className="route-large"><span>{proximo.Origen}</span><i>→</i><span>{proximo.Destino}</span></div><div className="trip-meta"><div><small>Folio</small><strong>{proximo.Folio_ruta || proximo.ID_Viaje}</strong></div><div><small>Mercancía</small><strong>{proximo.Mercancia || "No especificada"}</strong></div><div><small>Estado</small><strong className="client-status">{proximo.Estado}</strong></div></div></div> : <div className="empty-client">No tienes viajes activos por el momento.</div>}
          </div>

          <div className="client-panel profile-panel"><div className="panel-heading"><div><h2>Mi información</h2><p>Datos registrados</p></div></div><div className="profile-data"><div><span>Nombre</span><strong>{cliente?.Nombre || "No registrado"}</strong></div><div><span>Correo</span><strong>{usuario?.correo}</strong></div><div><span>Teléfono</span><strong>{cliente?.Telefono || "No registrado"}</strong></div></div></div>
        </section>

        <section className="client-panel table-panel"><div className="panel-heading"><div><h2>Mis viajes</h2><p>Historial y estado de tus envíos</p></div><button className="text-button" onClick={() => navigate("/viajes")}>Abrir listado →</button></div>{viajes.length === 0 ? <div className="empty-client">Aún no hay viajes asociados a tu cuenta.</div> : <div className="client-table-wrap"><table className="client-table"><thead><tr><th>Ruta</th><th>Folio</th><th>Fecha</th><th>Estado</th></tr></thead><tbody>{viajes.slice(0,6).map(v => <tr key={v.ID_Viaje}><td><strong>{v.Origen} → {v.Destino}</strong></td><td>{v.Folio_ruta || v.ID_Viaje}</td><td>{formatDate(v.Fecha_partida)}</td><td><span className={`status ${(v.Estado || "").toLowerCase().replace(" ", "-")}`}>{v.Estado || "Sin estado"}</span></td></tr>)}</tbody></table></div>}</section>
      </main>
    </div>
  );
}

function ClientStat({icon,title,value}) { return <div className="client-stat"><div className="client-stat-icon">{icon}</div><div><span>{title}</span><strong>{value}</strong></div></div>; }
function formatDate(value) { if (!value) return "—"; const d = new Date(value); return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString("es-MX", {day:"2-digit", month:"short", year:"numeric"}); }
export default InicioCliente;
