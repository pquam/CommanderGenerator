export interface SourceCard {
  name: string
  url: string
}

export interface GeneratedCard {
  manaCost: string
  rulesText: string[]
  power: number
  toughness: number
  colorIdentity: string
  sourceCards: SourceCard[]
}

export interface ScryfallCard {
  name: string
  oracle_text: string
  mana_cost: string
  type_line: string
  power?: string
  toughness?: string
  scryfall_uri?: string
  id?: string
}

/**
 * Parse mana cost string to extract color identity and converted mana cost
 * Examples: "WUBRG" -> { colors: "WUBRG", cmc: 5 }
 *           "3WUBRG" -> { colors: "WUBRG", cmc: 8 }
 */
export function parseManaCost(input: string): {
  colors: string
  cmc: number
  manaCost: string
} {
  // Remove spaces and convert to uppercase
  const cleaned = input.replace(/\s+/g, '').toUpperCase()
  
  // Extract numeric CMC
  const numericMatch = cleaned.match(/^(\d+)/)
  const numericValue = numericMatch ? parseInt(numericMatch[1]) : 0
  
  // Extract color symbols
  const colorSymbols = cleaned.replace(/^\d+/, '').replace(/[^WUBRGCX]/g, '')
  
  // Calculate CMC: numeric + number of color symbols
  const cmc = numericValue + colorSymbols.length
  
  // Reconstruct mana cost for display
  const manaCost = numericValue > 0 ? `${numericValue}${colorSymbols}` : colorSymbols
  
  return {
    colors: colorSymbols || 'C', // Default to colorless if no colors
    cmc,
    manaCost,
  }
}

/**
 * Extract rules text lines from cards
 */
export function extractRulesText(cards: ScryfallCard[]): string[] {
  const rulesTextList: string[] = []
  
  cards.forEach((card) => {
    if (card.oracle_text) {
      // Split by newline and filter out empty lines
      const lines = card.oracle_text
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
      rulesTextList.push(...lines)
    }
  })
  
  return rulesTextList
}

/**
 * Extract creature types from cards
 */
export function extractCreatureTypes(cards: ScryfallCard[]): string[] {
  const types: Set<string> = new Set()
  
  cards.forEach((card) => {
    if (card.type_line) {
      // Extract creature types (usually after "Creature — ")
      const match = card.type_line.match(/Creature\s*—\s*(.+)/i)
      if (match) {
        const creatureTypes = match[1].split(/\s*—\s*/)
        creatureTypes.forEach((type) => {
          const trimmed = type.trim()
          if (trimmed) types.add(trimmed)
        })
      }
    }
  })
  
  return Array.from(types)
}

/**
 * Replace card names in text with "this card"
 * Uses case-insensitive matching and word boundaries to avoid partial matches
 */
function replaceCardNames(text: string, cardNames: string[]): string {
  let result = text
  
  // Sort by length (longest first) to avoid replacing parts of longer names
  const sortedNames = [...cardNames].sort((a, b) => b.length - a.length)
  
  sortedNames.forEach((name) => {
    // Escape special regex characters in the card name
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    // Use word boundaries and case-insensitive flag
    // Match the name as a whole word (not part of another word)
    const regex = new RegExp(`\\b${escapedName}\\b`, 'gi')
    result = result.replace(regex, 'this card')
  })
  
  return result
}

/**
 * Generate a new card based on the algorithm described
 */
export function generateCard(
  manaCost: string,
  cards: ScryfallCard[]
): GeneratedCard {
  const parsed = parseManaCost(manaCost)
  const rulesTextList = extractRulesText(cards)
  
  // Starting P/T = CMC
  let power = parsed.cmc
  let toughness = parsed.cmc
  
  const selectedRulesText: string[] = []
  const usedOriginalLines = new Set<string>()
  
  // Get source card names for replacement
  const sourceCardNames = cards.map((card) => card.name)
  
  // Loop CMC times, roll 70% chance to add a rules text line each iteration
  for (let i = 0; i < parsed.cmc; i++) {
    if (rulesTextList.length === 0) break
    
    const roll = Math.random()
    if (roll < 0.7) {
      // Pick a random rules text line
      const randomIndex = Math.floor(Math.random() * rulesTextList.length)
      const selectedLine = rulesTextList[randomIndex]
      
      // Only add if not already added (avoid duplicates of original lines)
      if (!usedOriginalLines.has(selectedLine)) {
        usedOriginalLines.add(selectedLine)
        // Replace card names with "this card" before adding
        const replacedLine = replaceCardNames(selectedLine, sourceCardNames)
        selectedRulesText.push(replacedLine)
        
        // 50% chance to remove 1 power or 1 toughness
        const ptRoll = Math.random()
        if (ptRoll < 0.5) {
          // 50/50 chance between power and toughness
          if (Math.random() < 0.5) {
            power = Math.max(0, power - 1)
          } else {
            toughness = Math.max(0, toughness - 1)
          }
        }
      }
    }
  }
  
  // Extract source cards with URLs
  const sourceCards: SourceCard[] = cards.map((card) => {
    // Use scryfall_uri if available, otherwise construct URL from card name
    let url: string
    if (card.scryfall_uri) {
      url = card.scryfall_uri
    } else if (card.id) {
      url = `https://scryfall.com/card/${card.id}`
    } else {
      // Construct search URL from card name
      const encodedName = encodeURIComponent(card.name)
      url = `https://scryfall.com/search?q=!"${encodedName}"`
    }
    
    return {
      name: card.name,
      url,
    }
  })

  return {
    manaCost: parsed.manaCost,
    rulesText: selectedRulesText,
    power,
    toughness,
    colorIdentity: parsed.colors,
    sourceCards,
  }
}

