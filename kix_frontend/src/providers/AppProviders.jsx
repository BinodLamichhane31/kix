import { ThemeProvider } from '../store/contexts/ThemeContext'
import { UIProvider } from '../store/contexts/UIContext'
import { AuthProvider } from '../store/contexts/AuthContext'
import { CartProvider } from '../store/contexts/CartContext'
import { ToastProvider } from '../store/contexts/ToastContext'

export default function AppProviders({ children }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <ToastProvider>
            <UIProvider>
              {children}
            </UIProvider>
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

