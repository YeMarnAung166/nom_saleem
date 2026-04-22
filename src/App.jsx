import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import Login from './pages/Login'
import Onboarding from './pages/Onboarding'
import Home from './pages/Home'
import Notes from './pages/Notes'
import Photos from './pages/Photos'
import Videos from './pages/Videos'
import Settings from './pages/Settings'
import PostDetail from './pages/PostDetail'
import PublicPost from './pages/PublicPost'
import PublicFeed from './pages/PublicFeed'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex justify-center items-center h-screen dark:text-white">Loading...</div>
  return user ? children : <Navigate to="/login" />
}

function App() {
  return (
    <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/onboarding" element={<PrivateRoute><Onboarding /></PrivateRoute>} />
            <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
            <Route path="/notes" element={<PrivateRoute><Notes /></PrivateRoute>} />
            <Route path="/photos" element={<PrivateRoute><Photos /></PrivateRoute>} />
            <Route path="/videos" element={<PrivateRoute><Videos /></PrivateRoute>} />
            <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
            <Route path="/post/:id" element={<PrivateRoute><PostDetail /></PrivateRoute>} />
            <Route path="/s/:token" element={<PublicPost />} />
            <Route path="/feed/:token" element={<PublicFeed />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App