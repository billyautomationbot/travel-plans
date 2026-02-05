# Travel Planner Implementation Guide

## Architecture Overview

### High-Level Flow

```
User: "Plan a trip to Italy, May 25 - June 2, budget $5000"
    ↓
Main Agent (Haiku)
    ├─ Parse request, ask clarification questions
    ├─ Gather preferences (style, interests, dietary, pace)
    └─ Spawn Sonnet Sub-Agent
        ↓
    Sonnet Agent (Research Phase)
        ├─ Web search flights (Google Flights data)
        ├─ Web search hotels (Booking.com)
        ├─ Web search restaurants & attractions
        ├─ Gather local tips & logistics
        └─ Generate trip-data.json
        ↓
    Generate HTML
        ├─ Run generate.js to inject JSON into template
        └─ Create beautiful index.html
        ↓
    GitHub Integration
        ├─ Commit files to /travel-plans/italy-may-2026/
        └─ Generate GitHub Pages URL
        ↓
Main Agent delivers link to user
    └─ "Here's your Italy itinerary! [GitHub Pages URL]"
```

## How the User Triggers It

Billy (user) messages:
- "Plan a trip to Italy for May 25 to June 2, budget $5000"
- "Help me plan Tokyo, June 5-15"
- "I want to visit Barcelona for 4 days, relaxed pace"

The main agent recognizes this and:
1. Asks clarifying questions (if needed)
2. Collects all preferences
3. Spawns Sonnet sub-agent with preferences JSON

## Agent Workflow

### Phase 1: Main Agent (Clarification)

**Trigger:** User describes a trip idea

**Main agent asks for:**
```json
{
  "destination": "required",
  "startDate": "required",
  "endDate": "required",
  "budget": "required or estimate",
  "travelStyle": "adventurous|relaxed|cultural|luxury|budget",
  "pace": "packed|moderate|relaxed",
  "mustSees": "list of must-see attractions",
  "dietary": "vegetarian|vegan|kosher|halal|no restrictions",
  "accommodation": "budget|mid-range|luxury",
  "travelers": "number of people",
  "interests": "list of interests (history, food, art, etc)"
}
```

**Output:** Preferences JSON → Spawn Sonnet sub-agent

### Phase 2: Sonnet Agent (Research)

**Input:** Preferences JSON + agent-prompt.md

**Research Strategy:**

1. **Flights**
   - Search: "[Origin] to [Destination] flights [dates]"
   - Extract: Airline, price, duration, times, stops
   - Find 3-5 options per price tier
   - Sources: Google Flights patterns, Skyscanner data references

2. **Hotels**
   - Search: "[City] hotels [dates] [budget] per night"
   - Extract: Name, rating, amenities, location, price
   - Find options: Budget ($50-80), Mid ($80-150), Luxury ($150+)
   - Sources: Booking.com patterns, TripAdvisor data

3. **Attractions**
   - Search: "best attractions [city] 2026"
   - Extract: Name, type, hours, admission, time needed
   - Prioritize must-sees + matching interests
   - Sources: Google Maps, TripAdvisor, official tourism sites

4. **Restaurants**
   - Search: "[Cuisine] restaurants [city] highly rated"
   - Extract: Name, cuisine, rating, price, location
   - Mix: Budget, mid-range, splurge options
   - Sources: Google Maps, Yelp patterns, local guides

5. **Local Tips**
   - Transportation: public transit, car rental, costs
   - Language: basic phrases, English prevalence
   - Best time: seasonality, crowds
   - Currency: exchange rates, payment methods
   - Safety: crime, travel advisories
   - Culture: customs, tipping, dress codes

**Output:** trip-data.json (structured JSON with all research)

### Phase 3: HTML Generation

**Process:**
1. Sonnet outputs trip-data.json
2. Run: `node .templates/generate.js trip-data.json [output-dir]`
3. Script reads template + JSON
4. Injects data with templating
5. Generates beautiful index.html

**Template Features:**
- Sticky navigation with section links
- Hero section with trip metadata
- Day-by-day timeline (scrollable, color-coded)
- Flight comparison table (sortable)
- Hotel comparison table (sortable)
- Attraction cards with links/hours
- Restaurant recommendations (price/rating)
- Budget breakdown (pie chart + table)
- OpenStreetMap/Google Maps embed
- Local tips cards
- Responsive design + print-friendly
- Scroll animations

### Phase 4: GitHub Integration

**Directory Structure:**
```
travel-plans/                    (separate repo: billyautomationbot/travel-plans)
  korea-october-2026/
    index.html          (generated HTML)
    trip-data.json      (research JSON)
  italy-may-2026/
    index.html
    trip-data.json
  .templates/
    travel-plan.html    (HTML template)
    generate.js         (JSON → HTML generator)
```

**GitHub Push:**
```bash
cd /Users/billys/clawd/travel-plans
git add italy-may-2026/
git commit -m "Travel plan: Italy May 25 - June 2"
git push origin main
```

**GitHub Pages URL:**
- Repo: `https://github.com/billyautomationbot/travel-plans`
- Pages: `https://billyautomationbot.github.io/travel-plans/italy-may-2026/`
- Each trip folder gets its own URL automatically

### Phase 5: Deliver to User

