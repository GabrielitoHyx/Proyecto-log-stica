import { Router } from 'express';

import {getUsers,registerUser,login,getSession,getRecoveryQuestion,changePassword
} from '../controllers/usersControllers.js';

import {getCamiones,registerCamion, updateCamionController
} from '../controllers/camionesControllers.js';

import {getChofer,getChoferes,registerChofer,getUsuariosDisponiblesChofer
} from '../controllers/choferControllers.js';

import {getClientes,getCliente,registerCliente,getUsuariosDisponiblesCliente
} from '../controllers/clientesControllers.js';

import {getViaje,getViajes,registerViaje,getMisViajesChofer,getMisViajesCliente,solicitarViajeCliente,updateEstadoViaje,asignarViajeAdmin
} from '../controllers/viajesControllers.js';

import {registerGastoViaje
} from '../controllers/gastosviajeControllers.js';

import {requireAuth,requireRole
} from '../middleware/auth.js';

const router = Router();


// =====================================================
// USUARIOS
// =====================================================

router.get(
  '/users',
  getUsers
);

router.post(
  '/users',
  registerUser
);

router.post(
  '/login',
  login
);

router.get(
  '/session',
  getSession
);

router.post(
  '/recuperar',
  getRecoveryQuestion
);

router.post(
  '/cambiar-password',
  changePassword
);


// =====================================================
// CAMIONES
// =====================================================

router.get(
  '/vcamiones',
  requireRole('Admin'),
  getCamiones
);

router.post(
  '/rcamiones',
  requireRole('Admin'),
  registerCamion
);

router.put(
  '/ecamiones/:id',
  requireRole('Admin'),
  updateCamionController
);

// =====================================================
// CHOFERES
// =====================================================

router.get(
  '/vchoferes',
  requireRole('Admin'),
  getChoferes
);

router.get(
  '/vchoferes/:id',
  requireRole('Admin'),
  getChofer
);

router.post(
  '/rchoferes',
  requireRole('Admin'),
  registerChofer
);

router.get(
  '/usuarios-choferes',
  requireRole('Admin'),
  getUsuariosDisponiblesChofer
);


// =====================================================
// VIAJES
// =====================================================

router.get(
  '/vviajes',
  requireRole('Admin'),
  getViajes
);

router.get(
  '/vviajes/:id',
  requireRole('Admin'),
  getViaje
);

router.post(
  '/rviajes',
  requireRole('Admin'),
  registerViaje
);

router.get(
  '/mis-viajes',
  requireRole('Chofer'),
  getMisViajesChofer
);

router.get(
  '/mis-viajes-cliente',
  requireRole('Cliente'),
  getMisViajesCliente
);

router.post(
  '/solicitar-viaje',
  requireRole('Cliente'),
  solicitarViajeCliente
);

router.patch(
  '/viajes/:id/estado',
  requireRole('Chofer'),
  updateEstadoViaje
);

// Asignar chofer y camión a un viaje
router.patch(
  '/viajes/:id/asignacion',
  requireRole('Admin'),
  asignarViajeAdmin
);


// =====================================================
// CLIENTES
// =====================================================

router.get(
  '/vclientes',
  requireRole('Admin'),
  getClientes
);

router.get(
  '/vclientes/:id',
  requireRole('Admin'),
  getCliente
);

router.get(
  '/usuarios-clientes',
  requireRole('Admin'),
  getUsuariosDisponiblesCliente
);

router.post(
  '/rclientes',
  requireRole('Admin'),
  registerCliente
);


// =====================================================
// GASTOS DE VIAJE
// =====================================================

router.post(
  '/gastos-viaje',
  requireRole('Chofer'),
  registerGastoViaje
);


// =====================================================
// RUTA DE PRUEBA
// =====================================================

router.get(
  '/admin-test',
  requireRole('Cliente', 'Admin'),
  (req, res) => {
    res.json({
      mensaje: 'Tienes acceso de cliente',
      usuario: req.user
    });
  }
);


export default router;