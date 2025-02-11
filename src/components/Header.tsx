import { Link } from 'react-router-dom'

export default function Header() {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <h1 className="text-xl font-bold text-indigo-600">KATAPULT</h1>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
              <Link 
                to="/dashboard"
                className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Tableau de bord
              </Link>
            <Link
              to="/login"
              className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              Connexion
            </Link>
            <Link
              to="/signup"
              className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              S'inscrire
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
