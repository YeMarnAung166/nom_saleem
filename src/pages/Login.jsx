import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      if (isLogin) {
        await signIn(email, password)
        navigate('/')
      } else {
        await signUp(email, password)
        toast.success('Account created! Please complete onboarding.')
        navigate('/onboarding')
      }
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-pink-50 dark:bg-gray-900 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-pink-600 dark:text-pink-400 mb-6">CoupleVault</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-lg"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-lg"
            required
          />
          <button type="submit" className="w-full bg-pink-600 text-white p-3 rounded-lg font-semibold">
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>
        <p className="text-center mt-4 dark:text-gray-300">
          <button onClick={() => setIsLogin(!isLogin)} className="text-pink-600 dark:text-pink-400">
            {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Login'}
          </button>
        </p>
      </div>
    </div>
  )
}