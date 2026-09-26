import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Camiones() {

  const navigate = useNavigate();

  const [camiones, setCamiones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // Controla si mostramos el formulario
  const [mostrarFormulario, setMostrarFormulario] = useState(false);


  // ==========================
  // OBTENER CAMIONES
  // ==========================

  useEffect(() => {

    const obtenerCamiones = async () => {

      try {

        const respuesta = await fetch(
          "http://localhost:5000/api/vcamiones",
          {
            credentials: "include"
          }
        );

        const datos = await respuesta.json();

        if (!respuesta.ok) {
          throw new Error(
            datos.error || "Error al obtener camiones"
          );
        }

        setCamiones(datos);

      } catch (error) {

        console.error(error);
        setError(error.message);

      } finally {

        setCargando(false);

      }

    };

    obtenerCamiones();

  }, []);


  // ==========================
  // CARGANDO
  // ==========================

  if (cargando) {

    return (
      <div className="main">

        <h1>🚚 Camiones</h1>

        <p>Cargando camiones...</p>

      </div>
    );

  }


  // ==========================
  // ERROR
  // ==========================

  if (error) {

    return (
      <div className="main">

        <h1>🚚 Camiones</h1>

        <div className="alerta urgente">
          ❌ {error}
        </div>

        <button
          className="btn-regresar"
          onClick={() => navigate("/dashboard")}
        >
          🔙 Regresar al Dashboard
        </button>

      </div>
    );

  }


  // ==========================
  // PÁGINA
  // ==========================

  return (

    <div className="main">

      <div className="encabezado-pagina">

        <h1>🚚 Camiones</h1>

        <div className="acciones">

          <button
            className="btn-regresar"
            onClick={() => navigate("/dashboard")}
          >
            🔙 Dashboard
          </button>

          <button
            className="btn-registrar"
            onClick={() =>
              setMostrarFormulario(!mostrarFormulario)
            }
          >
            ➕ Registrar camión
          </button>

        </div>

      </div>


      {/* ==========================
          FORMULARIO
      ========================== */}

      {mostrarFormulario && (

        <div className="formulario">

          <h2>Registrar nuevo camión</h2>

          <p>
            Aquí agregaremos el formulario de registro.
          </p>

        </div>

      )}


      {/* ==========================
          TABLA
      ========================== */}

      <div className="tabla">

        <table>

          <thead>

            <tr>
              <th>ID</th>
              <th>Placas</th>
              <th>Modelo</th>
              <th>Kilometraje</th>
              <th>Tanque</th>
              <th>Capacidad de carga</th>
            </tr>

          </thead>

          <tbody>

            {camiones.map((camion) => (

              <tr key={camion.ID_CA}>

                <td>{camion.ID_CA}</td>

                <td>{camion.Placas}</td>

                <td>{camion.Modelo}</td>

                <td>
                  {camion.Kilometraje_total} km
                </td>

                <td>
                  {camion.Capacidad_tanque} L
                </td>

                <td>
                  {camion.Capacidad_carga} Ton
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  );
}

export default Camiones;