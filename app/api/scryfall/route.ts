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
    // Build the Scryfall query
    const query = `type:legendary color<=${colorIdentity} (game:paper)`
    const encodedQuery = encodeURIComponent(query)
    const url = `https://api.scryfall.com/cards/search?as=grid&order=name&q=${encodedQuery}`

    const response = await fetch(url)
    
    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: errorData.details || 'Failed to fetch from Scryfall' },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    // Filter to only legendary creatures and get random sample
    const creatures = data.data?.filter((card: any) => 
      card.type_line?.toLowerCase().includes('legendary') &&
      card.type_line?.toLowerCase().includes('creature')
    ) || []

    if (creatures.length === 0) {
      return NextResponse.json(
        { error: 'No legendary creatures found for this color identity' },
        { status: 404 }
      )
    }

    // Pick x random cards where x = CMC (or all if CMC > available)
    const numToPick = cmc ? Math.min(parseInt(cmc), creatures.length) : creatures.length
    const shuffled = [...creatures].sort(() => 0.5 - Math.random())
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

