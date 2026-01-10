import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import Layout from './components/Layout/Layout'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Home from './pages/Home'
import Profile from './pages/Profile'
import Events from './pages/Events'
import './App.css'

function App() {
  const { user } = useAuthStore()

  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
        <Route path="/" element={user ? <Layout /> : <Navigate to="/login" />}>
          <Route index element={<Home />} />
          <Route path="profile/:username?" element={<Profile />} />
          <Route path="events" element={<Events />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App