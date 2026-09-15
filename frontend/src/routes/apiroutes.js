import { Router } from 'express';
import { getUsers, registerUser,login,logout,getSession,getRecoveryQuestion,changePassword } from '../controllers/usersControllers.js';
import {getCamiones,registerCamion} from '../controllers/camionesControllers.js';
import {getChofer,getChoferes,registerChofer,  getUsuariosDisponiblesChofer} from '../controllers/choferControllers.js';
import { getClientes,getCliente,registerCliente,getUsuariosDisponiblesCliente } from '../controllers/clientesControllers.js';
import {getViaje,getViajes,registerViaje,getMisViajesChofer,updateEstadoViaje} from '../controllers/viajesControllers.js';

import {registerGastoViaje} from '../controllers/gastosviajeControllers.js'

import {requireAuth,  requireRole} from '../middleware/auth.js';

const router = Router();

router.get('/users', getUsers);       //tomar todos los usuarios
router.post('/users', registerUser);  //registrar usuario

router.post('/login',login);
router.post('/logout',logout);
router.get('/session',getSession);
router.post('/recuperar', getRecoveryQuestion);
router.post('/cambiar-password', changePassword);


//rutacamiones
router.get('/vcamiones',
  requireRole('Admin'),
  getCamiones
);


router.post('/rcamiones',
  requireRole('Admin'),
  registerCamion
);

//RUTA CHOFERES
router.get(
  '/vchoferes',
  requireRole('Admin'),
  getChoferes
);

router.get( //obtener un chofer en especifico
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

router.post(
  '/rchoferes',
  requireRole('Admin'),
  registerChofer
);

///////////////viajes
router.get(
  '/vviajes',
  requireRole('Admin'),
  getViajes
);

router.get(
  '/vviajes/:id', //viaje en especifico
  requireRole('Admin'),
  getViaje
);

router.post(
  '/rviajes',
  requireRole('Admin'),
  registerViaje
);

router.get( //viaje por chofer
  '/mis-viajes',
  requireRole('Chofer'),
  getMisViajesChofer
);

router.patch(
  '/viajes/:id/estado',
  requireRole('Chofer'),
  updateEstadoViaje
);

//////////////CLIENTES


router.get(
  '/vclientes',
  requireRole('Admin'),
  getClientes
);

router.get(
  '/vclientes/:id', ////CLIENTE en especifico
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


//////gastos viajes

router.post(
  '/gastos-viaje',
  requireRole('Chofer'),
  registerGastoViaje
);

// RUTA DE PRUEBA
router.get(
  '/admin-test',
  requireRole('Cliente','Admin'),
  (req, res) => {

    res.json({
      mensaje: 'Tienes acceso de cliente',
      usuario: req.session.user
    });

  }
);

export default router;