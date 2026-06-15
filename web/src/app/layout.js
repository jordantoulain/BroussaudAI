import AnimatedBackground from '../components/layout/AnimatedBackground'
import './globals.css'

export const metadata = {
  title: 'Broussaud AI',
  description: 'Application de chatbot Broussaud Textiles.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className='bg-neutral-200'>
        {/* <AnimatedBackground /> */}
        
        <main className="relative z-0 bg-neutral-100/50">
          {children}
        </main>
      </body>
    </html>
  )
}