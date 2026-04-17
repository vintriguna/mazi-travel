// type ParticipantPref = {
//   trip_pace: string;
//   budget_range: string;
//   top_priorities: string[];
//   ai_notes: string | null;
// };

// type TripInput = {
//   origin: string | null;
//   destination: string | null;
//   start_date: string | null;
//   end_date: string | null;
//   trip_type: string | null;
//   group_size: number | null;
//   participant_preferences: ParticipantPref[];
// };

// const TRIP_TYPE_LABELS: Record<string, string> = {
//   vacation: "Vacation",
//   event_celebration: "Event / celebration",
//   work_conference: "Work / conference",
// };

// const PACE_LABELS: Record<string, string> = {
//   relaxed: "Relaxed",
//   balanced: "Balanced",
//   packed: "Packed",
// };

// const BUDGET_LABELS: Record<string, string> = {
//   budget: "Budget-friendly",
//   moderate: "Moderate",
//   comfortable: "Comfortable",
//   luxury: "Luxury",
// };

// function buildPrompt(trip: TripInput): string {
//   const lines: string[] = [];

//   if (trip.origin) lines.push(`Origin: ${trip.origin}`);
//   if (trip.destination) lines.push(`Destination: ${trip.destination}`);
//   if (trip.start_date && trip.end_date) {
//     lines.push(`Dates: ${trip.start_date} to ${trip.end_date}`);
//   } else if (trip.start_date) {
//     lines.push(`Start date: ${trip.start_date}`);
//   }
//   if (trip.trip_type) {
//     lines.push(`Trip type: ${TRIP_TYPE_LABELS[trip.trip_type] ?? trip.trip_type}`);
//   }
//   if (trip.group_size) lines.push(`Group size: ${trip.group_size} people`);

//   if (trip.participant_preferences.length > 0) {
//     lines.push("\nParticipant preferences:");
//     trip.participant_preferences.forEach((p, i) => {
//       lines.push(`  Participant ${i + 1}:`);
//       lines.push(`    Pace: ${PACE_LABELS[p.trip_pace] ?? p.trip_pace}`);
//       lines.push(`    Budget: ${BUDGET_LABELS[p.budget_range] ?? p.budget_range}`);
//       lines.push(`    Priorities: ${p.top_priorities.join(", ")}`);
//       if (p.ai_notes) lines.push(`    Notes: ${p.ai_notes}`);
//     });
//   }

//   return lines.join("\n");
// }

// async function searchFlights(params: {
//   from: string;
//   to: string;
//   departure_date: string;
//   return_date?: string;
// }) {
//   const apiKey = process.env.SERPAPI_KEY;
//   if (!apiKey) throw new Error("SERPAPI_KEY is not set");

//   const url = new URL("https://serpapi.com/search.json");
//   url.searchParams.set("engine", "google_flights");
//   url.searchParams.set("departure_id", params.from);
//   url.searchParams.set("arrival_id", params.to);
//   url.searchParams.set("outbound_date", params.departure_date);
//   if (params.return_date) {
//     url.searchParams.set("return_date", params.return_date);
//   }
//   url.searchParams.set("currency", "USD");
//   url.searchParams.set("hl", "en");
//   url.searchParams.set("api_key", apiKey);
//   url.searchParams.set("deep_search", "true");

//   const res = await fetch(url.toString());
//   if (!res.ok) throw new Error("Flight search failed");

//   const data = await res.json();
//   return {
//     best_flights: data.best_flights ?? [],
//     other_flights: data.other_flights ?? [],
//     price_insights: data.price_insights ?? null,
//   };
// }

