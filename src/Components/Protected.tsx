import axios, { AxiosError } from 'axios'
import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'

interface Props {
  children: React.ReactNode
}

const ProtectedRoute = ({ children }: Props) => {
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null)

  useEffect(() => {
    const fetchAuthState = async () => {
      const authState = await getAuthState()
      setIsAuthed(authState)
    }

    fetchAuthState()
  }, [])

  if (isAuthed === null) {
    // Optionally, you can return a loading spinner or some placeholder here
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    )
  }

  if (!isAuthed) {
    return <Navigate to="/login" />
  }

  return <>{children}</>
}

export default ProtectedRoute

const getAuthState = async () => {
  try {
    const url = import.meta.env.VITE_BASE_URL
    const response = await axios.get(url + '/api/auth', {
      withCredentials: true
    })
    return response.status === 200
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(error.message)
    }
    return false
  }
}
