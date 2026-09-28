import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LogoutButton from "../components/LogoutButton";
import api from "../services/api";
import "./InicioCliente.css";

function InicioCliente() {
  const { usuario } = useAuth();

  const [viajes, setViajes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [viajeEditando, setViajeEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const [formulario, setFormulario] = useState({
    origen: "",
    destino: "",
    mercancia: "",
    peso_mercancia: "",
    distancia: "",
    fecha_partida: "",
    fecha_aprox_llegada: "",
    pago_cliente: ""
  });

  const cargarViajes = async () => {
    try {
      setCargando(true);
      setError("");

      const data = await api("/api/mis-viajes-cliente");

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
    () =>
      viajes.filter((v) =>
        ["Presupuesto", "Programado", "En tránsito"].includes(v.Estado)
      ).length,
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

  const recientes = useMemo(
    () => [...viajes].sort((a, b) => b.ID_Viaje - a.ID_Viaje).slice(0, 5),
    [viajes]
  );

  const abrirEdicion = (viaje) => {
    if (viaje.Estado !== "Presupuesto") {
      return;
    }

    setError("");
    setMensaje("");

    setViajeEditando(viaje);

    setFormulario({
      origen: viaje.Origen || "",
      destino: viaje.Destino || "",
      mercancia: viaje.Mercancia || "",
      peso_mercancia: viaje.Peso_Mercancia ?? "",
      distancia: viaje.Distancia ?? "",
      fecha_partida: formatearFechaInput(viaje.Fecha_partida),
      fecha_aprox_llegada: formatearFechaInput(viaje.Fecha_aprox_llegada),
      pago_cliente: viaje.Pago_Cliente ?? ""
    });
  };

  const cerrarEdicion = () => {
    if (guardando) return;

    setViajeEditando(null);

    setFormulario({
      origen: "",
      destino: "",
      mercancia: "",
      peso_mercancia: "",
      distancia: "",
      fecha_partida: "",
      fecha_aprox_llegada: "",
      pago_cliente: ""
    });
  };

  const manejarCambio = (e) => {
    const { name, value } = e.target;

    setFormulario((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const guardarCambios = async (e) => {
    e.preventDefault();

    if (!viajeEditando) return;

    if (
      !formulario.origen.trim() ||
      !formulario.destino.trim() ||
      !formulario.mercancia.trim() ||
      !formulario.fecha_partida
    ) {
      setError(
        "Origen, destino, mercancía y fecha de partida son obligatorios."
      );
      return;
    }

    try {
      setGuardando(true);
      setError("");
      setMensaje("");

      const payload = {
        origen: formulario.origen.trim(),
        destino: formulario.destino.trim(),
        mercancia: formulario.mercancia.trim(),
        peso_mercancia:
          formulario.peso_mercancia === ""
            ? null
            : Number(formulario.peso_mercancia),
        distancia:
          formulario.distancia === ""
            ? null
            : Number(formulario.distancia),
        fecha_partida: formulario.fecha_partida,
        fecha_aprox_llegada:
          formulario.fecha_aprox_llegada || null,
        pago_cliente:
          formulario.pago_cliente === ""
            ? null
            : Number(formulario.pago_cliente)
      };

      await api(`/api/mis-viajes-cliente/${viajeEditando.ID_Viaje}`, {
        method: "PATCH",
        body: JSON.stringify(payload)
      });

      cerrarEdicion();

      setMensaje("Solicitud de viaje actualizada correctamente.");

      await cargarViajes();
    } catch (e) {
      setError(e.message || "No se pudo actualizar la solicitud.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="cliente-dashboard">
      <main className="cliente-dashboard-main">
        <header className="cliente-topbar">
          <div>
            <p className="cliente-eyebrow">PORTAL DEL CLIENTE</p>

            <h1>¡Hola! 👋</h1>

            <p className="cliente-subtitle">
              {usuario?.correo || "Cliente"}. Aquí puedes consultar y
              administrar tus solicitudes de viaje.
            </p>
          </div>

          <div className="cliente-top-actions">
            <LogoutButton />
          </div>
        </header>

        {error && <div className="cliente-error">⚠ {error}</div>}

        {mensaje && <div className="cliente-success">✓ {mensaje}</div>}

        <section className="cliente-stats">
          <StatCard
            icon="🚛"
            label="Viajes totales"
            value={cargando ? "—" : viajes.length}
          />

          <StatCard
            icon="📍"
            label="Viajes activos"
            value={cargando ? "—" : activos}
          />

          <StatCard
            icon="⏳"
            label="Pendientes"
            value={cargando ? "—" : pendientes}
          />

          <StatCard
            icon="✓"
            label="Completados"
            value={cargando ? "—" : completados}
          />
        </section>

        <section className="cliente-content-grid">
          <div className="cliente-panel">
            <div className="cliente-panel-heading">
              <div>
                <h2>Mis viajes</h2>

                <p>
                  Consulta el estado de tus solicitudes y viajes.
                </p>
              </div>

              <Link to="/viajes" className="cliente-link">
                Solicitar viaje →
              </Link>
            </div>

            {cargando ? (
              <div className="cliente-empty">
                Cargando información...
              </div>
            ) : recientes.length === 0 ? (
              <div className="cliente-empty">
                <div className="cliente-empty-icon">🚚</div>

                <strong>No tienes viajes registrados</strong>

                <p>
                  Cuando solicites un viaje aparecerá aquí.
                </p>

                <Link
                  to="/viajes"
                  className="cliente-primary-button"
                >
                  Solicitar un viaje
                </Link>
              </div>
            ) : (
              <div className="cliente-table-wrapper">
                <table className="cliente-table">
                  <thead>
                    <tr>
                      <th>Folio</th>
                      <th>Ruta</th>
                      <th>Fecha</th>
                      <th>Chofer</th>
                      <th>Camión</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {recientes.map((viaje) => (
                      <tr key={viaje.ID_Viaje}>
                        <td>
                          {viaje.Folio_ruta || viaje.ID_Viaje}
                        </td>

                        <td>
                          <div className="cliente-ruta">
                            <strong>{viaje.Origen}</strong>
                            <span>→</span>
                            <strong>{viaje.Destino}</strong>
                          </div>
                        </td>

                        <td>
                          {formatearFecha(viaje.Fecha_partida)}
                        </td>

                        <td>
                          {viaje.Chofer || "Pendiente"}
                        </td>

                        <td>
                          {viaje.Camion || "Pendiente"}
                        </td>

                        <td>
                          <span
                            className={`cliente-status ${claseEstado(
                              viaje.Estado
                            )}`}
                          >
                            {viaje.Estado || "Sin estado"}
                          </span>
                        </td>

                        <td>
                          {viaje.Estado === "Presupuesto" ? (
                            <button
                              type="button"
                              className="cliente-edit-button"
                              onClick={() => abrirEdicion(viaje)}
                            >
                              Editar
                            </button>
                          ) : (
                            <span className="cliente-no-action">
                              —
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {viajeEditando && (
          <div
            className="cliente-modal-overlay"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) {
                cerrarEdicion();
              }
            }}
          >
            <div className="cliente-modal">
              <div className="cliente-modal-header">
                <div>
                  <p className="cliente-modal-eyebrow">
                    EDITAR SOLICITUD
                  </p>

                  <h2>
                    Viaje{" "}
                    {viajeEditando.Folio_ruta ||
                      viajeEditando.ID_Viaje}
                  </h2>

                  <p>
                    Puedes modificar esta solicitud mientras permanezca
                    en estado Presupuesto.
                  </p>
                </div>

                <button
                  type="button"
                  className="cliente-modal-close"
                  onClick={cerrarEdicion}
                  disabled={guardando}
                >
                  ×
                </button>
              </div>

              <form
                className="cliente-form"
                onSubmit={guardarCambios}
              >
                <div className="cliente-form-grid">
                  <div className="cliente-form-group">
                    <label htmlFor="origen">Origen *</label>

                    <input
                      id="origen"
                      name="origen"
                      type="text"
                      value={formulario.origen}
                      onChange={manejarCambio}
                      required
                    />
                  </div>

                  <div className="cliente-form-group">
                    <label htmlFor="destino">Destino *</label>

                    <input
                      id="destino"
                      name="destino"
                      type="text"
                      value={formulario.destino}
                      onChange={manejarCambio}
                      required
                    />
                  </div>

                  <div className="cliente-form-group cliente-form-full">
                    <label htmlFor="mercancia">
                      Mercancía *
                    </label>

                    <input
                      id="mercancia"
                      name="mercancia"
                      type="text"
                      value={formulario.mercancia}
                      onChange={manejarCambio}
                      required
                    />
                  </div>

                  <div className="cliente-form-group">
                    <label htmlFor="peso_mercancia">
                      Peso de mercancía
                    </label>

                    <input
                      id="peso_mercancia"
                      name="peso_mercancia"
                      type="number"
                      min="0"
                      step="any"
                      value={formulario.peso_mercancia}
                      onChange={manejarCambio}
                    />
                  </div>

                  <div className="cliente-form-group">
                    <label htmlFor="distancia">
                      Distancia
                    </label>

                    <input
                      id="distancia"
                      name="distancia"
                      type="number"
                      min="0"
                      step="any"
                      value={formulario.distancia}
                      onChange={manejarCambio}
                    />
                  </div>

                  <div className="cliente-form-group">
                    <label htmlFor="fecha_partida">
                      Fecha de partida *
                    </label>

                    <input
                      id="fecha_partida"
                      name="fecha_partida"
                      type="datetime-local"
                      value={formulario.fecha_partida}
                      onChange={manejarCambio}
                      required
                    />
                  </div>

                  <div className="cliente-form-group">
                    <label htmlFor="fecha_aprox_llegada">
                      Fecha aproximada de llegada
                    </label>

                    <input
                      id="fecha_aprox_llegada"
                      name="fecha_aprox_llegada"
                      type="datetime-local"
                      value={formulario.fecha_aprox_llegada}
                      onChange={manejarCambio}
                    />
                  </div>

                  <div className="cliente-form-group">
                    <label htmlFor="pago_cliente">
                      Pago del cliente
                    </label>

                    <input
                      id="pago_cliente"
                      name="pago_cliente"
                      type="number"
                      min="0"
                      step="any"
                      value={formulario.pago_cliente}
                      onChange={manejarCambio}
                    />
                  </div>
                </div>

                <div className="cliente-form-actions">
                  <button
                    type="button"
                    className="cliente-secondary-button"
                    onClick={cerrarEdicion}
                    disabled={guardando}
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="cliente-primary-button"
                    disabled={guardando}
                  >
                    {guardando
                      ? "Guardando..."
                      : "Guardar cambios"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="cliente-stat-card">
      <span className="cliente-stat-icon">{icon}</span>

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

  if (Number.isNaN(date.getTime())) {
    return fecha;
  }

  return date.toLocaleString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatearFechaInput(fecha) {
  if (!fecha) return "";

  const date = new Date(fecha);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function claseEstado(estado = "") {
  return estado
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-");
}

export default InicioCliente;