// function getAirportCode(destination: string | null): string {
//   if (!destination) return "LAX";
//   const map: Record<string, string> = {
//     // North America
//     new_york: "JFK", nyc: "JFK", jfk: "JFK", ewr: "EWR", lga: "LGA",
//     los_angeles: "LAX", la: "LAX", lax: "LAX",
//     chicago: "ORD", ord: "ORD", mdw: "MDW",
//     san_francisco: "SFO", sf: "SFO", sfo: "SFO", oakland: "OAK", oak: "OAK", san_jose: "SJC", sjc: "SJC",
//     seattle: "SEA", sea: "SEA",
//     boston: "BOS", bos: "BOS",
//     washington: "IAD", washington_dc: "IAD", dc: "IAD", iad: "IAD", dca: "DCA",
//     miami: "MIA", mia: "MIA", ft_lauderdale: "FLL", fll: "FLL",
//     dallas: "DFW", dfw: "DFW", dal: "DAL",
//     atlanta: "ATL", atl: "ATL",
//     houston: "IAH", iah: "IAH", hobby: "HOU", hou: "HOU",
//     denver: "DEN", den: "DEN",
//     orlando: "MCO", mco: "MCO",
//     las_vegas: "LAS", vegas: "LAS", las: "LAS",
//     phoenix: "PHX", phx: "PHX",
//     philadelphia: "PHL", phl: "PHL",
//     minneapolis: "MSP", msp: "MSP",
//     detroit: "DTW", dtw: "DTW",
//     charlotte: "CLT", clt: "CLT",
//     toronto: "YYZ", yyz: "YYZ", pearson: "YYZ",
//     vancouver: "YVR", yvr: "YVR",
//     montreal: "YUL", yul: "YUL",
//     mexico_city: "MEX", mex: "MEX",
//     // Europe
//     london: "LHR", lhr: "LHR", lgw: "LGW", stn: "STN", luton: "LTN", ltn: "LTN",
//     paris: "CDG", cdg: "CDG", orly: "ORY", ory: "ORY",
//     amsterdam: "AMS", ams: "AMS",
//     frankfurt: "FRA", fra: "FRA",
//     munich: "MUC", muc: "MUC",
//     berlin: "BER", ber: "BER",
//     zurich: "ZRH", zrh: "ZRH",
//     geneva: "GVA", gva: "GVA",
//     madrid: "MAD", mad: "MAD",
//     barcelona: "BCN", bcn: "BCN",
//     rome: "FCO", fco: "FCO", cia: "CIA",
//     milan: "MXP", mxp: "MXP", lin: "LIN",
//     brussels: "BRU", bru: "BRU",
//     vienna: "VIE", vie: "VIE",
//     dublin: "DUB", dub: "DUB",
//     copenhagen: "CPH", cph: "CPH",
//     oslo: "OSL", osl: "OSL",
//     stockholm: "ARN", arn: "ARN",
//     helsinki: "HEL", hel: "HEL",
//     istanbul: "IST", ist: "IST", saw: "SAW",
//     athens: "ATH", ath: "ATH",
//     prague: "PRG", prg: "PRG",
//     budapest: "BUD", bud: "BUD",
//     warsaw: "WAW", waw: "WAW",
//     lisbon: "LIS", lis: "LIS",
//     // Asia
//     tokyo: "HND", hnd: "HND", narita: "NRT", nrt: "NRT",
//     seoul: "ICN", icn: "ICN",
//     beijing: "PEK", pek: "PEK", pvg: "PVG", shanghai: "PVG",
//     hong_kong: "HKG", hkg: "HKG",
//     singapore: "SIN", sin: "SIN",
//     bangkok: "BKK", bkk: "BKK",
//     delhi: "DEL", del: "DEL",
//     mumbai: "BOM", bom: "BOM",
//     kuala_lumpur: "KUL", kul: "KUL",
//     manila: "MNL", mnl: "MNL",
//     jakarta: "CGK", cgk: "CGK",
//     taipei: "TPE", tpe: "TPE",
//     dubai: "DXB", dxb: "DXB",
//     abu_dhabi: "AUH", auh: "AUH",
//     doha: "DOH", doh: "DOH",
//     // Oceania
//     sydney: "SYD", syd: "SYD",
//     melbourne: "MEL", mel: "MEL",
//     brisbane: "BNE", bne: "BNE",
//     auckland: "AKL", akl: "AKL",
//     // Africa
//     johannesburg: "JNB", jnb: "JNB",
//     cape_town: "CPT", cpt: "CPT",
//     nairobi: "NBO", nbo: "NBO",
//     cairo: "CAI", cai: "CAI",
//     casablanca: "CMN", cmn: "CMN",
//     addis_ababa: "ADD", add: "ADD",
//     lagos: "LOS", los: "LOS",
//     // South America
//     sao_paulo: "GRU", gru: "GRU", congonhas: "CGH", cgh: "CGH",
//     rio: "GIG", rio_de_janeiro: "GIG", gig: "GIG",
//     lima: "LIM", lim: "LIM",
//     santiago: "SCL", scl: "SCL",
//     buenos_aires: "EZE", eze: "EZE",
//     bogota: "BOG", bog: "BOG",
//     quito: "UIO", uio: "UIO",
//     caracas: "CCS", ccs: "CCS",
//     // Middle East
//     tel_aviv: "TLV", tlv: "TLV",
//     amman: "AMM", amm: "AMM",
//     riyadh: "RUH", ruh: "RUH",
//     jeddah: "JED", jed: "JED",
//     kuwait: "KWI", kwi: "KWI",
//     muscat: "MCT", mct: "MCT",
//     bahrain: "BAH", bah: "BAH",
//     // fallback
//   };
//   // Normalize input: lowercase, replace spaces and hyphens with underscores
//   const key = destination.toLowerCase().replace(/[-\s]/g, "_");
//   return map[key] ?? "LAX";
// }

