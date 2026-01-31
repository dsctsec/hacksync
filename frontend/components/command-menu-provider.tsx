'use client'

import * as React from 'react'

interface CommandMenuContextType {
  open: boolean
  setOpen: (open: boolean) => void
}

const CommandMenuContext = React.createContext<CommandMenuContextType>({
  open: false,
  setOpen: () => {},
})

export function useCommandMenu() {
  const context = React.useContext(CommandMenuContext)
  if (!context) {
    throw new Error('useCommandMenu must be used within CommandMenuProvider')
  }
  return context
}

export function CommandMenuProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)

  return (
    <CommandMenuContext.Provider value={{ open, setOpen }}>
      {children}
    </CommandMenuContext.Provider>
  )
}
