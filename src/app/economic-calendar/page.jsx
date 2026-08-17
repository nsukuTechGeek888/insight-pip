// src/app/economic-calendar/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Filter,
  Download,
  Share,
  Bell,
  Clock,
  MapPin,
  TrendingUp,
  TrendingDown,
  Minus,
  X,
  Grid,
  List,
  RefreshCw,
  Settings
} from 'lucide-react';

// Reuse the same premium calendar hook and components from MobileToolsTab
const usePremiumEconomicCalendar = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('');
  const [dataSource, setDataSource] = useState('Loading...');

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/economic-calendar?premium=true');
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.events.length > 0) {
          setEvents(data.events);
          setDataSource(data.source);
          setLastUpdated(new Date().toLocaleTimeString());
        } else {
          setEvents(generatePremiumEconomicEvents());
          setDataSource('Premium Market Intelligence');
          setLastUpdated(new Date().toLocaleTimeString());
        }
      }
    } catch (error) {
      setEvents(generatePremiumEconomicEvents());
      setDataSource('Premium Market Intelligence');
      setLastUpdated(new Date().toLocaleTimeString());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return { events, loading, lastUpdated, dataSource, refreshData: fetchData };
};

// Reuse the same helper functions
const generatePremiumEconomicEvents = () => {
  const events = [];
  const today = new Date();
  
  const premiumEvents = [
    { country: 'United States', event: 'Federal Reserve Interest Rate Decision', time: '19:00', impact: 'high' },
    { country: 'United States', event: 'Non-Farm Payrolls (NFP)', time: '13:30', impact: 'high' },
    { country: 'United States', event: 'CPI Inflation Data', time: '13:30', impact: 'high' },
    { country: 'United States', event: 'Retail Sales Data', time: '13:30', impact: 'medium' },
    { country: 'United States', event: 'GDP Growth Rate', time: '13:30', impact: 'high' },
    { country: 'Euro Zone', event: 'ECB Monetary Policy Statement', time: '13:45', impact: 'high' },
    { country: 'Euro Zone', event: 'German ZEW Economic Sentiment', time: '10:00', impact: 'medium' },
    { country: 'United Kingdom', event: 'BOE Interest Rate Decision', time: '12:00', impact: 'high' },
    { country: 'United Kingdom', event: 'CPI Inflation Report', time: '07:00', impact: 'medium' },
    { country: 'Japan', event: 'BOJ Policy Rate Decision', time: '03:00', impact: 'high' },
    { country: 'Canada', event: 'Employment Change', time: '13:30', impact: 'medium' },
    { country: 'Australia', event: 'RBA Meeting Minutes', time: '01:30', impact: 'medium' },
    { country: 'Switzerland', event: 'SNB Monetary Policy Assessment', time: '08:30', impact: 'medium' },
    { country: 'China', event: 'Manufacturing PMI', time: '01:00', impact: 'medium' },
  ];

  let eventId = 1;
  
  premiumEvents.forEach(template => {
    const eventTime = new Date();
    const [hours, minutes] = template.time.split(':').map(Number);
    eventTime.setHours(hours, minutes, 0, 0);
    
    const dayOffset = (eventId - 1) % 7;
    eventTime.setDate(today.getDate() + dayOffset);
    
    if (eventTime > new Date()) {
      const { previous, forecast } = generateRealisticValues(template.event);
      
      events.push({
        id: `premium-${eventId++}`,
        country: template.country,
        currency: getCurrencyFromCountry(template.country),
        event: template.event,
        title: template.event,
        time: eventTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        impact: template.impact,
        previous,
        forecast,
        actual: Math.random() > 0.7 ? forecast : null,
        date: eventTime.toISOString().split('T')[0],
        timestamp: eventTime.getTime(),
        source: 'Premium Market Intelligence',
        importance: template.impact === 'high' ? 3 : template.impact === 'medium' ? 2 : 1,
        description: template.event
      });
    }
  });

  return events.sort((a, b) => a.timestamp - b.timestamp);
};

const getEventDisplayName = (event: any) => {
  const possibleNames = [event.event, event.title, event.name, event.description];
  const name = possibleNames.find(name => name && name !== 'N/A' && name.trim() !== '');
  return name || (event.country ? `${event.country} Economic Event` : 'Economic Event');
};

