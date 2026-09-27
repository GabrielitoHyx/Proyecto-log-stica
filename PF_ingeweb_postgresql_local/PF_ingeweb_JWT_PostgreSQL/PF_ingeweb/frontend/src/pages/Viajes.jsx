import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./Viajes.css";


function Viajes() {
  const { usuario } = useAuth();

  if (usuario?.rol === "Cliente") {
    return <ViajesCliente />;
  }

  if (usuario?.rol === "Admin") {
    return <ViajesAdmin />;
  }

  return <ViajesChofer />;
}

// =====================================================
// VISTA DEL ADMINISTRADOR
// =====================================================
function ViajesAdmin() {
  const navigate = useNavigate();
  const [viajes, setViajes] = useState([]);
  const [choferes, setChoferes] = useState([]);
  const [camiones, setCamiones] = useState([]);
  const [asignaciones, setAsignaciones] = useState({});
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setError("");

      const [viajesData, choferesData, camionesData] = await Promise.all([
        api("/api/vviajes"),
        api("/api/vchoferes"),
        api("/api/vcamiones")
      ]);

      const listaViajes = Array.isArray(viajesData)
        ? viajesData
        : viajesData.viajes || [];

      const listaChoferes = Array.isArray(choferesData)
        ? choferesData
        : choferesData.choferes || [];

      const listaCamiones = Array.isArray(camionesData)
        ? camionesData
        : camionesData.camiones || [];

      setViajes(listaViajes);
      setChoferes(listaChoferes);
      setCamiones(listaCamiones);

      const inicial = {};
      listaViajes.forEach((viaje) => {
        inicial[viaje.ID_Viaje] = {
          id_cho: viaje.ID_cho ?? "",
          id_ca: viaje.ID_ca ?? ""
        };
      });
      setAsignaciones(inicial);
    } catch (e) {
      setError(e.message || "No se pudieron cargar las solicitudes de viaje.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const cambiarAsignacion = (idViaje, campo, valor) => {
    setAsignaciones((actual) => ({
      ...actual,
      [idViaje]: {
        ...actual[idViaje],
        [campo]: valor
      }
    }));
  };

  const guardarAsignacion = async (viaje) => {
    const asignacion = asignaciones[viaje.ID_Viaje] || {};

    if (
      (asignacion.id_cho && !asignacion.id_ca) ||
      (!asignacion.id_cho && asignacion.id_ca)
    ) {
      setError("Para asignar un viaje debes seleccionar un chofer y un camión.");
      return;
    }

    try {
      setGuardando(viaje.ID_Viaje);
      setError("");
      setMensaje("");

      await api(`/api/viajes/${viaje.ID_Viaje}/asignacion`, {
        method: "PATCH",
        body: JSON.stringify({
          id_cho: asignacion.id_cho || null,
          id_ca: asignacion.id_ca || null
        })
      });

      setMensaje(
        asignacion.id_cho
          ? `El viaje ${viaje.Folio_ruta || viaje.ID_Viaje} fue asignado correctamente.`
          : `La asignación del viaje ${viaje.Folio_ruta || viaje.ID_Viaje} fue retirada.`
      );

      await cargarDatos();
    } catch (e) {
      setError(e.message || "No se pudo actualizar la asignación.");
    } finally {
      setGuardando(null);
    }
  };

  const solicitudes = viajes.filter((viaje) => viaje.Estado === "Presupuesto").length;
  const asignados = viajes.filter((viaje) => viaje.ID_cho && viaje.ID_ca).length;
  const activos = viajes.filter((viaje) => ["Programado", "En tránsito"].includes(viaje.Estado)).length;

  return (
    <div className="viajes-container">
      <main className="viajes-main">
        <header className="admin-viajes-header">
          <div>
            <p className="cliente-eyebrow">PANEL DEL ADMINISTRADOR</p>
            <h1>Solicitudes de viajes</h1>
            <p>Administra las solicitudes realizadas por los clientes y asigna los recursos disponibles.</p>
          </div>

          <button
            className="btn-dashboard-viajes"
            onClick={() => navigate("/dashboard")}
          >
            ← Volver al Dashboard
          </button>
        </header>

        {mensaje && <div className="mensaje-exito">✓ {mensaje}</div>}
        {error && <div className="mensaje-error">⚠ {error}</div>}

        <section className="admin-viajes-resumen">
          <div className="admin-viaje-card">
            <span>📋</span>
            <div>
              <small>Solicitudes pendientes</small>
              <strong>{cargando ? "—" : solicitudes}</strong>
            </div>
          </div>

          <div className="admin-viaje-card">
            <span>👨‍✈️</span>
            <div>
              <small>Viajes asignados</small>
              <strong>{cargando ? "—" : asignados}</strong>
            </div>
          </div>

          <div className="admin-viaje-card">
            <span>🚛</span>
            <div>
              <small>Viajes activos</small>
              <strong>{cargando ? "—" : activos}</strong>
            </div>
          </div>

          <div className="admin-viaje-card">
            <span>📦</span>
            <div>
              <small>Total de solicitudes</small>
              <strong>{cargando ? "—" : viajes.length}</strong>
            </div>
          </div>
        </section>

        <section className="tabla admin-mis-viajes">
          <div className="seccion-titulo">
            <div>
              <h2>Viajes solicitados por clientes</h2>
              <p>Selecciona un chofer y un camión para atender cada solicitud.</p>
            </div>

            <button className="btn-recargar" onClick={cargarDatos} disabled={cargando}>
              ↻ {cargando ? "Cargando..." : "Actualizar"}
            </button>
          </div>

          {cargando ? (
            <p className="estado-tabla">Cargando solicitudes...</p>
          ) : viajes.length === 0 ? (
            <p className="estado-tabla">Todavía no hay solicitudes de viaje.</p>
          ) : (
            <div className="tabla-scroll">
              <table className="admin-viajes-table">
                <thead>
                  <tr>
                    <th>Folio</th>
                    <th>Cliente</th>
                    <th>Ruta</th>
                    <th>Mercancía</th>
                    <th>Fecha</th>
                    <th>Estado</th>
                    <th>Chofer</th>
                    <th>Camión</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {viajes.map((viaje) => {
                    const asignacion = asignaciones[viaje.ID_Viaje] || {
                      id_cho: "",
                      id_ca: ""
                    };

                    return (
                      <tr key={viaje.ID_Viaje}>
                        <td>{viaje.Folio_ruta || viaje.ID_Viaje}</td>
                        <td>{viaje.Cliente || viaje.Correo_Cliente || "—"}</td>
                        <td>{viaje.Origen} → {viaje.Destino}</td>
                        <td>{viaje.Mercancia || "—"}</td>
                        <td>{formatearFecha(viaje.Fecha_partida)}</td>
                        <td>
                          <span className={`estado-badge ${claseEstado(viaje.Estado)}`}>
                            {viaje.Estado || "Sin estado"}
                          </span>
                        </td>
                        <td>
                          <select
                            value={asignacion.id_cho}
                            onChange={(e) =>
                              cambiarAsignacion(viaje.ID_Viaje, "id_cho", e.target.value)
                            }
                          >
                            <option value="">Sin asignar</option>
                            {choferes.map((chofer) => (
                              <option key={chofer.ID_Chof} value={chofer.ID_Chof}>
                                {chofer.Nombre || `Chofer #${chofer.ID_Chof}`}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <select
                            value={asignacion.id_ca}
                            onChange={(e) =>
                              cambiarAsignacion(viaje.ID_Viaje, "id_ca", e.target.value)
                            }
                          >
                            <option value="">Sin asignar</option>
                            {camiones.map((camion) => (
                              <option key={camion.ID_CA} value={camion.ID_CA}>
                                {camion.Placas}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <button
                            className="btn-asignar-viaje"
                            onClick={() => guardarAsignacion(viaje)}
                            disabled={guardando === viaje.ID_Viaje}
                          >
                            {guardando === viaje.ID_Viaje ? "Guardando..." : "Guardar"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

// =====================================================
// VISTA DEL CLIENTE
// =====================================================
function ViajesCliente() {
  const [viajes, setViajes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  
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
      const data = await api("/api/mis-viajes-cliente");
      setViajes(data.viajes || []);
      setError("");
    } catch (e) {
      setError(e.message || "No se pudieron cargar tus viajes.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarViajes();
  }, []);

  const cambiarCampo = (e) => {
    setFormulario((actual) => ({
      ...actual,
      [e.target.name]: e.target.value
    }));
  };

  const solicitarViaje = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError("");

    try {
      setEnviando(true);

      await api("/api/solicitar-viaje", {
        method: "POST",
        body: JSON.stringify(formulario)
      });

      setMensaje("Solicitud enviada correctamente. El administrador podrá asignarte un chofer y un camión.");

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

      await cargarViajes();
    } catch (e) {
      setError(e.message || "No se pudo solicitar el viaje.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="viajes-container cliente-viajes-page">
      <main className="viajes-main">
        <header className="cliente-viajes-header">
          <p className="cliente-eyebrow">PORTAL DEL CLIENTE</p>
          <h1>Solicitar un viaje</h1>
          <p>Solicita tu transporte y consulta el chofer y camión asignados a cada viaje.</p>
          <button
            className="btn-dashboard-viajes"
            onClick={() => navigate("/cliente")}
          >
            ← Volver al Dashboard
          </button>
        </header>

        {mensaje && <div className="mensaje-exito">✓ {mensaje}</div>}
        {error && <div className="mensaje-error">⚠ {error}</div>}

        <section className="formulario cliente-solicitud">
          <div className="seccion-titulo">
            <div>
              <h2>Datos del viaje</h2>
              <p>El chofer y el camión serán asignados posteriormente por el administrador.</p>
            </div>
          </div>

          <form onSubmit={solicitarViaje}>
            <div className="form-grid">
              <div className="form-group"><label>Origen *</label><input name="origen" value={formulario.origen} onChange={cambiarCampo} placeholder="Ej. Ciudad de México" required /></div>
              <div className="form-group"><label>Destino *</label><input name="destino" value={formulario.destino} onChange={cambiarCampo} placeholder="Ej. Puebla" required /></div>
              <div className="form-group"><label>Mercancía *</label><input name="mercancia" value={formulario.mercancia} onChange={cambiarCampo} placeholder="¿Qué deseas transportar?" required /></div>
              <div className="form-group"><label>Peso de mercancía (kg)</label><input type="number" min="0" name="peso_mercancia" value={formulario.peso_mercancia} onChange={cambiarCampo} placeholder="Ej. 500" /></div>
              <div className="form-group"><label>Distancia (km)</label><input type="number" min="0" name="distancia" value={formulario.distancia} onChange={cambiarCampo} placeholder="Ej. 130" /></div>
              <div className="form-group"><label>Fecha de partida *</label><input type="datetime-local" name="fecha_partida" value={formulario.fecha_partida} onChange={cambiarCampo} required /></div>
              <div className="form-group"><label>Fecha aproximada de llegada</label><input type="datetime-local" name="fecha_aprox_llegada" value={formulario.fecha_aprox_llegada} onChange={cambiarCampo} /></div>
              <div className="form-group"><label>Pago estimado</label><input type="number" min="0" step="0.01" name="pago_cliente" value={formulario.pago_cliente} onChange={cambiarCampo} placeholder="Opcional" /></div>
            </div>
            <button className="btn-guardar btn-solicitar" type="submit" disabled={enviando}>{enviando ? "Enviando solicitud..." : "Solicitar viaje"}</button>
          </form>
        </section>

        <section className="tabla cliente-mis-viajes">
          <div className="seccion-titulo">
            <div><h2>Mis viajes</h2><p>Aquí aparecerán tus viajes y los recursos asignados.</p></div>
            <button className="btn-recargar" onClick={cargarViajes}>↻ Actualizar</button>
          </div>

          {cargando ? <p className="estado-tabla">Cargando tus viajes...</p> : viajes.length === 0 ? <p className="estado-tabla">Todavía no tienes viajes solicitados.</p> : (
            <div className="tabla-scroll">
              <table>
                <thead><tr><th>Folio</th><th>Ruta</th><th>Mercancía</th><th>Fecha</th><th>Estado</th><th>Chofer</th><th>Camión</th></tr></thead>
                <tbody>
                  {viajes.map((viaje) => (
                    <tr key={viaje.ID_Viaje}>
                      <td>{viaje.Folio_ruta || viaje.ID_Viaje}</td>
                      <td>{viaje.Origen} → {viaje.Destino}</td>
                      <td>{viaje.Mercancia || "—"}</td>
                      <td>{formatearFecha(viaje.Fecha_partida)}</td>
                      <td><span className={`estado-badge ${claseEstado(viaje.Estado)}`}>{viaje.Estado || "Sin estado"}</span></td>
                      <td>{viaje.Chofer || <span className="pendiente">Pendiente</span>}</td>
                      <td>{viaje.Camion || <span className="pendiente">Pendiente</span>}</td>
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

// =====================================================
// VISTA DEL CHOFER
// =====================================================
function ViajesChofer() {
  const [viajes, setViajes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const cargarViajes = async () => {
    try {
      setCargando(true);
      const data = await api("/api/mis-viajes");
      setViajes(Array.isArray(data) ? data : data.viajes || []);
      setError("");
    } catch (e) {
      setError(e.message || "No se pudieron cargar tus viajes.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarViajes();
  }, []);

  return (
    <div className="viajes-container">
      <main className="viajes-main">
        <header className="cliente-viajes-header">
          <p className="cliente-eyebrow">PORTAL DEL CHOFER</p>
          <h1>Mis viajes</h1>
          <p>Consulta los viajes que tienes asignados.</p>
          <button
            className="btn-dashboard-viajes"
            onClick={() => navigate("/chofer")}
          >
            ← Volver al Dashboard
          </button>
        </header>

        {error && <div className="mensaje-error">⚠ {error}</div>}
        {cargando ? <p className="estado-tabla">Cargando tus viajes...</p> : viajes.length === 0 ? <p className="estado-tabla">No tienes viajes asignados.</p> : (
          <section className="tabla">
            <div className="tabla-scroll">
              <table>
                <thead><tr><th>Folio</th><th>Ruta</th><th>Cliente</th><th>Fecha</th><th>Estado</th><th>Camión</th></tr></thead>
                <tbody>
                  {viajes.map((viaje) => (
                    <tr key={viaje.ID_Viaje}>
                      <td>{viaje.Folio_ruta || viaje.ID_Viaje}</td>
                      <td>{viaje.Origen} → {viaje.Destino}</td>
                      <td>{viaje.Cliente || viaje.Correo_Cliente || "—"}</td>
                      <td>{formatearFecha(viaje.Fecha_partida)}</td>
                      <td><span className={`estado-badge ${claseEstado(viaje.Estado)}`}>{viaje.Estado || "Sin estado"}</span></td>
                      <td>{viaje.Camion || "Pendiente"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function formatearFecha(fecha) {
  if (!fecha) return "—";
  const d = new Date(fecha);
  if (Number.isNaN(d.getTime())) return fecha;

  return d.toLocaleString("es-MX", {
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

export default Viajes;