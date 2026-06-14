import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          {/* Card estilo Bootstrap/AllyUCT */}
          <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">
            <div className="bg-[#343a40] text-white px-6 py-4">
              <h2 className="text-xl font-semibold">Iniciar Sesión</h2>
            </div>

            <div className="p-6">
              {error && (
                <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-lg mb-4 text-sm" role="alert">
                  {error}
                  <button onClick={() => setError('')} className="float-right font-bold">×</button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Correo electrónico
                  </label>
                  <input id="email" type="email" required
                    placeholder="tu.correo@alu.uct.cl"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d6efd] focus:border-transparent transition-all"
                    aria-describedby="email-help"
                  />
                  <p id="email-help" className="text-xs text-gray-400 mt-1">Estudiantes: @uct.cl o @alu.uct.cl</p>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña
                  </label>
                  <input id="password" type="password" required
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d6efd] focus:border-transparent transition-all"
                  />
                </div>

                <button type="submit" disabled={loading}
                  className="w-full bg-[#0d6efd] hover:bg-[#0a58ca] text-white py-2.5 rounded-lg font-medium transition-all shadow disabled:opacity-50">
                  {loading ? 'Ingresando...' : 'Iniciar Sesión'}
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-4">
                ¿No tienes cuenta? <Link to="/register" className="text-[#0d6efd] font-medium hover:underline">Regístrate aquí</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
