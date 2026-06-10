import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const cookieStore = await cookies()
  
  const hasAccessToken = cookieStore.has('access_token')
  const hasRefreshToken = cookieStore.has('refresh_token')

  if (hasAccessToken || hasRefreshToken) {
    redirect('/chat')
  } else {
    redirect('/login')
  }
}