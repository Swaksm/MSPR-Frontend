import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { I18nProvider } from '@/lib/i18n-context'
import { GoogleOAuthProvider } from '@react-oauth/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

// ... (viewport and metadata)

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <GoogleOAuthProvider clientId="797890274251-agr9jkkdqrtqle8r4j9ct8mk1d8j9af2.apps.googleusercontent.com">
          <I18nProvider>{children}</I18nProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  )
}
