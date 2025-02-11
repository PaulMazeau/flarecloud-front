import { Link } from 'react-router-dom'

export default function SignUp() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl mb-4">Inscription</h1>
      <form className="w-full max-w-sm">
        <input
          type="text"
          placeholder="Nom"
          className="w-full mb-4 p-2 border rounded"
        />
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
          S'inscrire
        </button>
      </form>
      <Link to="/login" className="mt-4 text-blue-500 hover:text-blue-600">
        Déjà un compte ? Se connecter
      </Link>
    </div>
  )
} 