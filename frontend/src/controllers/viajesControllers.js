import {getAllViajes,getViajeById,createViaje,getViajesByUsuarioChofer, actualizarEstadoViaje} from '../models/viajesSQL.js';
import { getUserByEmail } from '../models/usersSQL.js';
import { getConnection } from '../config/sqlserver.js';


// =====================================================
// OBTENER TODOS LOS VIAJES
// =====================================================

export const getViajes = async (req, res) => {

  try {

    const viajes = await getAllViajes();

    res.json(viajes);

  } catch (error) {

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
      folio_ruta,
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
      !folio_ruta ||
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


    const pool = await getConnection();


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


    // Obtener ID_CLI

    const clienteResult = await pool.request()
      .input('id_usuario', usuarioCliente.ID_Usuario)
      .query(`
        SELECT ID_CLI
        FROM l.Cliente
        WHERE ID_Usuario = @id_usuario
      `);


    const cliente = clienteResult.recordset[0];


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


    // Obtener ID_Chof

    const choferResult = await pool.request()
      .input('id_usuario', usuarioChofer.ID_Usuario)
      .query(`
        SELECT ID_Chof
        FROM l.Chofer
        WHERE ID_Usuario = @id_usuario
      `);


    const chofer = choferResult.recordset[0];


    if (!chofer) {

      return res.status(404).json({
        error: 'El usuario no está registrado como Chofer'
      });

    }


    // ==========================================
    // BUSCAR CAMIÓN
    // ==========================================

    const camionResult = await pool.request()
      .input('placas', placas)
      .query(`
        SELECT ID_CA
        FROM l.Camion
        WHERE Placas = @placas
      `);


    const camion = camionResult.recordset[0];


    if (!camion) {

      return res.status(404).json({
        error: 'No existe un camión con esas placas'
      });

    }


    // ==========================================
    // CREAR VIAJE
    // ==========================================

    const id = await createViaje({

      folio_ruta,

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

      id

    });


  } catch (error) {

    console.error('Error al registrar viaje:', error);

    res.status(500).json({
      error: error.message
    });

  }

};

// =====================================================
// OBTENER VIAJE POR CHOFER
// =====================================================
export const getMisViajesChofer = async (req, res) => {
  try {

    const idUsuario = req.session.user.id;

    const viajes = await getViajesByUsuarioChofer(idUsuario);

    res.json(viajes);

  } catch (error) {

    console.error('Error al obtener viajes del chofer:', error);

    res.status(500).json({
      error: error.message
    });

  }
};

//////////////////

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

    const idUsuario = req.session.user.id;

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

    console.error('Error al actualizar estado:', error);

    res.status(500).json({
      error: error.message
    });

  }
};