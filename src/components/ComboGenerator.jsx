import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Calendar, ChevronDown, BarChart3, Eye, EyeOff, CalendarDays, Sparkles, Wifi, WifiOff } from 'lucide-react';
import ComboCard from './ComboCard';
import RollingHistory from './RollingHistory';
import Button from './Button';
import { menuApi, ApiError } from '../services/api';

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
  const [notification, setNotification] = useState('');
  const [menuData, setMenuData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState('checking'); // 'checking', 'online', 'offline'

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Load menu data on component mount and check API status
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      setApiStatus('checking');
      
      try {
        // Check API health first
        await menuApi.healthCheck();
        setApiStatus('online');
        
        // Load menu data
        const items = await menuApi.getAllItems();
        setMenuData(items);
        setError('');
        showNotification('Connected to API successfully');
      } catch (error) {
        console.error('Failed to initialize data:', error);
        setApiStatus('offline');
        setError(`API Connection Failed: ${error.message}`);
        
        // Fallback to local data if API is unavailable
        try {
          const fallbackData = await import('../assets/menu.json');
          setMenuData(fallbackData.default);
          showNotification('Using offline data - API unavailable');
        } catch (fallbackError) {
          setError('Both API and local data unavailable');
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
    
    // Set up periodic health checks
    const healthCheckInterval = setInterval(async () => {
      try {
        await menuApi.healthCheck();
        if (apiStatus === 'offline') {
          setApiStatus('online');
          showNotification('API connection restored');
        }
      } catch (error) {
        if (apiStatus === 'online') {
          setApiStatus('offline');
          showNotification('API connection lost - using cached data');
        }
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(healthCheckInterval);
  }, []);

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
      
      if (apiStatus === 'online') {
        // Use API for combo generation
        const usedItems = comboHistory.flatMap(combo => [
          combo.main.item_name, 
          combo.side.item_name, 
          combo.drink.item_name
        ]);
        
        const weeklyData = await menuApi.generateWeeklyCombos(viewMode, selectedDay, usedItems);
        
        if (viewMode === 'full-week') {
          const newWeeklyCombos = Array(7).fill([]).map(() => []);
          
          weeklyData.weeklyPlan.forEach(dayData => {
            if (dayData.dayIndex >= 0 && dayData.dayIndex < 7) {
              newWeeklyCombos[dayData.dayIndex] = dayData.combos;
            }
          });
          
          setWeeklyCombos(newWeeklyCombos);
        } else {
          // Rolling 3-day view
          const selectedDayIndex = daysOfWeek.indexOf(selectedDay);
          const newWeeklyCombos = [...weeklyCombos];
          
          weeklyData.weeklyPlan.forEach(dayData => {
            if (dayData.dayIndex >= 0 && dayData.dayIndex < 7) {
              newWeeklyCombos[dayData.dayIndex] = dayData.combos;
            }
          });
          
          setWeeklyCombos(newWeeklyCombos);
        }
        
        // Update history with all new combos
        const allNewCombos = weeklyData.weeklyPlan.flatMap(day => day.combos);
        const updatedHistory = [...comboHistory, ...allNewCombos];
        const recentHistory = updatedHistory.slice(-15);
        setComboHistory(recentHistory);
        
        showNotification(`Generated ${allNewCombos.length} combos via API`);
      } else {
        // Fallback to local generation logic
        await generateCombosLocally();
        showNotification('Generated combos locally (API offline)');
      }
      
      setCurrentSession(prev => prev + 1);
    } catch (err) {
      console.error('Generation error:', err);
      if (err instanceof ApiError) {
        setError(`API Error: ${err.message}`);
        // Try local generation as fallback
        try {
          await generateCombosLocally();
          showNotification('API failed - generated locally');
        } catch (localErr) {
          setError(`Both API and local generation failed: ${localErr.message}`);
        }
      } else {
        setError(err.message);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Local generation fallback when API is unavailable
  const generateCombosLocally = async () => {
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
  };

  // Clear all combos
  const clearAllCombos = () => {
    setWeeklyCombos(Array(7).fill([]).map(() => []));
    setComboHistory([]);
    setCurrentSession(1);
    setError('');
    showNotification('All combos cleared successfully');
  };

  // Clear history
  const clearHistory = () => {
    setComboHistory([]);
  };

  // Toggle view mode
  const toggleViewMode = () => {
    const newMode = viewMode === 'rolling' ? 'full-week' : 'rolling';
    setViewMode(newMode);
    showNotification(`Switched to ${newMode === 'rolling' ? '3-day rolling' : 'full week'} view`);
  };

  // Change day
  const changeDay = (day) => {
    setSelectedDay(day);
    showNotification(`Starting day changed to ${day}`);
  };

  // Show notification
  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 3000);
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
      {/* Loading State */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 360] 
            }}
            transition={{ 
              scale: { duration: 2, repeat: Infinity },
              rotate: { duration: 3, repeat: Infinity, ease: "linear" }
            }}
            className="glass-card rounded-2xl p-8 text-center"
          >
            <RefreshCw className="w-12 h-12 text-accent mx-auto mb-4" />
            <h3 className="text-xl font-heading font-semibold text-accent mb-2">
              Initializing Combo Generator
            </h3>
            <p className="text-text-light">
              Connecting to API and loading menu data...
            </p>
          </motion.div>
        </motion.div>
      )}

      {/* Enhanced Premium Control Panel */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-3xl p-12 mb-12 shadow-2xl shadow-accent/20 
                   border border-accent/10 relative overflow-hidden"
      >
        {/* Subtle animated background gradient */}
        <motion.div
          animate={{ 
            background: [
              'radial-gradient(circle at 20% 20%, rgba(191, 161, 129, 0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 80%, rgba(191, 161, 129, 0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 20%, rgba(191, 161, 129, 0.1) 0%, transparent 50%)'
            ]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 pointer-events-none"
        />
        
        {/* Enhanced Header */}
        <div className="text-center mb-10 relative z-10">
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-heading font-bold text-accent mb-3"
          >
            Meal Planning Studio
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-text-light/70 font-body"
          >
            Craft your perfect weekly dining experience with intelligent combo generation
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start relative z-10">
          
          {/* Enhanced View Mode Toggle */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-5"
          >
            <label className="text-accent font-body font-semibold flex items-center gap-3 text-lg">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <CalendarDays className="w-6 h-6 text-accent" />
              </motion.div>
              View Mode
            </label>
            <Button
              onClick={toggleViewMode}
              className="w-full justify-center relative group overflow-hidden
                         bg-gradient-to-r from-accent/20 to-accent-light/20 
                         hover:from-accent/30 hover:to-accent-light/30
                         border-accent/30 hover:border-accent/50 transition-all duration-300
                         transform hover:scale-105 hover:shadow-lg hover:shadow-accent/20"
            >
              <motion.div
                animate={{ scale: viewMode === 'rolling' ? [1, 1.1, 1] : [1, 1.05, 1] }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-3"
              >
                <motion.div
                  animate={{ rotate: viewMode === 'rolling' ? 360 : 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {viewMode === 'rolling' ? 
                    <Calendar className="w-5 h-5" /> : 
                    <CalendarDays className="w-5 h-5" />
                  }
                </motion.div>
                <span className="font-semibold">
                  {viewMode === 'rolling' ? '3-Day Rolling' : 'Full Week'}
                </span>
              </motion.div>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-accent/10 to-accent-light/10"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
              />
            </Button>
            <div className="text-xs text-text-light/60 text-center">
              {viewMode === 'rolling' ? 'Focus on 3 consecutive days' : 'Plan your entire week'}
            </div>
          </motion.div>

          {/* Enhanced Day Selector */}
          <AnimatePresence>
            {viewMode === 'rolling' && (
              <motion.div 
                initial={{ opacity: 0, x: -20, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -20, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                <label className="text-accent font-body font-semibold flex items-center gap-3 text-lg">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Calendar className="w-6 h-6 text-accent" />
                  </motion.div>
                  Starting Day
                </label>
                <div className="relative group">
                  <select
                    value={selectedDay}
                    onChange={(e) => changeDay(e.target.value)}
                    className="w-full glass-card rounded-xl px-6 py-5 text-text-light font-body text-lg
                             focus:border-accent focus:outline-none appearance-none cursor-pointer
                             hover:border-accent/60 transition-all duration-300 transform hover:scale-105
                             bg-gradient-to-r from-background/50 to-background/30"
                  >
                    {daysOfWeek.map(day => (
                      <option key={day} value={day} className="bg-background text-text-light py-2">
                        {day}
                      </option>
                    ))}
                  </select>
                  <motion.div
                    animate={{ y: [0, -2, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute right-5 top-1/2 transform -translate-y-1/2 pointer-events-none"
                  >
                    <ChevronDown className="w-6 h-6 text-accent group-hover:text-accent-light transition-colors" />
                  </motion.div>
                </div>
                <div className="text-xs text-text-light/60 text-center">
                  Next 2 days will follow automatically
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Enhanced Generate Button */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-5"
          >
            <div className="text-center">
              <div className="text-accent font-body font-semibold text-lg mb-2">
                Generate Combos
              </div>
            </div>
            <Button
              onClick={generateCombos}
              disabled={isGenerating}
              className={`w-full justify-center relative overflow-hidden transform transition-all duration-300
                         ${isGenerating 
                           ? 'bg-accent/30 scale-95 shadow-inner' 
                           : 'bg-gradient-to-r from-accent to-accent-light hover:from-accent-light hover:to-accent scale-100 hover:scale-110 hover:shadow-2xl hover:shadow-accent/30'
                         }`}
            >
              <motion.div
                animate={isGenerating ? { opacity: [1, 0.5, 1] } : { opacity: 1 }}
                transition={{ duration: 0.8, repeat: isGenerating ? Infinity : 0, ease: "easeInOut" }}
                className="flex items-center gap-4"
              >
                <RefreshCw className={`w-6 h-6 ${isGenerating ? 'text-accent-light' : ''}`} />
                <span className="font-bold text-lg">
                  {isGenerating ? 'Generating...' : 
                  viewMode === 'full-week' ? 'Generate Week' : 'Generate 3 Days'}
                </span>
              </motion.div>
              {/* Shimmer effect for generating state */}
              {isGenerating && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
            </Button>
            <div className="text-xs text-text-light/60 text-center">
              {isGenerating ? 'Crafting perfect combinations...' : 'Click to create new meal combinations'}
            </div>
          </motion.div>

          {/* Enhanced Action Buttons */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-5"
          >
            <div className="text-center">
              <div className="text-accent font-body font-semibold text-lg mb-2">
                Actions
              </div>
              
              {/* API Status Indicator */}
              <motion.div 
                animate={{ 
                  scale: apiStatus === 'checking' ? [1, 1.1, 1] : 1,
                  opacity: isLoading ? 0.7 : 1 
                }}
                transition={{ duration: 2, repeat: apiStatus === 'checking' ? Infinity : 0 }}
                className={`flex items-center justify-center gap-2 p-2 rounded-lg mb-4 text-sm
                           ${apiStatus === 'online' ? 'bg-green-500/20 border border-green-500/30 text-green-300' : 
                             apiStatus === 'offline' ? 'bg-red-500/20 border border-red-500/30 text-red-300' :
                             'bg-yellow-500/20 border border-yellow-500/30 text-yellow-300'}`}
              >
                {apiStatus === 'online' && <Wifi className="w-4 h-4" />}
                {apiStatus === 'offline' && <WifiOff className="w-4 h-4" />}
                {apiStatus === 'checking' && <RefreshCw className="w-4 h-4 animate-spin" />}
                <span className="font-medium">
                  {apiStatus === 'online' ? 'API Connected' : 
                   apiStatus === 'offline' ? 'Offline Mode' : 
                   'Connecting...'}
                </span>
              </motion.div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => setShowHistory(!showHistory)}
                className={`justify-center text-sm relative group overflow-hidden transition-all duration-300
                           ${showHistory 
                             ? 'bg-accent/30 border-accent/50 shadow-inner' 
                             : 'hover:bg-accent/20 hover:border-accent/40 hover:scale-105'
                           }`}
              >
                <motion.div
                  animate={{ scale: showHistory ? [1, 1.2, 1] : 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {showHistory ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </motion.div>
                <span className="ml-2 font-medium">
                  {showHistory ? 'Hide' : 'History'}
                </span>
              </Button>
              <Button
                onClick={() => setShowStats(!showStats)}
                className={`justify-center text-sm relative group overflow-hidden transition-all duration-300
                           ${showStats 
                             ? 'bg-accent/30 border-accent/50 shadow-inner' 
                             : 'hover:bg-accent/20 hover:border-accent/40 hover:scale-105'
                           }`}
              >
                <motion.div
                  animate={{ scale: showStats ? [1, 1.2, 1] : 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <BarChart3 className="w-5 h-5" />
                </motion.div>
                <span className="ml-2 font-medium">
                  {showStats ? 'Hide' : 'Stats'}
                </span>
              </Button>
            </div>
            <Button
              onClick={clearAllCombos}
              className="w-full justify-center text-sm bg-red-600/20 hover:bg-red-600/40 
                         border-red-400/30 hover:border-red-400/50 transition-all duration-300
                         hover:scale-105 hover:shadow-lg hover:shadow-red-500/20 group"
            >
              <motion.div
                whileHover={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.4 }}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4 group-hover:text-red-300" />
                <span className="font-medium">Clear All</span>
              </motion.div>
            </Button>
            <div className="text-xs text-text-light/60 text-center">
              View data insights & manage history
            </div>
          </motion.div>
        </div>
        
        {/* Enhanced Stats Panel */}
        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="mt-12 pt-10 border-t border-accent/30 relative"
            >
              {/* Stats Header */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center mb-8"
              >
                <h3 className="text-2xl font-heading font-bold text-accent mb-2">
                  Weekly Analytics
                </h3>
                <p className="text-text-light/70 font-body">
                  Insights into your meal planning preferences
                </p>
              </motion.div>

              {/* Enhanced Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {Object.entries(getWeekStats()).map(([key, value], index) => (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.1 * index, duration: 0.4 }}
                    className="group relative"
                  >
                    <div className="glass-card rounded-2xl p-6 text-center hover:border-accent/40 
                                  transition-all duration-300 transform hover:scale-105 hover:shadow-lg 
                                  hover:shadow-accent/20 bg-gradient-to-br from-background/50 to-background/30">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: index * 0.2 }}
                        className="text-4xl font-heading font-bold text-accent mb-3 relative"
                      >
                        {value}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-accent/20 to-accent-light/20 
                                   rounded-lg blur-lg opacity-0 group-hover:opacity-100"
                          transition={{ duration: 0.3 }}
                        />
                      </motion.div>
                      <div className="text-sm text-text-light/80 capitalize font-medium leading-relaxed">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                    </div>
                    
                    {/* Subtle hover indicator */}
                    <motion.div
                      className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-accent/20 to-accent-light/20 
                               opacity-0 group-hover:opacity-100 -z-10 blur-sm"
                      transition={{ duration: 0.3 }}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Additional Stats Info */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-8 text-center"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full 
                              bg-accent/10 border border-accent/20 text-text-light/70 text-sm">
                  <BarChart3 className="w-4 h-4 text-accent" />
                  <span>Statistics update automatically with each generation</span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Elegant Notification System */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="glass-card rounded-2xl px-6 py-4 border border-accent/30 
                          bg-gradient-to-r from-accent/20 to-accent-light/20 shadow-2xl shadow-accent/20">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 180, 360] }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                >
                  <Sparkles className="w-5 h-5 text-accent" />
                </motion.div>
                <span className="text-text-light font-medium">{notification}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
