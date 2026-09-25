import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

export default function Login() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // Estado para manejar errores visuales
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Limpiamos errores previos

    // 1. Validación básica en el frontend
    if (!correo || !password) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    try {
      // 2. Petición real al backend usando fetch
      const response = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ correo, password }), // Enviamos los datos
      });

      const data = await response.json();

      // ¡Aquí está la parte actualizada para JWT!
      if (response.ok) {
        console.log("Respuesta del servidor:", data.message);

        // 3. Guardamos el TOKEN (JWT) y los datos del usuario en el navegador
        localStorage.setItem("token", data.token);
        localStorage.setItem("usuario", JSON.stringify(data.usuario));

        // 4. Redirigimos al dashboard
        navigate("/dashboard");
      } else {
        // Mostramos mensaje si el correo o contraseña son incorrectos
        setError(data.message);
      }
    } catch (err) {
      console.error("Error en la petición:", err);
      setError(
        "Error al conectar con el servidor. Verifica que el backend esté encendido.",
      );
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-card">
        <h2>Iniciar Sesión</h2>

        {/* Mostramos el mensaje de error en rojo si existe */}
        {error && (
          <p style={{ color: "red", fontSize: "14px", marginBottom: "10px" }}>
            {error}
          </p>
        )}

        <input
          type="email"
          placeholder="Correo Electrónico"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Ingresar</button>
      </form>
    </div>
  );
}