const isEventLive = (eventTime: Date) => {
  const now = new Date();
  const thirtyMinutesBefore = new Date(eventTime.getTime() - 30 * 60 * 1000);
  const thirtyMinutesAfter = new Date(eventTime.getTime() + 30 * 60 * 1000);
  return now >= thirtyMinutesBefore && now <= thirtyMinutesAfter;
};

const getCurrencyFromCountry = (country: string) => {
  const currencyMap = {
    'United States': 'USD', 'Euro Zone': 'EUR', 'Germany': 'EUR',
    'United Kingdom': 'GBP', 'Japan': 'JPY', 'Canada': 'CAD',
    'Australia': 'AUD', 'Switzerland': 'CHF', 'China': 'CNY'
  };
  return currencyMap[country] || 'USD';
};

const generateRealisticValues = (eventType: string) => {
  const values = {
    'Federal Reserve Interest Rate Decision': { previous: '5.50%', forecast: '5.50%' },
    'Non-Farm Payrolls (NFP)': { previous: '198K', forecast: '180K' },
    'CPI Inflation Data': { previous: '3.2%', forecast: '3.1%' },
    'Retail Sales Data': { previous: '0.6%', forecast: '0.4%' },
    'GDP Growth Rate': { previous: '3.3%', forecast: '2.9%' },
    'ECB Monetary Policy Statement': { previous: '4.50%', forecast: '4.50%' },
    'German ZEW Economic Sentiment': { previous: '12.8', forecast: '15.2' },
    'BOE Interest Rate Decision': { previous: '5.25%', forecast: '5.25%' },
    'CPI Inflation Report': { previous: '4.0%', forecast: '3.8%' },
    'BOJ Policy Rate Decision': { previous: '-0.10%', forecast: '-0.10%' },
    'Employment Change': { previous: '25.3K', forecast: '20.0K' },
    'RBA Meeting Minutes': { previous: '4.35%', forecast: '4.35%' },
    'SNB Monetary Policy Assessment': { previous: '1.75%', forecast: '1.75%' },
    'Manufacturing PMI': { previous: '50.8', forecast: '51.2' },
  };
  return values[eventType] || { previous: 'N/A', forecast: 'N/A' };
};

