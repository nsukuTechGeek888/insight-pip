'use client';

import { useState, useEffect } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  Clock,
  MapPin,
  TrendingDown,
  Minus,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';

interface EconomicEvent {
  id: string;
  country: string;
  currency: string;
  event: string;
  time: string;
  impact: 'high' | 'medium' | 'low';
  previous: string;
  forecast: string;
  actual: string | null;
  timestamp: number;
  dateISO?: string;
  date?: string;
  title?: string;
  importance?: number;
}

const PremiumEconomicCalendar = () => {
  const [events, setEvents] = useState<EconomicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [impactFilter, setImpactFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [deviceTimezone, setDeviceTimezone] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<string>('');

  // Get device timezone and current time
  useEffect(() => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setDeviceTimezone(timezone);
    
    const updateCurrentTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }));
    };
    
    updateCurrentTime();
    const interval = setInterval(updateCurrentTime, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const timezone = deviceTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
      const response = await fetch(`/api/economic-calendar?premium=true&days=14&timezone=${encodeURIComponent(timezone)}`);
      
      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.events && Array.isArray(data.events) && data.events.length > 0) {
        setEvents(data.events);
        console.log(`Loaded ${data.events.length} events from API for timezone: ${timezone}`);
      } else {
        setError('No economic events available at this time');
        setEvents([]);
      }
    } catch (error) {
      console.error('Error fetching economic calendar:', error);
      setError('Failed to load economic calendar data. Please try again later.');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (deviceTimezone) {
      fetchData();
    }
  }, [deviceTimezone]);

  // Filter events by selected date AND impact
  const filteredEvents = events.filter(event => {
    const eventDate = new Date(event.timestamp);
    const isSameDate = eventDate.toDateString() === selectedDate.toDateString();
    const matchesImpact = impactFilter === 'all' || event.impact === impactFilter;
    return isSameDate && matchesImpact;
  });

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    return a.timestamp - b.timestamp;
  });

  const getImpactColor = (impact: string) => {
    switch(impact) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch(impact) {
      case 'high': return <AlertTriangle size={14} />;
      case 'medium': return <Minus size={14} />;
      case 'low': return <TrendingDown size={14} />;
      default: return null;
    }
  };

  const navigateDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const getEventsCountForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.timestamp);
      return eventDate.toDateString() === date.toDateString();
    }).length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-white">Loading economic data for {deviceTimezone}...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
        <AlertTriangle className="text-red-400 mx-auto mb-3" size={48} />
        <h3 className="text-red-400 font-semibold text-lg mb-2">Unable to Load Data</h3>
        <p className="text-zinc-400 mb-4">{error}</p>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white transition-colors inline-flex items-center gap-2"
        >
          <RefreshCw size={16} />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Timezone Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-xl">
            <Calendar className="text-blue-400" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Economic Calendar</h2>
            <div className="flex items-center gap-2 text-zinc-400 text-sm">
              <span>Timezone: {deviceTimezone}</span>
              <span>•</span>
              <span>Local time: {currentTime}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white transition-colors flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <div className="text-sm text-zinc-400">
            {events.length} total events
          </div>
        </div>
      </div>

      {/* Date Navigation */}
      <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateDate(-1)}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <ChevronLeft className="text-zinc-400" size={20} />
            </button>
            <div className="text-center">
              <div className="text-white font-bold text-lg">
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric',
                  timeZone: deviceTimezone 
                })}
              </div>
              <div className="text-zinc-400 text-sm">
                {sortedEvents.length} events on this day
              </div>
            </div>
            <button
              onClick={() => navigateDate(1)}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <ChevronRight className="text-zinc-400" size={20} />
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <select
              value={impactFilter}
              onChange={(e) => setImpactFilter(e.target.value as any)}
              className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Impact</option>
              <option value="high">High Impact</option>
              <option value="medium">Medium Impact</option>
              <option value="low">Low Impact</option>
            </select>
            
            <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm text-white transition-colors flex items-center gap-2">
              <Filter size={16} />
              Filters
            </button>
          </div>
        </div>

        {/* Dynamic Date Selector */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() + (i - 3));
            const isToday = date.toDateString() === new Date().toDateString();
            const isSelected = date.toDateString() === selectedDate.toDateString();
            const eventsCount = getEventsCountForDate(date);
            
            return (
              <button
                key={i}
                onClick={() => setSelectedDate(date)}
                className={`flex-1 min-w-[70px] py-3 rounded-lg text-center transition-all ${
                  isSelected
                    ? 'bg-blue-500 text-white'
                    : eventsCount > 0
                    ? 'bg-blue-500/20 text-white hover:bg-blue-500/30'
                    : isToday
                    ? 'bg-white/5 text-white'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                }`}
              >
                <div className="text-xs opacity-75">
                  {date.toLocaleDateString('en-US', { weekday: 'short', timeZone: deviceTimezone })}
                </div>
                <div className="font-bold">
                  {date.getDate()}
                </div>
                {eventsCount > 0 && (
                  <div className={`text-xs mt-1 ${isSelected ? 'text-blue-200' : 'text-blue-400'}`}>
                    {eventsCount} event{eventsCount !== 1 ? 's' : ''}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800/50">
              <tr>
                <th className="py-4 px-6 text-left text-zinc-400 font-semibold text-sm">Local Time</th>
                <th className="py-4 px-6 text-left text-zinc-400 font-semibold text-sm">Currency</th>
                <th className="py-4 px-6 text-left text-zinc-400 font-semibold text-sm">Event</th>
                <th className="py-4 px-6 text-left text-zinc-400 font-semibold text-sm">Impact</th>
                <th className="py-4 px-6 text-left text-zinc-400 font-semibold text-sm">Previous</th>
                <th className="py-4 px-6 text-left text-zinc-400 font-semibold text-sm">Forecast</th>
                <th className="py-4 px-6 text-left text-zinc-400 font-semibold text-sm">Actual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {sortedEvents.length > 0 ? (
                sortedEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-zinc-500" />
                        <span className="font-mono text-white">{event.time}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-zinc-500" />
                        <span className="text-white font-medium">{event.currency}</span>
                        <span className="text-zinc-500 text-sm">{event.country}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-white font-medium">{event.event}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getImpactColor(event.impact)}`}>
                        {getImpactIcon(event.impact)}
                        {event.impact.toUpperCase()}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-zinc-300">{event.previous || '--'}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-yellow-400 font-medium">{event.forecast || '--'}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className={`font-medium ${
                        event.actual === null
                          ? 'text-zinc-500'
                          : event.actual === event.forecast
                          ? 'text-green-400'
                          : 'text-orange-400'
                      }`}>
                        {event.actual || 'Pending'}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="text-zinc-500 mb-2">No events scheduled for this date</div>
                    <div className="text-zinc-600 text-sm">Try selecting another date from the calendar above</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats Footer */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
          <div className="text-zinc-400 text-sm mb-1">Total Events</div>
          <div className="text-white text-2xl font-bold">{events.length}</div>
        </div>
        <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/20">
          <div className="text-red-400 text-sm mb-1">High Impact</div>
          <div className="text-white text-2xl font-bold">
            {events.filter(e => e.impact === 'high').length}
          </div>
        </div>
        <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/20">
          <div className="text-yellow-400 text-sm mb-1">Medium Impact</div>
          <div className="text-white text-2xl font-bold">
            {events.filter(e => e.impact === 'medium').length}
          </div>
        </div>
        <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/20">
          <div className="text-green-400 text-sm mb-1">Upcoming Events</div>
          <div className="text-white text-2xl font-bold">
            {events.filter(e => new Date(e.timestamp) > new Date()).length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumEconomicCalendar;