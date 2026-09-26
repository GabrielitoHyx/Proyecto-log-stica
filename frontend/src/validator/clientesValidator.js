export const validarCliente = (req, res, next) => {

  const { nombre, telefono } = req.body;

  // ==============================
  // VALIDAR NOMBRE
  // ==============================

  if (!nombre || typeof nombre !== "string") {
    return res.status(400).json({
      error: "El nombre es obligatorio"
    });
  }

  const nombreLimpio = nombre.trim();

  if (nombreLimpio.length < 4) {
    return res.status(400).json({
      error: "El nombre debe tener al menos 4 caracteres"
    });
  }

  // ==============================
  // VALIDAR TELÉFONO
  // ==============================

  if (!telefono || typeof telefono !== "string") {
    return res.status(400).json({
      error: "El teléfono es obligatorio"
    });
  }

  if (!/^\d{10}$/.test(telefono)) {
    return res.status(400).json({
      error: "El teléfono debe contener exactamente 10 dígitos"
    });
  }

  // Guardamos los datos limpios
  req.body.nombre = nombreLimpio;
  req.body.telefono = telefono;

  next();
};