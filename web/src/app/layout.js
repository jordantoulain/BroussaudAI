import AnimatedBackground from '../components/layout/AnimatedBackground'
import './globals.css'

export const metadata = {
  title: 'Broussaud AI',
  description: 'Application de chatbot Broussaud Textiles.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className='bg-[#ededed]'>
        {/* <AnimatedBackground bgColor="#efefef" squareSize={35} shift={0.02} /> */}
        
        <main className="relative z-0">
          {children}
        </main>
      </body>
    </html>
  )
}