const api = async (endpoint, options = {}) => {

  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  // Agregar JWT automáticamente
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok) {

    // Si el token expiró o no es válido
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
    }

    throw new Error(
      data.error || 'Error en la petición'
    );

  }

  return data;
};

export default api;