// components/tools/MobileEconomicCalendar.tsx
'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, MapPin, TrendingDown, Minus, AlertTriangle } from 'lucide-react';

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
}

export default function MobileEconomicCalendar() {
  const [events, setEvents] = useState<EconomicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [impactFilter, setImpactFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [deviceTimezone, setDeviceTimezone] = useState<string>('');

  useEffect(() => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setDeviceTimezone(timezone);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const timezone = deviceTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
      const response = await fetch(`/api/economic-calendar?premium=true&days=14&timezone=${encodeURIComponent(timezone)}`);
      
      if (!response.ok) throw new Error('Failed to fetch');
      
      const data = await response.json();
      
      if (data.success && data.events) {
        setEvents(data.events);
      } else {
        setEvents([]);
      }
    } catch (error) {
      console.error('Error fetching economic calendar:', error);
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

  const filteredEvents = events.filter(event => {
    const eventDate = new Date(event.timestamp);
    const isSameDate = eventDate.toDateString() === selectedDate.toDateString();
    const matchesImpact = impactFilter === 'all' || event.impact === impactFilter;
    return isSameDate && matchesImpact;
  });

  const sortedEvents = [...filteredEvents].sort((a, b) => a.timestamp - b.timestamp);

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
      case 'high': return <AlertTriangle size={12} />;
      case 'medium': return <Minus size={12} />;
      case 'low': return <TrendingDown size={12} />;
      default: return null;
    }
  };

  const getEventsCountForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.timestamp);
      return eventDate.toDateString() === date.toDateString();
    }).length;
  };

  const navigateDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + days);
    setSelectedDate(newDate);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-white text-sm">Loading economic data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigateDate(-1)} className="p-2 hover:bg-white/5 rounded-lg">
            <ChevronLeft className="text-zinc-400" size={18} />
          </button>
          <div className="text-center">
            <div className="text-white font-bold text-base">
              {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
            <div className="text-zinc-500 text-xs">{sortedEvents.length} events</div>
          </div>
          <button onClick={() => navigateDate(1)} className="p-2 hover:bg-white/5 rounded-lg">
            <ChevronRight className="text-zinc-400" size={18} />
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {Array.from({ length: 5 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() + (i - 2));
            const isSelected = date.toDateString() === selectedDate.toDateString();
            const eventsCount = getEventsCountForDate(date);
            
            return (
              <button
                key={i}
                onClick={() => setSelectedDate(date)}
                className={`flex-1 py-2 rounded-lg text-center transition-all ${
                  isSelected
                    ? 'bg-blue-500 text-white'
                    : eventsCount > 0
                    ? 'bg-blue-500/20 text-white'
                    : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                <div className="text-[10px]">{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                <div className="font-bold text-sm">{date.getDate()}</div>
              </button>
            );
          })}
        </div>

        <div className="flex gap-2 mt-3">
          {[
            { id: 'all', label: 'All' },
            { id: 'high', label: 'High' },
            { id: 'medium', label: 'Medium' },
            { id: 'low', label: 'Low' }
          ].map(filter => (
            <button
              key={filter.id}
              onClick={() => setImpactFilter(filter.id as any)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                impactFilter === filter.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {sortedEvents.length > 0 ? (
          sortedEvents.map((event) => (
            <div key={event.id} className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock size={12} className="text-zinc-500" />
                  <span className="text-white text-sm font-mono">{event.time}</span>
                </div>
                <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${getImpactColor(event.impact)}`}>
                  {getImpactIcon(event.impact)}
                  {event.impact.toUpperCase()}
                </div>
              </div>
              
              <div className="mb-2">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin size={12} className="text-zinc-500" />
                  <span className="text-white text-sm font-medium">{event.currency}</span>
                  <span className="text-zinc-500 text-xs">{event.country}</span>
                </div>
                <div className="text-white text-sm font-semibold">{event.event}</div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800 text-center">
                <div>
                  <div className="text-zinc-500 text-[10px]">Previous</div>
                  <div className="text-white text-xs font-medium">{event.previous || '--'}</div>
                </div>
                <div>
                  <div className="text-zinc-500 text-[10px]">Forecast</div>
                  <div className="text-yellow-400 text-xs font-medium">{event.forecast || '--'}</div>
                </div>
                <div>
                  <div className="text-zinc-500 text-[10px]">Actual</div>
                  <div className={`text-xs font-medium ${event.actual ? 'text-green-400' : 'text-zinc-500'}`}>
                    {event.actual || 'Pending'}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-zinc-500 text-sm">
            No events scheduled for this date
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2">
        <div className="bg-zinc-800/50 rounded-xl p-3 text-center">
          <div className="text-zinc-500 text-[10px]">Total Events</div>
          <div className="text-white font-bold text-lg">{events.length}</div>
        </div>
        <div className="bg-red-500/10 rounded-xl p-3 text-center border border-red-500/20">
          <div className="text-red-400 text-[10px]">High Impact</div>
          <div className="text-white font-bold text-lg">{events.filter(e => e.impact === 'high').length}</div>
        </div>
        <div className="bg-yellow-500/10 rounded-xl p-3 text-center border border-yellow-500/20">
          <div className="text-yellow-400 text-[10px]">Medium Impact</div>
          <div className="text-white font-bold text-lg">{events.filter(e => e.impact === 'medium').length}</div>
        </div>
        <div className="bg-green-500/10 rounded-xl p-3 text-center border border-green-500/20">
          <div className="text-green-400 text-[10px]">Upcoming</div>
          <div className="text-white font-bold text-lg">{events.filter(e => new Date(e.timestamp) > new Date()).length}</div>
        </div>
      </div>
    </div>
  );
}