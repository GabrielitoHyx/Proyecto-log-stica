import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";

function App() {
  return (
    <Router>
      <Routes>
        {/* Cuando entres a la raíz (http://localhost:5173/), mostrará el Login */}
        <Route path="/" element={<Login />} />

        {/* Aquí pondremos las demás rutas en el futuro */}
      </Routes>
    </Router>
  );
}

export default App;
