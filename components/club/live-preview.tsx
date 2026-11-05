import { Coffee, Pizza, IceCream, Cookie, Cake, Star } from 'lucide-react'

interface LivePreviewProps {
  name: string
  primaryColor: string
  stampIcon: string
  stampsRequired: number
  rewardDescription: string
}

const iconMap: Record<string, React.ElementType> = {
  coffee: Coffee,
  pizza: Pizza,
  ice_cream: IceCream,
  cookie: Cookie,
  cake: Cake,
  star: Star,
}

export function LivePreview({ name, primaryColor, stampIcon, stampsRequired, rewardDescription }: LivePreviewProps) {
  const IconComponent = iconMap[stampIcon] || Coffee

  return (
    <div className="sticky top-8">
      <div className="text-sm font-medium text-muted-foreground mb-2">Vista Previa</div>
      
      {/* Mockup de Teléfono */}
      <div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-xl">
        <div className="h-[32px] w-[3px] bg-gray-800 absolute -left-[17px] top-[72px] rounded-l-lg"></div>
        <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[124px] rounded-l-lg"></div>
        <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[178px] rounded-l-lg"></div>
        <div className="h-[64px] w-[3px] bg-gray-800 absolute -right-[17px] top-[142px] rounded-r-lg"></div>
        
        {/* Pantalla */}
        <div className="rounded-[2rem] overflow-hidden w-full h-full bg-white relative">
          {/* Header del Wallet */}
          <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
            <span className="font-semibold text-sm">Wallet</span>
            <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center text-xs">+</div>
          </div>

          {/* Tarjeta de Lealtad */}
          <div className="p-4">
            <div 
              className="rounded-xl p-4 text-white shadow-lg relative overflow-hidden"
              style={{ backgroundColor: primaryColor }}
            >
              {/* Header de la tarjeta */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-2">
                  <IconComponent className="w-5 h-5" />
                  <span className="font-bold text-sm truncate max-w-[150px]">{name || 'Nombre del Club'}</span>
                </div>
                <span className="text-[10px] opacity-80">SELLOS 0/{stampsRequired || 10}</span>
              </div>

              {/* Grid de Sellos */}
              <div className="grid grid-cols-4 gap-2 mb-6">
                {Array.from({ length: stampsRequired || 10 }).map((_, i) => (
                  <div key={i} className="aspect-square rounded-full border-2 border-dashed border-white/40 flex items-center justify-center bg-white/10">
                    <IconComponent className="w-4 h-4 opacity-0" />
                  </div>
                ))}
              </div>

              {/* Info de Recompensa */}
              <div className="border-t border-white/20 pt-3 flex justify-between text-[10px]">
                <div>
                  <div className="opacity-70 text-[8px] uppercase">Recompensa</div>
                  <div className="font-medium truncate max-w-[80px]">{rewardDescription || '...'}</div>
                </div>
                <div>
                  <div className="opacity-70 text-[8px] uppercase">Te faltan</div>
                  <div className="font-medium">{stampsRequired || 10} sellos</div>
                </div>
              </div>

              {/* QR Falso */}
              <div className="mt-4 bg-white p-2 rounded-lg flex justify-center">
                <div className="w-16 h-16 bg-gray-900 rounded-sm flex items-center justify-center">
                  <div className="grid grid-cols-3 gap-0.5 w-10 h-10">
                    {Array.from({length: 9}).map((_, i) => (
                      <div key={i} className={`bg-white ${Math.random() > 0.5 ? 'opacity-100' : 'opacity-0'}`}></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}