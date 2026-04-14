type TripInput = {
  origin: string | null;
  destination: string | null;
  start_date: string | null;
  end_date: string | null;
  trip_type: string | null;
  group_size: number | null;
  total_budget: number | null;
  trip_pace: string | null;
  top_priorities: string[] | null;
  ai_notes: string | null;
  flight_summary: string | null;
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
  if (trip.total_budget) lines.push(`Total budget: $${trip.total_budget.toLocaleString()}`);
  if (trip.trip_pace) {
    lines.push(`Pace: ${PACE_LABELS[trip.trip_pace] ?? trip.trip_pace}`);
  }
  if (trip.top_priorities?.length) {
    lines.push(`Top priorities: ${trip.top_priorities.join(", ")}`);
  }
  if (trip.ai_notes) lines.push(`Additional notes: ${trip.ai_notes}`);

  return lines.join("\n");
}

export async function generateTripSummary(trip: TripInput): Promise<string> {
  const apiKey = process.env.OPEN_ROUTER_API_KEY;
  if (!apiKey) throw new Error("OPEN_ROUTER_API_KEY is not set");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a travel planning assistant. Given structured trip details, write a short (2–3 sentence) friendly summary describing the trip. Be specific and enthusiastic. Do not use bullet points.",
        },
        {
          role: "user",
          content: buildPrompt(trip),
        },
      ],
      max_tokens: 200,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenRouter error ${response.status}: ${text}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("No content in OpenRouter response");

  return content.trim();
}
