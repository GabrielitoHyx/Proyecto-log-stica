import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [error, setError] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [usuarioActual, setUsuarioActual] = useState({
    id: null,
    correo: "",
    password: "",
    rol: "",
  });
  const navigate = useNavigate();

  const cargarUsuarios = () => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:3000/api/usuarios", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject("Error")))
      .then((data) => setUsuarios(data))
      .catch((err) => {
        console.error(err);
        setError("No se pudieron cargar los datos.");
      });
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const handleGuardarUsuario = async (e) => {
    e.preventDefault();
    setError("");
    const token = localStorage.getItem("token");

    const url = modoEdicion
      ? `http://localhost:3000/api/usuarios/${usuarioActual.id}`
      : "http://localhost:3000/api/usuarios";

    const metodo = modoEdicion ? "PUT" : "POST";

    // Validación básica
    if (!modoEdicion && !usuarioActual.password) {
      setError("La contraseña es obligatoria para nuevos usuarios.");
      return;
    }

    try {
      const response = await fetch(url, {
        method: metodo,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(usuarioActual),
      });

      if (response.ok) {
        cancelarFormulario();
        cargarUsuarios();
      } else {
        const data = await response.json();
        setError(data.message || "Error al guardar el usuario");
      }
    } catch (err) {
      console.error(err);
      setError("Error de conexión.");
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este usuario?")) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3000/api/usuarios/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) cargarUsuarios();
      else {
        const data = await response.json();
        alert(data.message || "Error al eliminar");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión.");
    }
  };

  const prepararEdicion = (usuario) => {
    setModoEdicion(true);
    setUsuarioActual({
      id: usuario.ID_Usuario,
      correo: usuario.Correo,
      password: "", // Dejamos la contraseña en blanco por seguridad
      rol: usuario.Rol,
    });
    setMostrarFormulario(true);
  };

  const cancelarFormulario = () => {
    setMostrarFormulario(false);
    setModoEdicion(false);
    setUsuarioActual({ id: null, correo: "", password: "", rol: "" });
  };

  return (
    <div style={{ padding: "40px", color: "white", textAlign: "center" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>Módulo de Usuarios</h1>
        <div>
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              marginRight: "10px",
              padding: "10px",
              backgroundColor: "#333",
              color: "white",
              border: "1px solid #555",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Volver a Dashboard
          </button>
        </div>
      </div>

      <div style={{ margin: "20px 0", textAlign: "right" }}>
        <button
          onClick={() =>
            mostrarFormulario
              ? cancelarFormulario()
              : setMostrarFormulario(true)
          }
          style={{
            padding: "10px 15px",
            backgroundColor: mostrarFormulario ? "#f0ad4e" : "#5cb85c",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          {mostrarFormulario ? "Cancelar" : "+ Agregar Usuario"}
        </button>
      </div>

      {mostrarFormulario && (
        <form
          onSubmit={handleGuardarUsuario}
          style={{
            background: "#222",
            padding: "20px",
            borderRadius: "8px",
            marginBottom: "20px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "10px",
            alignItems: "center",
          }}
        >
          <input
            type="email"
            placeholder="Correo electrónico"
            required
            value={usuarioActual.correo}
            onChange={(e) =>
              setUsuarioActual({ ...usuarioActual, correo: e.target.value })
            }
          />
          <input
            type="password"
            placeholder={
              modoEdicion ? "Nueva contraseña (opcional)" : "Contraseña"
            }
            required={!modoEdicion}
            value={usuarioActual.password}
            onChange={(e) =>
              setUsuarioActual({ ...usuarioActual, password: e.target.value })
            }
          />
          <select
            value={usuarioActual.rol}
            required
            onChange={(e) =>
              setUsuarioActual({ ...usuarioActual, rol: e.target.value })
            }
            style={{ padding: "10px" }}
          >
            <option value="">Selecciona un Rol</option>
            <option value="Admin">Admin</option>
            <option value="Chofer">Chofer</option>
            <option value="Cliente">Cliente</option>
          </select>
          <button
            type="submit"
            style={{
              gridColumn: "span 3",
              padding: "10px 20px",
              backgroundColor: "#0275d8",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            {modoEdicion ? "Actualizar" : "Guardar"}
          </button>
        </form>
      )}

      <div
        style={{
          margin: "20px 0",
          padding: "20px",
          border: "1px solid #444",
          borderRadius: "8px",
          overflowX: "auto",
        }}
      >
        {error && <p style={{ color: "red" }}>{error}</p>}
        <table
          style={{
            width: "100%",
            marginTop: "20px",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr>
              <th style={{ borderBottom: "2px solid #fff", padding: "10px" }}>
                ID
              </th>
              <th style={{ borderBottom: "2px solid #fff", padding: "10px" }}>
                Correo
              </th>
              <th style={{ borderBottom: "2px solid #fff", padding: "10px" }}>
                Rol
              </th>
              <th style={{ borderBottom: "2px solid #fff", padding: "10px" }}>
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {usuarios.length > 0 ? (
              usuarios.map((user) => (
                <tr key={user.ID_Usuario}>
                  <td
                    style={{ padding: "10px", borderBottom: "1px solid #444" }}
                  >
                    {user.ID_Usuario}
                  </td>
                  <td
                    style={{ padding: "10px", borderBottom: "1px solid #444" }}
                  >
                    {user.Correo}
                  </td>
                  <td
                    style={{ padding: "10px", borderBottom: "1px solid #444" }}
                  >
                    {user.Rol}
                  </td>
                  <td
                    style={{ padding: "10px", borderBottom: "1px solid #444" }}
                  >
                    <button
                      onClick={() => prepararEdicion(user)}
                      style={{
                        marginRight: "10px",
                        padding: "5px 10px",
                        backgroundColor: "#0275d8",
                        color: "white",
                        border: "none",
                        borderRadius: "3px",
                        cursor: "pointer",
                      }}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleEliminar(user.ID_Usuario)}
                      style={{
                        padding: "5px 10px",
                        backgroundColor: "#d9534f",
                        color: "white",
                        border: "none",
                        borderRadius: "3px",
                        cursor: "pointer",
                      }}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ padding: "20px" }}>
                  No hay registros...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
