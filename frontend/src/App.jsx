import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// Verifica que estas rutas coincidan con dónde tienes guardados Login, Dashboard y Choferes
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Choferes from "./pages/Choferes"; // Import para iti baro a component
import ProtectedRoute from "./components/ProtectedRoute";
import Usuarios from "./pages/Usuarios"; // Import para iti baro a component

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta pública (Cualquiera puede verla) */}
        <Route path="/" element={<Login />} />

        {/* Ruta protegida para Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Ruta protegida para Choferes */}
        <Route
          path="/choferes"
          element={
            <ProtectedRoute>
              <Choferes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/usuarios"
          element={
            <ProtectedRoute>
              <Usuarios />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
