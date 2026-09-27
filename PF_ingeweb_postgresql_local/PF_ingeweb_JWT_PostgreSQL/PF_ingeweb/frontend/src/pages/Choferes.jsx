import { useEffect, useRef, useState } from "react";
import DataTable from "datatables.net-dt";
import { useNavigate } from "react-router-dom";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "./Choferes.css";
import api from "../services/api";

function Choferes() {
  const navigate = useNavigate();

  const tablaRef = useRef(null);
  const tablaInstancia = useRef(null);

  const [choferes, setChoferes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setError("");

      const [datosChoferes, datosUsuarios] = await Promise.all([
        api("/api/vchoferes"),
        api("/api/users")
      ]);

      setChoferes(
        Array.isArray(datosChoferes)
          ? datosChoferes
          : []
      );

      setUsuarios(
        Array.isArray(datosUsuarios)
          ? datosUsuarios
          : []
      );

    } catch (e) {

      console.error(
        "Error al cargar choferes:",
        e
      );

      setError(
        e.message ||
        "No se pudieron cargar los choferes."
      );

      setChoferes([]);
      setUsuarios([]);

    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {

    if (!tablaRef.current || cargando) {
      return;
    }

    if (tablaInstancia.current) {

      tablaInstancia.current.destroy();
      tablaInstancia.current = null;

    }

    const usuariosPorId = new Map(
      usuarios.map(
        (usuario) => [
          usuario.ID_Usuario,
          usuario.Correo
        ]
      )
    );

    const datosTabla = choferes.map(
      (chofer) => ({
        ...chofer,
        Correo:
          usuariosPorId.get(
            chofer.ID_Usuario
          ) || "Sin correo"
      })
    );

    tablaInstancia.current = new DataTable(
      tablaRef.current,
      {
        data: datosTabla,

        columns: [

          {
            data: "ID_Chof",
            title: "ID"
          },

          {
            data: "Correo",
            title: "Correo"
          },

          {
            data: "Nombre",
            title: "Nombre"
          },

          {
            data: "NSS",
            title: "NSS"
          },

          {
            data: "Licencia",
            title: "Licencia"
          },

          {
            data: "Edad",
            title: "Edad"
          },

          {
            data: "Sexo",
            title: "Sexo",

            render: (data) =>
              data || "—"
          }

        ],

        language: {

          search: "Buscar:",

          lengthMenu:
            "Mostrar _MENU_ choferes",

          info:
            "Mostrando _START_ a _END_ de _TOTAL_ choferes",

          infoEmpty:
            "No hay choferes disponibles",

          zeroRecords:
            "No se encontraron choferes",

          emptyTable:
            "No hay choferes registrados",

          paginate: {
            first: "Primero",
            last: "Último",
            next: "Siguiente",
            previous: "Anterior"
          }

        },

        pageLength: 10,

        order: [
          [0, "asc"]
        ]

      }
    );

    return () => {

      if (tablaInstancia.current) {

        tablaInstancia.current.destroy();

        tablaInstancia.current = null;

      }

    };

  }, [
    choferes,
    usuarios,
    cargando
  ]);

  return (

    <div className="choferes-container">

      <header className="choferes-header">

        <div>

          <p className="choferes-eyebrow">
            TRANSPORTES MX
          </p>

          <h1>
            Gestión de Choferes
          </h1>

          <p>
            Consulta la información de los
            choferes registrados en el sistema.
          </p>

        </div>

        <button
          className="btn-dashboard"
          onClick={() =>
            navigate("/dashboard")
          }
        >
          ← Volver al Dashboard
        </button>

      </header>

      {error && (

        <div className="choferes-mensaje error">
          ⚠ {error}
        </div>

      )}

      <section className="choferes-resumen">

        <div className="chofer-card">

          <span>
            👨‍✈️
          </span>

          <div>

            <small>
              Choferes registrados
            </small>

            <strong>
              {cargando
                ? "—"
                : choferes.length}
            </strong>

          </div>

        </div>

        <div className="chofer-card">

          <span>
            🪪
          </span>

          <div>

            <small>
              Con licencia registrada
            </small>

            <strong>

              {cargando
                ? "—"
                : choferes.filter(
                    (chofer) =>
                      Boolean(
                        chofer.Licencia
                      )
                  ).length}

            </strong>

          </div>

        </div>

        <div className="chofer-card">

          <span>
            👤
          </span>

          <div>

            <small>
              Con usuario asociado
            </small>

            <strong>

              {cargando
                ? "—"
                : choferes.filter(
                    (chofer) =>
                      Boolean(
                        chofer.ID_Usuario
                      )
                  ).length}

            </strong>

          </div>

        </div>

      </section>

      <section className="choferes-panel">

        <div className="choferes-panel-header">

          <div>

            <h2>
              Choferes registrados
            </h2>

            <p>
              Información obtenida
              directamente desde PostgreSQL.
            </p>

          </div>

          <button
            className="btn-recargar"
            onClick={cargarDatos}
            disabled={cargando}
          >
            ↻{" "}
            {cargando
              ? "Cargando..."
              : "Actualizar"}
          </button>

        </div>

        <div className="choferes-tabla-container">

          <table
            ref={tablaRef}
            className="display"
            style={{
              width: "100%"
            }}
          >

            <thead>

              <tr>

                <th>ID</th>
                <th>Correo</th>
                <th>Nombre</th>
                <th>NSS</th>
                <th>Licencia</th>
                <th>Edad</th>
                <th>Sexo</th>

              </tr>

            </thead>

            <tbody />

          </table>

        </div>

      </section>

    </div>

  );
}

export default Choferes;