import './globals.css'

export const metadata = {
  title: 'MCUTrack - Medical Check-Up Management',
  description: 'Hospital-grade MCU management system',
  icons: {
    icon: '/logoRS.png?v=2',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logoRS.png?v=2" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
