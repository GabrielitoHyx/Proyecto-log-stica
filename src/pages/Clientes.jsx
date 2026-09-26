import "./Dashboard.css";

function Clientes() {
  return (
    <div className="main">

      <h1>👤 Clientes</h1>

      <div className="tabla">

        <table>

          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Teléfono</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>1</td>
              <td>Empresa A</td>
              <td>5512345678</td>
            </tr>

            <tr>
              <td>2</td>
              <td>Empresa B</td>
              <td>5587654321</td>
            </tr>
          </tbody>

        </table>

      </div>

    </div>
  );
}

export default Clientes;