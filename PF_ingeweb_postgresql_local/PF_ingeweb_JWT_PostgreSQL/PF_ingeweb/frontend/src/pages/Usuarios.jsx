import { useEffect, useRef, useState } from "react";
import DataTable from "datatables.net-dt";
import { useNavigate } from "react-router-dom";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "./Usuarios.css";
import api from "../services/api";

function Usuarios() {
  const navigate = useNavigate();
  const tablaRef = useRef(null);
  const tablaInstancia = useRef(null);

  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargarUsuarios = async () => {
    try {
      setCargando(true);
      setError("");

      const datos = await api("/api/users");
      setUsuarios(Array.isArray(datos) ? datos : []);
    } catch (e) {
      console.error("Error al cargar usuarios:", e);
      setError(e.message || "No se pudieron cargar los usuarios.");
      setUsuarios([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  useEffect(() => {
    if (!tablaRef.current || cargando) return;

    if (tablaInstancia.current) {
      tablaInstancia.current.destroy();
      tablaInstancia.current = null;
    }

    tablaInstancia.current = new DataTable(tablaRef.current, {
      data: usuarios,
      columns: [
        {
          data: "ID_Usuario",
          title: "ID"
        },
        {
          data: "Correo",
          title: "Correo"
        },
        {
          data: "Rol",
          title: "Rol",
          render: (data) => {
            const clase = String(data || "")
              .toLowerCase()
              .replace(/\s+/g, "-");

            return `<span class="usuario-rol ${clase}">
              ${data || "Sin rol"}
            </span>`;
          }
        }
      ],
      language: {
        search: "Buscar:",
        lengthMenu: "Mostrar _MENU_ usuarios",
        info: "Mostrando _START_ a _END_ de _TOTAL_ usuarios",
        infoEmpty: "No hay usuarios disponibles",
        zeroRecords: "No se encontraron usuarios",
        emptyTable: "No hay usuarios registrados",
        paginate: {
          first: "Primero",
          last: "Último",
          next: "Siguiente",
          previous: "Anterior"
        }
      },
      pageLength: 10,
      order: [[0, "asc"]]
    });

    return () => {
      if (tablaInstancia.current) {
        tablaInstancia.current.destroy();
        tablaInstancia.current = null;
      }
    };
  }, [usuarios, cargando]);

  const administradores = usuarios.filter(
    (usuario) => usuario.Rol === "Admin"
  ).length;

  const choferes = usuarios.filter(
    (usuario) => usuario.Rol === "Chofer"
  ).length;

  const clientes = usuarios.filter(
    (usuario) => usuario.Rol === "Cliente"
  ).length;

  return (
    <div className="usuarios-container">

      <header className="usuarios-header">

        <div>
          <p className="usuarios-eyebrow">
            TRANSPORTES MX
          </p>

          <h1>
            Gestión de Usuarios
          </h1>

          <p>
            Consulta los usuarios registrados y el rol asignado a cada cuenta.
          </p>
        </div>

        <button
          className="btn-dashboard"
          onClick={() => navigate("/dashboard")}
        >
          ← Volver al Dashboard
        </button>

      </header>

      {error && (
        <div className="usuarios-mensaje error">
          ⚠ {error}
        </div>
      )}

      <section className="usuarios-resumen">

        <div className="usuario-card">
          <span>👥</span>

          <div>
            <small>Total de usuarios</small>

            <strong>
              {cargando ? "—" : usuarios.length}
            </strong>
          </div>
        </div>

        <div className="usuario-card">
          <span>🔐</span>

          <div>
            <small>Administradores</small>

            <strong>
              {cargando ? "—" : administradores}
            </strong>
          </div>
        </div>

        <div className="usuario-card">
          <span>👨‍✈️</span>

          <div>
            <small>Choferes</small>

            <strong>
              {cargando ? "—" : choferes}
            </strong>
          </div>
        </div>

        <div className="usuario-card">
          <span>👤</span>

          <div>
            <small>Clientes</small>

            <strong>
              {cargando ? "—" : clientes}
            </strong>
          </div>
        </div>

      </section>

      <section className="usuarios-panel">

        <div className="usuarios-panel-header">

          <div>
            <h2>
              Usuarios registrados
            </h2>

            <p>
              Información obtenida directamente desde PostgreSQL.
            </p>
          </div>

          <button
            className="btn-recargar"
            onClick={cargarUsuarios}
            disabled={cargando}
          >
            ↻ {cargando ? "Cargando..." : "Actualizar"}
          </button>

        </div>

        <div className="usuarios-tabla-container">

          <table
            ref={tablaRef}
            className="display"
            style={{ width: "100%" }}
          >

            <thead>
              <tr>
                <th>ID</th>
                <th>Correo</th>
                <th>Rol</th>
              </tr>
            </thead>

            <tbody />

          </table>

        </div>

      </section>

    </div>
  );
}

export default Usuarios;