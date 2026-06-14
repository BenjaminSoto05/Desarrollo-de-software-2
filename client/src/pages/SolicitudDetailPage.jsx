import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { solicitudesAPI, evaluacionesAPI } from '../services/api';

const estadoStyles = { PENDIENTE: 'bg-amber-100 text-amber-800', EN_CURSO: 'bg-blue-100 text-blue-800', COMPLETADA: 'bg-purple-100 text-purple-800', FINALIZADA: 'bg-green-100 text-green-800', CANCELADA: 'bg-gray-100 text-gray-500' };

export default function SolicitudDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sol, setSol] = useState(null);
  const [loading, setLoading] = useState(true);
  const [evalForm, setEvalForm] = useState({ puntuacion: 5, comentario: '' });
  const [showEvalForm, setShowEvalForm] = useState(false);

  const fetch = () => { solicitudesAPI.getById(id).then((r) => setSol(r.data.data)).catch(() => navigate('/solicitudes')).finally(() => setLoading(false)); };
  useEffect(fetch, [id]);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin h-10 w-10 border-4 border-uct-blue border-t-transparent rounded-full"></div></div>;
  if (!sol) return null;

  const esSolicitante = sol.solicitanteId === user?.id;
  const esVoluntario = sol.voluntarioId === user?.id;

  const handleAction = async (action, msg) => {
    if (!confirm(msg)) return;
    try {
      await action();
      fetch();
      alert('¡Operación exitosa!');
    } catch (e) { alert(e.response?.data?.error || 'Error'); }
  };

  const handleEval = async (e) => {
    e.preventDefault();
    try {
      await evaluacionesAPI.create({ solicitudId: id, ...evalForm });
      setShowEvalForm(false);
      alert('¡Evaluación registrada!');
      fetch();
    } catch (e) { alert(e.response?.data?.error || 'Error'); }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="text-uct-blue font-semibold mb-4 hover:underline">← Volver</button>
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-uct-blue to-uct-blue-light p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold">{sol.categoria?.nombre}</span>
              <h1 className="text-2xl font-bold mt-3">{sol.titulo}</h1>
            </div>
            <span className={`${estadoStyles[sol.estado]} px-4 py-1.5 rounded-full text-sm font-bold`}>{sol.estado}</span>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Description */}
          <div><h2 className="font-semibold text-gray-700 mb-2">Descripción</h2><p className="text-gray-600">{sol.descripcion}</p></div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4">
            <div><p className="text-xs text-gray-400">Fecha</p><p className="font-semibold">{new Date(sol.fechaProgramada).toLocaleDateString('es-CL')}</p></div>
            <div><p className="text-xs text-gray-400">Hora</p><p className="font-semibold">{sol.horaProgramada}</p></div>
            <div><p className="text-xs text-gray-400">Comuna</p><p className="font-semibold">{sol.comuna}</p></div>
            <div><p className="text-xs text-gray-400">Dirección</p><p className="font-semibold">{sol.direccion}</p></div>
          </div>

          {/* People */}
          <div className="grid md:grid-cols-2 gap-4">
            {sol.solicitante && (
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                <p className="text-xs text-amber-600 font-semibold mb-1">Solicitante</p>
                <p className="font-bold text-gray-800">{sol.solicitante.nombre} {sol.solicitante.apellido}</p>
                <p className="text-sm text-gray-500">{sol.solicitante.comuna}</p>
              </div>
            )}
            {sol.voluntario && (
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <p className="text-xs text-blue-600 font-semibold mb-1">Voluntario</p>
                <p className="font-bold text-gray-800">{sol.voluntario.nombre} {sol.voluntario.apellido}</p>
                <p className="text-sm text-gray-500">{sol.voluntario.email}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            {user?.rol === 'ESTUDIANTE' && sol.estado === 'PENDIENTE' && (
              <button onClick={() => handleAction(() => solicitudesAPI.accept(id), '¿Aceptar esta solicitud?')}
                className="bg-uct-blue text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-uct-blue-light transition-all">🤝 Aceptar</button>
            )}
            {esVoluntario && sol.estado === 'EN_CURSO' && (
              <>
                <button onClick={() => handleAction(() => solicitudesAPI.complete(id), '¿Marcar como completada?')}
                  className="bg-green-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-green-700 transition-all">✅ Completar</button>
                <button onClick={() => handleAction(() => solicitudesAPI.cancelAcceptance(id), '¿Cancelar tu aceptación?')}
                  className="bg-red-100 text-red-700 px-6 py-2.5 rounded-xl font-semibold hover:bg-red-200 transition-all">❌ Cancelar Tarea</button>
              </>
            )}
            {esSolicitante && sol.estado === 'COMPLETADA' && (
              <button onClick={() => handleAction(() => solicitudesAPI.confirm(id), '¿Confirmar que la tarea fue completada?')}
                className="bg-uct-gold text-uct-blue-dark px-6 py-2.5 rounded-xl font-semibold hover:bg-uct-gold-light transition-all shadow">🏆 Confirmar Finalización</button>
            )}
            {(esSolicitante || esVoluntario) && (sol.estado === 'FINALIZADA' || sol.estado === 'COMPLETADA') && (
              <button onClick={() => setShowEvalForm(!showEvalForm)}
                className="bg-purple-100 text-purple-700 px-6 py-2.5 rounded-xl font-semibold hover:bg-purple-200 transition-all">⭐ Evaluar</button>
            )}
          </div>

          {/* Eval Form */}
          {showEvalForm && (
            <form onSubmit={handleEval} className="bg-purple-50 rounded-xl p-5 border border-purple-100 space-y-4">
              <h3 className="font-bold text-purple-800">Evaluación</h3>
              <div className="flex gap-2">
                {[1,2,3,4,5].map((n) => (
                  <button key={n} type="button" onClick={() => setEvalForm({...evalForm, puntuacion: n})}
                    className={`text-3xl transition-transform ${evalForm.puntuacion >= n ? 'scale-110' : 'opacity-30'}`}>⭐</button>
                ))}
              </div>
              <textarea value={evalForm.comentario} onChange={(e) => setEvalForm({...evalForm, comentario: e.target.value})}
                placeholder="Comentario opcional..." rows={2}
                className="w-full px-4 py-2 border rounded-xl bg-white text-sm resize-none" />
              <button type="submit" className="bg-purple-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-purple-700">Enviar Evaluación</button>
            </form>
          )}

          {/* Evaluaciones */}
          {sol.evaluaciones?.length > 0 && (
            <div>
              <h3 className="font-bold text-gray-700 mb-3">Evaluaciones</h3>
              <div className="space-y-3">
                {sol.evaluaciones.map((ev) => (
                  <div key={ev.id} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{'⭐'.repeat(ev.puntuacion)}</span>
                      <span className="text-sm text-gray-400">{ev.puntuacion}/5</span>
                    </div>
                    {ev.comentario && <p className="text-sm text-gray-600">{ev.comentario}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
