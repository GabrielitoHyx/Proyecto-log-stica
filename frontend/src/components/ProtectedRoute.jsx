import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  // Verificamos si existe el pase encriptado (JWT)
  const token = localStorage.getItem("token");

  if (!token) {
    // Si no hay token, lo pateamos a la pantalla de Login (ruta "/")
    return <Navigate to="/" replace />;
  }

  // Si tiene token, lo dejamos pasar al componente (Dashboard)
  return children;
}
