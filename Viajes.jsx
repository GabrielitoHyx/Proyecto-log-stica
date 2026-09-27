import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./Viajes.css";

function Viajes() {
  const { usuario } = useAuth();

  if (usuario?.rol === "Cliente") {
    return <ViajesCliente />;
  }

  return (
    <div className="viajes-container">
      <main className="viajes-main">
        <h1>Registro de Viajes</h1>
        <p>Pantalla de viajes funcionando 🚛</p>
      </main>
    </div>
  );
}

function ViajesCliente() {
  const [viajes, setViajes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

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

      setMensaje(
        "Solicitud enviada correctamente. El administrador podrá asignarte un chofer y un camión."
      );

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
          <p>
            Solicita tu transporte y consulta el chofer y camión asignados a cada viaje.
          </p>
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
              <div className="form-group">
                <label>Origen *</label>
                <input
                  name="origen"
                  value={formulario.origen}
                  onChange={cambiarCampo}
                  placeholder="Ej. Ciudad de México"
                  required
                />
              </div>

              <div className="form-group">
                <label>Destino *</label>
                <input
                  name="destino"
                  value={formulario.destino}
                  onChange={cambiarCampo}
                  placeholder="Ej. Puebla"
                  required
                />
              </div>

              <div className="form-group">
                <label>Mercancía *</label>
                <input
                  name="mercancia"
                  value={formulario.mercancia}
                  onChange={cambiarCampo}
                  placeholder="¿Qué deseas transportar?"
                  required
                />
              </div>

              <div className="form-group">
                <label>Peso de mercancía (kg)</label>
                <input
                  type="number"
                  min="0"
                  name="peso_mercancia"
                  value={formulario.peso_mercancia}
                  onChange={cambiarCampo}
                  placeholder="Ej. 500"
                />
              </div>

              <div className="form-group">
                <label>Distancia (km)</label>
                <input
                  type="number"
                  min="0"
                  name="distancia"
                  value={formulario.distancia}
                  onChange={cambiarCampo}
                  placeholder="Ej. 130"
                />
              </div>

              <div className="form-group">
                <label>Fecha de partida *</label>
                <input
                  type="datetime-local"
                  name="fecha_partida"
                  value={formulario.fecha_partida}
                  onChange={cambiarCampo}
                  required
                />
              </div>

              <div className="form-group">
                <label>Fecha aproximada de llegada</label>
                <input
                  type="datetime-local"
                  name="fecha_aprox_llegada"
                  value={formulario.fecha_aprox_llegada}
                  onChange={cambiarCampo}
                />
              </div>

              <div className="form-group">
                <label>Pago estimado</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  name="pago_cliente"
                  value={formulario.pago_cliente}
                  onChange={cambiarCampo}
                  placeholder="Opcional"
                />
              </div>
            </div>

            <button className="btn-guardar btn-solicitar" type="submit" disabled={enviando}>
              {enviando ? "Enviando solicitud..." : "Solicitar viaje"}
            </button>
          </form>
        </section>

        <section className="tabla cliente-mis-viajes">
          <div className="seccion-titulo">
            <div>
              <h2>Mis viajes</h2>
              <p>Aquí aparecerán tus viajes y los recursos asignados.</p>
            </div>

            <button className="btn-recargar" onClick={cargarViajes}>
              ↻ Actualizar
            </button>
          </div>

          {cargando ? (
            <p className="estado-tabla">Cargando tus viajes...</p>
          ) : viajes.length === 0 ? (
            <p className="estado-tabla">Todavía no tienes viajes solicitados.</p>
          ) : (
            <div className="tabla-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Folio</th>
                    <th>Ruta</th>
                    <th>Mercancía</th>
                    <th>Fecha</th>
                    <th>Estado</th>
                    <th>Chofer</th>
                    <th>Camión</th>
                  </tr>
                </thead>
                <tbody>
                  {viajes.map((viaje) => (
                    <tr key={viaje.ID_Viaje}>
                      <td>{viaje.Folio_ruta || viaje.ID_Viaje}</td>
                      <td>
                        {viaje.Origen} → {viaje.Destino}
                      </td>
                      <td>{viaje.Mercancia || "—"}</td>
                      <td>{formatearFecha(viaje.Fecha_partida)}</td>
                      <td>
                        <span className={`estado-badge ${claseEstado(viaje.Estado)}`}>
                          {viaje.Estado || "Sin estado"}
                        </span>
                      </td>
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
