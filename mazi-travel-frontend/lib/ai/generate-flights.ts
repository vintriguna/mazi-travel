type ParticipantPref = {
  trip_pace: string;
  budget_range: string;
  top_priorities: string[];
  ai_notes: string | null;
};

type TripInput = {
  origin: string | null;
  destination: string | null;
  start_date: string | null;
  end_date: string | null;
  trip_type: string | null;
  group_size: number | null;
  participant_preferences: ParticipantPref[];
};

const TRIP_TYPE_LABELS: Record<string, string> = {
  vacation: "Vacation",
  event_celebration: "Event / celebration",
  work_conference: "Work / conference",
};

const PACE_LABELS: Record<string, string> = {
  relaxed: "Relaxed",
  balanced: "Balanced",
  packed: "Packed",
};

const BUDGET_LABELS: Record<string, string> = {
  budget: "Budget-friendly",
  moderate: "Moderate",
  comfortable: "Comfortable",
  luxury: "Luxury",
};

function buildPrompt(trip: TripInput): string {
  const lines: string[] = [];

  if (trip.origin) lines.push(`Origin: ${trip.origin}`);
  if (trip.destination) lines.push(`Destination: ${trip.destination}`);
  if (trip.start_date && trip.end_date) {
    lines.push(`Dates: ${trip.start_date} to ${trip.end_date}`);
  } else if (trip.start_date) {
    lines.push(`Start date: ${trip.start_date}`);
  }
  if (trip.trip_type) {
    lines.push(`Trip type: ${TRIP_TYPE_LABELS[trip.trip_type] ?? trip.trip_type}`);
  }
  if (trip.group_size) lines.push(`Group size: ${trip.group_size} people`);

  if (trip.participant_preferences.length > 0) {
    lines.push("\nParticipant preferences:");
    trip.participant_preferences.forEach((p, i) => {
      lines.push(`  Participant ${i + 1}:`);
      lines.push(`    Pace: ${PACE_LABELS[p.trip_pace] ?? p.trip_pace}`);
      lines.push(`    Budget: ${BUDGET_LABELS[p.budget_range] ?? p.budget_range}`);
      lines.push(`    Priorities: ${p.top_priorities.join(", ")}`);
      if (p.ai_notes) lines.push(`    Notes: ${p.ai_notes}`);
    });
  }

  return lines.join("\n");
}

async function searchFlights(params: {
  from: string;
  to: string;
  departure_date: string;
  return_date?: string;
}) {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) throw new Error("SERPAPI_KEY is not set");

  const url = new URL("https://serpapi.com/search.json");
  url.searchParams.set("engine", "google_flights");
  url.searchParams.set("departure_id", params.from);
  url.searchParams.set("arrival_id", params.to);
  url.searchParams.set("outbound_date", params.departure_date);
  if (params.return_date) {
    url.searchParams.set("return_date", params.return_date);
  }
  url.searchParams.set("currency", "USD");
  url.searchParams.set("hl", "en");
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("deep_search", "true");

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Flight search failed");

  const data = await res.json();
  return {
    best_flights: data.best_flights ?? [],
    other_flights: data.other_flights ?? [],
    price_insights: data.price_insights ?? null,
  };
}

function getAirportCode(destination: string | null): string {
  if (!destination) return "LAX";
  const map: Record<string, string> = {
    paris: "CDG",
    london: "LHR",
    tokyo: "HND",
    new_york: "JFK",
    los_angeles: "LAX",
    chicago: "ORD",
  };
  return map[destination.toLowerCase()] ?? "LAX";
}

export async function generateFlightPlan(trip: TripInput): Promise<string> {
  const apiKey = process.env.OPEN_ROUTER_API_KEY;
  if (!apiKey) throw new Error("OPEN_ROUTER_API_KEY is not set");

  if (!trip.start_date) {
    throw new Error("Trip must have a start_date");
  }

  const flightParams = {
    from: getAirportCode(trip.origin),
    to: getAirportCode(trip.destination),
    departure_date: trip.start_date,
    return_date: trip.end_date ?? undefined,
  };

  // 1. Fetch real flight data
  const flights = await searchFlights(flightParams);

  // 2. Ask AI to analyze them
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: `
You are a flight recommendation engine.

You MUST output ONLY valid JSON.
No markdown. No explanation. No extra text.

Return data in this exact structure:

{
  "title": string,
  "summary": string,
  "flights": [
    {
      "rank": number,
      "airline": string,
      "route": string,
      "price_per_person": number,
      "duration_minutes": number,
      "departure_time": string,
      "arrival_time": string,
      "aircraft": string,
      "stops": number,
      "pros": string[],
      "cons": string[],
      "best_for": string
    }
  ],
  "recommendation": {
    "best_option_rank": number,
    "reason": string
  }
}

Rules:
- max 2 flights
- durations in minutes (number only)
- price as number only (no $ or commas)
- max 3 pros, max 3 cons
- Keep all strings under 120 characters
- Consider each participant's budget range and priorities when recommending
`,
        },
        {
          role: "user",
          content: `
Trip Details:
${buildPrompt(trip)}

Flight Data:
${JSON.stringify(flights, null, 2)}

Return the structured JSON exactly.
`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenAI error ${response.status}: ${text}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("No content in response");

  return content.trim();
}
