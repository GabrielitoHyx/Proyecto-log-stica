import { useEffect, useRef, useState } from "react";
import DataTable from "datatables.net-dt";
import { useNavigate } from "react-router-dom";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "./Choferes.css";
import api from "../services/api";

const Choferes = () => {

  const navigate = useNavigate();

  const tablaRef = useRef(null);
  const tablaInstancia = useRef(null);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [choferSeleccionado, setChoferSeleccionado] =
    useState(null);

  const [usuariosDisponibles, setUsuariosDisponibles] =
    useState([]);

  const [formulario, setFormulario] = useState({
    correo: "",
    nss: "",
    nombre: "",
    licencia: "",
    edad: "",
    sexo: ""
  });

  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);


  // =========================================================
  // CARGAR USUARIOS DISPONIBLES PARA REGISTRAR COMO CHOFERES
  // =========================================================

  const cargarUsuariosDisponibles = async () => {

    try {

      const datos = await api(
        "/api/usuarios-choferes"
      );

      setUsuariosDisponibles(
        Array.isArray(datos)
          ? datos
          : []
      );

    } catch (error) {

      console.error(
        "Error al cargar usuarios:",
        error
      );

      setError(error.message);

    }

  };


  // =========================================================
  // INICIALIZAR DATATABLE
  // =========================================================

  useEffect(() => {

    if (!tablaRef.current) {
      return;
    }


    tablaInstancia.current =
      new DataTable(
        tablaRef.current,
        {

          ajax: async function (
            data,
            callback
          ) {

            try {

              const datos =
                await api(
                  "/api/vchoferes"
                );


              callback({

                data:
                  Array.isArray(datos)
                    ? datos
                    : []

              });


            } catch (error) {

              console.error(
                "Error DataTables:",
                error
              );


              callback({
                data: []
              });


              setError(
                error.message
              );

            }

          },


          columns: [

            {
              data: "ID_Chof",
              title: "ID"
            },

            {
              data: "Correo",
              title: "Correo",

              render: function (
                data
              ) {

                return data || "Sin correo";

              }

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

              render: function (
                data
              ) {

                return data || "—";

              }

            }

          ],


          language: {

            search:
              "Buscar:",

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

              first:
                "Primero",

              last:
                "Último",

              next:
                "Siguiente",

              previous:
                "Anterior"

            }

          },


          pageLength: 10,


          order: [
            [0, "asc"]
          ]

        }
      );


    // =====================================================
    // SELECCIONAR CHOFER AL HACER CLICK EN UNA FILA
    // =====================================================

    const manejarClick = (
      evento
    ) => {

      const fila =
        evento.target.closest(
          "tbody tr"
        );


      if (!fila) {
        return;
      }


      const datos =
        tablaInstancia.current
          .row(fila)
          .data();


      if (datos) {

        setChoferSeleccionado(
          datos
        );

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


      if (
        tablaInstancia.current
      ) {

        tablaInstancia.current.destroy();

        tablaInstancia.current = null;

      }

    };

  }, []);


  // =========================================================
  // ABRIR FORMULARIO PARA CREAR CHOFER
  // =========================================================

  const abrirFormulario = async () => {

    setError("");
    setMensaje("");

    setFormulario({

      correo: "",
      nss: "",
      nombre: "",
      licencia: "",
      edad: "",
      sexo: ""

    });

    setChoferSeleccionado(
      null
    );

    await cargarUsuariosDisponibles();

    setMostrarFormulario(
      true
    );

  };


  // =========================================================
  // CERRAR FORMULARIO
  // =========================================================

  const cerrarFormulario = () => {

    setMostrarFormulario(
      false
    );

    setFormulario({

      correo: "",
      nss: "",
      nombre: "",
      licencia: "",
      edad: "",
      sexo: ""

    });

    setError("");
    setMensaje("");

  };


  // =========================================================
  // CAMBIAR VALORES DEL FORMULARIO
  // =========================================================

  const manejarCambio = (
    evento
  ) => {

    const {
      name,
      value
    } = evento.target;


    setFormulario(
      (anterior) => ({

        ...anterior,

        [name]: value

      })
    );


    setError("");
    setMensaje("");

  };


  // =========================================================
  // VALIDACIÓN DEL CHOFER
  // =========================================================

  const validarFormulario = () => {

    const nss =
      formulario.nss.trim();

    const nombre =
      formulario.nombre.trim();

    const licencia =
      formulario.licencia.trim();

    const edad =
      Number(formulario.edad);

    const sexo =
      formulario.sexo;


    // ---------------------------------------------
    // VALIDAR CORREO
    // ---------------------------------------------

    if (!formulario.correo) {

      setError(
        "Debes seleccionar un usuario"
      );

      return false;

    }


    // ---------------------------------------------
    // VALIDAR NSS
    // ---------------------------------------------

    if (!/^\d{11}$/.test(nss)) {

      setError(
        "El NSS debe contener exactamente 11 dígitos"
      );

      return false;

    }


    // ---------------------------------------------
    // VALIDAR NOMBRE
    // ---------------------------------------------

    if (!nombre) {

      setError(
        "El nombre es obligatorio"
      );

      return false;

    }


    if (nombre.length <= 3) {

      setError(
        "El nombre debe tener más de 3 caracteres"
      );

      return false;

    }


    // ---------------------------------------------
    // VALIDAR LICENCIA
    // ---------------------------------------------

    if (!licencia) {

      setError(
        "La licencia es obligatoria"
      );

      return false;

    }


    if (licencia.length !== 12) {

      setError(
        "La licencia debe contener exactamente 12 caracteres"
      );

      return false;

    }


    // ---------------------------------------------
    // VALIDAR EDAD
    // ---------------------------------------------

    if (
      !Number.isInteger(edad) ||
      edad <= 18
    ) {

      setError(
        "La edad debe ser un número entero mayor de 18 años"
      );

      return false;

    }


    // ---------------------------------------------
    // VALIDAR SEXO
    // ---------------------------------------------

    if (
      sexo !== "M" &&
      sexo !== "F"
    ) {

      setError(
        "Debes seleccionar M o F en el campo sexo"
      );

      return false;

    }


    return true;

  };


  // =========================================================
  // REGISTRAR CHOFER
  // =========================================================

  const manejarSubmit = async (
    evento
  ) => {

    evento.preventDefault();

    setError("");
    setMensaje("");


    if (
      !validarFormulario()
    ) {

      return;

    }


    setCargando(true);


    try {

      await api(
        "/api/rchoferes",
        {

          method: "POST",

          body: JSON.stringify({

            correo:
              formulario.correo,

            nss:
              formulario.nss.trim(),

            nombre:
              formulario.nombre.trim(),

            licencia:
              formulario.licencia.trim(),

            edad:
              Number(
                formulario.edad
              ),

            sexo:
              formulario.sexo

          })

        }
      );


      setMensaje(
        "Chofer registrado correctamente"
      );


      // =====================================================
      // ACTUALIZAR TABLA
      // =====================================================

      if (
        tablaInstancia.current
      ) {

        tablaInstancia.current.ajax.reload(
          null,
          false
        );

      }


      // =====================================================
      // ACTUALIZAR USUARIOS DISPONIBLES
      // =====================================================

      await cargarUsuariosDisponibles();


      // =====================================================
      // CERRAR FORMULARIO
      // =====================================================

      setTimeout(() => {

        setMostrarFormulario(
          false
        );

        setFormulario({

          correo: "",
          nss: "",
          nombre: "",
          licencia: "",
          edad: "",
          sexo: ""

        });

        setMensaje("");

      }, 1200);


    } catch (error) {

      console.error(
        error
      );

      setError(
        error.message
      );

    } finally {

      setCargando(false);

    }

  };


  // =========================================================
  // RENDER
  // =========================================================

  return (

    <div className="choferes-container">


      {/* =====================================================
          ENCABEZADO
      ====================================================== */}

      <div className="choferes-header">

        <h1>
          Gestión de Choferes
        </h1>


        <button
          className="btn-dashboard"
          onClick={() =>
            navigate("/dashboard")
          }
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

      <div className="choferes-acciones">

        <button
          className="btn-agregar"
          onClick={
            abrirFormulario
          }
        >
          Registrar chofer
        </button>


        <button
          className="btn-ver"
          onClick={() => {

            if (
              !choferSeleccionado
            ) {

              setError(
                "Selecciona un chofer de la tabla"
              );

              return;

            }

            setError("");
            setMensaje("");

          }}
          disabled={
            !choferSeleccionado
          }
        >
          Chofer seleccionado
        </button>

      </div>


      {/* =====================================================
          CHOFER SELECCIONADO
      ====================================================== */}

      {choferSeleccionado && (

        <div className="chofer-seleccionado">

          <strong>
            Chofer seleccionado:
          </strong>{" "}

          {choferSeleccionado.Nombre}

        </div>

      )}


      {/* =====================================================
          TABLA
      ====================================================== */}

      <div className="tabla-container">

        <table
          ref={tablaRef}
          className="display"
          style={{
            width: "100%"
          }}
        >

          <thead>

            <tr>

              <th>
                ID
              </th>

              <th>
                Correo
              </th>

              <th>
                Nombre
              </th>

              <th>
                NSS
              </th>

              <th>
                Licencia
              </th>

              <th>
                Edad
              </th>

              <th>
                Sexo
              </th>

            </tr>

          </thead>


          <tbody />

        </table>

      </div>


      {/* =====================================================
          FORMULARIO
      ====================================================== */}

      {mostrarFormulario && (

        <div className="formulario-overlay">

          <div className="formulario-chofer">

            <h2>
              Registrar nuevo chofer
            </h2>


            <form
              onSubmit={
                manejarSubmit
              }
            >


              {/* =============================================
                  CORREO
              ============================================== */}

              <div className="campo">

                <label
                  htmlFor="correo"
                >
                  Usuario Chofer
                </label>


                <select
                  id="correo"
                  name="correo"
                  value={
                    formulario.correo
                  }
                  onChange={
                    manejarCambio
                  }
                  required
                  disabled={
                    cargando
                  }
                >

                  <option value="">
                    Selecciona un usuario
                  </option>


                  {usuariosDisponibles.map(
                    (
                      usuario,
                      index
                    ) => (

                      <option
                        key={
                          usuario.ID_Usuario ||
                          index
                        }
                        value={
                          usuario.Correo
                        }
                      >
                        {usuario.Correo}
                      </option>

                    )
                  )}

                </select>


                {usuariosDisponibles.length === 0 && (

                  <small>
                    No hay usuarios con rol Chofer
                    pendientes de registro.
                  </small>

                )}

              </div>


              {/* =============================================
                  NSS
              ============================================== */}

              <div className="campo">

                <label
                  htmlFor="nss"
                >
                  NSS
                </label>


                <input
                  type="text"
                  id="nss"
                  name="nss"
                  value={
                    formulario.nss
                  }
                  onChange={
                    manejarCambio
                  }
                  maxLength={11}
                  pattern="[0-9]{11}"
                  inputMode="numeric"
                  required
                  disabled={
                    cargando
                  }
                  placeholder="11 dígitos"
                />


                <small>
                  El NSS debe contener exactamente
                  11 dígitos.
                </small>

              </div>


              {/* =============================================
                  NOMBRE
              ============================================== */}

              <div className="campo">

                <label
                  htmlFor="nombre"
                >
                  Nombre
                </label>


                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={
                    formulario.nombre
                  }
                  onChange={
                    manejarCambio
                  }
                  minLength={4}
                  required
                  disabled={
                    cargando
                  }
                  placeholder="Nombre del chofer"
                />


                <small>
                  El nombre debe tener más de
                  3 caracteres.
                </small>

              </div>


              {/* =============================================
                  LICENCIA
              ============================================== */}

              <div className="campo">

                <label
                  htmlFor="licencia"
                >
                  Licencia
                </label>


                <input
                  type="text"
                  id="licencia"
                  name="licencia"
                  value={
                    formulario.licencia
                  }
                  onChange={
                    manejarCambio
                  }
                  minLength={12}
                  maxLength={12}
                  required
                  disabled={
                    cargando
                  }
                  placeholder="12 caracteres"
                />


                <small>
                  La licencia debe contener
                  exactamente 12 caracteres.
                </small>

              </div>


              {/* =============================================
                  EDAD
              ============================================== */}

              <div className="campo">

                <label
                  htmlFor="edad"
                >
                  Edad
                </label>


                <input
                  type="number"
                  id="edad"
                  name="edad"
                  value={
                    formulario.edad
                  }
                  onChange={
                    manejarCambio
                  }
                  min={19}
                  step={1}
                  required
                  disabled={
                    cargando
                  }
                  placeholder="Mayor de 18"
                />


                <small>
                  La edad debe ser mayor de
                  18 años.
                </small>

              </div>


              {/* =============================================
                  SEXO
              ============================================== */}

              <div className="campo">

                <label
                  htmlFor="sexo"
                >
                  Sexo
                </label>


                <select
                  id="sexo"
                  name="sexo"
                  value={
                    formulario.sexo
                  }
                  onChange={
                    manejarCambio
                  }
                  required
                  disabled={
                    cargando
                  }
                >

                  <option value="">
                    Selecciona
                  </option>

                  <option value="M">
                    M
                  </option>

                  <option value="F">
                    F
                  </option>

                </select>

              </div>


              {/* =============================================
                  BOTONES
              ============================================== */}

              <div className="formulario-botones">

                <button
                  type="submit"
                  className="btn-guardar"
                  disabled={
                    cargando ||
                    usuariosDisponibles.length === 0
                  }
                >
                  {cargando
                    ? "Guardando..."
                    : "Registrar chofer"}
                </button>


                <button
                  type="button"
                  className="btn-cancelar"
                  onClick={
                    cerrarFormulario
                  }
                  disabled={
                    cargando
                  }
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

export default Choferes;