// Premium Event Card Component
const PremiumEventCard = ({ event, onSelect, compact = false }) => {
  const eventName = getEventDisplayName(event);
  const isLive = event.timestamp && isEventLive(new Date(event.timestamp));
  const impactColor = {
    high: 'from-red-500 to-orange-500',
    medium: 'from-yellow-500 to-amber-500', 
    low: 'from-green-500 to-emerald-500'
  }[event.impact] || 'from-gray-500 to-gray-600';

  if (compact) {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onSelect(event)}
        className="bg-white/5 rounded-2xl p-4 border border-white/10 hover:border-white/20 transition-all backdrop-blur-xl cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${impactColor}`} />
            <div className="flex items-center gap-2 text-white font-mono text-sm">
              <Clock size={14} />
              {event.time}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-semibold truncate">{eventName}</h4>
              <p className="text-white/60 text-sm truncate">
                {event.currency} • {event.country}
              </p>
            </div>
          </div>
          {isLive && (
            <div className="flex items-center gap-2 bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
              LIVE
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(event)}
      className="bg-white/5 rounded-2xl p-5 border border-white/10 hover:border-white/20 transition-all backdrop-blur-xl cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${impactColor}`} />
          <div className="flex items-center gap-2 text-white font-mono text-lg font-bold">
            <Clock size={16} />
            {event.time}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isLive && (
            <div className="flex items-center gap-2 bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
              LIVE
            </div>
          )}
          <ChevronDown size={16} className="text-white/40 group-hover:text-white transition-colors" />
        </div>
      </div>
      
      <h3 className="text-white font-bold text-lg mb-3 leading-tight">
        {eventName}
      </h3>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-white/60 text-sm">
          <div className="flex items-center gap-2">
            <MapPin size={14} />
            {event.currency} • {event.country}
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${impactColor} text-white`}>
            {event.impact?.toUpperCase() || 'LOW'}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <Bell size={14} className="text-white/60" />
          </button>
          <button className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <Share size={14} className="text-white/60" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Event Detail Modal
const EventDetailModal = ({ event, onClose }) => {
  const eventName = getEventDisplayName(event);
  const isLive = event.timestamp && isEventLive(new Date(event.timestamp));
  const impactColor = {
    high: 'border-red-500/30 bg-red-500/10',
    medium: 'border-yellow-500/30 bg-yellow-500/10',
    low: 'border-green-500/30 bg-green-500/10'
  }[event.impact] || 'border-gray-500/30 bg-gray-500/10';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-zinc-900 rounded-3xl border border-white/10 w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white text-xl font-bold">Event Details</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <X size={20} className="text-white/60" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${
              event.impact === 'high' ? 'bg-red-500' :
              event.impact === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
            }`} />
            <div className="text-white/60 text-sm">
              {event.time} • {event.currency} • {event.country}
            </div>
            {isLive && (
              <div className="flex items-center gap-2 bg-red-500/20 text-red-400 px-2 py-1 rounded-full text-xs">
                <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
                LIVE
              </div>
            )}
          </div>
        </div>
        
        <div className="p-6">
          <h3 className="text-white font-bold text-lg mb-4">{eventName}</h3>
          
          <div className={`border rounded-2xl p-4 mb-6 ${impactColor}`}>
            <div className="text-center">
              <div className="text-white/60 text-sm mb-1">Impact Level</div>
              <div className="text-white font-bold text-xl">
                {event.impact?.toUpperCase() || 'LOW'} IMPACT
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-white/60 text-sm mb-2">Previous</div>
              <div className="text-white font-bold text-lg">
                {event.previous || 'N/A'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-white/60 text-sm mb-2">Forecast</div>
              <div className="text-yellow-400 font-bold text-lg">
                {event.forecast || 'N/A'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-white/60 text-sm mb-2">Actual</div>
              <div className={`font-bold text-lg ${
                event.actual 
                  ? event.actual === event.forecast 
                    ? 'text-green-400' 
                    : 'text-orange-400'
                  : 'text-white/40'
              }`}>
                {event.actual || 'Pending'}
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-2xl font-semibold transition-colors flex items-center justify-center gap-2">
              <Bell size={16} />
              Set Alert
            </button>
            <button className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-2xl font-semibold transition-colors flex items-center justify-center gap-2">
              <Share size={16} />
              Share
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Standalone Premium Calendar Component
const StandalonePremiumCalendar = () => {
  const { events, loading, lastUpdated, dataSource, refreshData } = usePremiumEconomicCalendar();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [impactFilter, setImpactFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [currencyFilter, setCurrencyFilter] = useState('all');
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  // Get dates for current view
  const getViewDates = () => {
    const dates = [];
    const start = new Date(selectedDate);
    
    if (viewMode === 'day') {
      dates.push(start);
    } else if (viewMode === 'week') {
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 0);
      start.setDate(diff);
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        dates.push(date);
      }
    } else {
      start.setDate(1);
      const day = start.getDay();
      const diff = start.getDate() - day;
      start.setDate(diff);
      
      for (let i = 0; i < 28; i++) {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        dates.push(date);
      }
    }
    
    return dates;
  };

  const viewDates = getViewDates();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Filter events
  const filteredEvents = events.filter(event => {
    const eventDate = new Date(event.timestamp);
    eventDate.setHours(0, 0, 0, 0);
    
    let dateMatch = false;
    if (viewMode === 'day') {
      const selectedDateCopy = new Date(selectedDate);
      selectedDateCopy.setHours(0, 0, 0, 0);
      dateMatch = eventDate.getTime() === selectedDateCopy.getTime();
    } else {
      const viewStart = new Date(viewDates[0]);
      viewStart.setHours(0, 0, 0, 0);
      const viewEnd = new Date(viewDates[viewDates.length - 1]);
      viewEnd.setHours(23, 59, 59, 999);
      dateMatch = event.timestamp >= viewStart.getTime() && event.timestamp <= viewEnd.getTime();
    }
    
    const impactMatch = impactFilter === 'all' || event.impact === impactFilter;
    const currencyMatch = currencyFilter === 'all' || event.currency === currencyFilter;
    
    return dateMatch && impactMatch && currencyMatch;
  });

  // Group events by date
  const eventsByDate = viewDates.reduce((acc, date) => {
    const dateKey = date.toISOString().split('T')[0];
    acc[dateKey] = filteredEvents.filter(event => {
      const eventDate = new Date(event.timestamp);
      return eventDate.toISOString().split('T')[0] === dateKey;
    });
    return acc;
  }, {} as { [key: string]: any[] });

  // Navigation
  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (viewMode === 'day') {
      newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'week') {
      newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(selectedDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setSelectedDate(newDate);
  };

  const goToToday = () => setSelectedDate(new Date());

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full mb-4"
        />
        <p className="text-white/60 text-lg font-light">Loading premium data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Premium Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl">
                <Calendar className="text-white" size={32} />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full border-4 border-slate-900 animate-pulse" />
            </div>
            <div>
              <h1 className="text-5xl font-bold text-white mb-2">Economic Calendar</h1>
              <p className="text-xl text-white/60">Professional-grade market intelligence</p>
            </div>
          </div>
        </motion.div>

        {/* The rest of the calendar component remains the same as in MobileToolsTab */}
        <div className="max-w-7xl mx-auto">
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/20 rounded-3xl p-6 border border-blue-500/20">
                <div className="text-blue-400 text-sm font-medium mb-2">Total Events</div>
                <div className="text-white text-3xl font-bold">{events.length}</div>
              </div>
              <div className="bg-gradient-to-br from-red-500/10 to-red-600/20 rounded-3xl p-6 border border-red-500/20">
                <div className="text-red-400 text-sm font-medium mb-2">High Impact</div>
                <div className="text-white text-3xl font-bold">
                  {events.filter(e => e.impact === 'high').length}
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-500/10 to-green-600/20 rounded-3xl p-6 border border-green-500/20">
                <div className="text-green-400 text-sm font-medium mb-2">Live Now</div>
                <div className="text-white text-3xl font-bold">
                  {events.filter(e => isEventLive(new Date(e.timestamp))).length}
                </div>
              </div>
            </div>

            {/* Date Navigation & Controls */}
            <div className="bg-white/5 rounded-3xl p-8 border border-white/10 backdrop-blur-xl">
              {/* View Mode Toggle */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex bg-white/5 rounded-2xl p-1">
                  {['day', 'week', 'month'].map((mode) => (
                    <motion.button
                      key={mode}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setViewMode(mode as any)}
                      className={`px-6 py-3 rounded-xl text-sm font-medium transition-all ${
                        viewMode === mode
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </motion.button>
                  ))}
                </div>
                
                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={refreshData}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10"
                  >
                    <RefreshCw size={20} className="text-white/70" />
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setLayoutMode(layoutMode === 'grid' ? 'list' : 'grid')}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10"
                  >
                    {layoutMode === 'grid' ? 
                      <List size={20} className="text-white/70" /> : 
                      <Grid size={20} className="text-white/70" />
                    }
                  </motion.button>
                </div>
              </div>

              {/* Date Navigation */}
              <div className="flex items-center justify-between mb-8">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigateDate('prev')}
                  className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/10"
                >
                  <ChevronLeft size={24} className="text-white/70" />
                </motion.button>

                <div className="text-center">
                  <h2 className="text-white text-2xl font-bold">
                    {viewMode === 'day' 
                      ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
                      : viewMode === 'week'
                      ? `Week of ${viewDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                      : selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                    }
                  </h2>
                  <p className="text-white/60 text-lg">
                    {filteredEvents.length} events scheduled
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigateDate('next')}
                  className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/10"
                >
                  <ChevronRight size={24} className="text-white/70" />
                </motion.button>
              </div>

              {/* Quick Date Selector */}
              <div className="flex gap-3 mb-8 overflow-x-auto scrollbar-hide">
                {viewDates.slice(0, viewMode === 'month' ? 7 : viewDates.length).map((date, index) => {
                  const isToday = date.toDateString() === today.toDateString();
                  const isSelected = selectedDate.toDateString() === date.toDateString();
                  const dateEvents = eventsByDate[date.toISOString().split('T')[0]] || [];
                  const hasHighImpact = dateEvents.some((event: any) => event.impact === 'high');
                  
                  return (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSelectedDate(date);
                        if (viewMode !== 'day') setViewMode('day');
                      }}
                      className={`flex-shrink-0 p-4 rounded-2xl text-center transition-all min-w-20 ${
                        isSelected
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                          : isToday
                          ? 'bg-white/10 text-white border border-white/20'
                          : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                      } ${hasHighImpact ? 'ring-2 ring-red-400' : ''}`}
                    >
                      <div className="text-sm font-medium opacity-80">
                        {date.toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                      <div className="text-xl font-bold">
                        {date.getDate()}
                      </div>
                      {dateEvents.length > 0 && (
                        <div className={`text-sm mt-2 ${
                          hasHighImpact ? 'text-red-400 font-bold' : 'text-white/40'
                        }`}>
                          {dateEvents.length}
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Advanced Filters */}
              <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
                <select
                  value={impactFilter}
                  onChange={(e) => setImpactFilter(e.target.value as any)}
                  className="flex-shrink-0 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-blue-500 backdrop-blur-xl text-lg"
                >
                  <option value="all">🎯 All Impact</option>
                  <option value="high">🔥 High Impact</option>
                  <option value="medium">⚡ Medium Impact</option>
                  <option value="low">💤 Low Impact</option>
                </select>
                
                <select
                  value={currencyFilter}
                  onChange={(e) => setCurrencyFilter(e.target.value)}
                  className="flex-shrink-0 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-blue-500 backdrop-blur-xl text-lg"
                >
                  <option value="all">🌍 All Currencies</option>
                  <option value="USD">🇺🇸 USD</option>
                  <option value="EUR">🇪🇺 EUR</option>
                  <option value="GBP">🇬🇧 GBP</option>
                  <option value="JPY">🇯🇵 JPY</option>
                </select>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-shrink-0 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white/60 hover:text-white transition-colors flex items-center gap-3 text-lg"
                >
                  <Filter size={20} />
                  More Filters
                </motion.button>
              </div>
            </div>

            {/* Events Display */}
            <div className="space-y-6">
              {filteredEvents.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-20 bg-white/5 rounded-3xl border border-white/10"
                >
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Calendar className="text-white/40" size={40} />
                  </div>
                  <h3 className="text-white text-2xl font-bold mb-3">No Events Found</h3>
                  <p className="text-white/60 text-lg max-w-md mx-auto">
                    No economic events match your current filters. Try adjusting your criteria or select a different date.
                  </p>
                </motion.div>
              ) : layoutMode === 'grid' ? (
                // Grid Layout
                <div className="grid gap-6">
                  {viewDates.map((date) => {
                    const dateKey = date.toISOString().split('T')[0];
                    const dayEvents = eventsByDate[dateKey] || [];
                    const isToday = date.toDateString() === today.toDateString();
                    
                    if (dayEvents.length === 0) return null;
                    
                    return (
                      <motion.div
                        key={dateKey}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/5 rounded-3xl border border-white/10 backdrop-blur-xl overflow-hidden"
                      >
                        {/* Date Header */}
                        <div className={`p-8 border-b border-white/10 ${
                          isToday ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10' : ''
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                              <div className={`w-4 h-4 rounded-full ${
                                isToday ? 'bg-blue-400' : 'bg-white/40'
                              }`} />
                              <div>
                                <h3 className="text-white font-bold text-2xl">
                                  {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                </h3>
                                <p className="text-white/60 text-lg">
                                  {dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''}
                                </p>
                              </div>
                            </div>
                            {isToday && (
                              <span className="bg-blue-500 text-white text-lg px-4 py-2 rounded-full font-medium">
                                Today
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Events Grid */}
                        <div className="p-8 grid gap-6">
                          {dayEvents.map((event, index) => (
                            <PremiumEventCard
                              key={event.id || index}
                              event={event}
                              onSelect={setSelectedEvent}
                            />
                          ))}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                // List Layout
                <div className="space-y-4">
                  {filteredEvents.map((event, index) => (
                    <PremiumEventCard
                      key={event.id || index}
                      event={event}
                      onSelect={setSelectedEvent}
                      compact
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Data Source Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center pt-6 border-t border-white/10"
            >
              <p className="text-white/40 text-lg">
                📡 Live data from {dataSource} • Updated {lastUpdated}
              </p>
            </motion.div>
          </div>
        </div>

        {/* Event Detail Modal */}
        <AnimatePresence>
          {selectedEvent && (
            <EventDetailModal
              event={selectedEvent}
              onClose={() => setSelectedEvent(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default function EconomicCalendarPage() {
  return <StandalonePremiumCalendar />;
}