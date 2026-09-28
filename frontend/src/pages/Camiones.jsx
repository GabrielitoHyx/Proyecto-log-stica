import { useEffect, useRef, useState } from "react";
import DataTable from "datatables.net-dt";
import { useNavigate } from "react-router-dom";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "./Camiones.css";
import api from "../services/api";

const Camiones = () => {
  const navigate = useNavigate();

  const tablaRef = useRef(null);
  const tablaInstancia = useRef(null);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [camionSeleccionado, setCamionSeleccionado] = useState(null);

  const [modoFormulario, setModoFormulario] = useState("crear");

  const [formulario, setFormulario] = useState({
    Placas: "",
    Modelo: "",
    Kilometraje_total: "",
    Capacidad_tanque: "",
    Capacidad_carga: ""
  });

  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  // =========================================================
  // INICIALIZAR DATATABLE
  // =========================================================

  useEffect(() => {
    if (!tablaRef.current) return;

    tablaInstancia.current = new DataTable(tablaRef.current, {
      ajax: async function (_data, callback) {
        try {
          const datos = await api("/api/vcamiones");

          callback({
            data: Array.isArray(datos) ? datos : []
          });

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
          render: function (data) {
            return data !== null &&
              data !== undefined &&
              data !== ""
              ? `${data} km`
              : "—";
          }
        },
        {
          data: "Capacidad_tanque",
          title: "Tanque",
          render: function (data) {
            return data !== null &&
              data !== undefined &&
              data !== ""
              ? `${data} L`
              : "—";
          }
        },
        {
          data: "Capacidad_carga",
          title: "Capacidad de carga",
          render: function (data) {
            return data !== null &&
              data !== undefined &&
              data !== ""
              ? `${data} Ton`
              : "—";
          }
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

      order: [
        [0, "asc"]
      ]
    });

    // =====================================================
    // SELECCIONAR CAMIÓN AL HACER CLICK EN UNA FILA
    // =====================================================

    const manejarClick = (evento) => {
      const fila = evento.target.closest("tbody tr");

      if (!fila) return;

      const datos = tablaInstancia.current
        .row(fila)
        .data();

      if (datos) {
        setCamionSeleccionado(datos);
        setError("");
        setMensaje("");
      }
    };

    tablaRef.current.addEventListener(
      "click",
      manejarClick
    );

    // =====================================================
    // LIMPIEZA
    // =====================================================

    return () => {
      if (tablaRef.current) {
        tablaRef.current.removeEventListener(
          "click",
          manejarClick
        );
      }

      if (tablaInstancia.current) {
        tablaInstancia.current.destroy();
        tablaInstancia.current = null;
      }
    };
  }, []);

  // =========================================================
  // ABRIR FORMULARIO PARA CREAR
  // =========================================================

  const abrirFormulario = () => {
    setError("");
    setMensaje("");

    setModoFormulario("crear");

    setFormulario({
      Placas: "",
      Modelo: "",
      Kilometraje_total: "",
      Capacidad_tanque: "",
      Capacidad_carga: ""
    });

    setCamionSeleccionado(null);

    setMostrarFormulario(true);
  };

  // =========================================================
  // ABRIR FORMULARIO PARA EDITAR
  // =========================================================

  const editarCamion = () => {
    if (!camionSeleccionado) {
      setError("Selecciona un camión de la tabla");
      return;
    }

    setError("");
    setMensaje("");

    setModoFormulario("editar");

    setFormulario({
      Placas: camionSeleccionado.Placas || "",
      Modelo: camionSeleccionado.Modelo || "",
      Kilometraje_total:
        camionSeleccionado.Kilometraje_total ?? "",
      Capacidad_tanque:
        camionSeleccionado.Capacidad_tanque ?? "",
      Capacidad_carga:
        camionSeleccionado.Capacidad_carga ?? ""
    });

    setMostrarFormulario(true);
  };

  // =========================================================
  // CERRAR FORMULARIO
  // =========================================================

  const cerrarFormulario = () => {
    setMostrarFormulario(false);

    setFormulario({
      Placas: "",
      Modelo: "",
      Kilometraje_total: "",
      Capacidad_tanque: "",
      Capacidad_carga: ""
    });

    setError("");
    setMensaje("");
  };

  // =========================================================
  // CAMBIAR VALORES DEL FORMULARIO
  // =========================================================

  const manejarCambio = (evento) => {
    const { name, value } = evento.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value
    }));

    setError("");
    setMensaje("");
  };

  // =========================================================
  // VALIDAR FORMULARIO
  // =========================================================

  const validarFormulario = () => {
    const placas = formulario.Placas.trim();
    const modelo = formulario.Modelo.trim();

    if (!placas) {
      setError("Las placas son obligatorias");
      return false;
    }

    if (!modelo) {
      setError("El modelo del camión es obligatorio");
      return false;
    }

    if (
      formulario.Kilometraje_total !== "" &&
      Number(formulario.Kilometraje_total) < 0
    ) {
      setError("El kilometraje no puede ser negativo");
      return false;
    }

    if (
      formulario.Capacidad_tanque !== "" &&
      Number(formulario.Capacidad_tanque) < 0
    ) {
      setError(
        "La capacidad del tanque no puede ser negativa"
      );
      return false;
    }

    if (
      formulario.Capacidad_carga !== "" &&
      Number(formulario.Capacidad_carga) < 0
    ) {
      setError(
        "La capacidad de carga no puede ser negativa"
      );
      return false;
    }

    return true;
  };

  // =========================================================
  // REGISTRAR / EDITAR CAMIÓN
  // =========================================================

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

      // =====================================================
      // CREAR
      // =====================================================

      if (modoFormulario === "crear") {

        const datos = await api("/api/rcamiones", {
          method: "POST",
          body: JSON.stringify(payload)
        });

        setMensaje(
          datos.mensaje ||
          "Camión registrado correctamente"
        );
      }

      // =====================================================
      // EDITAR
      // =====================================================

      else {

        if (!camionSeleccionado) {
          throw new Error(
            "No hay un camión seleccionado"
          );
        }

        const datos = await api(
          `/api/ecamiones/${camionSeleccionado.ID_CA}`,
          {
            method: "PUT",
            body: JSON.stringify(payload)
          }
        );

        setMensaje(
          datos.mensaje ||
          "Camión actualizado correctamente"
        );
      }

      // =====================================================
      // ACTUALIZAR TABLA
      // =====================================================

      if (tablaInstancia.current) {
        tablaInstancia.current.ajax.reload(
          null,
          false
        );
      }

      // =====================================================
      // CERRAR FORMULARIO
      // =====================================================

      setTimeout(() => {

        setMostrarFormulario(false);

        setFormulario({
          Placas: "",
          Modelo: "",
          Kilometraje_total: "",
          Capacidad_tanque: "",
          Capacidad_carga: ""
        });

        setCamionSeleccionado(null);

        setMensaje("");

      }, 1200);

    } catch (error) {

      console.error(error);

      setError(
        error.message ||
        (
          modoFormulario === "crear"
            ? "No se pudo registrar el camión."
            : "No se pudo actualizar el camión."
        )
      );

    } finally {

      setCargando(false);

    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="camiones-container">

      {/* =====================================================
          ENCABEZADO
      ====================================================== */}

      <div className="camiones-header">

        <div>

          <p className="camiones-eyebrow">
            TRANSPORTES MX
          </p>

          <h1>
            Gestión de Camiones
          </h1>

          <p>
            Consulta y registra las unidades disponibles
            para la operación.
          </p>

        </div>

        <button
          className="btn-dashboard"
          onClick={() => navigate("/dashboard")}
        >
          ← Volver al Dashboard
        </button>

      </div>

      {/* =====================================================
          MENSAJES
      ====================================================== */}

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

      {/* =====================================================
          BOTONES DE ACCIONES
      ====================================================== */}

      <div className="camiones-acciones">

        <button
          className="btn-agregar"
          onClick={abrirFormulario}
        >
          Registrar camión
        </button>

        <button
          className="btn-editar"
          onClick={editarCamion}
          disabled={!camionSeleccionado}
        >
          Editar camión
        </button>

      </div>

      {/* =====================================================
          CAMIÓN SELECCIONADO
      ====================================================== */}

      {camionSeleccionado && (
        <div className="camion-seleccionado">

          <strong>Camión seleccionado:</strong>{" "}

          {camionSeleccionado.Placas}

        </div>
      )}

      {/* =====================================================
          TABLA
      ====================================================== */}

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
            </tr>

          </thead>

          <tbody></tbody>

        </table>

      </div>

      {/* =====================================================
          FORMULARIO
      ====================================================== */}

      {mostrarFormulario && (

        <div className="formulario-overlay">

          <div className="formulario-camion">

            <h2>

              {modoFormulario === "crear"
                ? "Registrar nuevo camión"
                : "Editar camión"}

            </h2>

            <form onSubmit={manejarSubmit}>

              {/* =================================================
                  PLACAS
              ================================================== */}

              <div className="campo">

                <label htmlFor="Placas">
                  Placas
                </label>

                <input
                  type="text"
                  id="Placas"
                  name="Placas"
                  value={formulario.Placas}
                  onChange={manejarCambio}
                  placeholder="Ej. ABC-123"
                  required
                />

              </div>

              {/* =================================================
                  MODELO
              ================================================== */}

              <div className="campo">

                <label htmlFor="Modelo">
                  Modelo
                </label>

                <input
                  type="text"
                  id="Modelo"
                  name="Modelo"
                  value={formulario.Modelo}
                  onChange={manejarCambio}
                  placeholder="Ej. Freightliner 2024"
                  required
                />

              </div>

              {/* =================================================
                  KILOMETRAJE
              ================================================== */}

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

              {/* =================================================
                  TANQUE
              ================================================== */}

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

              {/* =================================================
                  CAPACIDAD
              ================================================== */}

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

              {/* =================================================
                  BOTONES
              ================================================== */}

              <div className="formulario-botones">

                <button
                  type="submit"
                  className="btn-guardar"
                  disabled={cargando}
                >
                  {cargando
                    ? "Guardando..."
                    : modoFormulario === "crear"
                    ? "Registrar camión"
                    : "Guardar cambios"}
                </button>

                <button
                  type="button"
                  className="btn-cancelar"
                  onClick={cerrarFormulario}
                  disabled={cargando}
                >
                  Cancelar
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
};

export default Camiones;