# Travel Planner Skill

## Overview

Conversational travel planning agent that gathers trip preferences, researches flights/hotels/activities, and generates an interactive itinerary page.

## How to Trigger

User says something like:
- "Plan a trip to Italy for May 25 to June 2"
- "Help me plan Tokyo June 5-15, budget $3000"
- "I want to visit Barcelona for 4 days, relaxed pace"

## Agent Flow

1. **Clarification** — Ask for missing info:
   - Budget (if not specified)
   - Travel style (adventurous, relaxed, cultural, luxury, budget)
   - Must-see attractions or experiences
   - Dietary preferences
   - Pace (packed schedule vs relaxed)
   - Accommodation style (budget, mid-range, luxury)

2. **Research Phase** — Spawn Sonnet sub-agent to:
   - Search for flights (Google Flights data)
   - Find hotels (Booking.com data)
   - Discover restaurants (Google Maps, Yelp)
   - Research attractions and activities
   - Gather local tips (transport, language, culture)

3. **Generation** — Sonnet creates:
   - trip-data.json (structured itinerary)
   - Push to GitHub in `/travel-plans/{destination}-{dates}/`
   - Generate index.html from template

4. **Delivery** — Main agent sends:
   - GitHub Pages URL
   - Quick summary (flights, hotels, daily activities)
   - Budget breakdown

## Data Collection Template

```json
{
  "trip": {
    "destination": "Italy",
    "startDate": "2026-05-25",
    "endDate": "2026-06-02",
    "days": 9,
    "budget": 5000
  },
  "preferences": {
    "style": "relaxed",
    "pace": "moderate",
    "mustSees": ["Venice", "Rome", "Florence"],
    "dietary": "vegetarian",
    "accommodation": "mid-range"
  },
  "flights": [
    {
      "airline": "United",
      "departure": "SFO",
      "arrival": "FCO",
      "date": "2026-05-25",
      "price": 450,
      "duration": "10h 30m"
    }
  ],
  "hotels": [
    {
      "name": "Hotel Name",
      "city": "Rome",
      "checkIn": "2026-05-25",
      "checkOut": "2026-05-28",
      "pricePerNight": 120,
      "rating": 4.5,
      "amenities": ["WiFi", "Breakfast"]
    }
  ],
  "itinerary": [
    {
      "day": 1,
      "date": "2026-05-25",
      "title": "Arrival & Rome Exploration",
      "activities": [
        {
          "time": "14:00",
          "activity": "Arrive at Fiumicino",
          "type": "travel"
        }
      ]
    }
  ],
  "budget": {
    "flights": 900,
    "hotels": 1080,
    "activities": 600,
    "meals": 1200,
    "transport": 300,
    "misc": 200
  }
}
```

## Web Scraping

Uses Clawdbot's built-in tools:
- `web_search` — Brave Search API for finding flights, hotels, restaurants
- `web_fetch` — Extract readable content from booking sites, review sites

No external libraries required; all research done via agent prompts and web access.

## HTML Template

Located at `.templates/travel-plan.html`

Features:
- Hero section with trip metadata
- Sticky navigation with section links
- Day-by-day timeline with color-coded activity types
- Flight comparison table (sortable)
- Hotel comparison table (sortable)
- Restaurant recommendations (cards with links/ratings)
- Activity grid with descriptions
- Budget breakdown (visual + numbers)
- OpenStreetMap embed with all locations
- Responsive design + print-friendly
- Scroll animations

## GitHub Integration

Each trip creates a folder:
```
clawd/
  travel-plans/
    italy-may-2026/
      index.html
      trip-data.json
      README.md
    tokyo-june-2026/
      ...
```

Pushes via `gh` CLI, generates GitHub Pages URL or direct link.

## Error Handling

- If web_search returns no results: fall back to general knowledge
- Missing data: ask user for clarification rather than guess
- Unreachable sites: note in itinerary ("Check prices directly at X")

## Future Enhancements

- Integrate real booking APIs (Skyscanner, Booking.com, Stripe for reservations)
- Add weather forecasts
- Include public transport maps (Google Transit)
- Email itinerary option
- Collaborative planning (share with Sharon to edit)
