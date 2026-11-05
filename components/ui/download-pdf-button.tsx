'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'
import html2pdf from 'html2pdf.js'

interface DownloadPdfButtonProps {
  clubName: string
  rewardDescription: string
  publicUrl: string
}

export function DownloadPdfButton({ clubName, rewardDescription, publicUrl }: DownloadPdfButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleDownload = async () => {
    setIsGenerating(true)

    // Crear el elemento temporal del cartel
    const element = document.createElement('div')
    element.innerHTML = `
      <div style="
        width: 210mm;
        height: 297mm;
        padding: 40px;
        background: white;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        font-family: system-ui, -apple-system, sans-serif;
      ">
        <div style="
          width: 200px;
          height: 200px;
          margin-bottom: 40px;
          border: 3px solid #000;
          padding: 20px;
        ">
          <img 
            src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(publicUrl)}"
            alt="QR"
            style="width: 100%; height: 100%; object-fit: contain;"
          />
        </div>
        <h1 style="font-size: 48px; margin: 0 0 20px 0; color: #000;">${clubName}</h1>
        <p style="font-size: 24px; margin: 0 0 30px 0; color: #666;">
          Escanea para unirte al club<br/>
          y ganar <strong>${rewardDescription}</strong>
        </p>
        <p style="font-size: 14px; color: #999; margin-top: 60px;">
          La Décima - Club de Lealtad Digital
        </p>
      </div>
    `

    // Configurar opciones del PDF
    const opt = {
      margin: 0,
      filename: `cartel-${clubName.toLowerCase().replace(/\s+/g, '-')}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        logging: false
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait' as const
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    }

    try {
      await html2pdf().set(opt).from(element).save()
    } catch (error) {
      console.error('Error generando PDF:', error)
      alert('Error al generar el PDF. Intenta de nuevo.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={isGenerating}
      className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
    >
      <Download className="w-4 h-4" />
      {isGenerating ? 'Generando PDF...' : 'Descargar PDF'}
    </button>
  )
}