import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import Navbar from '../components/Navbar';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('student');
  const [form, setForm] = useState({
    email: '', password: '', rut: '', nombre: '', apellido: '',
    telefono: '', rol: 'ADULTO_MAYOR', comuna: '', direccion: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (tab === 'student') await authAPI.registerStudent(form);
      else await authAPI.registerElderly(form);
      navigate('/login', { state: { registered: true } });
    } catch (err) {
      const details = err.response?.data?.details;
      setError(details ? details.map(d => d.mensaje).join('. ') : err.response?.data?.error || 'Error al registrar.');
    } finally { setLoading(false); }
  };

  const inputClass = "w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d6efd] focus:border-transparent transition-all text-sm";

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">
            <div className="bg-[#343a40] text-white px-6 py-4">
              <h2 className="text-xl font-semibold">Crear Cuenta</h2>
            </div>
            <div className="p-6">
              {/* Tabs */}
              <div className="flex rounded-lg bg-gray-100 p-1 mb-5" role="tablist">
                <button role="tab" aria-selected={tab === 'student'} onClick={() => setTab('student')}
                  className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${tab === 'student' ? 'bg-[#0077ba] text-white shadow' : 'text-gray-500'}`}>
                  🎓 Estudiante UCT
                </button>
                <button role="tab" aria-selected={tab === 'elderly'} onClick={() => setTab('elderly')}
                  className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${tab === 'elderly' ? 'bg-[#fdc300] text-black shadow' : 'text-gray-500'}`}>
                  👴 Adulto Mayor / Tutor
                </button>
              </div>

              {error && (
                <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-lg mb-4 text-sm" role="alert">
                  {error}
                  <button onClick={() => setError('')} className="float-right font-bold">×</button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                    <input id="nombre" name="nombre" required value={form.nombre} onChange={handleChange} className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor="apellido" className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                    <input id="apellido" name="apellido" required value={form.apellido} onChange={handleChange} className={inputClass} />
                  </div>
                </div>
                <div>
                  <label htmlFor="rut" className="block text-sm font-medium text-gray-700 mb-1">RUT</label>
                  <input id="rut" name="rut" required placeholder="12345678-5" value={form.rut} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
                  <input id="email" name="email" type="email" required value={form.email} onChange={handleChange}
                    placeholder={tab === 'student' ? 'nombre@alu.uct.cl' : 'correo@ejemplo.com'} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                  <input id="password" name="password" type="password" required value={form.password} onChange={handleChange}
                    placeholder="Mínimo 8 caracteres" className={inputClass} />
                </div>

                {tab === 'elderly' && (
                  <>
                    <div>
                      <label htmlFor="rol" className="block text-sm font-medium text-gray-700 mb-1">Tipo de cuenta</label>
                      <select id="rol" name="rol" value={form.rol} onChange={handleChange} className={inputClass}>
                        <option value="ADULTO_MAYOR">Adulto Mayor</option>
                        <option value="TUTOR">Tutor / Familiar</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="comuna" className="block text-sm font-medium text-gray-700 mb-1">Comuna</label>
                        <input id="comuna" name="comuna" value={form.comuna} onChange={handleChange} placeholder="Temuco" className={inputClass} />
                      </div>
                      <div>
                        <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                        <input id="direccion" name="direccion" value={form.direccion} onChange={handleChange} placeholder="Av. Ejemplo 123" className={inputClass} />
                      </div>
                    </div>
                  </>
                )}

                <button type="submit" disabled={loading}
                  className="w-full bg-[#0d6efd] hover:bg-[#0a58ca] text-white py-2.5 rounded-lg font-medium transition-all shadow disabled:opacity-50 mt-2">
                  {loading ? 'Registrando...' : 'Crear Cuenta'}
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-4">
                ¿Ya tienes cuenta? <Link to="/login" className="text-[#0d6efd] font-medium hover:underline">Inicia sesión</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
