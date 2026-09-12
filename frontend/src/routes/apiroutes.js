import { Router } from 'express';
import { getUsers, registerUser,login,logout,getSession } from '../controllers/usersControllers.js';
import {getCamiones,registerCamion} from '../controllers/camionesControllers.js';
import {requireAuth,  requireRole} from '../middleware/auth.js';



const router = Router();

router.get('/users', getUsers);       //tomar todos los usuarios
router.post('/users', registerUser);  //registrar usuario

router.post('/login',login);
router.post('/logout',logout);
router.get('/session',getSession);

//rutacamiones
router.get('/vcamiones',
  requireRole('Admin'),
  getCamiones
);


router.post('/rcamiones',
  requireRole('Admin'),
  registerCamion
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