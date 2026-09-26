import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Recuperar.css";

function Recuperar() {
  const navigate = useNavigate();

  const [correo, setCorreo] = useState("");
  const [pregunta, setPregunta] = useState("");
  const [respuesta, setRespuesta] = useState("");
  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const buscarPregunta = async (e) => {
    e.preventDefault();

    setError("");
    setMensaje("");

    if (!correo.trim()) {
      setError("Ingresa tu correo electrónico.");
      return;
    }

    try {
      setCargando(true);

      const data = await api("/api/recuperar", {
        method: "POST",
        body: JSON.stringify({
          correo
        })
      });

      setPregunta(data.pregunta);

    } catch (error) {

      setPregunta("");

      setError(
        error.message || "No se pudo encontrar el usuario."
      );

    } finally {
      setCargando(false);
    }
  };

  const cambiarPassword = async (e) => {
    e.preventDefault();

    setError("");
    setMensaje("");

    if (!respuesta.trim()) {
      setError("Ingresa la respuesta de recuperación.");
      return;
    }

    if (!nuevaContrasena) {
      setError("Ingresa una nueva contraseña.");
      return;
    }

    if (nuevaContrasena !== confirmarContrasena) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      setCargando(true);

      const data = await api("/api/cambiar-password", {
        method: "POST",
        body: JSON.stringify({
          correo,
          respuesta,
          nuevaContrasena
        })
      });

      setMensaje(data.mensaje);

      // Limpiar los campos
      setRespuesta("");
      setNuevaContrasena("");
      setConfirmarContrasena("");

    } catch (error) {

      setError(
        error.message || "No se pudo cambiar la contraseña."
      );

    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="recuperar-container">

      <div className="recuperar-card">

        <h1>Recuperar contraseña</h1>

        <p className="recuperar-descripcion">
          Ingresa tu correo para recuperar el acceso a tu cuenta.
        </p>

        {/* CORREO */}
        <form onSubmit={buscarPregunta}>

          <label>Correo electrónico</label>

          <input
            type="email"
            placeholder="Ingresa tu correo"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            disabled={!!pregunta}
          />

          {!pregunta && (
            <button
              type="submit"
              disabled={cargando}
            >
              {cargando ? "Buscando..." : "Continuar"}
            </button>
          )}

        </form>

        {/* PREGUNTA Y CAMBIO DE CONTRASEÑA */}
        {pregunta && (
          <form
            onSubmit={cambiarPassword}
            className="recuperacion-form"
          >

            <div className="pregunta-box">

              <label>Pregunta de recuperación</label>

              <p>
                {pregunta}
              </p>

            </div>

            <label>Respuesta</label>

            <input
              type="text"
              placeholder="Ingresa tu respuesta"
              value={respuesta}
              onChange={(e) => setRespuesta(e.target.value)}
            />

            <label>Nueva contraseña</label>

            <input
              type="password"
              placeholder="Ingresa tu nueva contraseña"
              value={nuevaContrasena}
              onChange={(e) =>
                setNuevaContrasena(e.target.value)
              }
            />

            <label>Confirmar contraseña</label>

            <input
              type="password"
              placeholder="Confirma tu nueva contraseña"
              value={confirmarContrasena}
              onChange={(e) =>
                setConfirmarContrasena(e.target.value)
              }
            />

            <button
              type="submit"
              disabled={cargando}
            >
              {cargando
                ? "Actualizando..."
                : "Cambiar contraseña"}
            </button>

          </form>
        )}

        {/* MENSAJES */}
        {error && (
          <p className="recuperar-error">
            {error}
          </p>
        )}

        {mensaje && (
          <p className="recuperar-mensaje">
            {mensaje}
          </p>
        )}

        {/* VOLVER */}
        <button
          className="volver-login"
          onClick={() => navigate("/")}
        >
          ← Volver al inicio de sesión
        </button>

      </div>

    </div>
  );
}

export default Recuperar;