import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Registro() {

  const navigate = useNavigate();

  const [formulario, setFormulario] = useState({
    correo: "",
    contrasena: "",
    rol: "Cliente",
    preguntarc: "",
    respuestarc: ""
  });

  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);


  const manejarCambio = (e) => {

    setFormulario({
      ...formulario,
      [e.target.name]: e.target.value
    });

  };


  const registrar = async (e) => {

    e.preventDefault();

    setError("");
    setMensaje("");
    setCargando(true);

    try {

      const respuesta = await fetch(
        "http://localhost:5000/api/users",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          credentials: "include",

          body: JSON.stringify(formulario)
        }
      );


      const datos = await respuesta.json();


      if (!respuesta.ok) {

        throw new Error(
          datos.error || "Error al registrar usuario"
        );

      }


      setMensaje(
        "Usuario registrado correctamente"
      );


      setTimeout(() => {

        navigate("/");

      }, 1500);


    } catch (error) {

      setError(error.message);

    } finally {

      setCargando(false);

    }

  };


  return (

    <div style={{ padding: "40px" }}>

      <h1>Registro de usuario</h1>

      <form onSubmit={registrar}>

        <input
          name="correo"
          type="email"
          placeholder="Correo"
          value={formulario.correo}
          onChange={manejarCambio}
          required
        />

        <br /><br />

        <input
          name="contrasena"
          type="password"
          placeholder="Contraseña"
          value={formulario.contrasena}
          onChange={manejarCambio}
          required
        />

        <br /><br />

        <select
          name="rol"
          value={formulario.rol}
          onChange={manejarCambio}
        >
          <option value="Cliente">
            Cliente
          </option>

          <option value="Chofer">
            Chofer
          </option>

          <option value="Admin">
            Admin
          </option>
        </select>

        <br /><br />

        <input
          name="preguntarc"
          placeholder="Pregunta de recuperación"
          value={formulario.preguntarc}
          onChange={manejarCambio}
          required
        />

        <br /><br />

        <input
          name="respuestarc"
          placeholder="Respuesta de recuperación"
          value={formulario.respuestarc}
          onChange={manejarCambio}
          required
        />

        <br /><br />

        {error && (
          <p style={{ color: "red" }}>
            ❌ {error}
          </p>
        )}

        {mensaje && (
          <p style={{ color: "green" }}>
            ✅ {mensaje}
          </p>
        )}

        <button type="submit" disabled={cargando}>
          {cargando
            ? "Registrando..."
            : "Registrar"}
        </button>

      </form>

      <br />

      <button onClick={() => navigate("/")}>
        🔙 Regresar al login
      </button>

    </div>

  );

}

export default Registro;