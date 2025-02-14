import { Routes, Route, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { authService } from './services/auth'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import Dashboard from './pages/Dashboard'
import Header from './components/Header'
import PrivateRoute from './components/PrivateRoute'

import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await authService.checkAuth()
      setIsAuthenticated(authenticated)
    }
    checkAuth()
  }, [])

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={
          <div className="flex flex-col items-center gap-4">
            <h1 className="text-2xl">Accueil</h1>
            {!isAuthenticated && (
              <div className="flex gap-4">
                <Link 
                  to="/login" 
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Connexion
                </Link>
                <Link 
                  to="/signup" 
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Inscription
                </Link>
              </div>
            )}
          </div>
        } />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />
      </Routes>
    </>
  )
}

export default App;