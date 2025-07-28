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
        return { icon: '🍛', bg: 'from-accent/10 to-accent/20', border: 'border-accent/40', text: 'text-accent' };
      case 'side':
        return { icon: '🥗', bg: 'from-accent-light/10 to-accent-light/20', border: 'border-accent-light/40', text: 'text-accent-light' };
      case 'drink':
        return { icon: '🥤', bg: 'from-accent/15 to-accent-light/15', border: 'border-accent/50', text: 'text-text-light' };
      default:
        return { icon: '🍽️', bg: 'from-neutral/10 to-neutral/20', border: 'border-neutral/40', text: 'text-neutral' };
    }
  };

  const getCalorieColor = (calories) => {
    if (calories <= 600) return 'text-accent';
    if (calories <= 700) return 'text-accent-light';
    return 'text-spicy';
  };

  const getCalorieGradient = (calories) => {
    if (calories <= 600) return 'from-accent to-accent-light';
    if (calories <= 700) return 'from-accent-light to-accent';
    return 'from-spicy to-sweet';
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
      {/* Luxury glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-accent/10 via-accent-light/10 to-accent/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
      
      {/* Main card */}
      <div className="relative glass-card rounded-2xl p-8 hover:border-accent/60 transition-all duration-500 shadow-lg shadow-accent/10">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <motion.h3 
            className="text-2xl font-heading font-semibold text-text-light text-luxury"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.2 + 0.5 }}
          >
            Combo {String(index + 1).padStart(2, '0')}
          </motion.h3>
          <TasteBadge taste={tasteProfile} />
        </div>

        {/* Items */}
        <div className="space-y-5 mb-8">
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
                className={`bg-gradient-to-r ${categoryInfo.bg} border ${categoryInfo.border} rounded-xl p-5 hover:scale-105 transition-transform duration-300 backdrop-blur-sm`}
              >
                <div className="flex items-center space-x-4">
                  <span className="text-3xl">{categoryInfo.icon}</span>
                  <div className="flex-1">
                    <h4 className={`font-heading font-medium ${categoryInfo.text} capitalize tracking-wide`}>
                      {category}
                    </h4>
                    <p className="text-text font-body font-medium mt-1">{item.item_name}</p>
                    <div className="flex items-center space-x-6 mt-3 text-sm">
                      <span className="text-text opacity-70 font-body">{item.calories} cal</span>
                      <span className="text-accent font-body">★ {(item.popularity_score * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Stats */}
        <div className="space-y-6">
          {/* Calories */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-body font-medium text-accent">Total Calories</span>
              <span className={`text-xl font-heading font-semibold ${getCalorieColor(totalCalories)}`}>
                {totalCalories}
              </span>
            </div>
            <div className="w-full bg-card rounded-full h-3 border border-accent/20">
              <motion.div
                className={`h-3 rounded-full bg-gradient-to-r ${getCalorieGradient(totalCalories)} shadow-lg`}
                initial={{ width: 0 }}
                animate={{ width: `${calorieProgress}%` }}
                transition={{ duration: 1, delay: index * 0.2 + 1 }}
              />
            </div>
            <div className="flex justify-between text-xs text-text opacity-60 mt-2 font-body">
              <span>550 cal</span>
              <span>800 cal</span>
            </div>
          </div>

          {/* Popularity */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-body font-medium text-accent">Popularity Score</span>
              <span className="text-xl font-heading font-semibold text-accent-light">
                {(popularityRange.max * 100).toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-card rounded-full h-3 border border-accent/20">
              <motion.div
                className="h-3 rounded-full bg-gradient-to-r from-accent to-accent-light shadow-lg"
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
          className="mt-6 text-center"
        >
          <span className="text-xs text-text opacity-50 font-body tracking-wide">
            Range: {(popularityRange.min * 100).toFixed(0)}% - {(popularityRange.max * 100).toFixed(0)}%
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ComboCard;
