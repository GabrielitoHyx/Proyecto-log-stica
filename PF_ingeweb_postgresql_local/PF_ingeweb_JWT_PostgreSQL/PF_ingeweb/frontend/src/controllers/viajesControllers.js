import {
  getAllViajes,
  getViajeById,
  createViaje,
  getViajesByUsuarioChofer,
  getViajesByUsuarioCliente,
  createSolicitudViajeCliente,
  actualizarEstadoViaje,
  asignarViaje
} from '../models/viajesSQL.js';

import { getUserByEmail } from '../models/usersSQL.js';
import { getConnection } from '../config/postgres.js';

const pool = getConnection();


// =====================================================
// OBTENER TODOS LOS VIAJES
// =====================================================

export const getViajes = async (req, res) => {
  try {

    const viajes = await getAllViajes();

    res.json(viajes);

  } catch (error) {

    console.error('Error al obtener viajes:', error);

    res.status(500).json({
      error: error.message
    });
  }
};


// =====================================================
// OBTENER UN VIAJE
// =====================================================

export const getViaje = async (req, res) => {
  try {

    const { id } = req.params;

    const viaje = await getViajeById(id);

    if (!viaje) {
      return res.status(404).json({
        error: 'Viaje no encontrado'
      });
    }

    res.json(viaje);

  } catch (error) {

    console.error('Error al obtener viaje:', error);

    res.status(500).json({
      error: error.message
    });
  }
};


// =====================================================
// REGISTRAR VIAJE
// =====================================================

export const registerViaje = async (req, res) => {
  try {

    const {
      correo_cliente,
      correo_chofer,
      placas,
      origen,
      destino,
      mercancia,
      peso_mercancia,
      distancia,
      fecha_partida,
      fecha_aprox_llegada,
      pago_cliente
    } = req.body;


    // ==========================================
    // VALIDACIONES BÁSICAS
    // ==========================================

    if (
      !correo_cliente ||
      !correo_chofer ||
      !placas ||
      !origen ||
      !destino ||
      !mercancia
    ) {
      return res.status(400).json({
        error: 'Faltan campos obligatorios'
      });
    }


    // ==========================================
    // BUSCAR CLIENTE
    // ==========================================

    const usuarioCliente = await getUserByEmail(correo_cliente);

    if (!usuarioCliente) {
      return res.status(404).json({
        error: 'No existe un usuario con ese correo'
      });
    }

    if (usuarioCliente.Rol !== 'Cliente') {
      return res.status(400).json({
        error: 'El usuario seleccionado no tiene rol de Cliente'
      });
    }


    const clienteResult = await pool.query(
      `
      SELECT "ID_CLI"
      FROM public."Cliente"
      WHERE "ID_Usuario" = $1
      `,
      [usuarioCliente.ID_Usuario]
    );

    const cliente = clienteResult.rows[0];

    if (!cliente) {
      return res.status(404).json({
        error: 'El usuario no está registrado como Cliente'
      });
    }


    // ==========================================
    // BUSCAR CHOFER
    // ==========================================

    const usuarioChofer = await getUserByEmail(correo_chofer);

    if (!usuarioChofer) {
      return res.status(404).json({
        error: 'No existe un usuario con ese correo'
      });
    }

    if (usuarioChofer.Rol !== 'Chofer') {
      return res.status(400).json({
        error: 'El usuario seleccionado no tiene rol de Chofer'
      });
    }


    const choferResult = await pool.query(
      `
      SELECT "ID_Chof"
      FROM public."Chofer"
      WHERE "ID_Usuario" = $1
      `,
      [usuarioChofer.ID_Usuario]
    );

    const chofer = choferResult.rows[0];

    if (!chofer) {
      return res.status(404).json({
        error: 'El usuario no está registrado como Chofer'
      });
    }


    // ==========================================
    // BUSCAR CAMIÓN
    // ==========================================

    const camionResult = await pool.query(
      `
      SELECT "ID_CA"
      FROM public."Camion"
      WHERE "Placas" = $1
      `,
      [placas]
    );

    const camion = camionResult.rows[0];

    if (!camion) {
      return res.status(404).json({
        error: 'No existe un camión con esas placas'
      });
    }


    // ==========================================
    // CREAR VIAJE
    // PostgreSQL genera automáticamente Folio_ruta
    // ==========================================

    const viaje = await createViaje({
      id_cli: cliente.ID_CLI,
      id_ca: camion.ID_CA,
      id_cho: chofer.ID_Chof,
      origen,
      destino,
      mercancia,
      peso_mercancia,
      distancia,
      fecha_partida,
      fecha_aprox_llegada,
      pago_cliente
    });


    // ==========================================
    // RESPUESTA
    // ==========================================

    res.status(201).json({
      mensaje: 'Viaje registrado correctamente',
      viaje
    });


  } catch (error) {

    console.error('Error al registrar viaje:', error);

    res.status(500).json({
      error: error.message
    });
  }
};


// =====================================================
// ASIGNAR / REASIGNAR VIAJE DESDE ADMINISTRADOR
// =====================================================

