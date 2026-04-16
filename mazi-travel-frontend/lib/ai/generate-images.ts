type TripImageInput = {
  destination: string | null;
};

export type TripImageResult = {
  imageUrl: string;
  thumbnailUrl?: string;
  title?: string;
  source?: string;
};

async function searchTripImage({ destination }: TripImageInput): Promise<TripImageResult | null> {
  if (!destination) return null;
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) throw new Error("SERPAPI_KEY is not set");

  const url = new URL("https://serpapi.com/search.json");
  url.searchParams.set("engine", "google_images");
  url.searchParams.set("q", destination);
  url.searchParams.set("gl", "us");
  url.searchParams.set("hl", "en");
  url.searchParams.set("api_key", apiKey);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Image search failed");
  const data = await res.json();
  const image = data.images_results?.[0];
  if (!image) return null;
  return {
    imageUrl: image.original,
    thumbnailUrl: image.thumbnail,
    title: image.title,
    source: image.source,
  };
}

export async function getTripImage(destination: string | null): Promise<string | null> {
  const result = await searchTripImage({ destination });
  return result?.imageUrl ?? null;
}
