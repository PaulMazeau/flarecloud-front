import { Link } from 'react-router-dom'

export default function Login() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl mb-4">Connexion</h1>
      <form className="w-full max-w-sm">
        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 p-2 border rounded"
        />
        <input
          type="password"
          placeholder="Mot de passe"
          className="w-full mb-4 p-2 border rounded"
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Se connecter
        </button>
      </form>
      <Link to="/signup" className="mt-4 text-blue-500 hover:text-blue-600">
        Pas encore de compte ? S'inscrire
      </Link>
    </div>
  )
}

