import { useNavigate } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";
import "./Dashboard.css";

function Dashboard() {

  const navigate = useNavigate();

  return (
    <div className="dashboard">
      
      <div className="sidebar">

        <h2>🚛 Transportes MX</h2>

        <ul>
          <li>🏠 Dashboard</li>

          <li onClick={() => navigate("/viajes")}>
            🚛 Viajes
          </li>

          <li onClick={() => navigate("/camiones")}>🚚 Camiones</li>
          <li onClick={() => navigate("/choferes")}>👨‍✈️ Choferes</li>
          <li onClick={() => navigate("/clientes")}>👤 Clientes</li>
          <li onClick={() => navigate("/usuarios")}>🔐 Usuarios</li>
          <li >💰 Gastos</li>
          <li >📈 Utilidades</li>
        </ul>
       <LogoutButton />
      </div>

      <div className="main">

        <h1 className="titulo">
          Dashboard Administrador
        </h1>

        <div className="cards">

          <div className="card">
            <h3>🚛 Viajes Activos</h3>
            <p>2</p>
          </div>

          <div className="card">
            <h3>🚚 Camiones</h3>
            <p>2</p>
          </div>

          <div className="card">
            <h3>👨‍✈️ Choferes</h3>
            <p>2</p>
          </div>

          <div className="card">
            <h3>👤 Clientes</h3>
            <p>2</p>
          </div>

        </div>

        <div className="alertas">

          <h2>Alertas</h2>

          <div className="alerta urgente">
            🚨 El seguro del camión ABC-123 vence en 5 días.
          </div>

          <div className="alerta advertencia">
            ⚠ El camión DEF-456 requiere mantenimiento.
          </div>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;