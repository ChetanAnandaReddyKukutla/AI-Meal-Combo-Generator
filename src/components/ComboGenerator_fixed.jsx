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

  // Get stats from current week
  const getWeekStats = () => {
    const allCombos = weeklyCombos.flat();
    const allItems = allCombos.map(combo => [combo.main, combo.side, combo.drink]).flat();
    
    return {
      totalCombos: allCombos.length,
      averageCalories: allCombos.length > 0 ? Math.round(allCombos.reduce((sum, combo) => sum + combo.totalCalories, 0) / allCombos.length) : 0,
      mostPopularTaste: allCombos.length > 0 ? Object.entries(allItems.reduce((acc, item) => {
        acc[item.taste_profile] = (acc[item.taste_profile] || 0) + 1;
        return acc;
      }, {})).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None' : 'None',
      weeklyDays: weeklyCombos.filter(day => day.length > 0).length
    };
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

  // Fallback combo generation without any restrictions
  const generateFallbackCombo = () => {
    for (let attempt = 0; attempt < 100; attempt++) {
      const main = menu.main[Math.floor(Math.random() * menu.main.length)];
      const side = menu.side[Math.floor(Math.random() * menu.side.length)];
      const drink = menu.drink[Math.floor(Math.random() * menu.drink.length)];

      const totalCalories = main.calories + side.calories + drink.calories;
      if (totalCalories >= 550 && totalCalories <= 800) {
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
          dayIndex: 0,
          day: 'Generated'
        };
      }
    }
    return null;
  };

  // Check if item is used in 3-day rolling window
  const isItemUsedInThreeDayWindow = (itemName, dayIndex) => {
    const windowDays = [
      (dayIndex - 1 + 7) % 7,
      dayIndex,
      (dayIndex + 1) % 7
    ];
    
    for (const checkDay of windowDays) {
      for (const combo of weeklyCombos[checkDay]) {
        if (combo.main?.item_name === itemName ||
            combo.side?.item_name === itemName ||
            combo.drink?.item_name === itemName) {
          return true;
        }
      }
    }
    return false;
  };

  // Generate a single combo for a specific day
  const generateSingleCombo = (usedItems, dayIndex, enforceThreeDayUniqueness = true) => {
    for (let attempt = 0; attempt < 1000; attempt++) {
      // Get available items that aren't used in this current generation session
      const availableMain = menu.main.filter(item => 
        !usedItems.has(item.item_name) && 
        (!enforceThreeDayUniqueness || !isItemUsedInThreeDayWindow(item.item_name, dayIndex))
      );
      const availableSide = menu.side.filter(item => 
        !usedItems.has(item.item_name) &&
        (!enforceThreeDayUniqueness || !isItemUsedInThreeDayWindow(item.item_name, dayIndex))
      );
      const availableDrink = menu.drink.filter(item => 
        !usedItems.has(item.item_name) &&
        (!enforceThreeDayUniqueness || !isItemUsedInThreeDayWindow(item.item_name, dayIndex))
      );

      if (availableMain.length === 0 || availableSide.length === 0 || availableDrink.length === 0) {
        // If we run out of items, reset the used items for this session and continue
        usedItems.clear();
        continue;
      }

      // Select random items
      const main = availableMain[Math.floor(Math.random() * availableMain.length)];
      const side = availableSide[Math.floor(Math.random() * availableSide.length)];
      const drink = availableDrink[Math.floor(Math.random() * availableDrink.length)];

      // Check all constraints
      const totalCalories = main.calories + side.calories + drink.calories;
      const isValidCalories = isCaloriesInRange(main, side, drink);
      const isValidPopularity = isPopularityInRange(main, side, drink);

      if (isValidCalories && isValidPopularity) {
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

  // Generate combos for a specific day
  const generateCombosForDay = async (dayIndex) => {
    const usedItems = new Set();
    const dayCombos = [];

    // Generate 3 unique combos for this day
    for (let i = 0; i < 3; i++) {
      // First try with 3-day uniqueness enforcement
      let combo = generateSingleCombo(usedItems, dayIndex, true);
      
      if (!combo) {
        // If that fails, try without 3-day uniqueness but with session uniqueness
        usedItems.clear();
        combo = generateSingleCombo(usedItems, dayIndex, false);
      }
      
      if (!combo) {
        // Final fallback: generate without any restrictions
        const fallbackCombo = generateFallbackCombo();
        if (fallbackCombo) {
          combo = { ...fallbackCombo, dayIndex, day: daysOfWeek[dayIndex] };
        }
      }
      
      if (combo) {
        dayCombos.push(combo);
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
          const dayCombos = await generateCombosForDay(dayIndex);
          newWeeklyCombos[dayIndex] = dayCombos;
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
          const dayCombos = await generateCombosForDay(dayIndex);
          newWeeklyCombos[dayIndex] = dayCombos;
          allNewCombos.push(...dayCombos);
        }
        
        setWeeklyCombos(newWeeklyCombos);
        
        // Update rolling history
        const updatedHistory = [...comboHistory, ...allNewCombos];
        const recentHistory = updatedHistory.slice(-15); // Keep last 15 combos for rolling view
        setComboHistory(recentHistory);
      }
      
      setCurrentSession(prev => prev + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Clear all combos
  const clearAllCombos = () => {
    setWeeklyCombos(Array(7).fill([]).map(() => []));
    setComboHistory([]);
    setCurrentSession(1);
    setError('');
  };

  // Clear history
  const clearHistory = () => {
    setComboHistory([]);
  };

  // Toggle view mode
  const toggleViewMode = () => {
    setViewMode(prev => prev === 'rolling' ? 'full-week' : 'rolling');
  };

  // Change day
  const changeDay = (day) => {
    setSelectedDay(day);
  };

  // Get weekly JSON data for display
  const getWeeklyJsonData = () => {
    const weeklyData = {
      generatedAt: new Date().toISOString(),
      viewMode: viewMode,
      selectedDay: selectedDay,
      totalCombos: weeklyCombos.flat().length,
      weeklyPlan: daysOfWeek.map((day, index) => ({
        day: day,
        dayIndex: index,
        combos: weeklyCombos[index].map((combo, comboIndex) => ({
          comboId: `${day}-${comboIndex + 1}`,
          main: {
            name: combo.main.item_name,
            calories: combo.main.calories,
            taste: combo.main.taste_profile,
            popularity: combo.main.popularity_score
          },
          side: {
            name: combo.side.item_name,
            calories: combo.side.calories,
            taste: combo.side.taste_profile,
            popularity: combo.side.popularity_score
          },
          drink: {
            name: combo.drink.item_name,
            calories: combo.drink.calories,
            taste: combo.drink.taste_profile,
            popularity: combo.drink.popularity_score
          },
          totals: {
            calories: combo.totalCalories,
            tasteProfile: combo.tasteProfile,
            popularityRange: combo.popularityRange
          }
        }))
      })).filter(day => day.combos.length > 0),
      uniquenessValidation: validateThreeDayUniqueness()
    };
    
    return weeklyData;
  };

  // Validate that 3 continuous days have different combos
  const validateThreeDayUniqueness = () => {
    const validationResults = [];
    
    for (let startDay = 0; startDay < 7; startDay++) {
      const threeDayWindow = [
        startDay,
        (startDay + 1) % 7,
        (startDay + 2) % 7
      ];
      
      const windowCombos = threeDayWindow.map(dayIndex => weeklyCombos[dayIndex]).flat();
      const allItems = windowCombos.map(combo => [
        combo.main.item_name,
        combo.side.item_name,
        combo.drink.item_name
      ]).flat();
      
      const uniqueItems = new Set(allItems);
      const duplicateItems = allItems.filter((item, index) => allItems.indexOf(item) !== index);
      
      validationResults.push({
        startingDay: daysOfWeek[startDay],
        days: threeDayWindow.map(i => daysOfWeek[i]),
        totalItems: allItems.length,
        uniqueItems: uniqueItems.size,
        duplicateItems: [...new Set(duplicateItems)],
        isUnique: duplicateItems.length === 0
      });
    }
    
    return validationResults;
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
                    <option key={day} value={day} className="bg-background text-text-light">
                      {day}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-accent pointer-events-none" />
              </div>
            </div>
          )}

          {/* Generate Button */}
          <div className="space-y-4">
            <Button
              onClick={generateCombos}
              disabled={isGenerating}
              className={`w-full justify-center relative overflow-hidden ${
                isGenerating ? 'bg-accent/20' : 'bg-gradient-to-r from-accent to-accent-light hover:shadow-accent/20'
              }`}
            >
              <motion.div
                animate={isGenerating ? { rotate: 360 } : { rotate: 0 }}
                transition={{ duration: 1, repeat: isGenerating ? Infinity : 0, ease: "linear" }}
                className="flex items-center gap-3"
              >
                <RefreshCw className="w-5 h-5" />
                <span className="font-semibold">
                  {isGenerating ? 'Generating...' : 
                  viewMode === 'full-week' ? 'Generate Week' : 'Generate 3 Days'}
                </span>
              </motion.div>
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => setShowHistory(!showHistory)}
                className="justify-center text-sm"
              >
                {showHistory ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
              <Button
                onClick={() => setShowStats(!showStats)}
                className="justify-center text-sm"
              >
                <BarChart3 className="w-4 h-4" />
              </Button>
            </div>
            <Button
              onClick={clearAllCombos}
              className="w-full justify-center text-sm bg-red-600/20 hover:bg-red-600/30 border-red-400/30"
            >
              Clear All
            </Button>
          </div>
        </div>
        
        {/* Stats Panel */}
        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-8 pt-8 border-t border-accent/20"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {Object.entries(getWeekStats()).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <div className="text-2xl font-heading font-bold text-accent">{value}</div>
                    <div className="text-sm text-text-light/70 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card rounded-xl p-6 mb-8 border-red-400/30 bg-red-600/10"
          >
            <p className="text-red-400 text-center font-body">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Combos Display */}
      <div className="space-y-10">
        <AnimatePresence mode="wait">
          {getDisplayedCombos().map((dayData, dayIndex) => (
            <motion.div
              key={`${dayData.day}-${currentSession}`}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.5, delay: dayIndex * 0.1 }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-heading font-bold text-accent text-center">
                {dayData.day}
              </h2>
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

      {/* Weekly Combos JSON Display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-8 mt-10 shadow-2xl shadow-accent/10"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-heading font-semibold text-accent">
            Weekly Combos Data
          </h3>
          <Button
            onClick={() => {
              const jsonData = getWeeklyJsonData();
              navigator.clipboard.writeText(JSON.stringify(jsonData, null, 2));
              // You could add a toast notification here
            }}
            className="text-sm"
          >
            Copy JSON
          </Button>
        </div>
        
        <div className="bg-background/30 rounded-xl p-6 overflow-auto max-h-96">
          <pre className="text-sm text-text-light font-mono leading-relaxed">
            {JSON.stringify(getWeeklyJsonData(), null, 2)}
          </pre>
        </div>
      </motion.div>
    </div>
  );
};

export default ComboGenerator;