export const asignarViajeAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_cho, id_ca } = req.body;

    const idChofer = id_cho === null || id_cho === "" || id_cho === undefined
      ? null
      : Number(id_cho);

    const idCamion = id_ca === null || id_ca === "" || id_ca === undefined
      ? null
      : Number(id_ca);

    if ((idChofer !== null && Number.isNaN(idChofer)) ||
        (idCamion !== null && Number.isNaN(idCamion))) {
      return res.status(400).json({
        error: 'El chofer o camión seleccionado no es válido'
      });
    }

    if ((idChofer === null) !== (idCamion === null)) {
      return res.status(400).json({
        error: 'Debes asignar un chofer y un camión, o retirar ambos'
      });
    }

    if (idChofer !== null) {
      const choferResult = await pool.query(
        `
        SELECT "ID_Chof"
        FROM public."Chofer"
        WHERE "ID_Chof" = $1
        `,
        [idChofer]
      );

      if (choferResult.rows.length === 0) {
        return res.status(404).json({
          error: 'El chofer seleccionado no existe'
        });
      }
    }

    if (idCamion !== null) {
      const camionResult = await pool.query(
        `
        SELECT "ID_CA"
        FROM public."Camion"
        WHERE "ID_CA" = $1
        `,
        [idCamion]
      );

      if (camionResult.rows.length === 0) {
        return res.status(404).json({
          error: 'El camión seleccionado no existe'
        });
      }
    }

    const viaje = await asignarViaje(id, idChofer, idCamion);

    if (!viaje) {
      return res.status(404).json({
        error: 'Viaje no encontrado'
      });
    }

    res.json({
      mensaje: idChofer === null
        ? 'Asignación retirada correctamente'
        : 'Viaje asignado correctamente',
      viaje
    });

  } catch (error) {
    console.error('Error al asignar viaje:', error);

    res.status(500).json({
      error: error.message
    });
  }
};


// =====================================================
// OBTENER VIAJES POR CHOFER
// =====================================================

export const getMisViajesChofer = async (req, res) => {
  try {

    const idUsuario = req.user.id;

    const viajes = await getViajesByUsuarioChofer(idUsuario);

    res.json(viajes);

  } catch (error) {

    console.error(
      'Error al obtener viajes del chofer:',
      error
    );

    res.status(500).json({
      error: error.message
    });
  }
};


// =====================================================
// ACTUALIZAR ESTADO DE VIAJE
// =====================================================

export const updateEstadoViaje = async (req, res) => {
  try {

    const { id } = req.params;
    const { estado } = req.body;

    const estadosPermitidos = [
      'Presupuesto',
      'Programado',
      'En tránsito',
      'Completado',
      'Cancelado'
    ];


    if (!estado) {
      return res.status(400).json({
        error: 'El estado es obligatorio'
      });
    }


    if (!estadosPermitidos.includes(estado)) {
      return res.status(400).json({
        error: 'Estado de viaje no válido'
      });
    }


    const idUsuario = req.user.id;

    const filasActualizadas = await actualizarEstadoViaje(
      id,
      idUsuario,
      estado
    );


    if (filasActualizadas === 0) {
      return res.status(403).json({
        error: 'El viaje no existe o no está asignado a este chofer'
      });
    }


    res.json({
      mensaje: 'Estado del viaje actualizado correctamente'
    });


  } catch (error) {

    console.error(
      'Error al actualizar estado:',
      error
    );

    res.status(500).json({
      error: error.message
    });
  }
};


// =====================================================
// OBTENER VIAJES DEL CLIENTE ACTUAL
// =====================================================

export const getMisViajesCliente = async (req, res) => {
  try {

    const idUsuario = req.user.id;

    const viajes = await getViajesByUsuarioCliente(idUsuario);

    res.json({
      viajes
    });

  } catch (error) {

    console.error(
      'Error al obtener viajes del cliente:',
      error
    );

    res.status(500).json({
      error: error.message
    });
  }
};


// =====================================================
// SOLICITAR VIAJE COMO CLIENTE
// =====================================================

export const solicitarViajeCliente = async (req, res) => {
  try {

    const {
      origen,
      destino,
      mercancia,
      peso_mercancia,
      distancia,
      fecha_partida,
      fecha_aprox_llegada,
      pago_cliente
    } = req.body;


    // ==========================================
    // VALIDACIONES
    // ==========================================

    if (
      !origen ||
      !destino ||
      !mercancia ||
      !fecha_partida
    ) {
      return res.status(400).json({
        error:
          'Origen, destino, mercancía y fecha de partida son obligatorios'
      });
    }


    const idUsuario = req.user.id;


    // ==========================================
    // BUSCAR CLIENTE
    // ==========================================

    const clienteResult = await pool.query(
      `
      SELECT "ID_CLI"
      FROM public."Cliente"
      WHERE "ID_Usuario" = $1
      `,
      [idUsuario]
    );


    const cliente = clienteResult.rows[0];


    if (!cliente) {
      return res.status(404).json({
        error: 'Tu usuario no está registrado como Cliente'
      });
    }


    // ==========================================
    // CREAR SOLICITUD
    // PostgreSQL genera automáticamente Folio_ruta
    // ==========================================

    const viaje = await createSolicitudViajeCliente({
      id_cli: cliente.ID_CLI,
      origen,
      destino,
      mercancia,
      peso_mercancia,
      distancia,
      fecha_partida,
      fecha_aprox_llegada,
      pago_cliente
    });


    // ==========================================
    // RESPUESTA
    // ==========================================

    res.status(201).json({
      mensaje: 'Solicitud de viaje enviada correctamente',
      viaje
    });


  } catch (error) {

    console.error(
      'Error al solicitar viaje como cliente:',
      error
    );

    res.status(500).json({
      error: error.message
    });
  }
};
