import React from 'react';
import { motion } from 'framer-motion';

const TasteBadge = ({ taste }) => {
  const getBadgeStyles = (taste) => {
    const baseStyles = "px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-sm";
    
    switch (taste.toLowerCase()) {
      case 'spicy':
        return `${baseStyles} bg-red-500/20 text-red-300 border-red-400/50 shadow-red-500/20`;
      case 'sweet':
        return `${baseStyles} bg-pink-500/20 text-pink-300 border-pink-400/50 shadow-pink-500/20`;
      case 'savory':
        return `${baseStyles} bg-yellow-500/20 text-yellow-300 border-yellow-400/50 shadow-yellow-500/20`;
      case 'neutral':
        return `${baseStyles} bg-gray-500/20 text-gray-300 border-gray-400/50 shadow-gray-500/20`;
      case 'mixed':
        return `${baseStyles} bg-gradient-to-r from-red-500/20 via-pink-500/20 to-yellow-500/20 text-cyan-300 border-cyan-400/50 shadow-cyan-500/20`;
      default:
        return `${baseStyles} bg-gray-500/20 text-gray-300 border-gray-400/50`;
    }
  };

  const getIcon = (taste) => {
    switch (taste.toLowerCase()) {
      case 'spicy':
        return '🌶️';
      case 'sweet':
        return '🍯';
      case 'savory':
        return '🧄';
      case 'neutral':
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
        scale: 1.1,
        boxShadow: "0 0 20px rgba(0, 255, 255, 0.4)"
      }}
      className={getBadgeStyles(taste)}
    >
      <div className="flex items-center space-x-1">
        <span>{getIcon(taste)}</span>
        <span className="capitalize font-mono">{taste}</span>
      </div>
    </motion.div>
  );
};

export default TasteBadge;
