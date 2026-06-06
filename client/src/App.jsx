import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Home from './pages/Home'
import Room from './pages/Room'

function RequireAuth({ children }) {
  return sessionStorage.getItem('playerName')
    ? children
    : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"  element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/"       element={<RequireAuth><Home /></RequireAuth>} />
        <Route path="/room/:code" element={<RequireAuth><Room /></RequireAuth>} />
      </Routes>
    </BrowserRouter>
  )
}
