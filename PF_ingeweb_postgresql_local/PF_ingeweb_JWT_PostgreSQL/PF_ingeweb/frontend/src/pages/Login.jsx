import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import fondo from "../assets/camion-fondo.jpg";

function Login() {

  const navigate = useNavigate();

  const { login } = useAuth();

  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");

  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);


  const iniciarSesion = async (e) => {

    e.preventDefault();

    setError("");
    setCargando(true);

    try {

      const usuario = await login(
        correo,
        contrasena
      );

      console.log("Usuario autenticado:", usuario);


      // Redirigir dependiendo del rol

      if (usuario.rol === "Admin") {

        navigate("/dashboard");

      } else if (usuario.rol === "Chofer") {

        navigate("/chofer");

      } else if (usuario.rol === "Cliente") {

        navigate("/cliente");

      } else {

        setError("El rol del usuario no es válido.");

      }

    } catch (error) {

      console.error("Error de login:", error);

      setError(
        error.message || "Correo o contraseña incorrectos"
      );

    } finally {

      setCargando(false);

    }

  };


  return (

    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",

        backgroundImage:
          `linear-gradient(
            rgba(13,71,161,0.7),
            rgba(13,71,161,0.7)
          ), url(${fondo})`,

        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >

      <div
        style={{
          backgroundColor: "white",
          width: "450px",
          padding: "40px",
          borderRadius: "20px",
          boxShadow:
            "0 10px 25px rgba(0,0,0,0.3)",
        }}
      >

        {/* TITULO */}

        <h1
          style={{
            textAlign: "center",
            color: "#0d47a1",
            marginBottom: "30px",
            fontSize: "42px",
          }}
        >
          TRANSPORTES MX
        </h1>


        <h2
          style={{
            textAlign: "center",
            marginBottom: "30px",
          }}
        >
          Iniciar Sesión
        </h2>


        <form onSubmit={iniciarSesion}>

          {/* CORREO */}

          <div style={{ marginBottom: "20px" }}>

            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "bold",
              }}
            >
              Correo Electrónico
            </label>

            <input
              type="email"
              placeholder="correo@empresa.com"

              value={correo}

              onChange={(e) =>
                setCorreo(e.target.value)
              }

              required

              style={{
                width: "100%",
                padding: "15px",
                borderRadius: "10px",
                border: "1px solid #ccc",
                fontSize: "16px",
                boxSizing: "border-box",
              }}
            />

          </div>


          {/* CONTRASEÑA */}

          <div style={{ marginBottom: "20px" }}>

            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "bold",
              }}
            >
              Contraseña
            </label>

            <input
              type="password"
              placeholder="********"

              value={contrasena}

              onChange={(e) =>
                setContrasena(e.target.value)
              }

              required

              style={{
                width: "100%",
                padding: "15px",
                borderRadius: "10px",
                border: "1px solid #ccc",
                fontSize: "16px",
                boxSizing: "border-box",
              }}
            />

          </div>


          {/* MENSAJE DE ERROR */}

          {error && (

            <div
              style={{
                backgroundColor: "#ffebee",
                color: "#c62828",
                padding: "12px",
                borderRadius: "8px",
                marginBottom: "20px",
                textAlign: "center",
              }}
            >
              ❌ {error}
            </div>

          )}


          {/* BOTON LOGIN */}

          <button
            type="submit"
            disabled={cargando}

            style={{
              width: "100%",
              padding: "15px",

              backgroundColor:
                cargando
                  ? "#90caf9"
                  : "#1565c0",

              color: "white",

              border: "none",

              borderRadius: "10px",

              fontSize: "18px",

              fontWeight: "bold",

              cursor:
                cargando
                  ? "not-allowed"
                  : "pointer",
            }}
          >

            {cargando
              ? "Iniciando sesión..."
              : "Ingresar"}

          </button>

        </form>


        {/* REGISTRO */}

        <button
          type="button"

          onClick={() =>
            navigate("/registro")
          }

          style={{
            width: "100%",

            marginTop: "20px",

            padding: "12px",

            backgroundColor: "transparent",

            color: "#1565c0",

            border: "1px solid #1565c0",

            borderRadius: "10px",

            fontSize: "16px",

            cursor: "pointer",
          }}
        >
          Crear una cuenta
        </button>


        {/* RECUPERAR CONTRASEÑA */}

        <button
          type="button"

          onClick={() =>
            navigate("/recuperar")
          }

          style={{
            width: "100%",

            marginTop: "10px",

            padding: "10px",

            backgroundColor: "transparent",

            color: "#555",

            border: "none",

            fontSize: "14px",

            cursor: "pointer",
          }}
        >
          ¿Olvidaste tu contraseña?
        </button>

      </div>

    </div>

  );
}

export default Login;