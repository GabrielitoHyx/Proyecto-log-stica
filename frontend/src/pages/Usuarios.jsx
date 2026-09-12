import "./Dashboard.css";

function Usuarios() {
  return (
    <div className="main">

      <h1>🔐 Usuarios</h1>

      <div className="tabla">

        <table>

          <thead>
            <tr>
              <th>ID</th>
              <th>Correo</th>
              <th>Rol</th>
            </tr>
          </thead>

          <tbody>

            <tr>
              <td>1</td>
              <td>admin@mx.com</td>
              <td>Admin</td>
            </tr>

            <tr>
              <td>2</td>
              <td>chofer1@mx.com</td>
              <td>Chofer</td>
            </tr>

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default Usuarios;