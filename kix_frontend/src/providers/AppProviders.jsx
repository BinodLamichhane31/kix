import { ThemeProvider } from '../store/contexts/ThemeContext'
import { UIProvider } from '../store/contexts/UIContext'
import { AuthProvider } from '../store/contexts/AuthContext'

export default function AppProviders({ children }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <UIProvider>
          {children}
        </UIProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

