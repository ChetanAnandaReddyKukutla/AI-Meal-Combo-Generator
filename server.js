import express from 'express';
import cors from 'cors';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Menu data (moved from JSON file)
const menuItems = [
  {
    "item_name": "Paneer Butter Masala",
    "category": "main",
    "calories": 450,
    "taste_profile": "spicy",
    "popularity_score": 0.9
  },
  {
    "item_name": "Chicken Biryani",
    "category": "main",
    "calories": 600,
    "taste_profile": "spicy",
    "popularity_score": 0.95
  },
  {
    "item_name": "Vegetable Pulao",
    "category": "main",
    "calories": 400,
    "taste_profile": "savory",
    "popularity_score": 0.7
  },
  {
    "item_name": "Rajma Chawal",
    "category": "main",
    "calories": 500,
    "taste_profile": "savory",
    "popularity_score": 0.8
  },
  {
    "item_name": "Chole Bhature",
    "category": "main",
    "calories": 650,
    "taste_profile": "spicy",
    "popularity_score": 0.85
  },
  {
    "item_name": "Masala Dosa",
    "category": "main",
    "calories": 480,
    "taste_profile": "savory",
    "popularity_score": 0.88
  },
  {
    "item_name": "Grilled Sandwich",
    "category": "main",
    "calories": 370,
    "taste_profile": "savory",
    "popularity_score": 0.6
  },
  {
    "item_name": "Garlic Naan",
    "category": "side",
    "calories": 200,
    "taste_profile": "savory",
    "popularity_score": 0.9
  },
  {
    "item_name": "Mixed Veg Salad",
    "category": "side",
    "calories": 150,
    "taste_profile": "sweet",
    "popularity_score": 0.75
  },
  {
    "item_name": "French Fries",
    "category": "side",
    "calories": 350,
    "taste_profile": "savory",
    "popularity_score": 0.8
  },
  {
    "item_name": "Curd Rice",
    "category": "side",
    "calories": 250,
    "taste_profile": "savory",
    "popularity_score": 0.7
  },
  {
    "item_name": "Papad",
    "category": "side",
    "calories": 100,
    "taste_profile": "savory",
    "popularity_score": 0.65
  },
  {
    "item_name": "Paneer Tikka",
    "category": "side",
    "calories": 300,
    "taste_profile": "spicy",
    "popularity_score": 0.85
  },
  {
    "item_name": "Masala Chaas",
    "category": "drink",
    "calories": 100,
    "taste_profile": "spicy",
    "popularity_score": 0.8
  },
  {
    "item_name": "Sweet Lassi",
    "category": "drink",
    "calories": 220,
    "taste_profile": "sweet",
    "popularity_score": 0.9
  },
  {
    "item_name": "Lemon Soda",
    "category": "drink",
    "calories": 90,
    "taste_profile": "savory",
    "popularity_score": 0.7
  },
  {
    "item_name": "Cold Coffee",
    "category": "drink",
    "calories": 180,
    "taste_profile": "sweet",
    "popularity_score": 0.75
  },
  {
    "item_name": "Coconut Water",
    "category": "drink",
    "calories": 60,
    "taste_profile": "sweet",
    "popularity_score": 0.6
  },
  {
    "item_name": "Iced Tea",
    "category": "drink",
    "calories": 120,
    "taste_profile": "sweet",
    "popularity_score": 0.78
  }
];

// Helper functions
const calculateTasteProfile = (main, side, drink) => {
  const tastes = [main.taste_profile, side.taste_profile, drink.taste_profile];
  const counts = tastes.reduce((acc, taste) => {
    acc[taste] = (acc[taste] || 0) + 1;
    return acc;
  }, {});
  
  return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
};

const generateSingleCombo = (usedItems = new Set()) => {
  const menu = {
    main: menuItems.filter(item => item.category === 'main'),
    side: menuItems.filter(item => item.category === 'side'),
    drink: menuItems.filter(item => item.category === 'drink')
  };

  for (let attempt = 0; attempt < 1000; attempt++) {
    const availableMain = menu.main.filter(item => !usedItems.has(item.item_name));
    const availableSide = menu.side.filter(item => !usedItems.has(item.item_name));
    const availableDrink = menu.drink.filter(item => !usedItems.has(item.item_name));

    if (availableMain.length === 0 || availableSide.length === 0 || availableDrink.length === 0) {
      return null;
    }

    const main = availableMain[Math.floor(Math.random() * availableMain.length)];
    const side = availableSide[Math.floor(Math.random() * availableSide.length)];
    const drink = availableDrink[Math.floor(Math.random() * availableDrink.length)];

    const totalCalories = main.calories + side.calories + drink.calories;
    
    if (totalCalories >= 550 && totalCalories <= 800) {
      const popularityScores = [main.popularity_score, side.popularity_score, drink.popularity_score];
      const minScore = Math.min(...popularityScores);
      const maxScore = Math.max(...popularityScores);
      
      if (maxScore - minScore <= 0.15) {
        usedItems.add(main.item_name);
        usedItems.add(side.item_name);
        usedItems.add(drink.item_name);

        const tasteProfile = calculateTasteProfile(main, side, drink);
        
        return {
          main,
          side,
          drink,
          totalCalories,
          tasteProfile,
          popularityRange: {
            min: minScore,
            max: maxScore
          }
        };
      }
    }
  }

  return null;
};

