export const validateUser = (user) => {
  const { correo, contrasena, rol, preguntarc, respuestarc } = user;

  if (!rol || rol.length < 2) {
    throw new Error('Rol inválido');
  }

  if (!correo || !correo.includes('@')) {
    throw new Error('Correo inválido');
  }

  if (!contrasena || contrasena.length < 8) {
    throw new Error('La contraseña debe tener al menos 8 caracteres');
  }

  if (!preguntarc) {
    throw new Error('Pregunta de recuperación requerida');
  }

  if (!respuestarc) {
    throw new Error('Respuesta de recuperación requerida');
  }
};