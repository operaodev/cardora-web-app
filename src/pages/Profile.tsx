import { useState, useEffect } from "react";
import { useUserStore } from "@/stores/useUserStore";
import { updateProfile } from "@/api/auth";
import { Icon } from "@iconify-icon/react";

export default function Profile() {
  const { user, setUser } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    phone_number: "",
    old_password: "",
    password: "",
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
        phone_number: user.phone_number || "",
      }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSuccessMsg("");
    setErrorMsg("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const updatedUser = await updateProfile({
        name: formData.name,
        phone_number: formData.phone_number,
        old_password: formData.old_password || undefined,
        password: formData.password || undefined,
      });
      setUser(updatedUser);
      setSuccessMsg("Perfil actualizado correctamente.");
      setFormData((prev) => ({
        ...prev,
        old_password: "",
        password: "",
      }));
    } catch (err: any) {
      const apiErr = err.response?.data?.error || err.response?.data?.message || "Error al actualizar perfil";
      setErrorMsg(apiErr);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-full pt-10">
        <p className="text-content">No estás autenticado.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto w-full p-4 sm:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-title flex items-center gap-2">
          <Icon icon="fluent:person-24-filled" className="text-indigo-500" />
          Mi Perfil
        </h1>
        <p className="text-content text-sm mt-1">
          Actualiza tu información personal y contraseña.
        </p>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-surface">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email (Read Only) */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-label">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className="input-base border-surface opacity-70 cursor-not-allowed bg-gray-50 dark:bg-gray-800/50"
            />
          </div>

          {/* Name */}
          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="text-sm font-medium text-label">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Tu nombre"
              className="input-base border-surface"
            />
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-1">
            <label htmlFor="phone_number" className="text-sm font-medium text-label">
              Teléfono
            </label>
            <input
              type="tel"
              id="phone_number"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="Tu número de teléfono"
              className="input-base border-surface"
            />
          </div>

          <div className="pt-4 pb-2">
            <h3 className="text-sm font-semibold text-title border-b border-surface pb-2">
              Cambiar Contraseña
            </h3>
            <p className="text-xs text-content mt-1">
              Deja estos campos en blanco si no deseas cambiar tu contraseña.
            </p>
          </div>

          {/* Old Password */}
          <div className="flex flex-col gap-1">
            <label htmlFor="old_password" className="text-sm font-medium text-label">
              Contraseña Actual
            </label>
            <input
              type="password"
              id="old_password"
              name="old_password"
              value={formData.old_password}
              onChange={handleChange}
              placeholder="••••••••"
              className="input-base border-surface"
            />
          </div>

          {/* New Password */}
          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm font-medium text-label">
              Nueva Contraseña
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="input-base border-surface"
            />
          </div>

          {/* Messages */}
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-2">
              <Icon icon="mdi:alert-circle" className="text-lg shrink-0" />
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm font-medium flex items-center gap-2">
              <Icon icon="mdi:check-circle" className="text-lg shrink-0" />
              {successMsg}
            </div>
          )}

          {/* Submit */}
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-white bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {loading ? (
                <>
                  <Icon icon="mdi:loading" className="animate-spin text-xl" />
                  Guardando...
                </>
              ) : (
                <>
                  <Icon icon="mdi:content-save" className="text-xl" />
                  Guardar información
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
