import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Trash2 } from 'lucide-react';

const RollingHistory = ({ history, onClear }) => {
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
      className="glass-dark rounded-2xl p-6 mb-8 border border-white/10"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Clock className="w-5 h-5 text-cyan-400" />
          <h3 className="text-xl font-bold text-white">Memory Bank</h3>
          <span className="px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-xs font-medium">
            {history.length} combos
          </span>
        </div>
        {history.length > 0 && (
          <motion.button
            onClick={onClear}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 px-3 py-2 bg-red-500/20 text-red-300 rounded-lg border border-red-500/30 hover:bg-red-500/30 transition-all duration-200"
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-sm">Clear</span>
          </motion.button>
        )}
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {groupedHistory.map((dayGroup, dayIndex) => (
            <motion.div
              key={dayIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: dayIndex * 0.1 }}
              className="bg-white/5 rounded-xl p-4 border border-white/5"
            >
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span className="text-sm font-medium text-gray-300">
                  {getDayLabel(dayIndex)}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {dayGroup.map((combo, comboIndex) => (
                  <div
                    key={`${dayIndex}-${comboIndex}`}
                    className="bg-white/5 rounded-lg p-3 border border-white/5"
                  >
                    <div className="text-xs text-gray-400 mb-2">
                      Combo {comboIndex + 1}
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-orange-300 truncate">
                        🍛 {combo.main.item_name}
                      </div>
                      <div className="text-sm text-green-300 truncate">
                        🥗 {combo.side.item_name}
                      </div>
                      <div className="text-sm text-blue-300 truncate">
                        🥤 {combo.drink.item_name}
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/10">
                      <span className="text-xs text-gray-400">
                        {combo.totalCalories} cal
                      </span>
                      <span className="text-xs text-gray-400 capitalize">
                        {combo.tasteProfile}
                      </span>
                    </div>
                  </div>
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
