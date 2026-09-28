import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

import api from "../services/api";

const AuthContext = createContext(null);


export function AuthProvider({ children }) {

  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);


  useEffect(() => {

    const verificarSesion = async () => {

      const token = localStorage.getItem("token");

      if (!token) {
        setCargando(false);
        return;
      }

      try {

        const data = await api("/api/session");

        if (data.autenticado) {

          setUsuario(data.usuario);

          localStorage.setItem(
            "usuario",
            JSON.stringify(data.usuario)
          );

        }

      } catch (error) {

        localStorage.removeItem("token");
        localStorage.removeItem("usuario");

        setUsuario(null);

      } finally {

        setCargando(false);

      }

    };

    verificarSesion();

  }, []);


  const login = async (correo, contrasena) => {

    const data = await api("/api/login", {

      method: "POST",

      body: JSON.stringify({
        correo,
        contrasena
      })

    });

    // Guardar JWT
    localStorage.setItem(
      "token",
      data.token
    );

    // Guardar información del usuario
    localStorage.setItem(
      "usuario",
      JSON.stringify(data.usuario)
    );

    setUsuario(data.usuario);

    return data.usuario;

  };


  const logout = () => {

    // Eliminar JWT
    localStorage.removeItem("token");

    // Eliminar información del usuario
    localStorage.removeItem("usuario");

    setUsuario(null);

  };


  return (

    <AuthContext.Provider
      value={{
        usuario,
        cargando,
        autenticado: !!usuario,
        login,
        logout
      }}
    >

      {children}

    </AuthContext.Provider>

  );

}


export function useAuth() {

  return useContext(AuthContext);

}