import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TasteBadge from './TasteBadge';

const ComboCard = ({ combo, index }) => {
  const { main, side, drink, totalCalories, tasteProfile, popularityRange } = combo;
  const [calorieProgress, setCalorieProgress] = useState(0);
  const [popularityProgress, setPopularityProgress] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setCalorieProgress((totalCalories - 550) / (800 - 550) * 100);
    }, 500 + index * 200);

    const timer2 = setTimeout(() => {
      setPopularityProgress(popularityRange.max * 100);
    }, 800 + index * 200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [totalCalories, popularityRange.max, index]);

  const getCategoryInfo = (category) => {
    switch (category) {
      case 'main':
        return { icon: '🍛', bg: 'from-cyan-500/20 to-cyan-600/20', border: 'border-cyan-400/40', text: 'text-cyan-300' };
      case 'side':
        return { icon: '🥗', bg: 'from-purple-500/20 to-purple-600/20', border: 'border-purple-400/40', text: 'text-purple-300' };
      case 'drink':
        return { icon: '🥤', bg: 'from-pink-500/20 to-pink-600/20', border: 'border-pink-400/40', text: 'text-pink-300' };
      default:
        return { icon: '🍽️', bg: 'from-gray-500/20 to-gray-600/20', border: 'border-gray-400/40', text: 'text-gray-300' };
    }
  };

  const getCalorieColor = (calories) => {
    if (calories <= 600) return 'text-green-400';
    if (calories <= 700) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getCalorieGradient = (calories) => {
    if (calories <= 600) return 'from-green-400 to-cyan-400';
    if (calories <= 700) return 'from-yellow-400 to-orange-400';
    return 'from-red-400 to-pink-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 100, rotateX: -30 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ 
        duration: 0.8, 
        delay: index * 0.2,
        type: "spring",
        stiffness: 100
      }}
      whileHover={{ 
        y: -10, 
        transition: { duration: 0.3 }
      }}
      className="relative group"
    >
      {/* Cyber glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
      
      {/* Main card */}
      <div className="relative bg-gray-900/80 backdrop-blur-sm border border-cyan-500/30 rounded-2xl p-6 hover:border-cyan-400/50 transition-all duration-500 shadow-lg shadow-cyan-500/10">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <motion.h3 
            className="text-2xl font-bold text-cyan-100 font-mono"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.2 + 0.5 }}
          >
            COMBO {String(index + 1).padStart(2, '0')}
          </motion.h3>
          <TasteBadge taste={tasteProfile} />
        </div>

        {/* Items */}
        <div className="space-y-4 mb-6">
          {[
            { item: main, category: 'main' },
            { item: side, category: 'side' },
            { item: drink, category: 'drink' }
          ].map(({ item, category }, itemIndex) => {
            const categoryInfo = getCategoryInfo(category);
            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 + itemIndex * 0.1 + 0.6 }}
                className={`bg-gradient-to-r ${categoryInfo.bg} border ${categoryInfo.border} rounded-xl p-4 hover:scale-105 transition-transform duration-300`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{categoryInfo.icon}</span>
                  <div className="flex-1">
                    <h4 className={`font-semibold ${categoryInfo.text} capitalize`}>
                      {category}
                    </h4>
                    <p className="text-gray-300 font-medium">{item.item_name}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm">
                      <span className="text-gray-400">{item.calories} cal</span>
                      <span className="text-gray-400">★ {(item.popularity_score * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Stats */}
        <div className="space-y-4">
          {/* Calories */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-cyan-300">Total Calories</span>
              <span className={`text-lg font-bold ${getCalorieColor(totalCalories)}`}>
                {totalCalories}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <motion.div
                className={`h-2 rounded-full bg-gradient-to-r ${getCalorieGradient(totalCalories)}`}
                initial={{ width: 0 }}
                animate={{ width: `${calorieProgress}%` }}
                transition={{ duration: 1, delay: index * 0.2 + 1 }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>550 cal</span>
              <span>800 cal</span>
            </div>
          </div>

          {/* Popularity */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-cyan-300">Popularity Score</span>
              <span className="text-lg font-bold text-cyan-400">
                {(popularityRange.max * 100).toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <motion.div
                className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-purple-400"
                initial={{ width: 0 }}
                animate={{ width: `${popularityProgress}%` }}
                transition={{ duration: 1, delay: index * 0.2 + 1.2 }}
              />
            </div>
          </div>
        </div>

        {/* Range indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.2 + 1.5 }}
          className="mt-4 text-center"
        >
          <span className="text-xs text-gray-400">
            Range: {(popularityRange.min * 100).toFixed(0)}% - {(popularityRange.max * 100).toFixed(0)}%
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ComboCard;
