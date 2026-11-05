'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

interface CopyButtonProps {
  text: string
}

export function CopyButton({ text }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Error al copiar:', err)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent flex items-center gap-2"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-green-600" />
          <span className="text-green-600">Copiado</span>
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" />
          <span>Copiar</span>
        </>
      )}
    </button>
  )
}