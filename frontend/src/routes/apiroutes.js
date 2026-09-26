import {
  getUsers,
  registerUser,
  login,
  getSession,
  getRecoveryQuestion,
  changePassword
} from '../controllers/usersControllers.js';


import {getViaje,getViajes,registerViaje,getMisViajesChofer,updateEstadoViaje} from '../controllers/viajesControllers.js';

import {registerGastoViaje} from '../controllers/gastosviajeControllers.js'


import {requireAuth,  requireRole} from '../middleware/auth.js';

const router = Router();

// Solo el admin puede ver todos los usuarios
router.get(
  '/users',
  requireRole('Admin'),
  getUsers
);

router.post('/users', registerUser);  //registrar usuario

router.post('/login',login);
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


router.get('/vclientes', requireRole('Admin'), getClientes);

router.get('/vclientes/:id', requireRole('Admin'), getCliente);

router.patch(
  '/clientes/:id/estado',
  requireRole('Admin'),
  cambiarEstadoCliente
);

router.patch(
  '/clientes/:id',
  requireRole('Admin'),
  validarCliente,
  actualizarClienteController
);

router.get(
  '/usuarios-clientes',
  requireRole('Admin'),
  getUsuariosDisponiblesCliente
);

router.post(
  '/rclientes',
  requireRole('Admin'),
  validarCliente,
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
  requireRole('Cliente', 'Admin'),
  (req, res) => {

    res.json({
      mensaje: 'Tienes acceso de cliente',
      usuario: req.user
    });

  }
);

export default router;