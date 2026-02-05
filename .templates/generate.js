#!/usr/bin/env node

/**
 * Travel Planner HTML Generator
 * 
 * Converts trip-data.json into a beautiful index.html page
 * Usage: node generate.js trip-data.json [output-directory]
 */

const fs = require('fs');
const path = require('path');

// Get arguments
const inputFile = process.argv[2] || 'trip-data.json';
const outputDir = process.argv[3] || '.';

// Read data
let tripData;
try {
    const rawData = fs.readFileSync(inputFile, 'utf8');
    tripData = JSON.parse(rawData);
    console.log(`✓ Loaded ${inputFile}`);
} catch (err) {
    console.error(`✗ Error reading ${inputFile}:`, err.message);
    process.exit(1);
}

// Read template
const templatePath = path.join(__dirname, 'travel-plan.html');
let html;
try {
    html = fs.readFileSync(templatePath, 'utf8');
    console.log(`✓ Loaded template`);
} catch (err) {
    console.error(`✗ Error reading template:`, err.message);
    process.exit(1);
}

// Generate content
const generated = generateHTML(html, tripData);

// Write output
const outputFile = path.join(outputDir, 'index.html');
try {
    fs.writeFileSync(outputFile, generated);
    console.log(`✓ Generated ${outputFile}`);
} catch (err) {
    console.error(`✗ Error writing output:`, err.message);
    process.exit(1);
}

function generateHTML(template, data) {
    let output = template;
    const t = data.trip;
    const p = data.preferences;

    // Hero section
    output = output.replace(/{{destination}}/g, t.destination);
    output = output.replace(/{{startDate}}/g, formatDate(t.startDate));
    output = output.replace(/{{endDate}}/g, formatDate(t.endDate));
    output = output.replace(/{{days}}/g, t.days);
    output = output.replace(/{{budget}}/g, t.budget);
    output = output.replace(/{{travelers}}/g, t.travelers || 1);
    output = output.replace(/{{generatedDate}}/g, new Date().toLocaleDateString());

    // Itinerary
    output = output.replace('{{itinerary_days}}', generateItinerary(data.itinerary));

    // Flights
    const [outbound, returnFlights] = splitFlights(data.flights || []);
    output = output.replace('{{flights_outbound}}', generateFlightsTable(outbound));
    output = output.replace('{{flights_return}}', generateFlightsTable(returnFlights));

    // Hotels
    output = output.replace('{{hotels_cards}}', generateCards(data.hotels || [], 'hotel'));

    // Attractions
    output = output.replace('{{attractions_cards}}', generateCards(data.attractions || [], 'attraction'));

    // Restaurants
    output = output.replace('{{restaurants_cards}}', generateCards(data.restaurants || [], 'restaurant'));

    // Budget
    output = output.replace('{{budget_items}}', generateBudgetItems(data.budget || {}));
    output = output.replace('{{budget_total}}', calculateBudgetTotal(data.budget || {}));
    output = output.replace('{{budget_chart_bars}}', generateBudgetChart(data.budget || {}));

    // Map
    output = output.replace('{{map_embed}}', generateMap(data.itinerary || [], t.destination));

    // Tips
    output = output.replace('{{tips_cards}}', generateTips(data.tips || {}));

    return output;
}

function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

function generateItinerary(days) {
    if (!days || days.length === 0) return '<p>No itinerary data</p>';

    return days.map(day => `
        <div class="itinerary-day">
            <div class="day-header">
                <div class="day-title">Day ${day.day}: ${day.title}</div>
                <span class="day-date">${formatDate(day.date)}</span>
            </div>
            ${(day.activities || []).map(activity => `
                <div class="activity">
                    <div class="activity-time">${activity.time}</div>
                    <div class="activity-content">
                        <h4>${activity.activity}</h4>
                        ${activity.details ? `<p>${activity.details}</p>` : ''}
                        <span class="activity-type ${activity.type}">${activity.type}</span>
                    </div>
                </div>
            `).join('')}
        </div>
    `).join('');
}

function splitFlights(flights) {
    const outbound = flights.filter(f => f.type !== 'return');
    const returnF = flights.filter(f => f.type === 'return');
    return [outbound, returnF];
}

