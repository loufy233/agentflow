import './globals.css'

export const metadata = {
  title: 'AgentFlow — Tableau de bord',
  description: 'Dashboard IA de Alexandre Bessard — Pizzeria Viaggio & Nonna Restaurant',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
