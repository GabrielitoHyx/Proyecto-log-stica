import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

import LogoutButton from "../components/LogoutButton";
import api from "../services/api";
import "./InicioChofer.css";

function InicioChofer() {
  const { usuario } = useAuth();
  const [viajes, setViajes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();


  const cargarViajes = async () => {
    try {
      setCargando(true);
      setError("");

      const data = await api("/api/mis-viajes");
      setViajes(Array.isArray(data) ? data : data.viajes || []);
    } catch (e) {
      setError(e.message || "No se pudieron cargar tus viajes.");
      setViajes([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarViajes();
  }, []);

  const activos = useMemo(
    () => viajes.filter((v) => ["Programado", "En tránsito"].includes(v.Estado)).length,
    [viajes]
  );

  const pendientes = useMemo(
    () => viajes.filter((v) => v.Estado === "Presupuesto").length,
    [viajes]
  );

  const completados = useMemo(
    () => viajes.filter((v) => v.Estado === "Completado").length,
    [viajes]
  );

  const proximoViaje = useMemo(() => {
    return [...viajes]
      .filter((v) => v.Fecha_partida && !["Completado", "Cancelado"].includes(v.Estado))
      .sort((a, b) => new Date(a.Fecha_partida) - new Date(b.Fecha_partida))[0];
  }, [viajes]);

  const recientes = useMemo(
    () => [...viajes].sort((a, b) => b.ID_Viaje - a.ID_Viaje).slice(0, 5),
    [viajes]
  );

  return (
    <div className="chofer-dashboard">
      <main className="chofer-dashboard-main">
        <header className="chofer-topbar">
          <div>
            <p className="chofer-eyebrow">PORTAL DEL CHOFER</p>
            <h1>¡Hola! 👋</h1>
            <p className="chofer-subtitle">
              {usuario?.correo || "Chofer"}. Aquí puedes consultar tus viajes asignados y su estado.
            </p>
          </div>

          <div className="chofer-top-actions">
            <LogoutButton />
          </div>
        </header>

        {error && <div className="chofer-error">⚠ {error}</div>}

        <section className="chofer-stats">
          <StatCard icon="🚛" label="Viajes totales" value={cargando ? "—" : viajes.length} />
          <StatCard icon="📍" label="Viajes activos" value={cargando ? "—" : activos} />
          <StatCard icon="⏳" label="Pendientes" value={cargando ? "—" : pendientes} />
          <StatCard icon="✓" label="Completados" value={cargando ? "—" : completados} />
        </section>

        <section className="chofer-content-grid">
          <div className="chofer-panel">
            <div className="chofer-panel-heading">
              <div>
                <h2>Próximo viaje</h2>
                <p>El siguiente viaje asignado a tu cuenta.</p>
              </div>
              <Link to="/viajes" className="chofer-link">
                Ver mis viajes →
              </Link>
            </div>

            {cargando ? (
              <div className="chofer-empty">Cargando información...</div>
            ) : !proximoViaje ? (
              <div className="chofer-empty">
                <div className="chofer-empty-icon">🚚</div>
                <strong>No tienes viajes próximos</strong>
                <p>Cuando el administrador te asigne un viaje aparecerá aquí.</p>
              </div>
            ) : (
              <div className="proximo-viaje">
                <div className="ruta-principal">
                  <div className="ruta-punto">
                    <span>Origen</span>
                    <strong>{proximoViaje.Origen}</strong>
                  </div>
                  <div className="ruta-linea">→</div>
                  <div className="ruta-punto">
                    <span>Destino</span>
                    <strong>{proximoViaje.Destino}</strong>
                  </div>
                </div>

                <div className="proximo-detalles">
                  <div>
                    <span>Folio</span>
                    <strong>{proximoViaje.Folio_ruta || proximoViaje.ID_Viaje}</strong>
                  </div>
                  <div>
                    <span>Fecha de partida</span>
                    <strong>{formatearFecha(proximoViaje.Fecha_partida)}</strong>
                  </div>
                  <div>
                    <span>Cliente</span>
                    <strong>{proximoViaje.Cliente || proximoViaje.Correo_Cliente || "—"}</strong>
                  </div>
                  <div>
                    <span>Camión</span>
                    <strong>{proximoViaje.Camion || "Pendiente"}</strong>
                  </div>
                </div>

                <span className={`chofer-status ${claseEstado(proximoViaje.Estado)}`}>
                  {proximoViaje.Estado || "Sin estado"}
                </span>
              </div>
            )}
          </div>

          <div className="chofer-panel chofer-actions-panel">
            <div className="chofer-panel-heading">
              <div>
                <h2>Acciones rápidas</h2>
                <p>Accesos para tu operación.</p>
              </div>
            </div>

            <Link to="/viajes" className="chofer-action">
              <span>🚛</span>
              <div>
                <strong>Mis viajes</strong>
                <small>Consultar viajes asignados</small>
              </div>
              <b>→</b>
            </Link>

            <Link to="/viajes" className="chofer-action">
              <span>📋</span>
              <div>
                <strong>Actualizar estado</strong>
                <small>Gestionar el estado de tus viajes</small>
              </div>
              <b>→</b>
            </Link>
          </div>
        </section>

        <section className="chofer-panel">
          <div className="chofer-panel-heading">
            <div>
              <h2>Viajes recientes</h2>
              <p>Últimos viajes relacionados con tu cuenta.</p>
            </div>
          </div>

          {cargando ? (
            <div className="chofer-empty">Cargando viajes...</div>
          ) : recientes.length === 0 ? (
            <div className="chofer-empty">No hay viajes asignados todavía.</div>
          ) : (
            <div className="chofer-table-wrapper">
              <table className="chofer-table">
                <thead>
                  <tr>
                    <th>Folio</th>
                    <th>Ruta</th>
                    <th>Cliente</th>
                    <th>Fecha</th>
                    <th>Camión</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {recientes.map((viaje) => (
                    <tr key={viaje.ID_Viaje}>
                      <td>{viaje.Folio_ruta || viaje.ID_Viaje}</td>
                      <td>{viaje.Origen} → {viaje.Destino}</td>
                      <td>{viaje.Cliente || viaje.Correo_Cliente || "—"}</td>
                      <td>{formatearFecha(viaje.Fecha_partida)}</td>
                      <td>{viaje.Camion || "Pendiente"}</td>
                      <td>
                        <span className={`chofer-status ${claseEstado(viaje.Estado)}`}>
                          {viaje.Estado || "Sin estado"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="chofer-stat-card">
      <span className="chofer-stat-icon">{icon}</span>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function formatearFecha(fecha) {
  if (!fecha) return "—";

  const date = new Date(fecha);
  if (Number.isNaN(date.getTime())) return fecha;

  return date.toLocaleString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function claseEstado(estado = "") {
  return estado
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-");
}

export default InicioChofer;