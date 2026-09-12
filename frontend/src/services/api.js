//peticiones para guardar cookies
const api = async (endpoint, options = {}) => {

  const response = await fetch(endpoint, {
    ...options,

    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },

    credentials: 'include'
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Error en la petición');
  }

  return data;
};

export default api;