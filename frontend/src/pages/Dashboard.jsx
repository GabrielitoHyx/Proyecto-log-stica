import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

export default function Dashboard() {
  const [camiones, setCamiones] = useState([]);
  const [error, setError] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [camionActual, setCamionActual] = useState({
    id: null,
    placas: "",
    modelo: "",
    capacidad_carga: "",
  });
  const navigate = useNavigate();

  const cargarCamiones = () => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:3000/api/camiones", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error en la respuesta");
        return res.json();
      })
      .then((data) => setCamiones(data))
      .catch(() => setError("No se pudieron cargar los datos."));
  };

  useEffect(() => {
    cargarCamiones();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleGuardarCamion = async (e) => {
    e.preventDefault();
    setError("");
    const token = localStorage.getItem("token");

    const url = modoEdicion
      ? `http://localhost:3000/api/camiones/${camionActual.id}`
      : "http://localhost:3000/api/camiones";

    const metodo = modoEdicion ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method: metodo,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(camionActual),
      });

      if (response.ok) {
        cancelarFormulario();
        cargarCamiones();
      } else {
        const data = await response.json();
        setError(data.message || "Error al guardar el camión");
      }
    } catch (err) {
      console.error(err);
      setError("Error al conectar con el servidor.");
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este camión?"))
      return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3000/api/camiones/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        cargarCamiones();
      } else {
        const data = await response.json();
        alert(data.message || "Error al eliminar");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión al intentar eliminar.");
    }
  };

  const prepararEdicion = (camion) => {
    setModoEdicion(true);
    setCamionActual({
      id: camion.ID_CA,
      placas: camion.Placas,
      modelo: camion.Modelo,
      capacidad_carga: camion.Capacidad_carga,
    });
    setMostrarFormulario(true);
  };

  const cancelarFormulario = () => {
    setMostrarFormulario(false);
    setModoEdicion(false);
    setCamionActual({ id: null, placas: "", modelo: "", capacidad_carga: "" });
  };

  return (
    <div style={{ padding: "40px", color: "white", textAlign: "center" }}>
      <h1>Panel de Control - Logística</h1>

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
          {mostrarFormulario ? "Cancelar" : "+ Agregar Nuevo Camión"}
        </button>
      </div>

      {mostrarFormulario && (
        <form
          onSubmit={handleGuardarCamion}
          style={{
            background: "#222",
            padding: "20px",
            borderRadius: "8px",
            marginBottom: "20px",
            display: "flex",
            gap: "10px",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <h3 style={{ margin: 0, marginRight: "10px" }}>
            {modoEdicion ? "Editar Camión:" : "Nuevo Camión:"}
          </h3>
          <input
            type="text"
            placeholder="Placas (Ej. AB-123)"
            required
            value={camionActual.placas}
            onChange={(e) =>
              setCamionActual({ ...camionActual, placas: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Modelo (Ej. Volvo FH)"
            value={camionActual.modelo}
            onChange={(e) =>
              setCamionActual({ ...camionActual, modelo: e.target.value })
            }
          />
          <input
            type="number"
            placeholder="Cap. Carga (Kg)"
            required
            value={camionActual.capacidad_carga}
            onChange={(e) =>
              setCamionActual({
                ...camionActual,
                capacidad_carga: e.target.value,
              })
            }
          />
          <button
            type="submit"
            style={{
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
        <h2>Módulo de Camiones</h2>
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
                Placas
              </th>
              <th style={{ borderBottom: "2px solid #fff", padding: "10px" }}>
                Modelo
              </th>
              <th style={{ borderBottom: "2px solid #fff", padding: "10px" }}>
                Capacidad (Kg)
              </th>
              <th style={{ borderBottom: "2px solid #fff", padding: "10px" }}>
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {camiones.length > 0 ? (
              camiones.map((camion) => (
                <tr key={camion.ID_CA}>
                  <td
                    style={{ padding: "10px", borderBottom: "1px solid #444" }}
                  >
                    {camion.ID_CA}
                  </td>
                  <td
                    style={{ padding: "10px", borderBottom: "1px solid #444" }}
                  >
                    {camion.Placas}
                  </td>
                  <td
                    style={{ padding: "10px", borderBottom: "1px solid #444" }}
                  >
                    {camion.Modelo || "N/A"}
                  </td>
                  <td
                    style={{ padding: "10px", borderBottom: "1px solid #444" }}
                  >
                    {camion.Capacidad_carga || "N/A"}
                  </td>
                  <td
                    style={{ padding: "10px", borderBottom: "1px solid #444" }}
                  >
                    <button
                      onClick={() => prepararEdicion(camion)}
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
                      onClick={() => handleEliminar(camion.ID_CA)}
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
                <td colSpan="5" style={{ padding: "20px" }}>
                  No hay registros...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Botón añadido para ir a Usuarios */}
      <button
        onClick={() => navigate("/usuarios")}
        style={{
          padding: "10px 20px",
          backgroundColor: "#f0ad4e", // Color naranja/amarillo para diferenciarlo
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          marginRight: "15px",
        }}
      >
        Ir a Módulo de Usuarios
      </button>

      {/* Botón añadido para ir a Choferes */}
      <button
        onClick={() => navigate("/choferes")}
        style={{
          padding: "10px 20px",
          backgroundColor: "#5bc0de",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          marginRight: "15px",
        }}
      >
        Ir a Módulo de Choferes
      </button>

      {/* Botón de Cerrar Sesión */}
      <button
        onClick={handleLogout}
        style={{
          padding: "10px 20px",
          backgroundColor: "#d9534f",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Cerrar Sesión
      </button>
    </div>
  );
}
