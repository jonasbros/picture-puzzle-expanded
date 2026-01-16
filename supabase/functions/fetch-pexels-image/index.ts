// supabase/functions/fetch-pexels-image/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const PEXELS_API_KEY = Deno.env.get('PEXELS_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

interface PexelsPhoto {
  id: number
  url: string
  photographer: string
  photographer_url: string
  src: {
    original: string
    large2x: string
    large: string
    medium: string
    small: string
    portrait: string
    landscape: string
    tiny: string
  }
  alt: string
}

interface PexelsResponse {
  page: number
  per_page: number
  photos: PexelsPhoto[]
}

serve(async (req) => {
  try {
    // Fetch the first image from Pexels curated endpoint
    const response = await fetch(
      'https://api.pexels.com/v1/curated?page=1&per_page=1',
      {
        headers: {
          Authorization: PEXELS_API_KEY!,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.statusText}`)
    }

    const data: PexelsResponse = await response.json()

    if (!data.photos || data.photos.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No photos returned from Pexels' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const photo = data.photos[0]

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

    // Check if image already exists
    const { data: existingPuzzle } = await supabase
      .from('puzzles')
      .select('id')
      .eq('url', photo.src.landscape)
      .single()

    if (existingPuzzle) {
      return new Response(
        JSON.stringify({
          message: 'Image already exists in database',
          photo_id: photo.id,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Prepare attribution data
    const attribution = {
      photographer: photo.photographer,
      source: 'Pexels',
      source_url: photo.url,
    }

    // Insert into puzzles table
    const { data: insertedPuzzle, error: insertError } = await supabase
      .from('puzzles')
      .insert({
        title: photo.alt || `Photo by ${photo.photographer}`,
        url: photo.src.landscape,
        attribution: attribution,
      })
      .select()
      .single()

    if (insertError) {
      throw new Error(`Database insert error: ${insertError.message}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Successfully inserted new puzzle image',
        puzzle: insertedPuzzle,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