// export async function generateFlightPlan(trip: TripInput): Promise<string> {
//   const apiKey = process.env.OPEN_ROUTER_API_KEY;
//   if (!apiKey) throw new Error("OPEN_ROUTER_API_KEY is not set");

//   if (!trip.start_date) {
//     throw new Error("Trip must have a start_date");
//   }

//   const flightParams = {
//     from: getAirportCode(trip.origin),
//     to: getAirportCode(trip.destination),
//     departure_date: trip.start_date,
//     return_date: trip.end_date ?? undefined,
//   };

//   // 1. Fetch real flight data
//   const flights = await searchFlights(flightParams);

//   // 2. Ask AI to analyze them
//   const response = await fetch("https://api.openai.com/v1/chat/completions", {
//     method: "POST",
//     headers: {
//       Authorization: `Bearer ${apiKey}`,
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       model: "gpt-4.1-mini",
//       messages: [
//         {
//           role: "system",
//           content: `
// You are a flight recommendation engine.

// You MUST output ONLY valid JSON.
// No markdown. No explanation. No extra text.

// Return data in this exact structure:

// {
//   "title": string,
//   "summary": string,
//   "flights": [
//     {
//       "rank": number,
//       "airline": string,
//       "route": string,
//       "price_per_person": number,
//       "duration_minutes": number,
//       "departure_time": string,
//       "arrival_time": string,
//       "aircraft": string,
//       "stops": number,
//       "pros": string[],
//       "cons": string[],
//       "best_for": string
//     }
//   ],
//   "recommendation": {
//     "best_option_rank": number,
//     "reason": string
//   }
// }

// Rules:
// - max 2 flights
// - durations in minutes (number only)
// - price as number only (no $ or commas)
// - max 3 pros, max 3 cons
// - Keep all strings under 120 characters
// - Consider each participant's budget range and priorities when recommending
// `,
//         },
//         {
//           role: "user",
//           content: `
// Trip Details:
// ${buildPrompt(trip)}

// Flight Data:
// ${JSON.stringify(flights, null, 2)}

// Return the structured JSON exactly.
// `,
//         },
//       ],
//       temperature: 0.7,
//       max_tokens: 1500,
//     }),
//   });

//   if (!response.ok) {
//     const text = await response.text();
//     throw new Error(`OpenAI error ${response.status}: ${text}`);
//   }

//   const data = await response.json();
//   const content = data.choices?.[0]?.message?.content;
//   if (!content) throw new Error("No content in response");