// API Routes

// Get all menu items
app.get('/api/menu', (req, res) => {
  try {
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
});

// Get menu items by category
app.get('/api/menu/:category', (req, res) => {
  try {
    const { category } = req.params;
    const filteredItems = menuItems.filter(item => item.category === category);
    res.json(filteredItems);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch menu items by category' });
  }
});

// Generate a single combo
app.post('/api/combo/generate', (req, res) => {
  try {
    const { usedItems = [] } = req.body;
    const usedItemsSet = new Set(usedItems);
    
    const combo = generateSingleCombo(usedItemsSet);
    
    if (!combo) {
      return res.status(400).json({ error: 'Could not generate a valid combo with current constraints' });
    }
    
    res.json(combo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate combo' });
  }
});

// Generate multiple combos
app.post('/api/combos/generate', (req, res) => {
  try {
    const { count = 3, usedItems = [] } = req.body;
    const usedItemsSet = new Set(usedItems);
    const combos = [];
    
    for (let i = 0; i < count; i++) {
      const combo = generateSingleCombo(usedItemsSet);
      if (combo) {
        combos.push(combo);
      } else {
        return res.status(400).json({ 
          error: `Could not generate combo ${i + 1} of ${count}. Please try with fewer combos or clear history.` 
        });
      }
    }
    
    res.json(combos);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate combos' });
  }
});

// Generate weekly combos
app.post('/api/combos/weekly', (req, res) => {
  try {
    const { viewMode = 'rolling', selectedDay = 'Monday', usedItems = [] } = req.body;
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const usedItemsSet = new Set(usedItems);
    
    let weeklyCombos = [];
    
    if (viewMode === 'full-week') {
      // Generate for entire week
      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const dayCombos = [];
        const dayUsedItems = new Set();
        
        for (let comboIndex = 0; comboIndex < 3; comboIndex++) {
          const combo = generateSingleCombo(dayUsedItems);
          if (combo) {
            combo.dayIndex = dayIndex;
            combo.day = daysOfWeek[dayIndex];
            dayCombos.push(combo);
          }
        }
        
        weeklyCombos.push({
          day: daysOfWeek[dayIndex],
          dayIndex: dayIndex,
          combos: dayCombos
        });
      }
    } else {
      // Rolling 3-day view
      const selectedDayIndex = daysOfWeek.indexOf(selectedDay);
      const displayedDays = [
        (selectedDayIndex + 0) % 7,
        (selectedDayIndex + 1) % 7,
        (selectedDayIndex + 2) % 7
      ];
      
      for (const dayIndex of displayedDays) {
        const dayCombos = [];
        const dayUsedItems = new Set();
        
        for (let comboIndex = 0; comboIndex < 3; comboIndex++) {
          const combo = generateSingleCombo(dayUsedItems);
          if (combo) {
            combo.dayIndex = dayIndex;
            combo.day = daysOfWeek[dayIndex];
            dayCombos.push(combo);
          }
        }
        
        weeklyCombos.push({
          day: daysOfWeek[dayIndex],
          dayIndex: dayIndex,
          combos: dayCombos
        });
      }
    }
    
    const weeklyData = {
      generatedAt: new Date().toISOString(),
      viewMode: viewMode,
      selectedDay: selectedDay,
      totalCombos: weeklyCombos.reduce((total, day) => total + day.combos.length, 0),
      weeklyPlan: weeklyCombos
    };
    
    res.json(weeklyData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate weekly combos' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Combo Generator API Server running on port ${PORT}`);
  console.log(`📋 Available endpoints:`);
  console.log(`   GET  /api/health - Health check`);
  console.log(`   GET  /api/menu - Get all menu items`);
  console.log(`   GET  /api/menu/:category - Get menu items by category`);
  console.log(`   POST /api/combo/generate - Generate single combo`);
  console.log(`   POST /api/combos/generate - Generate multiple combos`);
  console.log(`   POST /api/combos/weekly - Generate weekly combos`);
});
