import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

export default function Choferes() {
  const [choferes, setChoferes] = useState([]);
  const [error, setError] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [choferActual, setChoferActual] = useState({
    id: null,
    id_usuario: "",
    nss: "",
    nombre: "",
    licencia: "",
    edad: "",
    sexo: "",
  });
  const navigate = useNavigate();

  const cargarChoferes = () => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:3000/api/choferes", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error en la respuesta");
        return res.json();
      })
      .then((data) => setChoferes(data))
      .catch((err) => {
        console.error(err);
        setError("No se pudieron cargar los datos.");
      });
  };

  useEffect(() => {
    cargarChoferes();
  }, []);

  const handleGuardarChofer = async (e) => {
    e.preventDefault();
    setError("");
    const token = localStorage.getItem("token");

    const url = modoEdicion
      ? `http://localhost:3000/api/choferes/${choferActual.id}`
      : "http://localhost:3000/api/choferes";

    const metodo = modoEdicion ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method: metodo,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(choferActual),
      });

      if (response.ok) {
        cancelarFormulario();
        cargarChoferes();
      } else {
        const data = await response.json();
        setError(data.message || "Error al guardar el chofer");
      }
    } catch (err) {
      console.error(err);
      setError("Error al conectar con el servidor.");
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este chofer?"))
      return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3000/api/choferes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        cargarChoferes();
      } else {
        const data = await response.json();
        alert(data.message || "Error al eliminar");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión al intentar eliminar.");
    }
  };

  const prepararEdicion = (chofer) => {
    setModoEdicion(true);
    setChoferActual({
      id: chofer.ID_Chof,
      id_usuario: chofer.ID_Usuario || "",
      nss: chofer.NSS || "",
      nombre: chofer.Nombre || "",
      licencia: chofer.Licencia || "",
      edad: chofer.Edad || "",
      sexo: chofer.Sexo || "",
    });
    setMostrarFormulario(true);
  };

  const cancelarFormulario = () => {
    setMostrarFormulario(false);
    setModoEdicion(false);
    setChoferActual({
      id: null,
      id_usuario: "",
      nss: "",
      nombre: "",
      licencia: "",
      edad: "",
      sexo: "",
    });
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
        <h1>Módulo de Choferes</h1>
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
            Volver a Camiones
          </button>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/");
            }}
            style={{
              padding: "10px",
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
          {mostrarFormulario ? "Cancelar" : "+ Agregar Chofer"}
        </button>
      </div>

      {mostrarFormulario && (
        <form
          onSubmit={handleGuardarChofer}
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
            type="number"
            placeholder="ID Usuario (Opcional)"
            value={choferActual.id_usuario}
            onChange={(e) =>
              setChoferActual({ ...choferActual, id_usuario: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Nombre completo"
            required
            value={choferActual.nombre}
            onChange={(e) =>
              setChoferActual({ ...choferActual, nombre: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="NSS"
            value={choferActual.nss}
            onChange={(e) =>
              setChoferActual({ ...choferActual, nss: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Licencia"
            required
            value={choferActual.licencia}
            onChange={(e) =>
              setChoferActual({ ...choferActual, licencia: e.target.value })
            }
          />
          <input
            type="number"
            placeholder="Edad"
            value={choferActual.edad}
            onChange={(e) =>
              setChoferActual({ ...choferActual, edad: e.target.value })
            }
          />
          <select
            value={choferActual.sexo}
            onChange={(e) =>
              setChoferActual({ ...choferActual, sexo: e.target.value })
            }
            style={{ padding: "10px" }}
          >
            <option value="">Sexo</option>
            <option value="M">Masculino (M)</option>
            <option value="F">Femenino (F)</option>
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
                ID Usuario
              </th>
              <th style={{ borderBottom: "2px solid #fff", padding: "10px" }}>
                Nombre
              </th>
              <th style={{ borderBottom: "2px solid #fff", padding: "10px" }}>
                NSS
              </th>
              <th style={{ borderBottom: "2px solid #fff", padding: "10px" }}>
                Licencia
              </th>
              <th style={{ borderBottom: "2px solid #fff", padding: "10px" }}>
                Edad
              </th>
              <th style={{ borderBottom: "2px solid #fff", padding: "10px" }}>
                Sexo
              </th>
              <th style={{ borderBottom: "2px solid #fff", padding: "10px" }}>
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {choferes.length > 0 ? (
              choferes.map((chofer) => (
                <tr key={chofer.ID_Chof}>
                  <td
                    style={{ padding: "10px", borderBottom: "1px solid #444" }}
                  >
                    {chofer.ID_Chof}
                  </td>
                  <td
                    style={{ padding: "10px", borderBottom: "1px solid #444" }}
                  >
                    {chofer.ID_Usuario || "-"}
                  </td>
                  <td
                    style={{ padding: "10px", borderBottom: "1px solid #444" }}
                  >
                    {chofer.Nombre}
                  </td>
                  <td
                    style={{ padding: "10px", borderBottom: "1px solid #444" }}
                  >
                    {chofer.NSS || "-"}
                  </td>
                  <td
                    style={{ padding: "10px", borderBottom: "1px solid #444" }}
                  >
                    {chofer.Licencia}
                  </td>
                  <td
                    style={{ padding: "10px", borderBottom: "1px solid #444" }}
                  >
                    {chofer.Edad || "-"}
                  </td>
                  <td
                    style={{ padding: "10px", borderBottom: "1px solid #444" }}
                  >
                    {chofer.Sexo || "-"}
                  </td>
                  <td
                    style={{ padding: "10px", borderBottom: "1px solid #444" }}
                  >
                    <button
                      onClick={() => prepararEdicion(chofer)}
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
                      onClick={() => handleEliminar(chofer.ID_Chof)}
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
                <td colSpan="8" style={{ padding: "20px" }}>
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
