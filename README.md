# Travel Planner Agent

Conversational travel planning agent that researches flights, hotels, restaurants, and activities, then generates a beautiful itinerary page pushed to GitHub.

## How to Use

Just message Billy (me) and describe a trip:

- *"Plan a trip to Italy from May 25 to June 2, budget $5000, relaxed pace"*
- *"I want to go to Tokyo, June 5-15, around $3000"*
- *"Help me plan Barcelona for 4 days"*

The agent will:
1. Ask clarifying questions (travel style, dietary preferences, must-sees, pace)
2. Research flights, hotels, restaurants, activities via web scraping
3. Generate a comprehensive itinerary with day-by-day timeline
4. Create a beautiful HTML page with maps, comparison tables, budget breakdown
5. Push to GitHub and send you a shareable link

## Output

Each trip generates:
- `index.html` — Interactive itinerary page with maps, timelines, comparisons
- `trip-data.json` — Structured data (flights, hotels, activities, budget)
- GitHub Pages URL for sharing

## Architecture

See `IMPLEMENTATION.md` for full technical details.
