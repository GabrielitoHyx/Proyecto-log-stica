import { useAuth } from "../context/AuthContext";
import LogoutButton from "../components/LogoutButton";

function InicioChofer() {

  const { usuario } = useAuth();

  return (
    <div style={{ padding: "40px" }}>

      <h1>🚚 Panel del Chofer</h1>

      <h2>Bienvenido</h2>

      <p>
        Usuario: {usuario?.correo}
      </p>

      <p>
        Rol: {usuario?.rol}
      </p>

      <LogoutButton />

    </div>
  );
}

export default InicioChofer;