import { BrowserRouter, Routes, Route } from "react-router-dom";

// Autenticación
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import Recuperar from "./pages/Recuperar";

// Admin
import Dashboard from "./pages/Dashboard";
import Camiones from "./pages/Camiones";
import Choferes from "./pages/Choferes";
import Clientes from "./pages/Clientes";
import Usuarios from "./pages/Usuarios";

// General
import Viajes from "./pages/Viajes";

// Usuarios
import InicioChofer from "./pages/InicioChofer";
import InicioCliente from "./pages/InicioCliente";

// Seguridad
import NoAutorizado from "./pages/NoAutorizado";
import ProtectedRoute from "./components/ProtectedRoute";


function App() {

  return (

    <BrowserRouter>

      <Routes>

        {/* ========================= */}
        {/* AUTENTICACIÓN */}
        {/* ========================= */}

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/registro"
          element={<Registro />}
        />

        <Route
          path="/recuperar"
          element={<Recuperar />}
        />


        {/* ========================= */}
        {/* NO AUTORIZADO */}
        {/* ========================= */}

        <Route
          path="/no-autorizado"
          element={<NoAutorizado />}
        />


        {/* ========================= */}
        {/* ADMIN */}
        {/* ========================= */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={["Admin"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />


        <Route
          path="/camiones"
          element={
            <ProtectedRoute roles={["Admin"]}>
              <Camiones />
            </ProtectedRoute>
          }
        />


        <Route
          path="/choferes"
          element={
            <ProtectedRoute roles={["Admin"]}>
              <Choferes />
            </ProtectedRoute>
          }
        />


        <Route
          path="/clientes"
          element={
            <ProtectedRoute roles={["Admin"]}>
              <Clientes />
            </ProtectedRoute>
          }
        />


        <Route
          path="/usuarios"
          element={
            <ProtectedRoute roles={["Admin"]}>
              <Usuarios />
            </ProtectedRoute>
          }
        />


        {/* ========================= */}
        {/* VIAJES */}
        {/* ========================= */}

        <Route
          path="/viajes"
          element={
            <ProtectedRoute
              roles={["Admin", "Chofer", "Cliente"]}
            >
              <Viajes />
            </ProtectedRoute>
          }
        />


        {/* ========================= */}
        {/* INICIO CHOFER */}
        {/* ========================= */}

        <Route
          path="/chofer"
          element={
            <ProtectedRoute roles={["Chofer"]}>
              <InicioChofer />
            </ProtectedRoute>
          }
        />


        {/* ========================= */}
        {/* INICIO CLIENTE */}
        {/* ========================= */}

        <Route
          path="/cliente"
          element={
            <ProtectedRoute roles={["Cliente"]}>
              <InicioCliente />
            </ProtectedRoute>
          }
        />

      </Routes>

    </BrowserRouter>

  );

}

export default App;