import jwt from 'jsonwebtoken';

export const requireAuth = (req, res, next) => {

  try {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: 'No autenticado'
      });
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        error: 'Formato de token inválido'
      });
    }

    const token = parts[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;

    next();

  } catch (error) {

    return res.status(401).json({
      error: 'Token inválido o expirado'
    });

  }

};


export const requireRole = (...rolesPermitidos) => {

  return (req, res, next) => {

    // Primero comprobamos autenticación
    requireAuth(req, res, () => {

      if (!rolesPermitidos.includes(req.user.rol)) {

        return res.status(403).json({
          error: 'No tienes permisos para realizar esta operación'
        });

      }

      next();

    });

  };

};