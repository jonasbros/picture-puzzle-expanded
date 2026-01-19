// supabase/functions/fetch-pexels-image/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const PEXELS_API_KEY = Deno.env.get("PEXELS_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

interface PexelsPhoto {
  id: number;
  url: string;
  photographer: string;
  photographer_url: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
  alt: string;
}

interface PexelsResponse {
  page: number;
  per_page: number;
  photos: PexelsPhoto[];
}

async function fetchPexelsImage(page: number): Promise<PexelsResponse> {
  const response = await fetch(
    `https://api.pexels.com/v1/curated?page=${page}&per_page=1`,
    {
      headers: {
        Authorization: PEXELS_API_KEY!,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Pexels API error: ${response.statusText}`);
  }

  return await response.json();
}

serve(async (req) => {
  try {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    const MAX_ATTEMPTS = 10; // Try up to 10 different pages
    let photo: PexelsPhoto | null = null;
    const attemptedPages: number[] = [];

    // Try to find a unique image
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      // Generate a random page number between 1 and 100
      const randomPage = Math.floor(Math.random() * 100) + 1;
      attemptedPages.push(randomPage);

      const data = await fetchPexelsImage(randomPage);

      if (!data.photos || data.photos.length === 0) {
        console.log(`No photos on page ${randomPage}, trying next page`);
        continue;
      }

      const candidatePhoto = data.photos[0];

      // Check if this image already exists in database
      const { data: existingPuzzle } = await supabase
        .from("puzzles")
        .select("id")
        .eq("url", candidatePhoto.src.landscape)
        .single();

      if (!existingPuzzle) {
        // Found a unique image!
        photo = candidatePhoto;
        break;
      }

      console.log(
        `Image from page ${randomPage} already exists, trying another page`
      );
    }

    // If we couldn't find a unique image after MAX_ATTEMPTS
    if (!photo) {
      return new Response(
        JSON.stringify({
          error: "Could not find a unique image after multiple attempts",
          attempted_pages: attemptedPages,
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Prepare attribution data
    const attribution = {
      photographer: photo.photographer,
      source: "Pexels",
      source_url: photo.url,
    };

    // Insert into puzzles table
    const { data: insertedPuzzle, error: insertError } = await supabase
      .from("puzzles")
      .insert({
        title: photo.alt || `Photo by ${photo.photographer}`,
        url: photo.src.landscape,
        attribution: attribution,
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Database insert error: ${insertError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Successfully inserted new puzzle image",
        puzzle: insertedPuzzle,
        attempts: attemptedPages.length,
        attempted_pages: attemptedPages,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
