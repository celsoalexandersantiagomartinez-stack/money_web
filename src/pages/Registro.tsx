import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch, ApiError } from "../lib/api";
import { card, label, input, buttonPrimary, errorBanner, link } from "../lib/ui";

export default function Registro() {
  const [nombre, setNombre] = useState("");
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
      await apiFetch("/auth/registro", {
        method: "POST",
        body: JSON.stringify({ nombre, correo, contrasena }),
      });
      navigate("/login");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo completar el registro.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <form onSubmit={handleSubmit} className={`w-full max-w-sm p-6 space-y-4 ${card}`}>
        <h1 className="text-xl font-semibold text-gray-100">Crear cuenta</h1>

        {error && <p className={errorBanner}>{error}</p>}

        <div>
          <label className={label}>Nombre</label>
          <input
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className={input}
          />
        </div>

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
            minLength={4}
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            className={input}
          />
        </div>

        <button type="submit" disabled={cargando} className={`w-full ${buttonPrimary}`}>
          {cargando ? "Creando cuenta..." : "Crear cuenta"}
        </button>

        <p className="text-sm text-gray-400 text-center">
          ¿Ya tenés cuenta? <Link to="/login" className={link}>Iniciá sesión</Link>
        </p>
      </form>
    </div>
  );
}
