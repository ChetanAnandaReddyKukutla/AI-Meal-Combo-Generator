import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Trash2 } from 'lucide-react';
import Button from './Button';

const RollingHistory = ({ history, onClearHistory }) => {
  if (history.length === 0) return null;

  const groupedHistory = [];
  for (let i = 0; i < history.length; i += 3) {
    groupedHistory.push(history.slice(i, i + 3));
  }

  const getDayLabel = (dayIndex) => {
    const days = ['Today', 'Yesterday', '2 Days Ago'];
    return days[dayIndex] || `${dayIndex + 1} Days Ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="glass-card rounded-2xl p-8 mb-10 shadow-lg shadow-accent/10"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Clock className="w-6 h-6 text-accent" />
          <h3 className="text-2xl font-heading font-semibold text-text-light text-luxury">Culinary Archive</h3>
          <span className="px-3 py-1 bg-accent/20 text-accent rounded-full text-xs font-body font-medium tracking-wide">
            {history.length} Combos
          </span>
        </div>
        {history.length > 0 && (
          <motion.button
            onClick={onClearHistory}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 px-4 py-2 bg-spicy/20 text-spicy rounded-lg border border-spicy/40 hover:bg-spicy/30 transition-all duration-200 font-body"
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-sm">Clear</span>
          </motion.button>
        )}
      </div>

      <div className="space-y-6">
        <AnimatePresence>
          {groupedHistory.map((dayGroup, dayIndex) => (
            <motion.div
              key={dayIndex}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ delay: dayIndex * 0.1 }}
              className="border border-accent/20 rounded-xl p-6 glass-card"
            >
              <h4 className="text-lg font-heading font-medium text-accent mb-4 tracking-wide">
                {getDayLabel(dayIndex)}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {dayGroup.map((combo, comboIndex) => (
                  <motion.div
                    key={`${dayIndex}-${comboIndex}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: dayIndex * 0.1 + comboIndex * 0.05 }}
                    className="glass-card rounded-lg p-4 hover:border-accent/40 transition-colors"
                  >
                    <div className="space-y-3">
                      <div className="text-xs text-accent font-body font-medium tracking-wide">
                        Combo {comboIndex + 1}
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm text-text font-body">{combo.main.item_name}</div>
                        <div className="text-sm text-text font-body">{combo.side.item_name}</div>
                        <div className="text-sm text-text font-body">{combo.drink.item_name}</div>
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t border-accent/20">
                        <span className="text-xs text-accent-light font-body tracking-wide">
                          {combo.totalCalories} cal
                        </span>
                        <span className="text-xs text-accent font-body capitalize tracking-wide">
                          {combo.tasteProfile}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default RollingHistory;
