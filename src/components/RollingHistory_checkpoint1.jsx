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
      className="bg-gray-900/80 backdrop-blur-sm border border-cyan-500/30 rounded-2xl p-6 mb-8 shadow-lg shadow-cyan-500/20"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Clock className="w-5 h-5 text-cyan-400" />
          <h3 className="text-xl font-bold text-cyan-100 font-mono">MEMORY BANK</h3>
          <span className="px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-xs font-medium font-mono">
            {history.length} COMBOS
          </span>
        </div>
        {history.length > 0 && (
          <motion.button
            onClick={onClearHistory}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 px-3 py-2 bg-red-500/20 text-red-300 rounded-lg border border-red-500/40 hover:bg-red-500/30 transition-all duration-200"
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-sm font-mono">CLEAR</span>
          </motion.button>
        )}
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {groupedHistory.map((dayGroup, dayIndex) => (
            <motion.div
              key={dayIndex}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ delay: dayIndex * 0.1 }}
              className="border border-gray-700/50 rounded-xl p-4"
            >
              <h4 className="text-lg font-semibold text-cyan-300 mb-3 font-mono">
                {getDayLabel(dayIndex)}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {dayGroup.map((combo, comboIndex) => (
                  <motion.div
                    key={`${dayIndex}-${comboIndex}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: dayIndex * 0.1 + comboIndex * 0.05 }}
                    className="bg-gray-800/60 border border-cyan-500/20 rounded-lg p-3 hover:border-cyan-400/40 transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="text-xs text-cyan-300 font-mono">
                        COMBO {comboIndex + 1}
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm text-gray-300">{combo.main.item_name}</div>
                        <div className="text-sm text-gray-300">{combo.side.item_name}</div>
                        <div className="text-sm text-gray-300">{combo.drink.item_name}</div>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-gray-700">
                        <span className="text-xs text-cyan-400 font-mono">
                          {combo.totalCalories} CAL
                        </span>
                        <span className="text-xs text-purple-400 font-mono capitalize">
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
