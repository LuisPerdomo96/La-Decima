'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { Camera, CameraOff } from 'lucide-react'

interface QRScannerProps {
  onScan: (data: string) => void
  onError?: (error: string) => void
}

export function QRScanner({ onScan, onError }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!containerRef.current) return

    scannerRef.current = new Html5Qrcode('qr-reader')
    
    const startScanner = async () => {
      try {
        await scannerRef.current!.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            onScan(decodedText)
            stopScanner()
          },
          (errorMessage) => {
            // Errores de escaneo son normales, no los mostramos
          }
        )
        setIsScanning(true)
        setError('')
      } catch (err) {
        const errorMsg = 'Error al iniciar la cámara. Verifica los permisos.'
        setError(errorMsg)
        onError?.(errorMsg)
      }
    }

    startScanner()

    return () => {
      stopScanner()
    }
  }, [])

  const stopScanner = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop()
        scannerRef.current.clear()
      } catch (err) {
        console.error('Error stopping scanner:', err)
      }
      setIsScanning(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Escanear código QR</h3>
        {isScanning && (
          <button
            onClick={stopScanner}
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <CameraOff className="w-4 h-4" />
            Detener
          </button>
        )}
      </div>

      <div 
        id="qr-reader" 
        ref={containerRef}
        className="w-full aspect-square max-w-[400px] mx-auto border-2 border-dashed rounded-lg overflow-hidden"
      />

      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {!isScanning && !error && (
        <div className="text-center text-muted-foreground text-sm py-8">
          <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Iniciando cámara...</p>
        </div>
      )}
    </div>
  )
}