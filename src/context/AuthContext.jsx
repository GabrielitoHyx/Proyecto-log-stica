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

      try {

        const data = await api("/api/session");

        if (data.autenticado) {
          setUsuario(data.usuario);
        }

      } catch (error) {

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

    setUsuario(data.usuario);

    return data.usuario;
  };


  const logout = async () => {

    await api("/api/logout", {
      method: "POST"
    });

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