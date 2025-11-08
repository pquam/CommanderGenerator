'use client'

import { GeneratedCard } from '@/lib/cardGenerator'

interface CardDisplayProps {
  card: GeneratedCard
}

// Get card frame image path based on color identity
function getCardFrameImage(colorIdentity: string): string {
  const colors = colorIdentity.toUpperCase()
  
  // Extract unique colors
  const uniqueColors = new Set<string>()
  const colorSymbols = ['W', 'U', 'B', 'R', 'G']
  colorSymbols.forEach(symbol => {
    if (colors.includes(symbol)) {
      uniqueColors.add(symbol)
    }
  })
  
  const numUniqueColors = uniqueColors.size
  
  // If multiple unique colors, use gold frame
  if (numUniqueColors > 1) {
    return '/cardframes/gold.jpeg' // Multicolor - use gold
  }
  
  // Single color frames
  if (uniqueColors.has('W')) {
    return '/cardframes/white.jpg' // White
  } else if (uniqueColors.has('U')) {
    return '/cardframes/blue.jpg' // Blue
  } else if (uniqueColors.has('B')) {
    return '/cardframes/black.png' // Black
  } else if (uniqueColors.has('R')) {
    return '/cardframes/red.png' // Red
  } else if (uniqueColors.has('G')) {
    return '/cardframes/green.png' // Green
  } else {
    return '/cardframes/colorless.jpg' // Colorless - default to white
  }
}

export default function CardDisplay({ card }: CardDisplayProps) {
  const frameImage = getCardFrameImage(card.colorIdentity)
  
  return (
    <div className="flex justify-center my-8">
      <div
        className="relative w-[416px] rounded-lg shadow-2xl overflow-hidden border-4 border-black"
        style={{
          aspectRatio: '5 / 7',
          backgroundImage: `url(${frameImage})`,
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Card Art Area (placeholder) */}
        <div className="absolute top-0 left-0 right-0" style={{ height: '38%' }}>
          <div className="h-full bg-gradient-to-b from-transparent to-black/20" />
        </div>
        
        {/* Card Name Area (placeholder) */}
        <div className="absolute right-20" style={{ top: '5%', left: '10%' }}>
          <div className="text-lg font-bold text-black drop-shadow-lg">
            [Card Name]
          </div>
        </div>
        
        {/* Mana Cost */}
        <div className="absolute" style={{ top: '5%', right: '10%' }}>
          <div className="text-lg font-bold text-black drop-shadow-lg">
            {card.manaCost || '0'}
          </div>
        </div>
        
        {/* Type Line (placeholder) */}
        <div className="absolute left-4 right-4" style={{ top: '57%' , left: '10%' }}>
          <div className="text-sm font-semibold text-black drop-shadow-lg">
            Legendary Creature
          </div>
        </div>
        
        {/* Rules Text */}
        <div className="absolute left-4 right-4 bottom-16" style={{ top: '65%' , left: '10%' }}>
          <div className="text-black drop-shadow-md h-full overflow-y-auto leading-relaxed" style={{ width: '95%' }}>
            {card.rulesText.length > 0 ? (
              (() => {
                // Calculate font size based on total number of lines
                // Start at 1rem (16px), decrease by 0.05rem per line
                // Minimum size of 0.7rem (11.2px)
                const baseSize = 1.5 // 16px (text-base)
                const sizeDecrement = 0.6 // 0.8px per line
                const fontSize = Math.max(baseSize - ((card.rulesText.length - 1) * sizeDecrement), 0.7)
                
                return (
                  <div className="space-y-1.5" style={{ fontSize: `${fontSize}rem` }}>
                    {card.rulesText.map((line, index) => (
                      <p key={index} className="leading-relaxed">
                        {line}
                      </p>
                    ))}
                  </div>
                )
              })()
            ) : (
              <p className="italic opacity-75 text-sm">No rules text generated</p>
            )}
          </div>
        </div>
        
        {/* Power/Toughness */}
        <div className="absolute bottom-4 right-4" style={{ bottom: '5%', right: '10%' }}>
          <div className="text-3xl font-bold text-black">
            {card.power}/{card.toughness}
          </div>
        </div>
      </div>
    </div>
  )
}

