import { createContext, useContext, useMemo, useState } from 'react'

const UIContext = createContext(undefined)

export function UIProvider({ children }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const value = useMemo(
    () => ({
      isMenuOpen,
      toggleMenu: () => setIsMenuOpen((prev) => !prev),
    }),
    [isMenuOpen],
  )

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  )
}

export function useUI() {
  const context = useContext(UIContext)

  if (!context) {
    throw new Error('useUI must be used within a UIProvider')
  }

  return context
}

