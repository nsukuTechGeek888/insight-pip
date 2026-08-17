// src/app/api/economic-calendar/route.js

export async function GET(request) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 's-maxage=300, stale-while-revalidate=600'
  };

  try {
    const url = new URL(request.url);
    const targetTimezone = url.searchParams.get('timezone') || 'Africa/Johannesburg';
    const days = parseInt(url.searchParams.get('days')) || 7;
    
    // Fetch XML
    const response = await fetch('https://nfs.faireconomy.media/ff_calendar_thisweek.xml', {
      signal: AbortSignal.timeout(10000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      }
    });
    
    const xmlText = await response.text();
    const events = parseForexFactoryXML(xmlText);
    
    // Convert to SA time by adding 2 hours
    const convertedEvents = events.map(event => convertToSATime(event));
    
    // Filter by days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);
    const filteredEvents = convertedEvents.filter(event => 
      new Date(event.timestamp) <= cutoffDate
    );
    
    return new Response(JSON.stringify({
      success: true,
      events: filteredEvents,
      count: filteredEvents.length,
      timezone: targetTimezone,
      lastUpdated: new Date().toISOString()
    }), { status: 200, headers });
    
  } catch (error) {
    console.error('❌ Calendar failed:', error);
    return new Response(JSON.stringify({
      success: false,
      events: [],
      error: error.message
    }), { status: 500, headers });
  }
}

function parseForexFactoryXML(xmlText) {
  const events = [];
  const eventBlocks = xmlText.split(/<\/event>/i);
  
  for (const block of eventBlocks) {
    try {
      const title = extractField(block, 'title');
      const countryCode = extractField(block, 'country');
      const dateStr = extractField(block, 'date');
      const timeStr = extractField(block, 'time');
      const forecast = extractField(block, 'forecast');
      const previous = extractField(block, 'previous');
      const impactFromXML = extractField(block, 'impact');
      
      if (!title || !dateStr || !timeStr) continue;
      
      // Parse the raw date and time
      const parsed = parseRawDateTime(dateStr, timeStr);
      if (!parsed) continue;
      
      let { year, month, day, hours, minutes } = parsed;
      
      // Use the XML impact directly (it's already low/medium/high)
      let impact = 'low';
      if (impactFromXML) {
        const impactLower = impactFromXML.toLowerCase();
        if (impactLower === 'high') impact = 'high';
        else if (impactLower === 'medium') impact = 'medium';
        else impact = 'low';
      } else {
        // Fallback to keyword detection if no impact in XML
        impact = determineImpact(title, countryCode);
      }
      
      events.push({
        id: `${countryCode}-${title}-${Date.now()}-${Math.random()}`,
        title: title,
        countryCode: countryCode,
        countryName: getCountryName(countryCode),
        currency: countryCode,
        rawYear: year,
        rawMonth: month,
        rawDay: day,
        rawHour: hours,
        rawMinute: minutes,
        forecast: forecast || '--',
        previous: previous || '--',
        impact: impact
      });
      
    } catch (err) {
      // Skip malformed events
    }
  }
  
  return events;
}

function parseRawDateTime(dateStr, timeStr) {
  try {
    // Parse date (format: MM-DD-YYYY)
    const dateParts = dateStr.split('-');
    if (dateParts.length !== 3) return null;
    
    const month = parseInt(dateParts[0]) - 1;
    const day = parseInt(dateParts[1]);
    const year = parseInt(dateParts[2]);
    
    // Parse time (format: "9:00am", "10:30pm", "2:00pm")
    const timeLower = timeStr.toLowerCase().trim();
    const timeMatch = timeLower.match(/(\d+)(?::(\d+))?\s*(am|pm)/);
    
    if (!timeMatch) return null;
    
    let hours = parseInt(timeMatch[1]);
    const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
    const ampm = timeMatch[3];
    
    // Convert to 24-hour format
    if (ampm === 'pm' && hours !== 12) {
      hours += 12;
    } else if (ampm === 'am' && hours === 12) {
      hours = 0;
    }
    
    return { year, month, day, hours, minutes };
    
  } catch (error) {
    return null;
  }
}

function convertToSATime(event) {
  // Add 2 hours to raw time (SAST = UTC+2)
  let saHour = event.rawHour + 2;
  let saDay = event.rawDay;
  let saMonth = event.rawMonth;
  let saYear = event.rawYear;
  
  // Handle day rollover
  if (saHour >= 24) {
    saHour -= 24;
    saDay += 1;
    
    // Get days in month
    const daysInMonth = new Date(saYear, saMonth + 1, 0).getDate();
    if (saDay > daysInMonth) {
      saDay = 1;
      saMonth += 1;
      if (saMonth > 11) {
        saMonth = 0;
        saYear += 1;
      }
    }
  }
  
  const formattedTime = `${String(saHour).padStart(2, '0')}:${String(event.rawMinute).padStart(2, '0')}`;
  const saDate = new Date(saYear, saMonth, saDay, saHour, event.rawMinute);
  
  return {
    id: event.id,
    country: event.countryName,
    currency: event.currency,
    event: event.title,
    time: formattedTime,
    impact: event.impact,
    previous: event.previous,
    forecast: event.forecast,
    actual: null,
    timestamp: saDate.getTime(),
    dateISO: `${saYear}-${String(saMonth + 1).padStart(2, '0')}-${String(saDay).padStart(2, '0')}`
  };
}

function extractField(xml, fieldName) {
  const regex = new RegExp(`<${fieldName}>(?:<!\\[CDATA\\[)?(.*?)(?:\\]\\]>)?</${fieldName}>`, 'i');
  const match = xml.match(regex);
  return match ? match[1].trim() : null;
}

function determineImpact(title, countryCode) {
  // Fallback keyword detection (used only if XML doesn't have impact)
  const highImpactKeywords = [
    'interest rate', 'non-farm', 'nfp', 'employment', 'unemployment',
    'cpi', 'inflation', 'gdp', 'fed', 'ecb', 'boe', 'boj', 'fomc',
    'rate decision', 'payrolls', 'jobs report', 'central bank',
    'housing market index', 'existing home sales'
  ];
  
  const titleLower = title.toLowerCase();
  
  if (highImpactKeywords.some(keyword => titleLower.includes(keyword))) {
    return 'high';
  }
  
  const majorCurrencies = ['USD', 'EUR', 'GBP', 'JPY'];
  if (majorCurrencies.includes(countryCode)) {
    return 'medium';
  }
  
  return 'low';
}

function getCountryName(currencyCode) {
  const map = {
    'USD': 'United States',
    'EUR': 'Euro Zone',
    'GBP': 'United Kingdom',
    'JPY': 'Japan',
    'CAD': 'Canada',
    'AUD': 'Australia',
    'NZD': 'New Zealand',
    'CHF': 'Switzerland',
    'CNY': 'China'
  };
  return map[currencyCode] || currencyCode;
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}