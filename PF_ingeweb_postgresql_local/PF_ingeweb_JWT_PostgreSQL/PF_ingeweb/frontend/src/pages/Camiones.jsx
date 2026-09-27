import { useEffect, useRef, useState } from "react";
import DataTable from "datatables.net-dt";
import { useNavigate } from "react-router-dom";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "./Camiones.css";
import api from "../services/api";

const formularioInicial = {
  Placas: "",
  Modelo: "",
  Kilometraje_total: "",
  Capacidad_tanque: "",
  Capacidad_carga: ""
};

function Camiones() {
  const navigate = useNavigate();

  const tablaRef = useRef(null);
  const tablaInstancia = useRef(null);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  const camionesRef = useRef([]);
  const [camionEditandoId, setCamionEditandoId] = useState(null);

  useEffect(() => {
    if (!tablaRef.current) return;

    tablaInstancia.current = new DataTable(tablaRef.current, {
      ajax: async function (_data, callback) {
        try {
          const datos = await api("/api/vcamiones");
          camionesRef.current = Array.isArray(datos) ? datos : [];
          callback({ data: camionesRef.current });
        } catch (error) {
          console.error("Error DataTables:", error);

          callback({
            data: []
          });

          setError(
            error.message || "No se pudieron cargar los camiones."
          );
        }
      },

      columns: [
        {
          data: "ID_CA",
          title: "ID"
        },
        {
          data: "Placas",
          title: "Placas"
        },
        {
          data: "Modelo",
          title: "Modelo"
        },
        {
          data: "Kilometraje_total",
          title: "Kilometraje",
          render: (data) =>
            data !== null &&
            data !== undefined &&
            data !== ""
              ? `${data} km`
              : "—"
        },
        {
          data: "Capacidad_tanque",
          title: "Tanque",
          render: (data) =>
            data !== null &&
            data !== undefined &&
            data !== ""
              ? `${data} L`
              : "—"
        },
        {
          data: "Capacidad_carga",
          title: "Capacidad de carga",
          render: (data) =>
            data !== null &&
            data !== undefined &&
            data !== ""
              ? `${data} Ton`
              : "—"
        },
        {
          data: null,
          title: "Acciones",
          orderable: false,
          render: (data) =>
            `<button type="button" class="btn-editar-camion" data-id="${data.ID_CA}">Editar</button>`
        }

      ],

      language: {
        search: "Buscar:",
        lengthMenu: "Mostrar _MENU_ camiones",
        info: "Mostrando _START_ a _END_ de _TOTAL_ camiones",
        infoEmpty: "No hay camiones disponibles",
        zeroRecords: "No se encontraron camiones",
        emptyTable: "No hay camiones registrados",
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
  }, []);

  useEffect(() => {
    const tabla = tablaRef.current;
    if (!tabla) return;

    const manejarClickTabla = (evento) => {
      const boton = evento.target.closest(".btn-editar-camion");
      if (!boton) return;

      const camion = camionesRef.current.find(
        (c) => String(c.ID_CA) === String(boton.dataset.id)
      );

      if (camion) abrirFormularioEdicion(camion);
    };

    tabla.addEventListener("click", manejarClickTabla);
    return () => tabla.removeEventListener("click", manejarClickTabla);
  }, []);

  const abrirFormulario = () => {
    setFormulario(formularioInicial);
    setCamionEditandoId(null);
    setError("");
    setMensaje("");
    setMostrarFormulario(true);
  };

  const abrirFormularioEdicion = (camion) => {
    setFormulario({
      Placas: camion.Placas || "",
      Modelo: camion.Modelo || "",
      Kilometraje_total: camion.Kilometraje_total ?? "",
      Capacidad_tanque: camion.Capacidad_tanque ?? "",
      Capacidad_carga: camion.Capacidad_carga ?? ""
    });
    setCamionEditandoId(camion.ID_CA);
    setError("");
    setMensaje("");
    setMostrarFormulario(true);
  };

  const cerrarFormulario = () => {
    setMostrarFormulario(false);
    setFormulario(formularioInicial);
    setCamionEditandoId(null);
    setError("");
  };

  const manejarCambio = (evento) => {
    const { name, value } = evento.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value
    }));

    setError("");
    setMensaje("");
  };

  const validarFormulario = () => {
    const placas = formulario.Placas.trim();
    const modelo = formulario.Modelo.trim();

    if (!placas) {
      setError("Las placas son obligatorias.");
      return false;
    }

    if (!modelo) {
      setError("El modelo del camión es obligatorio.");
      return false;
    }

    if (
      formulario.Kilometraje_total !== "" &&
      Number(formulario.Kilometraje_total) < 0
    ) {
      setError("El kilometraje no puede ser negativo.");
      return false;
    }

    if (
      formulario.Capacidad_tanque !== "" &&
      Number(formulario.Capacidad_tanque) < 0
    ) {
      setError("La capacidad del tanque no puede ser negativa.");
      return false;
    }

    if (
      formulario.Capacidad_carga !== "" &&
      Number(formulario.Capacidad_carga) < 0
    ) {
      setError("La capacidad de carga no puede ser negativa.");
      return false;
    }

    return true;
  };

  const manejarSubmit = async (evento) => {
    evento.preventDefault();

    setError("");
    setMensaje("");

    if (!validarFormulario()) {
      return;
    }

    setCargando(true);

    const payload = {
      Placas: formulario.Placas.trim(),
      Modelo: formulario.Modelo.trim(),

      Kilometraje_total:
        formulario.Kilometraje_total === ""
          ? null
          : Number(formulario.Kilometraje_total),

      Capacidad_tanque:
        formulario.Capacidad_tanque === ""
          ? null
          : Number(formulario.Capacidad_tanque),

      Capacidad_carga:
        formulario.Capacidad_carga === ""
          ? null
          : Number(formulario.Capacidad_carga)
    };

    try {
      const datos = camionEditandoId
        ? await api(`/api/ecamiones/${camionEditandoId}`, {
            method: "PUT",
            body: JSON.stringify(payload)
          })
        : await api("/api/rcamiones", {
            method: "POST",
            body: JSON.stringify(payload)
          });

      setMensaje(
        datos.mensaje ||
        (camionEditandoId
          ? "Camión actualizado correctamente."
          : "Camión registrado correctamente.")
      );

      setFormulario(formularioInicial);
      setCamionEditandoId(null);

      if (tablaInstancia.current) {
        tablaInstancia.current.ajax.reload(null, false);
      }

      setTimeout(() => {
        setMostrarFormulario(false);
        setMensaje("");
      }, 1200);

    } catch (error) {
      console.error(error);

      setError(
        error.message ||
        (camionEditandoId
          ? "No se pudo actualizar el camión."
          : "No se pudo registrar el camión.")
      );

    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="camiones-container">

      <div className="camiones-header">

        <div>

          <p className="camiones-eyebrow">
            TRANSPORTES MX
          </p>

          <h1>
            Gestión de Camiones
          </h1>

          <p>
            Consulta y registra las unidades disponibles para la operación.
          </p>

        </div>

        <button
          className="btn-dashboard"
          onClick={() => navigate("/dashboard")}
        >
           ← Volver al Dashboard
        </button>

      </div>

      {error && (
        <div className="mensaje error">
          {error}
        </div>
      )}

      {mensaje && (
        <div className="mensaje exito">
          {mensaje}
        </div>
      )}

      <div className="camiones-acciones">

        <button
          className="btn-agregar"
          onClick={abrirFormulario}
        >
          Registrar camión
        </button>

      </div>

      <div className="tabla-container">

        <table
          ref={tablaRef}
          className="display"
          style={{ width: "100%" }}
        >

          <thead>
            <tr>
              <th>ID</th>
              <th>Placas</th>
              <th>Modelo</th>
              <th>Kilometraje</th>
              <th>Tanque</th>
              <th>Capacidad de carga</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody></tbody>

        </table>

      </div>

      {mostrarFormulario && (

        <div className="formulario-overlay">

          <div className="formulario-camion">

            <h2>
              {camionEditandoId ? "Editar camión" : "Registrar nuevo camión"}
            </h2>

            <form onSubmit={manejarSubmit}>

              <div className="campo">

                <label htmlFor="Placas">
                  Placas
                </label>

                <input
                  id="Placas"
                  name="Placas"
                  value={formulario.Placas}
                  onChange={manejarCambio}
                  placeholder="Ej. ABC-123"
                  required
                />

              </div>

              <div className="campo">

                <label htmlFor="Modelo">
                  Modelo
                </label>

                <input
                  id="Modelo"
                  name="Modelo"
                  value={formulario.Modelo}
                  onChange={manejarCambio}
                  placeholder="Ej. Freightliner 2024"
                  required
                />

              </div>

              <div className="campo">

                <label htmlFor="Kilometraje_total">
                  Kilometraje total (km)
                </label>

                <input
                  id="Kilometraje_total"
                  name="Kilometraje_total"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formulario.Kilometraje_total}
                  onChange={manejarCambio}
                  placeholder="Ej. 125000"
                />

              </div>

              <div className="campo">

                <label htmlFor="Capacidad_tanque">
                  Capacidad del tanque (L)
                </label>

                <input
                  id="Capacidad_tanque"
                  name="Capacidad_tanque"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formulario.Capacidad_tanque}
                  onChange={manejarCambio}
                  placeholder="Ej. 500"
                />

              </div>

              <div className="campo">

                <label htmlFor="Capacidad_carga">
                  Capacidad de carga (Ton)
                </label>

                <input
                  id="Capacidad_carga"
                  name="Capacidad_carga"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formulario.Capacidad_carga}
                  onChange={manejarCambio}
                  placeholder="Ej. 10"
                />

              </div>

              <div className="formulario-botones">

                <button
                  type="button"
                  className="btn-cancelar"
                  onClick={cerrarFormulario}
                  disabled={cargando}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="btn-guardar"
                  disabled={cargando}
                >
                  {cargando
                    ? "Guardando..."
                    : camionEditandoId
                      ? "Guardar cambios"
                      : "Guardar camión"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default Camiones;