import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export const useAuth = (requireAuth = true) => {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window === 'undefined') return

    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzOTY1ODQyNC1mZmNlLTQzZTUtOWUxYy0xMjAyNjFiYWFhNDQiLCJleHAiOjE3NDY0MDg0Nzd9.53T4W0Dqzq-XEj2LCO7VRZZsgs44rOTw3B5TJYMn_Yk"
    const isLoginPage = pathname === '/login'

    console.log("token", token)     
    console.log("isLoginPage", isLoginPage)

    if (requireAuth && !token && !isLoginPage) {
      router.push('/login')
    } else if (token && isLoginPage) {
      router.push('/')
    }
  }, [requireAuth, router, pathname])
} 