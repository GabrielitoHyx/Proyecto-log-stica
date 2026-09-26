import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function LogoutButton() {

  const { logout } = useAuth();
  const navigate = useNavigate();

  const cerrarSesion = () => {

    logout();

    navigate("/");

  };

  return (
    <button onClick={cerrarSesion}>
      🚪 Cerrar sesión
    </button>
  );

}

export default LogoutButton;