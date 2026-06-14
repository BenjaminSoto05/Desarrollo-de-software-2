import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { solicitudesAPI, categoriasAPI } from '../services/api';

const estadoStyles = {
  PENDIENTE: 'bg-[#198754] text-white',
  EN_CURSO: 'bg-[#ffc107] text-black',
  COMPLETADA: 'bg-[#6f42c1] text-white',
  FINALIZADA: 'bg-gray-500 text-white',
  CANCELADA: 'bg-gray-300 text-gray-700',
};

export default function SolicitudesPage() {
  const { user } = useAuth();
  const [solicitudes, setSolicitudes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [filters, setFilters] = useState({ categoriaId: '', comuna: '', estado: 'PENDIENTE' });
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  const fetchSolicitudes = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 9 };
      if (filters.categoriaId) params.categoriaId = filters.categoriaId;
      if (filters.comuna) params.comuna = filters.comuna;
      if (filters.estado) params.estado = filters.estado;
      const res = await solicitudesAPI.getAll(params);
      setSolicitudes(res.data.data);
      setPagination(res.data.pagination);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { categoriasAPI.getAll().then((r) => setCategorias(r.data.data)); }, []);
  useEffect(() => { fetchSolicitudes(); }, [filters]);

  const handleAccept = async (id) => {
    if (!confirm('¿Aceptar esta solicitud?')) return;
    try {
      await solicitudesAPI.accept(id);
      alert('¡Solicitud aceptada! La dirección ya está disponible.');
      fetchSolicitudes(pagination.page);
    } catch (e) { alert(e.response?.data?.error || 'Error'); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-normal">Solicitudes de Ayuda</h1>
          <p className="text-gray-500 text-sm">Solicitudes disponibles actualmente: <strong>{pagination.total}</strong></p>
        </div>
        {['ADULTO_MAYOR', 'TUTOR'].includes(user?.rol) && (
          <Link to="/solicitudes/nueva" className="bg-[#198754] hover:bg-[#157347] text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-sm">
            + Nueva Solicitud
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border p-4 mb-6 flex flex-wrap gap-3">
        <select value={filters.categoriaId} onChange={(e) => setFilters({...filters, categoriaId: e.target.value})}
          className="px-3 py-2 border rounded-xl text-sm bg-gray-50" aria-label="Filtrar por categoría">
          <option value="">Todas las categorías</option>
          {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
        <input placeholder="Filtrar por comuna..." value={filters.comuna}
          onChange={(e) => setFilters({...filters, comuna: e.target.value})}
          className="px-3 py-2 border rounded-xl text-sm bg-gray-50 w-48" aria-label="Filtrar por comuna" />
        <select value={filters.estado} onChange={(e) => setFilters({...filters, estado: e.target.value})}
          className="px-3 py-2 border rounded-xl text-sm bg-gray-50" aria-label="Filtrar por estado">
          <option value="PENDIENTE">Pendientes</option>
          <option value="EN_CURSO">En Curso</option>
          <option value="COMPLETADA">Completadas</option>
          <option value="FINALIZADA">Finalizadas</option>
          <option value="">Todos</option>
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-16"><div className="animate-spin h-10 w-10 border-4 border-uct-blue border-t-transparent rounded-full mx-auto"></div></div>
      ) : solicitudes.length === 0 ? (
        <div className="text-center py-16 text-gray-400"><p className="text-5xl mb-3">📭</p><p className="text-lg">No hay solicitudes disponibles.</p></div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {solicitudes.map((sol) => (
            <div key={sol.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <span className="bg-uct-blue/10 text-uct-blue px-3 py-1 rounded-full text-xs font-semibold">{sol.categoria?.nombre}</span>
                  <span className={`${estadoStyles[sol.estado]} px-3 py-1 rounded-full text-xs font-semibold`}>{sol.estado}</span>
                </div>
                <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-uct-blue transition-colors">{sol.titulo}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-4">{sol.descripcion}</p>
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                  <span>📍 {sol.comuna}</span>
                  <span>·</span>
                  <span>📅 {new Date(sol.fechaProgramada).toLocaleDateString('es-CL')}</span>
                  <span>·</span>
                  <span>🕐 {sol.horaProgramada}</span>
                </div>
                {sol.solicitante && <p className="text-xs text-gray-400">👤 {sol.solicitante.nombre} {sol.solicitante.apellido}</p>}
              </div>
              <div className="border-t px-5 py-3 flex gap-2">
                <Link to={`/solicitudes/${sol.id}`} className="flex-1 text-center text-sm text-uct-blue font-semibold py-2 rounded-lg hover:bg-uct-blue/5 transition-colors">
                  Ver Detalle
                </Link>
                {user?.rol === 'ESTUDIANTE' && sol.estado === 'PENDIENTE' && (
                  <button onClick={() => handleAccept(sol.id)} className="flex-1 text-center text-sm bg-uct-blue text-white font-semibold py-2 rounded-lg hover:bg-uct-blue-light transition-colors">
                    Aceptar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: pagination.totalPages }, (_, i) => (
            <button key={i + 1} onClick={() => fetchSolicitudes(i + 1)}
              className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${
                pagination.page === i + 1 ? 'bg-uct-blue text-white shadow' : 'bg-white text-gray-600 border hover:bg-gray-50'
              }`}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
