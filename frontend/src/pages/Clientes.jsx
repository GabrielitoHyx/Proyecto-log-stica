import { useEffect, useRef, useState } from "react";
import DataTable from "datatables.net-dt";
import { useNavigate } from "react-router-dom";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "./Clientes.css";

const Clientes = () => {
  const navigate = useNavigate();

  const tablaRef = useRef(null);
  const tablaInstancia = useRef(null);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [usuariosDisponibles, setUsuariosDisponibles] = useState([]);

  const [modoFormulario, setModoFormulario] = useState("crear");

  const [formulario, setFormulario] = useState({
    correo: "",
    nombre: "",
    telefono: ""
  });

  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  // =========================================================
  // CARGAR USUARIOS DISPONIBLES PARA REGISTRAR COMO CLIENTES
  // =========================================================

  const cargarUsuariosDisponibles = async () => {
    try {
      const respuesta = await fetch(
        "http://localhost:5000/api/usuarios-clientes",
        {
          credentials: "include"
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.error || "Error al obtener usuarios disponibles"
        );
      }

      setUsuariosDisponibles(datos);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
      setError(error.message);
    }
  };

  // =========================================================
  // INICIALIZAR DATATABLE
  // =========================================================

  useEffect(() => {
    if (!tablaRef.current) return;

    tablaInstancia.current = new DataTable(tablaRef.current, {
      ajax: async function (data, callback) {
        try {
          const respuesta = await fetch(
            "http://localhost:5000/api/vclientes",
            {
              credentials: "include"
            }
          );

          const datos = await respuesta.json();

          if (!respuesta.ok) {
            throw new Error(
              datos.error || "Error al obtener clientes"
            );
          }

          callback({
            data: datos
          });

        } catch (error) {
          console.error("Error DataTables:", error);

          callback({
            data: []
          });

          setError(error.message);
        }
      },

      columns: [
        {
          data: "ID_CLI",
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
          data: "Telefono",
          title: "Teléfono"
        },
        {
          data: "Estado",
          title: "Estado",
          render: function (data) {
            return data
              ? '<span class="estado activo">Activo</span>'
              : '<span class="estado inactivo">Inactivo</span>';
          }
        }
      ],

      language: {
        search: "Buscar:",
        lengthMenu: "Mostrar _MENU_ clientes",
        info: "Mostrando _START_ a _END_ de _TOTAL_ clientes",
        infoEmpty: "No hay clientes disponibles",
        zeroRecords: "No se encontraron clientes",
        emptyTable: "No hay clientes registrados",
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
    // SELECCIONAR CLIENTE AL HACER CLICK EN UNA FILA
    // =====================================================

    const manejarClick = (evento) => {
      const fila = evento.target.closest("tbody tr");

      if (!fila) return;

      const datos = tablaInstancia.current
        .row(fila)
        .data();

      if (datos) {
        setClienteSeleccionado(datos);
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
  // ABRIR FORMULARIO PARA CREAR CLIENTE
  // =========================================================

  const abrirFormulario = async () => {
    setError("");
    setMensaje("");

    setModoFormulario("crear");

    setFormulario({
      correo: "",
      nombre: "",
      telefono: ""
    });

    setClienteSeleccionado(null);

    await cargarUsuariosDisponibles();

    setMostrarFormulario(true);
  };

  // =========================================================
  // ABRIR FORMULARIO PARA EDITAR CLIENTE
  // =========================================================

  const editarCliente = () => {
    if (!clienteSeleccionado) {
      setError("Selecciona un cliente de la tabla");
      return;
    }

    setError("");
    setMensaje("");

    setModoFormulario("editar");

    setFormulario({
      correo: clienteSeleccionado.Correo || "",
      nombre: clienteSeleccionado.Nombre || "",
      telefono: clienteSeleccionado.Telefono || ""
    });

    setMostrarFormulario(true);
  };

  // =========================================================
  // CERRAR FORMULARIO
  // =========================================================

  const cerrarFormulario = () => {
    setMostrarFormulario(false);

    setFormulario({
      correo: "",
      nombre: "",
      telefono: ""
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
  // VALIDACIÓN DEL CLIENTE
  // =========================================================

  const validarFormulario = () => {
    const nombre = formulario.nombre.trim();
    const telefono = formulario.telefono.trim();

    // ---------------------------------------------
    // VALIDAR NOMBRE
    // ---------------------------------------------

    if (!nombre) {
      setError("El nombre es obligatorio");
      return false;
    }

    if (nombre.length < 4) {
      setError(
        "El nombre debe tener al menos 4 caracteres"
      );
      return false;
    }

    // ---------------------------------------------
    // VALIDAR TELÉFONO
    // ---------------------------------------------

    if (!telefono) {
      setError("El teléfono es obligatorio");
      return false;
    }

    if (!/^\d{10}$/.test(telefono)) {
      setError(
        "El teléfono debe contener exactamente 10 dígitos"
      );
      return false;
    }

    return true;
  };

  // =========================================================
  // REGISTRAR / EDITAR CLIENTE
  // =========================================================

  const manejarSubmit = async (evento) => {
    evento.preventDefault();

    setError("");
    setMensaje("");

    // Validaciones
    if (!validarFormulario()) {
      return;
    }

    setCargando(true);

    try {
      // =====================================================
      // CREAR CLIENTE
      // =====================================================

      if (modoFormulario === "crear") {
        if (!formulario.correo) {
          setError("Debes seleccionar un correo");
          setCargando(false);
          return;
        }

        const respuesta = await fetch(
          "http://localhost:5000/api/rclientes",
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              correo: formulario.correo,
              nombre: formulario.nombre.trim(),
              telefono: formulario.telefono.trim()
            })
          }
        );

        const datos = await respuesta.json();

        if (!respuesta.ok) {
          throw new Error(
            datos.error || "Error al registrar cliente"
          );
        }

        setMensaje(
          "Cliente registrado correctamente"
        );

        // Recargar usuarios disponibles
        await cargarUsuariosDisponibles();

      }

      // =====================================================
      // EDITAR CLIENTE
      // =====================================================

      else {
        if (!clienteSeleccionado) {
          throw new Error(
            "No hay un cliente seleccionado"
          );
        }

        const respuesta = await fetch(
          `http://localhost:5000/api/clientes/${clienteSeleccionado.ID_CLI}`,
          {
            method: "PATCH",
            credentials: "include",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              nombre: formulario.nombre.trim(),
              telefono: formulario.telefono.trim()
            })
          }
        );

        const datos = await respuesta.json();

        if (!respuesta.ok) {
          throw new Error(
            datos.error || "Error al actualizar cliente"
          );
        }

        setMensaje(
          "Cliente actualizado correctamente"
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
      // CERRAR FORMULARIO DESPUÉS DE UN MOMENTO
      // =====================================================

      setTimeout(() => {
        setMostrarFormulario(false);

        setFormulario({
          correo: "",
          nombre: "",
          telefono: ""
        });

        setMensaje("");
      }, 1200);

    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setCargando(false);
    }
  };

  // =========================================================
  // CAMBIAR ESTADO DEL CLIENTE
  // =========================================================

  const cambiarEstado = async () => {
    if (!clienteSeleccionado) {
      setError("Selecciona un cliente de la tabla");
      return;
    }

    setError("");
    setMensaje("");

    const nuevoEstado = !clienteSeleccionado.Estado;

    const confirmacion = window.confirm(
      nuevoEstado
        ? "¿Deseas reactivar este cliente?"
        : "¿Deseas dar de baja este cliente?"
    );

    if (!confirmacion) {
      return;
    }

    try {
      const respuesta = await fetch(
        `http://localhost:5000/api/clientes/${clienteSeleccionado.ID_CLI}/estado`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            estado: nuevoEstado
          })
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.error ||
          "Error al cambiar el estado del cliente"
        );
      }

      setMensaje(datos.mensaje);

      // Actualizar selección local
      setClienteSeleccionado({
        ...clienteSeleccionado,
        Estado: nuevoEstado
      });

      // Recargar tabla
      if (tablaInstancia.current) {
        tablaInstancia.current.ajax.reload(
          null,
          false
        );
      }

    } catch (error) {
      console.error(error);
      setError(error.message);
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="clientes-container">

      {/* =====================================================
          ENCABEZADO
      ====================================================== */}

      <div className="clientes-header">

        <h1>Gestión de Clientes</h1>

        <button
          className="btn-dashboard"
          onClick={() => navigate("/dashboard")}
        >
          Volver al Dashboard
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

      <div className="clientes-acciones">

        <button
          className="btn-agregar"
          onClick={abrirFormulario}
        >
          Registrar cliente
        </button>

        <button
          className="btn-editar"
          onClick={editarCliente}
          disabled={!clienteSeleccionado}
        >
          Editar cliente
        </button>

        <button
          className="btn-estado"
          onClick={cambiarEstado}
          disabled={!clienteSeleccionado}
        >
          {clienteSeleccionado?.Estado
            ? "Dar de baja"
            : "Reactivar cliente"}
        </button>

      </div>

      {/* =====================================================
          CLIENTE SELECCIONADO
      ====================================================== */}

      {clienteSeleccionado && (
        <div className="cliente-seleccionado">

          <strong>Cliente seleccionado:</strong>{" "}

          {clienteSeleccionado.Nombre}

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
              <th>Correo</th>
              <th>Nombre</th>
              <th>Teléfono</th>
              <th>Estado</th>
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

          <div className="formulario-cliente">

            <h2>
              {modoFormulario === "crear"
                ? "Registrar nuevo cliente"
                : "Editar cliente"}
            </h2>

            <form onSubmit={manejarSubmit}>

              {/* =================================================
                  CORREO
              ================================================== */}

              <div className="campo">

                <label htmlFor="correo">
                  Correo
                </label>

                {modoFormulario === "crear" ? (

                  <select
                    id="correo"
                    name="correo"
                    value={formulario.correo}
                    onChange={manejarCambio}
                    required
                  >

                    <option value="">
                      Selecciona un usuario
                    </option>

                    {usuariosDisponibles.map(
                      (usuario, index) => (
                        <option
                          key={usuario.Correo || index}
                          value={usuario.Correo}
                        >
                          {usuario.Correo}
                        </option>
                      )
                    )}

                  </select>

                ) : (

                  <input
                    type="email"
                    id="correo"
                    name="correo"
                    value={formulario.correo}
                    disabled
                  />

                )}

              </div>

              {/* =================================================
                  NOMBRE
              ================================================== */}

              <div className="campo">

                <label htmlFor="nombre">
                  Nombre
                </label>

                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formulario.nombre}
                  onChange={manejarCambio}
                  minLength={4}
                  required
                  placeholder="Nombre del cliente"
                />

                <small>
                  El nombre debe tener al menos 4 caracteres.
                </small>

              </div>

              {/* =================================================
                  TELÉFONO
              ================================================== */}

              <div className="campo">

                <label htmlFor="telefono">
                  Teléfono
                </label>

                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  value={formulario.telefono}
                  onChange={manejarCambio}
                  maxLength={10}
                  pattern="[0-9]{10}"
                  inputMode="numeric"
                  required
                  placeholder="10 dígitos"
                />

                <small>
                  El teléfono debe contener exactamente 10
                  dígitos.
                </small>

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
                    ? "Registrar cliente"
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

export default Clientes;