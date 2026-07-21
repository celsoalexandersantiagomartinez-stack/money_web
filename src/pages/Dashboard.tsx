import { useNavigate } from "react-router-dom";
import { clearToken } from "../lib/auth";

export default function Dashboard() {
  const navigate = useNavigate();

  function handleLogout() {
    clearToken();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold text-gray-900">Money Web</h1>
        <button onClick={handleLogout} className="text-sm text-red-600 font-medium">
          Cerrar sesión
        </button>
      </header>
      <p className="text-sm text-gray-600">
        Acá van a ir el formulario de gastos, el listado y el resumen (próximas fases).
      </p>
    </div>
  );
}
