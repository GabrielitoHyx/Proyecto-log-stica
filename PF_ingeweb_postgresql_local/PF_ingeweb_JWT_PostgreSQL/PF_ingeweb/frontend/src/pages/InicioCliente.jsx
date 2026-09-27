import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LogoutButton from "../components/LogoutButton";
import api from "../services/api";

function InicioCliente() {
  const { usuario } = useAuth();
  const [viajes, setViajes] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargarViajes = async () => {
    try {
      const data = await api("/api/mis-viajes-cliente");
      setViajes(data.viajes || []);
    } catch (error) {
      setViajes([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarViajes();
  }, []);

  const activos = viajes.filter(
    (v) => !["Completado", "Cancelado"].includes(v.Estado)
  ).length;

  const completados = viajes.filter(
    (v) => v.Estado === "Completado"
  ).length;

  return (
    <div style={styles.page}>
      <main style={styles.main}>
        <header style={styles.header}>
          <div>
            <p style={styles.eyebrow}>PORTAL DEL CLIENTE</p>
            <h1 style={styles.title}>¡Hola! 👋</h1>
            <p style={styles.subtitle}>
              {usuario?.correo || "Cliente"}. Aquí puedes consultar tus viajes y solicitar uno nuevo.
            </p>
          </div>

          <LogoutButton />
        </header>

        <section style={styles.cards}>
          <div style={styles.card}>
            <span style={styles.cardIcon}>🚛</span>
            <div>
              <span style={styles.cardLabel}>Total de viajes</span>
              <strong style={styles.cardNumber}>{viajes.length}</strong>
            </div>
          </div>

          <div style={styles.card}>
            <span style={styles.cardIcon}>📦</span>
            <div>
              <span style={styles.cardLabel}>Viajes activos</span>
              <strong style={styles.cardNumber}>{activos}</strong>
            </div>
          </div>

          <div style={styles.card}>
            <span style={styles.cardIcon}>✓</span>
            <div>
              <span style={styles.cardLabel}>Completados</span>
              <strong style={styles.cardNumber}>{completados}</strong>
            </div>
          </div>
        </section>

        <section style={styles.actions}>
          <div>
            <h2 style={styles.sectionTitle}>¿Necesitas transportar mercancía?</h2>
            <p style={styles.sectionText}>
              Solicita un viaje indicando origen, destino, mercancía y fecha.
            </p>
          </div>

          <Link to="/viajes" style={styles.button}>
            + Solicitar viaje
          </Link>
        </section>

        <section style={styles.panel}>
          <div style={styles.panelHeader}>
            <div>
              <h2 style={styles.sectionTitle}>Mis viajes recientes</h2>
              <p style={styles.sectionText}>
                Consulta el estado, chofer y camión de cada viaje.
              </p>
            </div>

            <Link to="/viajes" style={styles.link}>
              Ver todos →
            </Link>
          </div>

          {cargando ? (
            <p style={styles.empty}>Cargando viajes...</p>
          ) : viajes.length === 0 ? (
            <div style={styles.emptyBox}>
              <div style={styles.emptyIcon}>🚚</div>
              <strong>Aún no tienes viajes</strong>
              <p>Solicita tu primer viaje para comenzar.</p>
              <Link to="/viajes" style={styles.buttonSmall}>
                Solicitar viaje
              </Link>
            </div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Folio</th>
                    <th style={styles.th}>Ruta</th>
                    <th style={styles.th}>Fecha</th>
                    <th style={styles.th}>Estado</th>
                    <th style={styles.th}>Chofer</th>
                    <th style={styles.th}>Camión</th>
                  </tr>
                </thead>
                <tbody>
                  {viajes.slice(0, 5).map((viaje) => (
                    <tr key={viaje.ID_Viaje}>
                      <td style={styles.td}>{viaje.Folio_ruta || viaje.ID_Viaje}</td>
                      <td style={styles.td}>
                        {viaje.Origen} → {viaje.Destino}
                      </td>
                      <td style={styles.td}>{formatearFecha(viaje.Fecha_partida)}</td>
                      <td style={styles.td}>
                        <span style={styles.status}>{viaje.Estado || "Sin estado"}</span>
                      </td>
                      <td style={styles.td}>{viaje.Chofer || "Pendiente"}</td>
                      <td style={styles.td}>{viaje.Camion || "Pendiente"}</td>
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
  const date = new Date(fecha);
  if (Number.isNaN(date.getTime())) return fecha;

  return date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f7fb",
    padding: "30px"
  },
  main: {
    maxWidth: "1250px",
    margin: "0 auto"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "28px"
  },
  eyebrow: {
    margin: 0,
    color: "#0d47a1",
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "1.5px"
  },
  title: {
    margin: "5px 0",
    color: "#17233c",
    fontSize: "34px"
  },
  subtitle: {
    margin: 0,
    color: "#6b7280"
  },
  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "18px",
    marginBottom: "22px"
  },
  card: {
    background: "white",
    borderRadius: "16px",
    padding: "22px",
    boxShadow: "0 5px 18px rgba(0,0,0,.07)",
    display: "flex",
    alignItems: "center",
    gap: "15px"
  },
  cardIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    background: "#eaf2ff",
    display: "grid",
    placeItems: "center",
    fontSize: "22px"
  },
  cardLabel: {
    display: "block",
    color: "#737b8c",
    fontSize: "13px"
  },
  cardNumber: {
    display: "block",
    color: "#17233c",
    fontSize: "27px",
    marginTop: "3px"
  },
  actions: {
    background: "#0d47a1",
    color: "white",
    borderRadius: "16px",
    padding: "24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "22px"
  },
  sectionTitle: {
    margin: 0,
    color: "#17233c",
    fontSize: "20px"
  },
  actionsTitle: {
    color: "white"
  },
  sectionText: {
    margin: "6px 0 0",
    color: "#737b8c",
    fontSize: "14px"
  },
  button: {
    background: "white",
    color: "#0d47a1",
    padding: "12px 18px",
    borderRadius: "10px",
    textDecoration: "none",
    fontWeight: 800,
    whiteSpace: "nowrap"
  },
  buttonSmall: {
    display: "inline-block",
    marginTop: "12px",
    background: "#0d47a1",
    color: "white",
    padding: "10px 16px",
    borderRadius: "9px",
    textDecoration: "none",
    fontWeight: 700
  },
  panel: {
    background: "white",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 5px 18px rgba(0,0,0,.07)"
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    marginBottom: "20px"
  },
  link: {
    color: "#0d47a1",
    textDecoration: "none",
    fontWeight: 700
  },
  tableWrapper: {
    overflowX: "auto"
  },
  table: {
    width: "100%",
    minWidth: "800px",
    borderCollapse: "collapse"
  },
  th: {
    textAlign: "left",
    padding: "12px",
    background: "#f6f8fc",
    color: "#596273",
    fontSize: "12px"
  },
  td: {
    padding: "13px 12px",
    borderBottom: "1px solid #edf0f5",
    color: "#3d4657",
    fontSize: "14px"
  },
  status: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: "20px",
    background: "#eef2f7",
    color: "#536070",
    fontSize: "12px",
    fontWeight: 700
  },
  empty: {
    color: "#737b8c",
    padding: "20px 0"
  },
  emptyBox: {
    textAlign: "center",
    padding: "35px 20px",
    color: "#596273"
  },
  emptyIcon: {
    fontSize: "38px",
    marginBottom: "10px"
  }
};

export default InicioCliente;