Main agent sends:
```
Here's your Italy itinerary! 🇮🇹

📅 May 25 - June 2 (9 days)
✈️ Flights: $1,570 (roundtrip for 2)
🏨 Hotels: Rome, Venice, Florence
🎯 Must-sees: Colosseum, Vatican, St. Mark's
🍽️ Dining: Trattoria, fine dining, local trattorias
💰 Budget: $4,700 total

👉 View full itinerary: [GitHub Pages Link]
```

## Web Scraping Strategy

### Tools & Libraries

**Clawdbot Built-in:**
- `web_search` — Brave Search API for finding flights, hotels, restaurants
- `web_fetch` — Extract readable content from URLs

**No external libraries required** — all research done via agent prompts and Clawdbot's web tools.

### Search Queries

#### Flights
```
"SFO to Rome flights May 25 2026 economy"
"cheapest flights San Francisco to Italy May"
"United Airlines Alitalia prices SFO FCO"
```

#### Hotels
```
"Rome hotels May 26-28 2026 mid-range"
"Venice accommodation near San Marco reviews"
"Florence 3-star hotels €100-150 per night"
```

#### Attractions
```
"best attractions Rome 2026"
"colosseum vatican museums hours admission"
"Venice St. Mark's Basilica Rialto Bridge must see"
```

#### Restaurants
```
"best Italian restaurants Rome highly rated"
"Venice seafood restaurants near San Marco"
"Florence Tuscan cuisine traditional"
```

## Error Handling

### If Web Search Fails
- Fall back to general knowledge (tourist classics)
- Note in itinerary: "Check current prices directly at [site]"
- Estimate based on typical price ranges
- Provide general recommendations

### If Data Incomplete
- Ask user for clarification via main agent
- Suggest alternatives ("No exact dates found, would X-Y work?")
- Use conservative estimates (budget higher than typical)

### If Attraction Closed
- Note in itinerary: "Currently closed — visit [alternative]"
- Provide backup suggestions based on interests

## Data Schema

### trip-data.json Top Level
```json
{
  "trip": { destination, dates, budget, travelers },
  "preferences": { style, pace, mustSees, dietary, interests },
  "flights": [ { airline, price, times, duration } ],
  "hotels": [ { name, price/night, rating, amenities } ],
  "attractions": [ { name, type, hours, admission, rating } ],
  "restaurants": [ { name, cuisine, price, rating } ],
  "itinerary": [ { day, date, title, activities[] } ],
  "budget": { flights, accommodation, activities, meals, transport, misc },
  "tips": { transportation, language, bestTime, crowds, currency, safety }
}
```

## Future Enhancements

1. **Real Booking APIs**
   - Skyscanner/Amadeus for live flight prices
   - Booking.com/Airbnb for hotel availability
   - Stripe integration for payments

2. **Dynamic Pricing**
   - Show price trends (cheapest days to fly)
   - Hotel price per night analysis

3. **Weather Forecasts**
   - Integrate weather API (OpenWeatherMap)
   - Show historical averages + predictions

4. **Public Transit Maps**
   - Google Transit for each city
   - Cost estimates for transport passes

5. **Collaborative Planning**
   - Share with Sharon to add notes
   - Voting on restaurants/activities
   - Real-time sync updates

6. **PDF Export**
   - Generate printable PDF version
   - Email itinerary option

7. **Mobile App**
   - Offline access to itinerary
   - GPS tracking during trip
   - Real-time navigation

8. **AR Features**
   - Point phone at attractions
   - Show historical info/reconstructions
   - Restaurant menus via QR codes

## Testing

### Test Data
Use `example-trip-data.json` to test HTML generation:
```bash
node .templates/generate.js .templates/example-trip-data.json .
```

Should generate `index.html` with full Italy trip example.

### Test Workflow
1. Manually create a trip JSON
2. Run generate.js
3. Open index.html in browser
4. Verify all sections render correctly
5. Test responsive design (mobile, tablet, desktop)
6. Test print functionality

## Files Reference

| File | Purpose |
|------|---------|
| `SKILL.md` | User guide + skill definition |
| `IMPLEMENTATION.md` | This file - architecture & details |
| `agent-prompt.md` | Sonnet sub-agent prompt for research |
| `.templates/travel-plan.html` | HTML template (templated with `{{}}` markers) |
| `.templates/generate.js` | Node.js script to inject JSON into template |
| `.templates/example-trip-data.json` | Example data (Italy trip) |
| `README.md` | Quick user guide |

## Integration with Clawdbot

### How Billy Triggers It
Just message: "Plan a trip to..."

### Under the Hood
1. Clawdbot detects trip planning trigger
2. Main agent (Haiku) handles conversation
3. Spawns Sonnet sub-agent with preferences
4. Sonnet runs web_search + web_fetch for research
5. Generates trip-data.json
6. Runs generate.js to create HTML
7. Commits to GitHub
8. Returns link to main agent
9. Main agent sends link to Billy via WhatsApp

### No Extra Setup Needed
- `web_search` already configured in Clawdbot
- `web_fetch` built-in
- GitHub CLI (`gh`) available if git is configured
- Node.js available for generate.js

---

## Questions?

Refer back to this guide for:
- Agent flow diagrams
- Data schema examples
- Search query templates
- File structure
- Future enhancement ideas