function generateFlightsTable(flights) {
    if (!flights || flights.length === 0) return '<tr><td colspan="5" style="text-align: center;">No flights found</td></tr>';

    return flights.map(flight => `
        <tr>
            <td><strong>${flight.airline}</strong></td>
            <td>${flight.from} → ${flight.to}</td>
            <td>${flight.departTime} → ${flight.arriveTime}</td>
            <td>${flight.duration}${flight.stops ? ` (${flight.stops} stops)` : ''}</td>
            <td style="color: var(--success); font-weight: bold;">$${flight.price}</td>
        </tr>
    `).join('');
}

function generateCards(items, type) {
    if (!items || items.length === 0) return `<p>No ${type}s found</p>`;

    return items.map(item => {
        let card = `
            <div class="card">
                <h4>${item.name}</h4>
        `;

        if (item.rating) {
            card += `<div class="rating">⭐ ${item.rating}/5</div>`;
        }

        if (item.city) {
            card += `<div class="details">📍 ${item.city}</div>`;
        }

        if (item.pricePerNight) {
            card += `<div class="price">$${item.pricePerNight}/night</div>`;
        } else if (item.price) {
            card += `<div class="price">$${item.price}</div>`;
        } else if (item.priceRange) {
            card += `<div class="price">${item.priceRange}</div>`;
        }

        if (item.description) {
            card += `<p>${item.description}</p>`;
        }

        if (item.cuisine) {
            card += `<div class="details">🍽️ ${item.cuisine}</div>`;
        }

        if (item.type) {
            card += `<div class="details">${item.type}</div>`;
        }

        if (item.hoursOpen) {
            card += `<div class="details">⏰ ${item.hoursOpen}</div>`;
        }

        if (item.amenities && item.amenities.length > 0) {
            card += `<div class="details">✓ ${item.amenities.join(', ')}</div>`;
        }

        if (item.url) {
            card += `<div style="margin-top: 1rem;"><a href="${item.url}" target="_blank" style="color: var(--primary); text-decoration: none;">View →</a></div>`;
        }

        card += '</div>';
        return card;
    }).join('');
}

function generateBudgetItems(budget) {
    if (!budget || Object.keys(budget).length === 0) return '<li>No budget data</li>';

    return Object.entries(budget)
        .filter(([key]) => key !== 'total')
        .map(([category, item]) => {
            if (typeof item === 'object' && item.amount) {
                return `
                    <li class="budget-item">
                        <strong>${item.description || category}</strong>
                        <span class="amount">$${item.amount}</span>
                    </li>
                `;
            }
            return '';
        }).join('');
}

function calculateBudgetTotal(budget) {
    if (budget.total) return budget.total;

    let total = 0;
    Object.values(budget).forEach(item => {
        if (typeof item === 'object' && item.amount) {
            total += item.amount;
        }
    });
    return total;
}

function generateBudgetChart(budget) {
    const items = Object.entries(budget)
        .filter(([key]) => key !== 'total')
        .map(([, item]) => item.amount || 0);

    const total = calculateBudgetTotal(budget);
    const colors = ['#3b82f6', '#1e40af', '#0ea5e9', '#06b6d4', '#10b981', '#f59e0b'];

    return items.map((amount, i) => {
        const percentage = ((amount / total) * 100).toFixed(1);
        return `
            <div class="budget-bar" style="width: ${percentage}%; background: ${colors[i % colors.length]};">
                ${percentage}%
            </div>
        `;
    }).join('');
}

function generateMap(itinerary, destination) {
    // Generate a simple OpenStreetMap embed or Google Maps
    const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=-0.5,-0.5,0.5,0.5&layer=mapnik&marker=${destination}`;
    return `<iframe src="https://maps.google.com/maps?q=${encodeURIComponent(destination)}&t=&z=13&ie=UTF8&iwloc=&output=embed" style="border: 0;" allowfullscreen="" loading="lazy"></iframe>`;
}

function generateTips(tips) {
    if (!tips || Object.keys(tips).length === 0) return '<p>No tips available</p>';

    const icons = {
        transportation: '🚆',
        language: '🗣️',
        bestTime: '🌞',
        crowds: '👥',
        currency: '💵',
        safety: '🛡️'
    };

    return Object.entries(tips).map(([key, tip]) => {
        const icon = icons[key] || '💡';
        const title = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        return `
            <div class="tip">
                <h4>${icon} ${title}</h4>
                <p>${tip}</p>
            </div>
        `;
    }).join('');
}

console.log('✓ HTML generation complete!');
