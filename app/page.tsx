'use client'

import { useState } from 'react'
import CardDisplay from '@/components/CardDisplay'
import { generateCard, parseManaCost, type GeneratedCard, type ScryfallCard } from '@/lib/cardGenerator'

export default function Home() {
  const [manaCostInput, setManaCostInput] = useState('')
  const [generatedCard, setGeneratedCard] = useState<GeneratedCard | null>(null)
  const [cachedCards, setCachedCards] = useState<ScryfallCard[]>([])
  const [cachedManaCost, setCachedManaCost] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCards = async (manaCost: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const parsed = parseManaCost(manaCost)
      
      // Build color identity query string
      const colorIdentity = parsed.colors || 'C'
      
      const response = await fetch(
        `/api/scryfall?colorIdentity=${encodeURIComponent(colorIdentity)}&cmc=${parsed.cmc}`
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch cards')
      }

      const data = await response.json()
      return data.cards as ScryfallCard[]
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerate = async () => {
    if (!manaCostInput.trim()) {
      setError('Please enter a mana cost')
      return
    }

    let cards = cachedCards
    
    // Only fetch if we don't have cached cards for this mana cost
    if (cachedCards.length === 0 || cachedManaCost !== manaCostInput) {
      const fetchedCards = await fetchCards(manaCostInput)
      if (!fetchedCards) return
      
      cards = fetchedCards
      setCachedCards(cards)
      setCachedManaCost(manaCostInput)
    }

    // Generate the card
    const newCard = generateCard(manaCostInput, cards)
    setGeneratedCard(newCard)
  }

  const handleReRoll = async () => {
    if (!cachedManaCost) {
      handleGenerate()
      return
    }

    // Fetch new random cards with the same color identity and CMC
    const fetchedCards = await fetchCards(cachedManaCost)
    if (!fetchedCards) return

    // Generate new card with the newly fetched random cards
    const newCard = generateCard(cachedManaCost, fetchedCards)
    setGeneratedCard(newCard)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
            <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-purple-600 bg-clip-text text-transparent">
              Commander Generator
            </span>
          </h1>
          <p className="mt-4 text-lg leading-8 text-purple-200 sm:text-xl max-w-2xl mx-auto">
            Generate a new legendary creature card for Magic: The Gathering Commander
          </p>
        </div>

        {/* Input Form */}
        <div className="max-w-md mx-auto mb-8">
          <div className="bg-gray-900/80 backdrop-blur-sm border border-purple-900/50 rounded-lg shadow-2xl shadow-purple-950/50 p-6">
            <label
              htmlFor="manaCost"
              className="block text-sm font-medium text-purple-200 mb-2"
            >
              Mana Cost
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                id="manaCost"
                value={manaCostInput}
                onChange={(e) => setManaCostInput(e.target.value)}
                placeholder="e.g., WUBRG or 3WUBRG"
                className="flex-1 px-4 py-2 bg-gray-800 border border-purple-800/50 rounded-md shadow-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleGenerate()
                  }
                }}
              />
              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="px-6 py-2 bg-purple-700 hover:bg-purple-600 text-white font-semibold rounded-md shadow-lg shadow-purple-900/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Loading...' : 'Generate'}
              </button>
            </div>
            <p className="mt-2 text-xs text-purple-300/70">
              Enter mana symbols (W, U, B, R, G) and optional numeric cost
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-md mx-auto mb-4">
            <div className="bg-red-950/80 border border-red-800/50 rounded-md p-4 backdrop-blur-sm">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          </div>
        )}

        {/* Source Cards Display */}
        {generatedCard && generatedCard.sourceCards.length > 0 && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-gray-900/80 backdrop-blur-sm border border-purple-900/50 rounded-lg shadow-2xl shadow-purple-950/50 p-6">
              <h2 className="text-lg font-semibold text-purple-200 mb-3">
                Source Cards Used:
              </h2>
              <div className="flex flex-wrap gap-2">
                {generatedCard.sourceCards.map((card, index) => (
                  <a
                    key={index}
                    href={card.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-purple-900/50 border border-purple-700/50 text-purple-200 rounded-full text-sm font-medium hover:bg-purple-800/70 hover:border-purple-600 transition-colors cursor-pointer"
                  >
                    {card.name}
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Generated Card */}
        {generatedCard && (
          <div>
            <CardDisplay card={generatedCard} />
            <div className="flex justify-center mt-4">
              <button
                onClick={handleReRoll}
                className="px-8 py-3 bg-purple-700 hover:bg-purple-600 text-white font-semibold rounded-md shadow-lg shadow-purple-900/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black transition-colors"
              >
                ReRoll
              </button>
            </div>
          </div>
        )}

        {/* Instructions */}
        {!generatedCard && !isLoading && (
          <div className="max-w-2xl mx-auto mt-12">
            <div className="bg-gray-900/80 backdrop-blur-sm border border-purple-900/50 rounded-lg shadow-2xl shadow-purple-950/50 p-6">
              <h2 className="text-xl font-semibold text-purple-200 mb-4">
                How it works
              </h2>
              <ul className="space-y-2 text-purple-300/80 text-sm">
                <li>• Enter a mana cost (e.g., "WUBRG" or "3WUBRG")</li>
                <li>• The app queries Scryfall for legendary creatures matching your color identity</li>
                <li>• It randomly selects cards equal to your converted mana cost</li>
                <li>• For each mana pip, there's a 70% chance to add a rules text line</li>
                <li>• Each successful rules text roll has a 50% chance to reduce power or toughness</li>
                <li>• Starting power and toughness equal your converted mana cost</li>
                <li>• Use "ReRoll" to generate a new card with the same input</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
