import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const colorIdentity = searchParams.get('colorIdentity')
  const cmc = searchParams.get('cmc')

  if (!colorIdentity) {
    return NextResponse.json(
      { error: 'Color identity is required' },
      { status: 400 }
    )
  }

  try {
    // Build the Scryfall query - use random order instead of name order
    const query = `type:legendary color<=${colorIdentity} (game:paper)`
    const encodedQuery = encodeURIComponent(query)
    
    // Fetch all pages of results
    let allCreatures: any[] = []
    let nextPage: string | null = `https://api.scryfall.com/cards/search?q=${encodedQuery}`
    
    // Collect cards from all pages (limit to reasonable number to avoid timeout)
    while (nextPage && allCreatures.length < 1000) {
      const response: Response = await fetch(nextPage)
      
      if (!response.ok) {
        const errorData = await response.json()
        // If we have some cards, continue with what we have
        if (allCreatures.length > 0) break
        return NextResponse.json(
          { error: errorData.details || 'Failed to fetch from Scryfall' },
          { status: response.status }
        )
      }

      const data = await response.json()
      
      // Filter to only legendary creatures
      const pageCreatures = data.data?.filter((card: any) => 
        card.type_line?.toLowerCase().includes('legendary') &&
        card.type_line?.toLowerCase().includes('creature')
      ) || []
      
      allCreatures.push(...pageCreatures)
      
      // Check for next page
      nextPage = data.has_more ? data.next_page : null
    }

    if (allCreatures.length === 0) {
      return NextResponse.json(
        { error: 'No legendary creatures found for this color identity' },
        { status: 404 }
      )
    }

    // Proper Fisher-Yates shuffle
    const shuffled = [...allCreatures]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }

    // Pick x random cards where x = CMC (or all if CMC > available)
    const numToPick = cmc ? Math.min(parseInt(cmc), shuffled.length) : shuffled.length
    const selectedCards = shuffled.slice(0, numToPick)

    return NextResponse.json({ cards: selectedCards })
  } catch (error) {
    console.error('Scryfall API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cards from Scryfall' },
      { status: 500 }
    )
  }
}

