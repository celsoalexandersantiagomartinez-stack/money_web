import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch, ApiError } from "../lib/api";
import { clearToken } from "../lib/auth";
import type { Categoria } from "../lib/types";
import { errorBanner } from "../lib/ui";
import FormularioGasto from "../components/FormularioGasto";
import ListaGastos from "../components/ListaGastos";
import Resumen from "../components/Resumen";

export default function Dashboard() {
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Categoria[]>("/categorias")
      .then(setCategorias)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "No se pudieron cargar las categorías."),
      );
  }, []);

  function handleLogout() {
    clearToken();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-gray-950 p-4 space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-100">
          Money <span className="text-emerald-400">Web</span>
        </h1>
        <button onClick={handleLogout} className="text-sm text-red-400 hover:text-red-300 font-medium">
          Cerrar sesión
        </button>
      </header>

      {error && <p className={errorBanner}>{error}</p>}

      <Resumen reloadTrigger={reloadTrigger} />

      <FormularioGasto
        categorias={categorias}
        onCategoriaCreada={(c) => setCategorias((prev) => [...prev, c])}
        onGastoCreado={() => setReloadTrigger((n) => n + 1)}
      />

      <ListaGastos categorias={categorias} reloadTrigger={reloadTrigger} />
    </div>
  );
}
