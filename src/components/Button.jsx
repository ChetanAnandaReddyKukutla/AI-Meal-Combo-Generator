import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ children, onClick, disabled, className, variant = 'primary' }) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return `bg-luxury hover:opacity-90 text-background shadow-lg shadow-accent/25 border border-accent/60`;
      case 'secondary':
        return `glass-card border border-accent/40 text-text hover:border-accent hover:shadow-accent/20`;
      case 'ghost':
        return `text-text hover:text-accent hover:bg-accent/10 border border-transparent hover:border-accent/30`;
      default:
        return `bg-luxury hover:opacity-90 text-background shadow-lg shadow-accent/25 border border-accent/60`;
    }
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`
        px-8 py-4 rounded-xl font-body font-medium transition-all duration-300 
        backdrop-blur-sm relative overflow-hidden group tracking-wide
        ${getVariantStyles()}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {/* Luxury glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/20 to-accent/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      
      {/* Content */}
      <span className="relative z-10 flex items-center justify-center space-x-2">
        {children}
      </span>
    </motion.button>
  );
};

export default Button;
