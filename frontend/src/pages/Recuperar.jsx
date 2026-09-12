import { useNavigate } from "react-router-dom";

function Recuperar() {

  const navigate = useNavigate();

  return (

    <div style={{ padding: "40px" }}>

      <h1>Recuperar contraseña</h1>

      <p>
        Aquí construiremos el proceso de recuperación.
      </p>

      <button onClick={() => navigate("/")}>
        🔙 Regresar al login
      </button>

    </div>

  );

}

export default Recuperar;