import { NavLink } from "react-router-dom";
import LogoutButton from "./LogoutButton";

const links = [
  ["/dashboard", "⌂", "Dashboard"],
  ["/viajes", "🚛", "Viajes"],
  ["/camiones", "🚚", "Camiones"],
  ["/choferes", "👨‍✈️", "Choferes"],
  ["/clientes", "👤", "Clientes"],
  ["/usuarios", "🔐", "Usuarios"],
];

export default function AdminSidebar() {
  return (
    <aside className="app-sidebar">
      <div className="brand">
        <div className="brand-icon">🚛</div>
        <div>
          <strong>Transportes MX</strong>
          <span>Panel administrativo</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {links.map(([to, icon, label]) => (
          <NavLink key={to} to={to} className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <span>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <LogoutButton />
      </div>
    </aside>
  );
}
