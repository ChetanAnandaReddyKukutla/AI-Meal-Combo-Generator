import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Calendar, ChevronDown, BarChart3, Eye, EyeOff } from 'lucide-react';
import ComboCard from './ComboCard';
import RollingHistory from './RollingHistory';
import Button from './Button';
import menuData from '../assets/menu.json';

const ComboGenerator = () => {
  const [combos, setCombos] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedDay, setSelectedDay] = useState('Monday');
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

  // Statistics
  const stats = {
    totalCombos: comboHistory.length,
    avgCalories: comboHistory.length > 0 ? Math.round(comboHistory.reduce((sum, combo) => sum + combo.totalCalories, 0) / comboHistory.length) : 0,
    tastesDistribution: comboHistory.reduce((acc, combo) => {
      acc[combo.tasteProfile] = (acc[combo.tasteProfile] || 0) + 1;
      return acc;
    }, {}),
    daysActive: Math.ceil(comboHistory.length / 3),
    currentFilter: tasteFilter !== 'all' ? tasteFilter : null
  };

  // Generate a canonical combo key for comparison (sorted item names)
  const getComboKey = (main, side, drink) => {
    return [main.item_name, side.item_name, drink.item_name].sort().join('|');
  };

  // Check if a combo already exists in history
  const isComboInHistory = (main, side, drink) => {
    const comboKey = getComboKey(main, side, drink);
    return comboHistory.some(historyCombo => 
      getComboKey(historyCombo.main, historyCombo.side, historyCombo.drink) === comboKey
    );
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

  // Generate a single valid combo
  const generateSingleCombo = (usedItems = new Set()) => {
    const maxAttempts = 1000;
    let attempts = 0;
    const filteredMenu = getFilteredMenuByCategory();

    // Check if we have enough items in each category
    if (filteredMenu.main.length === 0 || filteredMenu.side.length === 0 || filteredMenu.drink.length === 0) {
      return null;
    }

    while (attempts < maxAttempts) {
      attempts++;

      // Randomly select items from each filtered category
      const main = filteredMenu.main[Math.floor(Math.random() * filteredMenu.main.length)];
      const side = filteredMenu.side[Math.floor(Math.random() * filteredMenu.side.length)];
      const drink = filteredMenu.drink[Math.floor(Math.random() * filteredMenu.drink.length)];

      // Check all constraints
      const totalCalories = main.calories + side.calories + drink.calories;
      const isValidCalories = isCaloriesInRange(main, side, drink);
      const isValidPopularity = isPopularityInRange(main, side, drink);
      const isNotInHistory = !isComboInHistory(main, side, drink);
      const isNotUsedToday = !usedItems.has(main.item_name) && 
                           !usedItems.has(side.item_name) && 
                           !usedItems.has(drink.item_name);

      if (isValidCalories && isValidPopularity && isNotInHistory && isNotUsedToday) {
        // Mark items as used
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
          }
        };
      }
    }

    return null; // Could not generate a valid combo
  };

  // Generate a single combo with a specific menu set
  const generateSingleComboWithMenu = (menuSet, usedItems) => {
    for (let attempt = 0; attempt < 1000; attempt++) {
      // Get available items that aren't used in this generation
      const availableMain = menuSet.main.filter(item => !usedItems.has(item.item_name));
      const availableSide = menuSet.side.filter(item => !usedItems.has(item.item_name));
      const availableDrink = menuSet.drink.filter(item => !usedItems.has(item.item_name));

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
      const isNotInHistory = !isComboInHistory(main, side, drink);
      const isNotUsedToday = !usedItems.has(main.item_name) && 
                           !usedItems.has(side.item_name) && 
                           !usedItems.has(drink.item_name);

      if (isValidCalories && isValidPopularity && isNotInHistory && isNotUsedToday) {
        // Mark items as used
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
          }
        };
      }
    }

    return null; // Could not generate a valid combo
  };

  // Generate a pure taste combo (only items matching the target taste)
  const generatePureTasteCombo = (targetTaste, usedItems) => {
    for (let attempt = 0; attempt < 1000; attempt++) {
      // Get only items that match the target taste
      const availableMain = menuData.filter(item => 
        item.category === 'main' && 
        item.taste_profile === targetTaste && 
        !usedItems.has(item.item_name)
      );
      const availableSide = menuData.filter(item => 
        item.category === 'side' && 
        item.taste_profile === targetTaste && 
        !usedItems.has(item.item_name)
      );
      const availableDrink = menuData.filter(item => 
        item.category === 'drink' && 
        item.taste_profile === targetTaste && 
        !usedItems.has(item.item_name)
      );

      // Check if we have at least one item in each category for this taste
      if (availableMain.length === 0 || availableSide.length === 0 || availableDrink.length === 0) {
        return null; // Cannot create a pure taste combo
      }

      // Select random items from each category (only matching taste)
      const main = availableMain[Math.floor(Math.random() * availableMain.length)];
      const side = availableSide[Math.floor(Math.random() * availableSide.length)];
      const drink = availableDrink[Math.floor(Math.random() * availableDrink.length)];

      // Ensure no duplicates
      if (main.item_name === side.item_name || main.item_name === drink.item_name || side.item_name === drink.item_name) {
        continue;
      }

      // Check all constraints
      const totalCalories = main.calories + side.calories + drink.calories;
      const isValidCalories = isCaloriesInRange(main, side, drink);
      const isValidPopularity = isPopularityInRange(main, side, drink);
      const isNotInHistory = !isComboInHistory(main, side, drink);
      const isNotUsedToday = !usedItems.has(main.item_name) && 
                           !usedItems.has(side.item_name) && 
                           !usedItems.has(drink.item_name);

      if (isValidCalories && isValidPopularity && isNotInHistory && isNotUsedToday) {
        // Mark items as used
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
          }
        };
      }
    }

    return null; // Could not generate a valid combo
  };

  // Generate combos based on taste selection
  const generateCombos = async () => {
    setIsGenerating(true);
    setError('');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1200)); // Enhanced processing time

      if (tasteFilter === 'all') {
        // Generate 3 combos: one spicy, one sweet, one savory
        const spicyMenu = {
          main: menuData.filter(item => item.category === 'main' && item.taste_profile === 'spicy'),
          side: menuData.filter(item => item.category === 'side' && item.taste_profile === 'spicy'),
          drink: menuData.filter(item => item.category === 'drink' && item.taste_profile === 'spicy')
        };

        const sweetMenu = {
          main: menuData.filter(item => item.category === 'main' && item.taste_profile === 'sweet'),
          side: menuData.filter(item => item.category === 'side' && item.taste_profile === 'sweet'),
          drink: menuData.filter(item => item.category === 'drink' && item.taste_profile === 'sweet')
        };

        const savoryMenu = {
          main: menuData.filter(item => item.category === 'main' && item.taste_profile === 'savory'),
          side: menuData.filter(item => item.category === 'side' && item.taste_profile === 'savory'),
          drink: menuData.filter(item => item.category === 'drink' && item.taste_profile === 'savory')
        };

        const newCombos = [];
        const usedItems = new Set();

        // Generate spicy combo (only if all categories have spicy items)
        if (spicyMenu.main.length > 0 && spicyMenu.side.length > 0 && spicyMenu.drink.length > 0) {
          const spicyCombo = generatePureTasteCombo('spicy', usedItems);
          if (spicyCombo) {
            newCombos.push(spicyCombo);
          }
        }

        // Generate sweet combo (only if all categories have sweet items)
        if (sweetMenu.main.length > 0 && sweetMenu.side.length > 0 && sweetMenu.drink.length > 0) {
          const sweetCombo = generatePureTasteCombo('sweet', usedItems);
          if (sweetCombo) {
            newCombos.push(sweetCombo);
          }
        }

        // Generate savory combo (only if all categories have savory items)
        if (savoryMenu.main.length > 0 && savoryMenu.side.length > 0 && savoryMenu.drink.length > 0) {
          const savoryCombo = generatePureTasteCombo('savory', usedItems);
          if (savoryCombo) {
            newCombos.push(savoryCombo);
          }
        }

        if (newCombos.length === 0) {
          throw new Error('Cannot generate pure taste combos with current menu. Some taste categories are missing items in main/side/drink categories.');
        }

        // Update combos and history
        setCombos(newCombos);
        
        // Update rolling 3-day history
        const updatedHistory = [...comboHistory, ...newCombos];
        // Keep only last 9 combos (3 days × 3 combos)
        const recentHistory = updatedHistory.slice(-9);
        setComboHistory(recentHistory);

      } else {
        // Generate 1 combo for specific taste
        const filteredMenu = getFilteredMenuByCategory();
        
        // Check if we have enough items for the selected taste filter
        if (filteredMenu.main.length === 0 || filteredMenu.side.length === 0 || filteredMenu.drink.length === 0) {
          throw new Error(`No valid ${tasteFilter} combos found. Please try "All Tastes" or select a different taste profile.`);
        }

        const usedItems = new Set();
        const combo = generateSingleCombo(usedItems);
        
        if (combo) {
          setCombos([combo]);
          
          // Update rolling 3-day history
          const updatedHistory = [...comboHistory, combo];
          // Keep only last 9 combos (3 days × 3 combos)
          const recentHistory = updatedHistory.slice(-9);
          setComboHistory(recentHistory);
        } else {
          throw new Error(`Could not generate valid ${tasteFilter} combo. Please try again or clear history.`);
        }
      }

      // Increment session counter
      setCurrentSession(prev => prev + 1);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Clear history
  const clearHistory = () => {
    setComboHistory([]);
    setCurrentSession(1);
  };

  // Change day
  const changeDay = (day) => {
    setSelectedDay(day);
  };

  // Change taste filter
  const changeTasteFilter = (taste) => {
    setTasteFilter(taste);
    setError(''); // Clear any previous errors
    // Optionally auto-regenerate combos when filter changes
    // setCombos([]); // Uncomment to clear current combos when filter changes
  };

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* Taste Filter */}
      <TasteFilter 
        selectedTaste={tasteFilter}
        onTasteChange={changeTasteFilter}
        tasteOptions={tasteFilterOptions}
      />

      {/* Enhanced Control Panel */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-dark rounded-2xl p-8 mb-8 border border-white/10"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          
          {/* Day Selector */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300 uppercase tracking-wider">
              Select Day
            </label>
            <div className="relative">
              <select
                value={selectedDay}
                onChange={(e) => changeDay(e.target.value)}
                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white font-medium focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all duration-200 appearance-none cursor-pointer"
              >
                {daysOfWeek.map(day => (
                  <option key={day} value={day} className="bg-gray-900 text-white">
                    {day}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Session Info */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-2 text-gray-300">
              <Calendar className="w-5 h-5" />
              <span className="font-medium text-lg">{selectedDay}</span>
            </div>
            <div className="text-cyan-400 font-semibold">
              Session #{currentSession}
            </div>
            {comboHistory.length > 0 && (
              <div className="text-xs text-gray-400">
                {comboHistory.length} combos in memory
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-3">
            <Button
              onClick={generateCombos}
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>GENERATING...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  <span>GENERATE COMBOS</span>
                </>
              )}
            </Button>
            
            <div className="flex space-x-2">
              <Button
                onClick={() => setShowHistory(!showHistory)}
                variant="secondary"
                className="flex-1"
              >
                {showHistory ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span className="text-sm">HISTORY</span>
              </Button>
              
              <Button
                onClick={() => setShowStats(!showStats)}
                variant="secondary"
                className="flex-1"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="text-sm">STATS</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300"
            >
              <div className="flex items-center space-x-2">
                <span className="text-red-400">⚠️</span>
                <span>{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Stats Panel */}
      <AnimatePresence>
        {showStats && stats.totalCombos > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-dark rounded-2xl p-6 mb-8 border border-white/10"
          >
            <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              <span>Statistics</span>
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white/5 rounded-xl">
                <div className="text-2xl font-bold text-purple-400">{stats.totalCombos}</div>
                <div className="text-sm text-gray-400">Total Combos</div>
              </div>
              
              <div className="text-center p-4 bg-white/5 rounded-xl">
                <div className="text-2xl font-bold text-cyan-400">{stats.avgCalories}</div>
                <div className="text-sm text-gray-400">Avg Calories</div>
              </div>
              
              <div className="text-center p-4 bg-white/5 rounded-xl">
                <div className="text-2xl font-bold text-pink-400">{stats.daysActive}</div>
                <div className="text-sm text-gray-400">Days Active</div>
              </div>
              
              <div className="text-center p-4 bg-white/5 rounded-xl">
                <div className="text-2xl font-bold text-green-400">
                  {Object.keys(stats.tastesDistribution).length}
                </div>
                <div className="text-sm text-gray-400">Taste Varieties</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History Panel */}
      <AnimatePresence>
        {showHistory && (
          <RollingHistory history={comboHistory} onClear={clearHistory} />
        )}
      </AnimatePresence>

      {/* Combos Display */}
      <AnimatePresence mode="wait">
        {combos.length > 0 && (
          <motion.div
            key="combos"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.h2 
              className="text-3xl md:text-4xl font-heading font-bold text-center mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="bg-gradient-to-r from-accent via-accent-secondary to-accent bg-clip-text text-transparent">
                {selectedDay}'s AI-Generated Combos
              </span>
            </motion.h2>
            
            {/* Active filter indicator */}
            {tasteFilter !== 'all' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex justify-center mb-6"
              >
                <div className="bg-accent/20 border border-accent/40 rounded-full px-4 py-2 flex items-center space-x-2">
                  <span className="text-lg">
                    {tasteFilterOptions.find(opt => opt.value === tasteFilter)?.icon}
                  </span>
                  <span className="text-accent font-body font-semibold uppercase tracking-wider text-sm">
                    {tasteFilter} Filter Active
                  </span>
                </div>
              </motion.div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {combos.map((combo, index) => (
                <ComboCard key={`${currentSession}-${index}`} combo={combo} index={index} />
              ))}
            </div>

            {/* JSON Viewer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="mt-12 glass-dark rounded-2xl p-6 border border-white/10"
            >
              <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                <span>📋</span>
                <span>Structured Output</span>
              </h3>
              <pre className="text-sm text-gray-300 overflow-x-auto bg-black/30 rounded-lg p-4 border border-white/5">
                {JSON.stringify(combos.map(combo => ({
                  main: combo.main.item_name,
                  side: combo.side.item_name,
                  drink: combo.drink.item_name,
                  totalCalories: combo.totalCalories,
                  tasteProfile: combo.tasteProfile,
                  popularityRange: combo.popularityRange
                })), null, 2)}
              </pre>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Welcome Message */}
      {combos.length === 0 && !isGenerating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="glass-dark rounded-3xl p-12 border border-white/10 max-w-4xl mx-auto">
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity,
                repeatDelay: 2
              }}
              className="text-8xl mb-8"
            >
              🤖
            </motion.div>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-accent via-accent-secondary to-accent bg-clip-text text-transparent font-heading">
              Ready to Discover Your Perfect Meal?
            </h2>
            
            <p className="text-xl text-text mb-8 leading-relaxed">
              Our AI will generate <span className="text-accent font-semibold">3 unique combinations</span> that are perfectly balanced in calories, taste, and popularity. 
              <span className="text-accent-secondary font-medium"> Use the taste filter above to customize your preferences.</span> No repeats, guaranteed satisfaction.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-card/30 rounded-xl p-6 border border-accent/10">
                <div className="text-3xl mb-3">🎨</div>
                <h3 className="text-lg font-semibold text-text-light mb-2 font-heading">Taste Filtering</h3>
                <p className="text-text/70 text-sm font-body">Choose your preferred taste profile</p>
              </div>
              
              <div className="bg-card/30 rounded-xl p-6 border border-accent/10">
                <div className="text-3xl mb-3">⚖️</div>
                <h3 className="text-lg font-semibold text-text-light mb-2 font-heading">Perfectly Balanced</h3>
                <p className="text-text/70 text-sm font-body">550-800 calories per combo</p>
              </div>
              
              <div className="bg-card/30 rounded-xl p-6 border border-accent/10">
                <div className="text-3xl mb-3">🎯</div>
                <h3 className="text-lg font-semibold text-text-light mb-2 font-heading">Smart Matching</h3>
                <p className="text-text/70 text-sm font-body">Popularity scores within ±0.15</p>
              </div>
              
              <div className="bg-card/30 rounded-xl p-6 border border-accent/10">
                <div className="text-3xl mb-3">🧠</div>
                <h3 className="text-lg font-semibold text-text-light mb-2 font-heading">Memory System</h3>
                <p className="text-text/70 text-sm font-body">No repeats for 3 days</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ComboGenerator;
