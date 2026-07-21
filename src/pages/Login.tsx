import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch, ApiError } from "../lib/api";
import { setToken } from "../lib/auth";
import { card, label, input, buttonPrimary, errorBanner, link } from "../lib/ui";

export default function Login() {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      const data = await apiFetch<{ token: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ correo, contrasena }),
      });
      setToken(data.token);
      navigate("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo iniciar sesión.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <form onSubmit={handleSubmit} className={`w-full max-w-sm p-6 space-y-4 ${card}`}>
        <h1 className="text-xl font-semibold text-gray-100">Iniciar sesión</h1>

        {error && <p className={errorBanner}>{error}</p>}

        <div>
          <label className={label}>Correo</label>
          <input
            type="email"
            required
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            className={input}
          />
        </div>

        <div>
          <label className={label}>Contraseña</label>
          <input
            type="password"
            required
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            className={input}
          />
        </div>

        <button type="submit" disabled={cargando} className={`w-full ${buttonPrimary}`}>
          {cargando ? "Ingresando..." : "Ingresar"}
        </button>

        <p className="text-sm text-gray-400 text-center">
          ¿No tenés cuenta? <Link to="/registro" className={link}>Registrate</Link>
        </p>
      </form>
    </div>
  );
}
