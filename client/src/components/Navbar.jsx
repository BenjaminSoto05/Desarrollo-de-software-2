import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roleLabels = {
  ESTUDIANTE: 'Voluntario',
  ADULTO_MAYOR: 'Adulto Mayor',
  TUTOR: 'Tutor',
  ADMIN: 'Admin',
};

const roleColors = {
  ESTUDIANTE: 'bg-[#0077ba]',
  ADULTO_MAYOR: 'bg-[#fdc300] !text-black',
  TUTOR: 'bg-[#343a40]',
  ADMIN: 'bg-[#343a40]',
};

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Navbar color por rol (igual que Django)
  const navBg = user?.rol === 'ADULTO_MAYOR' ? 'bg-[#fdc300]' 
    : user?.rol === 'ESTUDIANTE' ? 'bg-[#0077ba]'
    : 'bg-[#343a40]';
  const navText = user?.rol === 'ADULTO_MAYOR' ? 'text-black' : 'text-white';

  return (
    <nav className={`${navBg} shadow-md transition-colors duration-500`} role="navigation" aria-label="Navegación principal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo UCT + Brand */}
          <div className="flex items-center gap-3">
            <img src="/logo2.png" alt="Logo UCT" className="hidden lg:block h-9 w-auto" />
            <Link to="/" className={`flex items-center gap-2 ${navText} font-bold text-xl tracking-wide`} aria-label="Ir al inicio">
              <img src="/logo.jpg" alt="Logo" className="w-8 h-8 rounded" />
              AllyUCT
            </Link>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className={`${navText} text-sm`}>Hola, {user.nombre}</span>
                  <span className={`${roleColors[user.rol]} text-xs px-2 py-0.5 rounded font-medium`}>
                    {roleLabels[user.rol]}
                  </span>
                </div>

                <div className="relative group">
                  <button className={`${navText === 'text-black' ? 'bg-white/50 text-black' : 'bg-white/10 text-white'} px-3 py-1.5 rounded-full text-sm transition-all hover:bg-white/30`}>
                    ▾ Menú
                  </button>
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    <Link to="/solicitudes" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg">
                      Solicitudes
                    </Link>
                    <Link to="/mis-solicitudes" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      Mis Tareas
                    </Link>
                    <hr className="my-1 border-gray-200" />
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link to="/login"
                  className={`${navText === 'text-black' ? 'border-black/30 text-black' : 'border-white/40 text-white'} border px-4 py-1.5 rounded-full text-sm transition-all hover:-translate-y-0.5`}>
                  Iniciar Sesión
                </Link>
                <Link to="/register"
                  className="bg-white text-gray-800 px-4 py-1.5 rounded-full text-sm font-medium transition-all hover:-translate-y-0.5 shadow-sm">
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
