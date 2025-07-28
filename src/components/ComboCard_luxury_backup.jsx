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
        return { icon: '🍛', bg: 'from-accent/15 to-accent/20', border: 'border-accent/30', text: 'text-accent-secondary' };
      case 'side':
        return { icon: '🥗', bg: 'from-accent-secondary/15 to-accent-secondary/20', border: 'border-accent-secondary/30', text: 'text-accent' };
      case 'drink':
        return { icon: '🥤', bg: 'from-taste-neutral/15 to-taste-neutral/20', border: 'border-taste-neutral/30', text: 'text-taste-neutral' };
      default:
        return { icon: '🍽️', bg: 'from-card/60 to-card/80', border: 'border-text/20', text: 'text-text' };
    }
  };

  const getCalorieColor = (calories) => {
    if (calories <= 600) return 'text-accent-secondary';
    if (calories <= 700) return 'text-taste-sweet';
    return 'text-taste-spicy';
  };

  const getCalorieGradient = (calories) => {
    if (calories <= 600) return 'from-accent-secondary to-accent';
    if (calories <= 700) return 'from-taste-sweet to-accent-secondary';
    return 'from-taste-spicy to-taste-sweet';
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
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-accent/10 via-accent-secondary/10 to-accent/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
      
      {/* Main card */}
      <div className="relative glass-card rounded-2xl p-6 border border-accent/10 backdrop-blur-xl hover:border-accent/20 transition-all duration-500 luxury-glow">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <motion.h3 
            className="text-2xl font-heading font-bold text-text-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.2 + 0.5 }}
          >
            COMBO {String(index + 1).padStart(2, '0')}
          </motion.h3>
          
          <div className="flex items-center space-x-3">
            <motion.div
              className={`text-2xl font-bold ${getCalorieColor(totalCalories)}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.2 + 0.7, type: "spring" }}
            >
              {totalCalories}
            </motion.div>
            <span className="text-text text-sm font-medium font-body">CAL</span>
          </div>
        </div>

        {/* Calorie Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-text/70 mb-2 font-body">
            <span>CALORIE RANGE</span>
            <span>550-800</span>
          </div>
          <div className="h-2 bg-card rounded-full overflow-hidden border border-accent/20">
            <motion.div
              className={`h-full bg-gradient-to-r ${getCalorieGradient(totalCalories)} rounded-full`}
              initial={{ width: 0 }}
              animate={{ width: `${calorieProgress}%` }}
              transition={{ duration: 1.2, delay: index * 0.2 + 0.5 }}
            />
          </div>
        </div>

        {/* Food Items */}
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
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 + itemIndex * 0.1 + 0.8 }}
                className={`flex items-center space-x-4 p-4 rounded-xl bg-gradient-to-r ${categoryInfo.bg} border ${categoryInfo.border} backdrop-blur-sm`}
              >
                <motion.span
                  className="text-3xl"
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {categoryInfo.icon}
                </motion.span>
                <div className="flex-1">
                  <p className="font-semibold text-text-light text-lg font-body">{item.item_name}</p>
                  <p className="text-text/80 text-sm font-body">
                    {item.calories} cal • {category.charAt(0).toUpperCase() + category.slice(1)}
                  </p>
                </div>
                <div className="text-right">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent/20 to-accent-secondary/20 flex items-center justify-center border border-accent/20">
                    <span className={`text-xs font-bold font-body ${categoryInfo.text}`}>
                      {Math.round(item.popularity_score * 100)}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Popularity Progress Ring */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-text/70 mb-3 font-body">
            <span>POPULARITY SCORE</span>
            <span>{popularityRange.min.toFixed(2)} - {popularityRange.max.toFixed(2)}</span>
          </div>
          <div className="relative">
            <div className="h-3 bg-card rounded-full overflow-hidden border border-accent/20">
              <motion.div
                className="h-full bg-gradient-to-r from-accent to-accent-secondary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${popularityProgress}%` }}
                transition={{ duration: 1.5, delay: index * 0.2 + 1 }}
              />
            </div>
          </div>
        </div>

        {/* Taste Badge */}
        <div className="flex justify-center">
          <TasteBadge taste={tasteProfile} />
        </div>

        {/* Luxury decoration */}
        <div className="absolute top-4 right-4 w-2 h-2 bg-accent rounded-full animate-pulse"></div>
        <div className="absolute bottom-4 left-4 w-1 h-1 bg-accent-secondary rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>
    </motion.div>
  );
};

export default ComboCard;
