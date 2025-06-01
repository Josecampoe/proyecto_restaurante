// Obtener la URL del servidor desde una variable de entorno o usar un valor por defecto
const getServerUrl = () => {
  // En desarrollo, usa localhost
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3002';
  }
  
  // En producción, usa la URL del servidor actual
  return window.location.origin;
};

export const API_URL = getServerUrl(); 