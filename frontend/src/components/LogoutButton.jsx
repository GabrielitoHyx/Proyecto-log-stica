import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function LogoutButton() {

  const { logout } = useAuth();
  const navigate = useNavigate();


  const cerrarSesion = async () => {

    try {

      await logout();

      navigate("/");

    } catch (error) {

      console.error(
        "Error al cerrar sesión:",
        error
      );

    }

  };


  return (
    <button onClick={cerrarSesion}>
      🚪 Cerrar sesión
    </button>
  );

}

export default LogoutButton;