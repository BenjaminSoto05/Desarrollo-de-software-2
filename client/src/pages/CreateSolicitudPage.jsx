import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { solicitudesAPI, categoriasAPI } from '../services/api';

export default function CreateSolicitudPage() {
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState([]);
  const [form, setForm] = useState({ titulo: '', descripcion: '', categoriaId: '', fechaProgramada: '', horaProgramada: '', direccion: '', comuna: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { categoriasAPI.getAll().then((r) => setCategorias(r.data.data)); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await solicitudesAPI.create({ ...form, fechaProgramada: new Date(form.fechaProgramada).toISOString() });
      navigate('/mis-solicitudes', { state: { created: true } });
    } catch (err) {
      const details = err.response?.data?.details;
      setError(details ? details.map(d => d.mensaje).join('. ') : err.response?.data?.error || 'Error al crear.');
    } finally { setLoading(false); }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Nueva Solicitud de Ayuda</h1>
      <div className="bg-white rounded-2xl shadow-sm border p-8">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm" role="alert">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input id="titulo" name="titulo" required value={form.titulo} onChange={handleChange} placeholder="Ej: Necesito ayuda con compras"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-uct-blue focus:border-transparent" />
          </div>
          <div>
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea id="descripcion" name="descripcion" required rows={3} value={form.descripcion} onChange={handleChange}
              placeholder="Describe lo que necesitas..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-uct-blue focus:border-transparent resize-none" />
          </div>
          <div>
            <label htmlFor="categoriaId" className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select id="categoriaId" name="categoriaId" required value={form.categoriaId} onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-uct-blue focus:border-transparent">
              <option value="">Selecciona una categoría</option>
              {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre} — {c.descripcion}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="fechaProgramada" className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
              <input id="fechaProgramada" name="fechaProgramada" type="date" required value={form.fechaProgramada} onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-uct-blue focus:border-transparent" />
            </div>
            <div>
              <label htmlFor="horaProgramada" className="block text-sm font-medium text-gray-700 mb-1">Hora (08:00 - 20:00)</label>
              <input id="horaProgramada" name="horaProgramada" type="time" required value={form.horaProgramada} onChange={handleChange}
                min="08:00" max="20:00"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-uct-blue focus:border-transparent" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="comuna" className="block text-sm font-medium text-gray-700 mb-1">Comuna</label>
              <input id="comuna" name="comuna" required value={form.comuna} onChange={handleChange} placeholder="Temuco"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-uct-blue focus:border-transparent" />
            </div>
            <div>
              <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
              <input id="direccion" name="direccion" required value={form.direccion} onChange={handleChange} placeholder="Av. Alemania 123"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-uct-blue focus:border-transparent" />
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-uct-blue hover:bg-uct-blue-light text-white py-3 rounded-xl font-semibold transition-all shadow-lg disabled:opacity-50">
            {loading ? 'Creando...' : 'Crear Solicitud'}
          </button>
        </form>
      </div>
    </div>
  );
}
