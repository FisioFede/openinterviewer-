import { redirect } from 'next/navigation'

export default function Home() {
  // Redirect to researcher setup by default
  redirect('/setup')
}
