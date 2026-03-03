import './globals.css'

export const metadata = {
  title: 'MCUTrack - Medical Check-Up Management',
  description: 'Hospital-grade MCU management system',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