//   return content.trim();
// }


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
    // North America
    new_york: "JFK", nyc: "JFK", jfk: "JFK", ewr: "EWR", lga: "LGA",
    los_angeles: "LAX", la: "LAX", lax: "LAX",
    chicago: "ORD", ord: "ORD", mdw: "MDW",
    san_francisco: "SFO", sf: "SFO", sfo: "SFO", oakland: "OAK", oak: "OAK", san_jose: "SJC", sjc: "SJC",
    seattle: "SEA", sea: "SEA",
    boston: "BOS", bos: "BOS",
    washington: "IAD", washington_dc: "IAD", dc: "IAD", iad: "IAD", dca: "DCA",
    miami: "MIA", mia: "MIA", ft_lauderdale: "FLL", fll: "FLL",
    dallas: "DFW", dfw: "DFW", dal: "DAL",
    atlanta: "ATL", atl: "ATL",
    houston: "IAH", iah: "IAH", hobby: "HOU", hou: "HOU",
    denver: "DEN", den: "DEN",
    orlando: "MCO", mco: "MCO",
    las_vegas: "LAS", vegas: "LAS", las: "LAS",
    phoenix: "PHX", phx: "PHX",
    philadelphia: "PHL", phl: "PHL",
    minneapolis: "MSP", msp: "MSP",
    detroit: "DTW", dtw: "DTW",
    charlotte: "CLT", clt: "CLT",
    toronto: "YYZ", yyz: "YYZ", pearson: "YYZ",
    vancouver: "YVR", yvr: "YVR",
    montreal: "YUL", yul: "YUL",
    mexico_city: "MEX", mex: "MEX",
    // Europe
    london: "LHR", lhr: "LHR", lgw: "LGW", stn: "STN", luton: "LTN", ltn: "LTN",
    paris: "CDG", cdg: "CDG", orly: "ORY", ory: "ORY",
    amsterdam: "AMS", ams: "AMS",
    frankfurt: "FRA", fra: "FRA",
    munich: "MUC", muc: "MUC",
    berlin: "BER", ber: "BER",
    zurich: "ZRH", zrh: "ZRH",
    geneva: "GVA", gva: "GVA",
    madrid: "MAD", mad: "MAD",
    barcelona: "BCN", bcn: "BCN",
    rome: "FCO", fco: "FCO", cia: "CIA",
    milan: "MXP", mxp: "MXP", lin: "LIN",
    brussels: "BRU", bru: "BRU",
    vienna: "VIE", vie: "VIE",
    dublin: "DUB", dub: "DUB",
    copenhagen: "CPH", cph: "CPH",
    oslo: "OSL", osl: "OSL",
    stockholm: "ARN", arn: "ARN",
    helsinki: "HEL", hel: "HEL",
    istanbul: "IST", ist: "IST", saw: "SAW",
    athens: "ATH", ath: "ATH",
    prague: "PRG", prg: "PRG",
    budapest: "BUD", bud: "BUD",
    warsaw: "WAW", waw: "WAW",
    lisbon: "LIS", lis: "LIS",
    // Asia
    tokyo: "HND", hnd: "HND", narita: "NRT", nrt: "NRT",
    seoul: "ICN", icn: "ICN",
    beijing: "PEK", pek: "PEK", pvg: "PVG", shanghai: "PVG",
    hong_kong: "HKG", hkg: "HKG",
    singapore: "SIN", sin: "SIN",
    bangkok: "BKK", bkk: "BKK",
    delhi: "DEL", del: "DEL",
    mumbai: "BOM", bom: "BOM",
    kuala_lumpur: "KUL", kul: "KUL",
    manila: "MNL", mnl: "MNL",
    jakarta: "CGK", cgk: "CGK",
    taipei: "TPE", tpe: "TPE",
    dubai: "DXB", dxb: "DXB",
    abu_dhabi: "AUH", auh: "AUH",
    doha: "DOH", doh: "DOH",
    // Oceania
    sydney: "SYD", syd: "SYD",
    melbourne: "MEL", mel: "MEL",
    brisbane: "BNE", bne: "BNE",
    auckland: "AKL", akl: "AKL",
    // Africa
    johannesburg: "JNB", jnb: "JNB",
    cape_town: "CPT", cpt: "CPT",
    nairobi: "NBO", nbo: "NBO",
    cairo: "CAI", cai: "CAI",
    casablanca: "CMN", cmn: "CMN",
    addis_ababa: "ADD", add: "ADD",
    lagos: "LOS", los: "LOS",
    // South America
    sao_paulo: "GRU", gru: "GRU", congonhas: "CGH", cgh: "CGH",
    rio: "GIG", rio_de_janeiro: "GIG", gig: "GIG",
    lima: "LIM", lim: "LIM",
    santiago: "SCL", scl: "SCL",
    buenos_aires: "EZE", eze: "EZE",
    bogota: "BOG", bog: "BOG",
    quito: "UIO", uio: "UIO",
    caracas: "CCS", ccs: "CCS",
    // Middle East
    tel_aviv: "TLV", tlv: "TLV",
    amman: "AMM", amm: "AMM",
    riyadh: "RUH", ruh: "RUH",
    jeddah: "JED", jed: "JED",
    kuwait: "KWI", kwi: "KWI",
    muscat: "MCT", mct: "MCT",
    bahrain: "BAH", bah: "BAH",
    // fallback
  };
  // Normalize input: lowercase, replace spaces and hyphens with underscores
  const key = destination.toLowerCase().replace(/[-\s]/g, "_");
  return map[key] ?? "LAX";
}

export async function generateFlightPlan(trip: TripInput): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

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

  // 2. Ask Gemini to analyze them
  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text:
                `You are a flight recommendation engine.\n\nYou MUST output ONLY valid JSON.\nNo markdown. No explanation. No extra text.\n\nReturn data in this exact structure:\n\n{\n  "title": string,\n  "summary": string,\n  "flights": [\n    {\n      "rank": number,\n      "airline": string,\n      "route": string,\n      "price_per_person": number,\n      "duration_minutes": number,\n      "departure_time": string,\n      "arrival_time": string,\n      "aircraft": string,\n      "stops": number,\n      "pros": string[],\n      "cons": string[],\n      "best_for": string\n    }\n  ],\n  "recommendation": {\n    "best_option_rank": number,\n    "reason": string\n  }\n}\n\nRules:\n- max 2 flights\n- durations in minutes (number only)\n- price as number only (no $ or commas)\n- max 3 pros, max 3 cons\n- Keep all strings under 120 characters\n- Consider each participant's budget range and priorities when recommending\n\nTrip Details:\n${buildPrompt(trip)}\n\nFlight Data:\n${JSON.stringify(flights, null, 2)}\n\nReturn the structured JSON exactly.`,
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${text}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) throw new Error("No content in Gemini response");

  return content.trim();
}