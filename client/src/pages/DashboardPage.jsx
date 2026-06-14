import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { solicitudesAPI } from '../services/api';

const estadoBadges = {
  PENDIENTE: 'bg-[#198754] text-white',
  EN_CURSO: 'bg-[#ffc107] text-black',
  COMPLETADA: 'bg-[#6f42c1] text-white',
  FINALIZADA: 'bg-gray-500 text-white',
  CANCELADA: 'bg-gray-300 text-gray-700',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [solicitudes, setSolicitudes] = useState([]);
  const [stats, setStats] = useState({ total: 0, pendientes: 0, enCurso: 0, finalizadas: 0 });
  const [loading, setLoading] = useState(true);
  const isElderlyOrTutor = ['ADULTO_MAYOR', 'TUTOR'].includes(user?.rol);

  useEffect(() => {
    solicitudesAPI.getMine().then((res) => {
      const data = res.data.data;
      setSolicitudes(data.slice(0, 5));
      setStats({
        total: data.length,
        pendientes: data.filter((s) => s.estado === 'PENDIENTE').length,
        enCurso: data.filter((s) => s.estado === 'EN_CURSO').length,
        finalizadas: data.filter((s) => s.estado === 'FINALIZADA').length,
      });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Welcome — Estilo similar al Hero del index Django */}
      <div className="px-6 py-8 mb-6 text-center bg-white rounded-2xl shadow-lg border-b-4 border-[#0d6efd]">
        <h1 className="text-3xl font-bold text-[#0d6efd] mb-2">¡Hola, {user?.nombre}! 👋</h1>
        <p className="text-gray-500 text-lg">
          {isElderlyOrTutor ? 'Gestiona tus solicitudes de ayuda y conecta con voluntarios.' : 'Encuentra solicitudes de ayuda y marca la diferencia.'}
        </p>
        <div className="flex gap-3 justify-center mt-5">
          {isElderlyOrTutor && (
            <Link to="/solicitudes/nueva" className="bg-[#198754] hover:bg-[#157347] text-white px-6 py-2.5 rounded-full font-medium transition-all btn-custom shadow-sm">
              + Nueva Solicitud
            </Link>
          )}
          <Link to="/solicitudes" className="bg-[#343a40] hover:bg-[#23272b] text-white px-6 py-2.5 rounded-full font-medium transition-all btn-custom shadow-sm">
            Ver Solicitudes
          </Link>
        </div>
      </div>

      {/* Stats — Cards estilo Bootstrap */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: stats.total, bg: 'bg-[#0d6efd]/10 border-[#0d6efd]/20 text-[#0d6efd]' },
          { label: 'Disponibles', value: stats.pendientes, bg: 'bg-[#198754]/10 border-[#198754]/20 text-[#198754]' },
          { label: 'En Curso', value: stats.enCurso, bg: 'bg-[#ffc107]/10 border-[#ffc107]/30 text-[#856404]' },
          { label: 'Finalizadas', value: stats.finalizadas, bg: 'bg-gray-100 border-gray-200 text-gray-600' },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} border rounded-2xl p-5 card-hover`}>
            <p className="text-2xl font-bold">{loading ? '—' : s.value}</p>
            <p className="text-sm opacity-70">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity — Card estilo Bootstrap */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="bg-[#343a40] text-white px-6 py-3 flex items-center justify-between">
          <h2 className="font-semibold">Actividad Reciente</h2>
          <Link to="/mis-solicitudes" className="text-sm text-white/70 hover:text-white">Ver todo →</Link>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-400">Cargando...</div>
        ) : solicitudes.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <p className="text-3xl mb-2">📭</p>
            <p>No tienes actividad aún.</p>
          </div>
        ) : (
          <div className="divide-y">
            {solicitudes.map((sol) => (
              <Link key={sol.id} to={`/solicitudes/${sol.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">{sol.titulo}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{sol.categoria?.nombre} · {sol.comuna}</p>
                </div>
                <span className={`${estadoBadges[sol.estado]} px-3 py-1 rounded text-xs font-medium`}>{sol.estado}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
