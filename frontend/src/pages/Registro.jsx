import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Registro.css";

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

      setMensaje("Usuario registrado correctamente");

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
    <div className="registro-container">

      <div className="registro-card">

        <h1>Registro de usuario</h1>

        <form onSubmit={registrar}>

          <label htmlFor="correo">
            Correo
          </label>

          <input
            id="correo"
            name="correo"
            type="email"
            placeholder="Correo electrónico"
            value={formulario.correo}
            onChange={manejarCambio}
            required
          />

          <label htmlFor="contrasena">
            Contraseña
          </label>

          <input
            id="contrasena"
            name="contrasena"
            type="password"
            placeholder="Contraseña"
            value={formulario.contrasena}
            onChange={manejarCambio}
            required
          />

          <label htmlFor="rol">
            Tipo de usuario
          </label>

          <select
            id="rol"
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

          <label htmlFor="preguntarc">
            Pregunta de recuperación
          </label>

          <input
            id="preguntarc"
            name="preguntarc"
            placeholder="Ej. ¿Cuál es el nombre de tu mascota?"
            value={formulario.preguntarc}
            onChange={manejarCambio}
            required
          />

          <label htmlFor="respuestarc">
            Respuesta de recuperación
          </label>

          <input
            id="respuestarc"
            name="respuestarc"
            placeholder="Respuesta"
            value={formulario.respuestarc}
            onChange={manejarCambio}
            required
          />

          {error && (
            <p className="registro-error">
              ❌ {error}
            </p>
          )}

          {mensaje && (
            <p className="registro-mensaje">
              ✅ {mensaje}
            </p>
          )}

          <button
            type="submit"
            disabled={cargando}
          >
            {cargando
              ? "Registrando..."
              : "Registrar"}
          </button>

        </form>

        <button
          type="button"
          className="volver-login"
          onClick={() => navigate("/")}
        >
          🔙 Regresar al login
        </button>

      </div>

    </div>
  );
}

export default Registro;

