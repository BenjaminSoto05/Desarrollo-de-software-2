import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { solicitudesAPI } from '../services/api';

const estadoStyles = { PENDIENTE: 'bg-amber-100 text-amber-800', EN_CURSO: 'bg-blue-100 text-blue-800', COMPLETADA: 'bg-purple-100 text-purple-800', FINALIZADA: 'bg-green-100 text-green-800', CANCELADA: 'bg-gray-100 text-gray-500' };

export default function MisSolicitudesPage() {
  const { user } = useAuth();
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    solicitudesAPI.getMine().then((r) => setSolicitudes(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = filter ? solicitudes.filter((s) => s.estado === filter) : solicitudes;
  const isElderlyOrTutor = ['ADULTO_MAYOR', 'TUTOR'].includes(user?.rol);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{isElderlyOrTutor ? 'Mis Solicitudes' : 'Mis Tareas Aceptadas'}</h1>
        {isElderlyOrTutor && (
          <Link to="/solicitudes/nueva" className="bg-uct-gold text-uct-blue-dark px-5 py-2.5 rounded-xl font-semibold hover:bg-uct-gold-light shadow">➕ Nueva</Link>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['', 'PENDIENTE', 'EN_CURSO', 'COMPLETADA', 'FINALIZADA'].map((estado) => (
          <button key={estado} onClick={() => setFilter(estado)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filter === estado ? 'bg-uct-blue text-white shadow' : 'bg-white text-gray-600 border hover:bg-gray-50'}`}>
            {estado || 'Todas'} ({estado ? solicitudes.filter((s) => s.estado === estado).length : solicitudes.length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16"><div className="animate-spin h-10 w-10 border-4 border-uct-blue border-t-transparent rounded-full mx-auto"></div></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400"><p className="text-5xl mb-3">📭</p><p>No tienes solicitudes.</p></div>
      ) : (
        <div className="space-y-3">
          {filtered.map((sol) => (
            <Link key={sol.id} to={`/solicitudes/${sol.id}`}
              className="flex items-center justify-between bg-white rounded-2xl shadow-sm border px-6 py-4 hover:shadow-md transition-shadow">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate">{sol.titulo}</p>
                <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                  <span>{sol.categoria?.nombre}</span>
                  <span>📍 {sol.comuna}</span>
                  <span>📅 {new Date(sol.fechaProgramada).toLocaleDateString('es-CL')}</span>
                  <span>🕐 {sol.horaProgramada}</span>
                </div>
              </div>
              <span className={`${estadoStyles[sol.estado]} px-4 py-1.5 rounded-full text-xs font-bold ml-4`}>{sol.estado}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
