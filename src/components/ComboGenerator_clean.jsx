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
    avgPopularity: comboHistory.length > 0 ? ((comboHistory.reduce((sum, combo) => sum + (combo.popularityRange.min + combo.popularityRange.max) / 2, 0) / comboHistory.length) * 100).toFixed(1) : 0,
    favoriteTaste: comboHistory.length > 0 ? 
      Object.entries(comboHistory.reduce((acc, combo) => {
        acc[combo.tasteProfile] = (acc[combo.tasteProfile] || 0) + 1;
        return acc;
      }, {})).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None' : 'None'
  };

  // Check if a combo (or similar) exists in history
  const isComboInHistory = (main, side, drink) => {
    return comboHistory.some(combo => 
      combo.main.item_name === main.item_name ||
      combo.side.item_name === side.item_name ||
      combo.drink.item_name === drink.item_name
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

  // Generate a single combo
  const generateSingleCombo = (usedItems) => {
    for (let attempt = 0; attempt < 1000; attempt++) {
      // Get available items that aren't used in this generation
      const availableMain = menu.main.filter(item => !usedItems.has(item.item_name));
      const availableSide = menu.side.filter(item => !usedItems.has(item.item_name));
      const availableDrink = menu.drink.filter(item => !usedItems.has(item.item_name));

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

  // Generate 3 unique combos for the day
  const generateCombos = async () => {
    setIsGenerating(true);
    setError('');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1200)); // Enhanced processing time

      const newCombos = [];
      const usedItems = new Set();

      // Generate 3 unique combos
      for (let i = 0; i < 3; i++) {
        const combo = generateSingleCombo(usedItems);
        if (combo) {
          newCombos.push(combo);
        } else {
          throw new Error(`Could not generate valid combo ${i + 1}. Please try again or clear history.`);
        }
      }

      // Update combos and history
      setCombos(newCombos);
      
      // Update rolling 3-day history
      const updatedHistory = [...comboHistory, ...newCombos];
      // Keep only last 9 combos (3 days × 3 combos)
      const recentHistory = updatedHistory.slice(-9);
      setComboHistory(recentHistory);

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

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* Enhanced Control Panel */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-dark rounded-2xl p-8 mb-8 border border-white/10"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          
          {/* Day Selector */}
          <div className="space-y-3">
            <label className="text-primary-light font-medium flex items-center gap-2">
              <Calendar className="w-5 h-5 text-accent" />
              Day Selection
            </label>
            <div className="relative">
              <select
                value={selectedDay}
                onChange={(e) => changeDay(e.target.value)}
                className="w-full bg-dark/50 border border-white/20 rounded-xl px-4 py-3 text-primary-light 
                         focus:border-accent focus:outline-none appearance-none cursor-pointer
                         hover:border-white/30 transition-colors"
              >
                {daysOfWeek.map(day => (
                  <option key={day} value={day} className="bg-dark text-primary-light">
                    {day}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-accent pointer-events-none" />
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex justify-center">
            <Button
              onClick={generateCombos}
              disabled={isGenerating}
              className="px-8 py-4 text-lg font-semibold"
            >
              {isGenerating ? (
                <div className="flex items-center gap-3">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Generating...
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <RefreshCw className="w-5 h-5" />
                  Generate Combos
                </div>
              )}
            </Button>
          </div>

          {/* Stats & Controls */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
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

        {/* Enhanced Stats Panel */}
        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 pt-6 border-t border-white/10"
            >
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-light rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-accent">{stats.totalCombos}</div>
                  <div className="text-sm text-secondary">Total Combos</div>
                </div>
                <div className="glass-light rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-accent">{stats.avgCalories}</div>
                  <div className="text-sm text-secondary">Avg Calories</div>
                </div>
                <div className="glass-light rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-accent">{stats.avgPopularity}%</div>
                  <div className="text-sm text-secondary">Avg Popularity</div>
                </div>
                <div className="glass-light rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-accent capitalize">{stats.favoriteTaste}</div>
                  <div className="text-sm text-secondary">Favorite Taste</div>
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
        className="text-center mb-8"
      >
        <p className="text-primary-light text-lg">
          <span className="text-accent font-semibold">{selectedDay}</span> • Session {currentSession}
        </p>
        <p className="text-secondary text-sm mt-1">
          Generate your perfect meal combinations with AI precision
        </p>
      </motion.div>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 text-center"
          >
            <p className="text-red-400 font-medium">⚠️</p>
            <p className="text-red-300 mt-1">{error}</p>
            <Button
              onClick={clearHistory}
              variant="secondary"
              className="mt-3 text-sm"
            >
              Clear History & Try Again
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Combos Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <AnimatePresence>
          {combos.map((combo, index) => (
            <ComboCard 
              key={`${selectedDay}-${currentSession}-${index}`}
              combo={combo} 
              index={index}
            />
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
