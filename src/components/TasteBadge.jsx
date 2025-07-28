import React from 'react';
import { motion } from 'framer-motion';

const TasteBadge = ({ taste }) => {
  const getBadgeStyles = (taste) => {
    const baseStyles = "px-4 py-2 rounded-full text-xs font-body font-medium border backdrop-blur-sm";
    
    switch (taste.toLowerCase()) {
      case 'spicy':
        return `${baseStyles} bg-spicy/20 text-spicy border-spicy/50 shadow-lg shadow-spicy/20`;
      case 'sweet':
        return `${baseStyles} bg-sweet/20 text-sweet border-sweet/50 shadow-lg shadow-sweet/20`;
      case 'savory':
        return `${baseStyles} bg-savory/20 text-savory border-savory/50 shadow-lg shadow-savory/20`;
      case 'mixed':
        return `${baseStyles} taste-gradient-mixed text-white border-accent/50 shadow-lg shadow-accent/20`;
      default:
        return `${baseStyles} bg-neutral/20 text-neutral border-neutral/50`;
    }
  };

  const getIcon = (taste) => {
    switch (taste.toLowerCase()) {
      case 'spicy':
        return '🌶️';
      case 'sweet':
        return '🍯';
      case 'savory':
        return '🥄';
      case 'mixed':
        return '🎨';
      default:
        return '🍽️';
    }
  };

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ 
        type: "spring", 
        stiffness: 200, 
        damping: 15,
        delay: 0.3 
      }}
      whileHover={{ 
        scale: 1.05,
        boxShadow: "0 0 25px rgba(191, 161, 129, 0.4)"
      }}
      className={getBadgeStyles(taste)}
    >
      <div className="flex items-center space-x-2">
        <span>{getIcon(taste)}</span>
        <span className="capitalize tracking-wide">{taste}</span>
      </div>
    </motion.div>
  );
};

export default TasteBadge;
