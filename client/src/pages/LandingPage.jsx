import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4">
        {/* Hero Section — Réplica del Django index.html */}
        <div className="px-4 py-10 my-8 text-center bg-white rounded-2xl shadow-lg border-b-4 border-[#0d6efd]">
          <div className="max-w-3xl mx-auto py-6">
            <h1 className="text-4xl md:text-5xl font-bold text-[#0d6efd] mb-4">
              Bienvenido a la Red de Ayuda
            </h1>
            <p className="text-lg text-gray-500 mb-6 leading-relaxed">
              Conectamos a Presidentes de Junta, Voluntarios y Adultos Mayores para
              construir una comunidad más solidaria, activa y segura para todos.
            </p>

            {!isAuthenticated ? (
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/register"
                  className="bg-[#0d6efd] hover:bg-[#0a58ca] text-white text-lg px-8 py-3 rounded-lg shadow-sm font-medium transition-all">
                  Registrarse
                </Link>
                <Link to="/login"
                  className="border-2 border-gray-400 hover:border-gray-600 text-gray-600 text-lg px-8 py-3 rounded-lg shadow-sm font-medium transition-all">
                  Iniciar Sesión
                </Link>
              </div>
            ) : (
              <Link to="/solicitudes"
                className="inline-block bg-[#343a40] hover:bg-[#23272b] text-white text-lg px-10 py-3 rounded-full shadow-sm font-medium transition-all btn-custom">
                Ver Solicitudes
              </Link>
            )}
          </div>
        </div>

        {/* Role Cards — "Nuestros Pilares" */}
        <div className="py-10" id="roles">
          <h2 className="text-center text-2xl text-gray-500 font-normal pb-3 mb-8 border-b border-gray-300">
            Nuestros Pilares
          </h2>
          <div className="grid md:grid-cols-3 gap-6 py-3">
            <div className="bg-[#343a40] text-white rounded-2xl shadow-lg overflow-hidden card-hover">
              <div className="flex flex-col h-full p-8 pb-6">
                <h3 className="pt-12 mt-8 mb-4 text-3xl font-bold leading-tight">Presidentes de Junta</h3>
                <p className="text-lg text-white/80">Gestionen las necesidades de su comunidad creando solicitudes de ayuda específicas.</p>
              </div>
            </div>

            <div className="bg-[#ffc107] text-gray-900 rounded-2xl shadow-lg overflow-hidden card-hover">
              <div className="flex flex-col h-full p-8 pb-6">
                <h3 className="pt-12 mt-8 mb-4 text-3xl font-bold leading-tight">Voluntarios</h3>
                <p className="text-lg">Ofrezcan su tiempo y habilidades para ayudar a quienes más lo necesitan.</p>
              </div>
            </div>

            <div className="bg-[#0d6efd] text-white rounded-2xl shadow-lg overflow-hidden card-hover">
              <div className="flex flex-col h-full p-8 pb-6">
                <h3 className="pt-12 mt-8 mb-4 text-3xl font-bold leading-tight">Adultos Mayores</h3>
                <p className="text-lg text-white/80">Reciban la ayuda que necesitan de manera segura y coordinada.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Misión */}
        <div className="py-10">
          <div className="grid lg:grid-cols-2 gap-10 items-center py-8">
            <div className="order-2 lg:order-1">
              <h2 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">Nuestra Misión</h2>
              <p className="text-lg text-gray-500 mb-3">
                Buscamos a gente que pueda ayudar gratuitamente a adultos mayores en sus quehaceres,
                consiguiendo una sonrisa de parte de ellos.
              </p>
              <p className="text-gray-500">
                Día a día miles de adultos mayores no tienen manera de realizar ciertas acciones para su vida diaria,
                pintar una cerca, limpiar su auto, cortar su césped, entre otros, llevándolos a situaciones desfavorables
                pero fácilmente reversibles.
              </p>
            </div>
            <div className="order-1 lg:order-2">
              <div className="bg-gray-50 rounded-2xl border shadow-sm p-10 text-center text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor"
                  className="mx-auto mb-3 text-red-500" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z" />
                </svg>
                <h4 className="text-xl font-semibold text-gray-600">Compromiso Social</h4>
              </div>
            </div>
          </div>
        </div>

        {/* Cómo Funciona */}
        <div className="bg-gray-50 -mx-4 px-4 py-12">
          <div className="max-w-7xl mx-auto py-6" id="how-it-works">
            <h2 className="text-center text-2xl font-normal pb-3 mb-8 border-b border-gray-300">
              ¿Cómo Funciona?
            </h2>
            <div className="grid md:grid-cols-3 gap-8 py-6">
              {[
                {
                  step: '1', title: 'Registro',
                  desc: 'Para comenzar en este viaje de empatía, debes de registrarte junto tu rut, nombre y apellido, y una contraseña para tu seguridad, además recuerda elegir la opción adecuada que te define.'
                },
                {
                  step: '2', title: 'Conexión',
                  desc: 'Una vez registrado, se iniciará sesión automáticamente y tendrás disponible la opción de solicitudes, donde encontrarás distintas maneras para ayudar.'
                },
                {
                  step: '3', title: 'Ayuda',
                  desc: 'Una vez en la sección de solicitudes, podrás encontrar múltiples maneras de ayudar e incluso podrás ver quiénes se encuentran en esa solicitud específica.'
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-4">
                  <div className="w-12 h-12 bg-[#0d6efd] text-white rounded-lg flex items-center justify-center text-xl font-bold flex-shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-2xl font-normal mb-2">{item.title}</h3>
                    <p className="text-gray-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Características */}
        <div className="py-10" id="features">
          <h2 className="text-2xl font-normal pb-3 mb-6 border-b border-gray-300">
            Características del Servicio
          </h2>
          <div className="grid md:grid-cols-3 gap-6 py-6">
            {[
              {
                title: 'Seguridad',
                desc: 'Utilizamos el rut para conocer a profundidad nuestros voluntarios, solicitantes y presidentes de junta, además siempre contamos con seguridad extra para asegurar un mejor servicio.',
              },
              {
                title: 'Comunidad',
                desc: 'Este desafío empático, más que un desafío para mejorar como persona, también lo es para mejorar como sociedad y comunidad.',
              },
              {
                title: 'Rapidez',
                desc: 'Regístrate, inicia sesión y comienza a ayudar, o también, tener la posibilidad de ser ayudado!',
              },
            ].map((feat) => (
              <div key={feat.title} className="bg-white p-6 rounded-2xl shadow-sm border h-full">
                <h4 className="text-lg font-semibold mb-3">{feat.title}</h4>
                <p className="text-gray-600">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
