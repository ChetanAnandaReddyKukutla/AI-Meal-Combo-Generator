import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Calendar, ChevronDown, BarChart3, Eye, EyeOff, CalendarDays } from 'lucide-react';
import ComboCard from './ComboCard';
import RollingHistory from './RollingHistory';
import Button from './Button';
import menuData from '../assets/menu.json';

const ComboGenerator = () => {
  const [weeklyCombos, setWeeklyCombos] = useState(Array(7).fill([]).map(() => [])); // 7 days of combos
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [viewMode, setViewMode] = useState('rolling'); // 'rolling' or 'full-week'
  const [currentSession, setCurrentSession] = useState(1);
  const [comboHistory, setComboHistory] = useState([]);
  const [error, setError] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Separate menu items by category
  const menu = {
    main: menuData.filter(item => item.category === 'main'),
    side: menuData.filter(item => item.category === 'side'),
    drink: menuData.filter(item => item.category === 'drink')
  };

  // Get displayed combos based on current view mode
  const getDisplayedCombos = () => {
    if (viewMode === 'full-week') {
      return weeklyCombos.map((dayCombos, index) => ({
        day: daysOfWeek[index],
        combos: dayCombos
      })).filter(day => day.combos.length > 0);
    } else {
      // Rolling 3-day view
      const selectedDayIndex = daysOfWeek.indexOf(selectedDay);
      const displayedDays = [
        (selectedDayIndex + 0) % 7,
        (selectedDayIndex + 1) % 7,
        (selectedDayIndex + 2) % 7,
      ];
      
      return displayedDays.map(dayIndex => ({
        day: daysOfWeek[dayIndex],
        combos: weeklyCombos[dayIndex]
      })).filter(day => day.combos.length > 0);
    }
  };

  // Statistics
  const stats = {
    totalCombos: comboHistory.length,
    avgCalories: comboHistory.length > 0 ? Math.round(comboHistory.reduce((sum, combo) => sum + combo.totalCalories, 0) / comboHistory.length) : 0,
    avgPopularity: comboHistory.length > 0 ? ((comboHistory.reduce((sum, combo) => sum + (combo.popularityRange.min + combo.popularityRange.max) / 2, 0) / comboHistory.length) * 100).toFixed(1) : 0,
    favoriteTaste: comboHistory.length > 0 ? 
      Object.entries(comboHistory.reduce((acc, combo) => {
        acc[combo.tasteProfile] = (acc[combo.tasteProfile] || 0) + 1;
        return acc;
      }, {})).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None' : 'None',
    weeklyDays: weeklyCombos.filter(day => day.length > 0).length
  };

  // Check if a combo exists in weekly combos or history
  const isComboUsed = (main, side, drink, excludeDayIndex = -1) => {
    // Check in weekly combos (excluding current day being generated)
    for (let dayIndex = 0; dayIndex < weeklyCombos.length; dayIndex++) {
      if (dayIndex === excludeDayIndex) continue;
      
      for (const combo of weeklyCombos[dayIndex]) {
        if (combo.main.item_name === main.item_name ||
            combo.side.item_name === side.item_name ||
            combo.drink.item_name === drink.item_name) {
          return true;
        }
      }
    }
    
    // Check in rolling history
    return comboHistory.some(combo => 
      combo.main.item_name === main.item_name ||
      combo.side.item_name === side.item_name ||
      combo.drink.item_name === drink.item_name
    );
  };

  // Check if items are used in 3-day rolling window
  const isItemUsedInRollingWindow = (itemName, dayIndex) => {
    const windowDays = [
      (dayIndex - 1 + 7) % 7,
      dayIndex,
      (dayIndex + 1) % 7
    ];
    
    for (const checkDay of windowDays) {
      for (const combo of weeklyCombos[checkDay]) {
        if (combo.main.item_name === itemName ||
            combo.side.item_name === itemName ||
            combo.drink.item_name === itemName) {
          return true;
        }
      }
    }
    return false;
  };

  // Calculate taste profile for a combo
  const calculateTasteProfile = (main, side, drink) => {
    const tastes = [main.taste_profile, side.taste_profile, drink.taste_profile];
    const uniqueTastes = [...new Set(tastes)];
    return uniqueTastes.length === 1 ? uniqueTastes[0] : 'mixed';
  };

  // Check if popularity scores are within ±0.15 range
  const isPopularityInRange = (main, side, drink) => {
    const scores = [main.popularity_score, side.popularity_score, drink.popularity_score];
    const min = Math.min(...scores);
    const max = Math.max(...scores);
    return (max - min) <= 0.15;
  };

  // Check if total calories are within 550-800 range
  const isCaloriesInRange = (main, side, drink) => {
    const total = main.calories + side.calories + drink.calories;
    return total >= 550 && total <= 800;
  };

  // Generate a single combo for a specific day
  const generateSingleCombo = (usedItems, dayIndex) => {
    for (let attempt = 0; attempt < 1000; attempt++) {
      // Get available items that aren't used in this generation or rolling window
      const availableMain = menu.main.filter(item => 
        !usedItems.has(item.item_name) && 
        !isItemUsedInRollingWindow(item.item_name, dayIndex)
      );
      const availableSide = menu.side.filter(item => 
        !usedItems.has(item.item_name) && 
        !isItemUsedInRollingWindow(item.item_name, dayIndex)
      );
      const availableDrink = menu.drink.filter(item => 
        !usedItems.has(item.item_name) && 
        !isItemUsedInRollingWindow(item.item_name, dayIndex)
      );

      if (availableMain.length === 0 || availableSide.length === 0 || availableDrink.length === 0) {
        return null;
      }

      // Select random items
      const main = availableMain[Math.floor(Math.random() * availableMain.length)];
      const side = availableSide[Math.floor(Math.random() * availableSide.length)];
      const drink = availableDrink[Math.floor(Math.random() * availableDrink.length)];

      // Check all constraints
      const totalCalories = main.calories + side.calories + drink.calories;
      const isValidCalories = isCaloriesInRange(main, side, drink);
      const isValidPopularity = isPopularityInRange(main, side, drink);
      const isNotUsed = !isComboUsed(main, side, drink, dayIndex);

      if (isValidCalories && isValidPopularity && isNotUsed) {
        // Mark items as used for this generation session
        usedItems.add(main.item_name);
        usedItems.add(side.item_name);
        usedItems.add(drink.item_name);

        const tasteProfile = calculateTasteProfile(main, side, drink);
        const scores = [main.popularity_score, side.popularity_score, drink.popularity_score];
        
        return {
          main,
          side,
          drink,
          totalCalories,
          tasteProfile,
          popularityRange: {
            min: Math.min(...scores),
            max: Math.max(...scores)
          },
          dayIndex,
          day: daysOfWeek[dayIndex]
        };
      }
    }

    return null; // Could not generate a valid combo
  };
    const tastes = [main.taste_profile, side.taste_profile, drink.taste_profile];
    const uniqueTastes = [...new Set(tastes)];
    return uniqueTastes.length === 1 ? uniqueTastes[0] : 'mixed';
  };

  // Check if popularity scores are within ±0.15 range
  const isPopularityInRange = (main, side, drink) => {
    const scores = [main.popularity_score, side.popularity_score, drink.popularity_score];
    const min = Math.min(...scores);
    const max = Math.max(...scores);
    return (max - min) <= 0.15;
  };

  // Check if total calories are within 550-800 range
  const isCaloriesInRange = (main, side, drink) => {
    const total = main.calories + side.calories + drink.calories;
    return total >= 550 && total <= 800;
  };

  // Generate combos for a specific day
  const generateCombosForDay = async (dayIndex) => {
    const usedItems = new Set();
    const dayCombos = [];

    // Generate 3 unique combos for this day
    for (let i = 0; i < 3; i++) {
      const combo = generateSingleCombo(usedItems, dayIndex);
      if (combo) {
        dayCombos.push(combo);
      } else {
        throw new Error(`Could not generate valid combo ${i + 1} for ${daysOfWeek[dayIndex]}. Please try again or clear history.`);
      }
    }

    return dayCombos;
  };

  // Generate combos based on view mode
  const generateCombos = async () => {
    setIsGenerating(true);
    setError('');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Enhanced processing time

      if (viewMode === 'full-week') {
        // Generate for entire week
        const newWeeklyCombos = [...weeklyCombos];
        
        for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
          try {
            const dayCombos = await generateCombosForDay(dayIndex);
            newWeeklyCombos[dayIndex] = dayCombos;
          } catch (err) {
            throw new Error(`Week generation failed on ${daysOfWeek[dayIndex]}: ${err.message}`);
          }
        }
        
        setWeeklyCombos(newWeeklyCombos);
        
        // Update history with all combos
        const allNewCombos = newWeeklyCombos.flat();
        const updatedHistory = [...comboHistory, ...allNewCombos];
        const recentHistory = updatedHistory.slice(-21); // Keep last 21 combos (full week)
        setComboHistory(recentHistory);
        
      } else {
        // Rolling 3-day view
        const selectedDayIndex = daysOfWeek.indexOf(selectedDay);
        const displayedDays = [
          (selectedDayIndex + 0) % 7,
          (selectedDayIndex + 1) % 7,
          (selectedDayIndex + 2) % 7,
        ];
        
        const newWeeklyCombos = [...weeklyCombos];
        const allNewCombos = [];
        
        for (const dayIndex of displayedDays) {
          try {
            const dayCombos = await generateCombosForDay(dayIndex);
            newWeeklyCombos[dayIndex] = dayCombos;
            allNewCombos.push(...dayCombos);
          } catch (err) {
            throw new Error(`3-day generation failed on ${daysOfWeek[dayIndex]}: ${err.message}`);
          }
        }
        
        setWeeklyCombos(newWeeklyCombos);
        
        // Update rolling history
        const updatedHistory = [...comboHistory, ...allNewCombos];
        const recentHistory = updatedHistory.slice(-15); // Keep last 15 combos for rolling view
        setComboHistory(recentHistory);
      }

      // Increment session counter
      setCurrentSession(prev => prev + 1);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Clear all data
  const clearHistory = () => {
    setComboHistory([]);
    setWeeklyCombos(Array(7).fill([]).map(() => []));
    setCurrentSession(1);
  };

  // Toggle view mode
  const toggleViewMode = () => {
    setViewMode(prev => prev === 'rolling' ? 'full-week' : 'rolling');
  };

  // Change day
  const changeDay = (day) => {
    setSelectedDay(day);
  };

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* Premium Control Panel */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-10 mb-10 shadow-2xl shadow-accent/10"
      >
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-center">
          
          {/* View Mode Toggle */}
          <div className="space-y-4">
            <label className="text-accent font-body font-medium flex items-center gap-3">
              <CalendarDays className="w-5 h-5 text-accent" />
              View Mode
            </label>
            <Button
              onClick={toggleViewMode}
              variant="secondary"
              className="w-full justify-center"
            >
              {viewMode === 'rolling' ? '3-Day Rolling' : 'Full Week'}
            </Button>
          </div>

          {/* Day Selector - Only show for rolling mode */}
          {viewMode === 'rolling' && (
            <div className="space-y-4">
              <label className="text-accent font-body font-medium flex items-center gap-3">
                <Calendar className="w-5 h-5 text-accent" />
                Starting Day
              </label>
              <div className="relative">
                <select
                  value={selectedDay}
                  onChange={(e) => changeDay(e.target.value)}
                  className="w-full glass-card rounded-xl px-5 py-4 text-text-light font-body
                           focus:border-accent focus:outline-none appearance-none cursor-pointer
                           hover:border-accent/60 transition-colors"
                >
                  {daysOfWeek.map(day => (
                    <option key={day} value={day} className="bg-card text-text">
                      {day}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-accent pointer-events-none" />
              </div>
            </div>
          )}

          {viewMode === 'full-week' && (
            <div className="space-y-4">
              <div className="text-accent-light font-body text-center">
                <CalendarDays className="w-8 h-8 mx-auto mb-2 text-accent" />
                <p className="text-sm tracking-wide">Generating for entire week</p>
              </div>
            </div>
          )}

          {/* Generate Button */}
          <div className="flex justify-center">
            <Button
              onClick={generateCombos}
              disabled={isGenerating}
              className="px-10 py-4 text-lg font-body font-medium"
            >
              {isGenerating ? (
                <div className="flex items-center gap-3">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Generating...
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <RefreshCw className="w-5 h-5" />
                  {viewMode === 'full-week' ? 'Generate Week' : 'Generate 3 Days'}
                </div>
              )}
            </Button>
          </div>

          {/* Stats & Controls */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <Button
              onClick={() => setShowStats(!showStats)}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <BarChart3 className="w-5 h-5" />
              {showStats ? 'Hide Stats' : 'Show Stats'}
            </Button>
            <Button
              onClick={() => setShowHistory(!showHistory)}
              variant="secondary"
              className="flex items-center gap-2"
            >
              {showHistory ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              {showHistory ? 'Hide History' : 'Show History'}
            </Button>
          </div>
        </div>

        {/* Premium Stats Panel */}
        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-8 pt-8 border-t border-accent/30"
            >
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
                <div className="glass-card rounded-xl p-6 text-center">
                  <div className="text-3xl font-heading font-bold text-accent">{stats.totalCombos}</div>
                  <div className="text-sm text-text font-body tracking-wide">Total Combos</div>
                </div>
                <div className="glass-card rounded-xl p-6 text-center">
                  <div className="text-3xl font-heading font-bold text-accent-light">{stats.avgCalories}</div>
                  <div className="text-sm text-text font-body tracking-wide">Avg Calories</div>
                </div>
                <div className="glass-card rounded-xl p-6 text-center">
                  <div className="text-3xl font-heading font-bold text-accent">{stats.avgPopularity}%</div>
                  <div className="text-sm text-text font-body tracking-wide">Avg Popularity</div>
                </div>
                <div className="glass-card rounded-xl p-6 text-center">
                  <div className="text-3xl font-heading font-bold text-accent-light capitalize">{stats.favoriteTaste}</div>
                  <div className="text-sm text-text font-body tracking-wide">Favorite Taste</div>
                </div>
                <div className="glass-card rounded-xl p-6 text-center">
                  <div className="text-3xl font-heading font-bold text-accent">{stats.weeklyDays}</div>
                  <div className="text-sm text-text font-body tracking-wide">Days Planned</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Session Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center mb-10"
      >
        <p className="text-text-light text-xl font-body">
          <span className="text-accent font-heading font-semibold">
            {viewMode === 'full-week' ? 'Full Week Plan' : `${selectedDay} + 2 Days`}
          </span> • Session {currentSession}
        </p>
        <p className="text-text opacity-70 text-sm mt-2 font-body tracking-wide">
          {viewMode === 'full-week' 
            ? 'Complete weekly meal planning with rolling uniqueness' 
            : 'Curate your perfect 3-day meal combinations'}
        </p>
      </motion.div>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card border-spicy/60 rounded-xl p-6 mb-8 text-center"
          >
            <p className="text-spicy font-heading text-2xl">⚠️</p>
            <p className="text-spicy mt-2 font-body">{error}</p>
            <Button
              onClick={clearHistory}
              variant="secondary"
              className="mt-4 text-sm"
            >
              Clear All Data & Try Again
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Day-Based Combos Display */}
      <div className="space-y-12 mb-10">
        <AnimatePresence>
          {getDisplayedCombos().map((dayData, dayIndex) => (
            <motion.div
              key={`${dayData.day}-${currentSession}`}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ delay: dayIndex * 0.2 }}
              className="space-y-6"
            >
              {/* Day Header */}
              <div className="text-center">
                <h3 className="text-3xl font-heading font-semibold text-accent text-luxury mb-2">
                  {dayData.day}
                </h3>
                <div className="w-24 h-1 bg-gradient-to-r from-accent to-accent-light mx-auto rounded-full"></div>
              </div>
              
              {/* Day's Combos */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {dayData.combos.map((combo, comboIndex) => (
                  <ComboCard 
                    key={`${dayData.day}-${currentSession}-${comboIndex}`}
                    combo={combo} 
                    index={comboIndex + (dayIndex * 3)}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Rolling History */}
      <AnimatePresence>
        {showHistory && (
          <RollingHistory 
            history={comboHistory}
            onClearHistory={clearHistory}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ComboGenerator;
