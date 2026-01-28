// supabase/functions/fetch-pexels-image/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const PEXELS_API_KEY = Deno.env.get("PEXELS_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const COLOR_CHECKER_API = Deno.env.get("COLOR_CHECKER_API"); // Your Vercel API URL

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

/**
 * Check if image has dominant color by calling Vercel API
 */
async function hasDominantColor(
  imageUrl: string,
  threshold = 35,
): Promise<boolean> {
  try {
    const response = await fetch(COLOR_CHECKER_API!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imageUrl,
        threshold,
      }),
    });

    if (!response.ok) {
      console.error(`Color checker API error: ${response.statusText}`);
      return false; // If API fails, don't reject the image
    }

    const data = await response.json();
    console.log(`Color analysis: ${data.dominantPercentage}% dominant`);

    return data.hasDominantColor;
  } catch (error) {
    console.error(`Color analysis failed: ${error.message}`);
    return false; // If analysis fails, don't reject the image
  }
}

async function fetchPexelsImage(page: number): Promise<PexelsResponse> {
  const response = await fetch(
    `https://api.pexels.com/v1/curated?page=${page}&per_page=1`,
    {
      headers: {
        Authorization: PEXELS_API_KEY!,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Pexels API error: ${response.statusText}`);
  }

  return await response.json();
}

serve(async (req) => {
  try {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    const MAX_ATTEMPTS = 20;
    let photo: PexelsPhoto | null = null;
    const attemptedPages: number[] = [];
    const rejectedReasons: string[] = [];

    // Try to find a unique image without dominant color
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const randomPage = Math.floor(Math.random() * 100) + 1;
      attemptedPages.push(randomPage);

      const data = await fetchPexelsImage(randomPage);

      if (!data.photos || data.photos.length === 0) {
        rejectedReasons.push(`Page ${randomPage}: No photos available`);
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

      if (existingPuzzle) {
        rejectedReasons.push(`Page ${randomPage}: Image already exists`);
        console.log(`Image from page ${randomPage} already exists`);
        continue;
      }

      // Check if image has dominant color (use medium size for faster analysis)
      const isDominant = await hasDominantColor(candidatePhoto.src.medium, 35);

      if (isDominant) {
        rejectedReasons.push(`Page ${randomPage}: Dominant color detected`);
        console.log(`Image from page ${randomPage} has dominant color`);
        continue;
      }

      // Found suitable image!
      photo = candidatePhoto;
      console.log(`Found suitable image on page ${randomPage}`);
      break;
    }

    if (!photo) {
      return new Response(
        JSON.stringify({
          error: "Could not find suitable image after multiple attempts",
          attempted_pages: attemptedPages,
          rejected_reasons: rejectedReasons,
        }),
        { status: 404, headers: { "Content-Type": "application/json" } },
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
        message: "Successfully inserted puzzle image (no dominant color)",
        puzzle: insertedPuzzle,
        attempts: attemptedPages.length,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
