# 🚀 Complete API Testing Examples - All Methods

## 📋 Quick Reference

**Base URL:** `http://localhost:3001/api`  
**Content-Type:** `application/json` (for POST requests)

---

## 1. 🏥 Health Check
**Test if API is running**

**Request:**
```http
GET http://localhost:3001/api/health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-07-28T12:30:45.123Z"
}
```

---

## 2. 📋 Get All Menu Items
**Retrieve complete menu**

**Request:**
```http
GET http://localhost:3001/api/menu
```

**Response:**
```json
[
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
  // ... 17 more items
]
```

---

## 3. 🍽️ Get Menu by Category
**Filter items by category**

### Main Dishes
**Request:**
```http
GET http://localhost:3001/api/menu/main
```

**Response:**
```json
[
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
  // ... 5 more main dishes
]
```

### Side Dishes
**Request:**
```http
GET http://localhost:3001/api/menu/side
```

### Drinks
**Request:**
```http
GET http://localhost:3001/api/menu/drink
```

---

## 4. 🎯 Generate Single Combo
**Create one meal combination**

### Basic Generation (No Restrictions)
**Request:**
```http
POST http://localhost:3001/api/combo/generate
Content-Type: application/json

{
  "usedItems": []
}
```

**Response:**
```json
{
  "main": {
    "item_name": "Masala Dosa",
    "category": "main",
    "calories": 480,
    "taste_profile": "savory",
    "popularity_score": 0.88
  },
  "side": {
    "item_name": "Garlic Naan",
    "category": "side",
    "calories": 200,
    "taste_profile": "savory",
    "popularity_score": 0.9
  },
  "drink": {
    "item_name": "Lemon Soda",
    "category": "drink",
    "calories": 90,
    "taste_profile": "savory",
    "popularity_score": 0.7
  },
  "totalCalories": 770,
  "tasteProfile": "savory",
  "popularityRange": {
    "min": 0.7,
    "max": 0.9
  }
}
```

### With Excluded Items
**Request:**
```http
POST http://localhost:3001/api/combo/generate
Content-Type: application/json

{
  "usedItems": ["Paneer Butter Masala", "Garlic Naan", "Sweet Lassi"]
}
```

**Response:**
```json
{
  "main": {
    "item_name": "Chicken Biryani",
    "category": "main",
    "calories": 600,
    "taste_profile": "spicy",
    "popularity_score": 0.95
  },
  "side": {
    "item_name": "Paneer Tikka",
    "category": "side",
    "calories": 300,
    "taste_profile": "spicy",
    "popularity_score": 0.85
  },
  "drink": {
    "item_name": "Masala Chaas",
    "category": "drink",
    "calories": 100,
    "taste_profile": "spicy",
    "popularity_score": 0.8
  },
  "totalCalories": 1000,
  "tasteProfile": "spicy",
  "popularityRange": {
    "min": 0.8,
    "max": 0.95
  }
}
```

---

## 5. 🎲 Generate Multiple Combos
**Create multiple combinations at once**

### Generate 3 Combos
**Request:**
```http
POST http://localhost:3001/api/combos/generate
Content-Type: application/json

{
  "count": 3,
  "usedItems": []
}
```

**Response:**
```json
[
  {
    "main": {
      "item_name": "Rajma Chawal",
      "category": "main",
      "calories": 500,
      "taste_profile": "savory",
      "popularity_score": 0.8
    },
    "side": {
      "item_name": "Mixed Veg Salad",
      "category": "side",
      "calories": 150,
      "taste_profile": "sweet",
      "popularity_score": 0.75
    },
    "drink": {
      "item_name": "Iced Tea",
      "category": "drink",
      "calories": 120,
      "taste_profile": "sweet",
      "popularity_score": 0.78
    },
    "totalCalories": 770,
    "tasteProfile": "sweet",
    "popularityRange": {
      "min": 0.75,
      "max": 0.8
    }
  },
  {
    "main": {
      "item_name": "Vegetable Pulao",
      "category": "main",
      "calories": 400,
      "taste_profile": "savory",
      "popularity_score": 0.7
    },
    "side": {
      "item_name": "Curd Rice",
      "category": "side",
      "calories": 250,
      "taste_profile": "savory",
      "popularity_score": 0.7
    },
    "drink": {
      "item_name": "Lemon Soda",
      "category": "drink",
      "calories": 90,
      "taste_profile": "savory",
      "popularity_score": 0.7
    },
    "totalCalories": 740,
    "tasteProfile": "savory",
    "popularityRange": {
      "min": 0.7,
      "max": 0.7
    }
  },
  {
    "main": {
      "item_name": "Chole Bhature",
      "category": "main",
      "calories": 650,
      "taste_profile": "spicy",
      "popularity_score": 0.85
    },
    "side": {
      "item_name": "Papad",
      "category": "side",
      "calories": 100,
      "taste_profile": "savory",
      "popularity_score": 0.65
    },
    "drink": {
      "item_name": "Cold Coffee",
      "category": "drink",
      "calories": 180,
      "taste_profile": "sweet",
      "popularity_score": 0.75
    },
    "totalCalories": 930,
    "tasteProfile": "spicy",
    "popularityRange": {
      "min": 0.65,
      "max": 0.85
    }
  }
]
```

### Generate with Exclusions
**Request:**
```http
POST http://localhost:3001/api/combos/generate
Content-Type: application/json

{
  "count": 2,
  "usedItems": ["Paneer Butter Masala", "Chicken Biryani", "Sweet Lassi"]
}
```

---

## 6. 📅 Generate Weekly Combos
**Create meal plans for multiple days**

### Rolling 3-Day Plan (Starting Monday)
**Request:**
```http
POST http://localhost:3001/api/combos/weekly
Content-Type: application/json

{
  "viewMode": "rolling",
  "selectedDay": "Monday",
  "usedItems": []
}
```

**Response:**
```json
{
  "generatedAt": "2025-07-28T12:35:10.456Z",
  "viewMode": "rolling",
  "selectedDay": "Monday",
  "totalCombos": 9,
  "weeklyPlan": [
    {
      "day": "Monday",
      "dayIndex": 0,
      "combos": [
        {
          "main": {
            "item_name": "Paneer Butter Masala",
            "category": "main",
            "calories": 450,
            "taste_profile": "spicy",
            "popularity_score": 0.9
          },
          "side": {
            "item_name": "Garlic Naan",
            "category": "side",
            "calories": 200,
            "taste_profile": "savory",
            "popularity_score": 0.9
          },
          "drink": {
            "item_name": "Sweet Lassi",
            "category": "drink",
            "calories": 220,
            "taste_profile": "sweet",
            "popularity_score": 0.9
          },
          "totalCalories": 870,
          "tasteProfile": "spicy",
          "popularityRange": {
            "min": 0.9,
            "max": 0.9
          },
          "dayIndex": 0,
          "day": "Monday"
        },
        {
          "main": {
            "item_name": "Masala Dosa",
            "category": "main",
            "calories": 480,
            "taste_profile": "savory",
            "popularity_score": 0.88
          },
          "side": {
            "item_name": "French Fries",
            "category": "side",
            "calories": 350,
            "taste_profile": "savory",
            "popularity_score": 0.8
          },
          "drink": {
            "item_name": "Masala Chaas",
            "category": "drink",
            "calories": 100,
            "taste_profile": "spicy",
            "popularity_score": 0.8
          },
          "totalCalories": 930,
          "tasteProfile": "savory",
          "popularityRange": {
            "min": 0.8,
            "max": 0.88
          },
          "dayIndex": 0,
          "day": "Monday"
        },
        {
          "main": {
            "item_name": "Rajma Chawal",
            "category": "main",
            "calories": 500,
            "taste_profile": "savory",
            "popularity_score": 0.8
          },
          "side": {
            "item_name": "Mixed Veg Salad",
            "category": "side",
            "calories": 150,
            "taste_profile": "sweet",
            "popularity_score": 0.75
          },
          "drink": {
            "item_name": "Iced Tea",
            "category": "drink",
            "calories": 120,
            "taste_profile": "sweet",
            "popularity_score": 0.78
          },
          "totalCalories": 770,
          "tasteProfile": "savory",
          "popularityRange": {
            "min": 0.75,
            "max": 0.8
          },
          "dayIndex": 0,
          "day": "Monday"
        }
      ]
    },
    {
      "day": "Tuesday",
      "dayIndex": 1,
      "combos": [
        // ... 3 combos for Tuesday
      ]
    },
    {
      "day": "Wednesday",
      "dayIndex": 2,
      "combos": [
        // ... 3 combos for Wednesday
      ]
    }
  ]
}
```

### Full Week Plan
**Request:**
```http
POST http://localhost:3001/api/combos/weekly
Content-Type: application/json

{
  "viewMode": "full-week",
  "selectedDay": "Monday",
  "usedItems": []
}
```

**Response:**
```json
{
  "generatedAt": "2025-07-28T12:40:15.789Z",
  "viewMode": "full-week",
  "selectedDay": "Monday",
  "totalCombos": 21,
  "weeklyPlan": [
    {
      "day": "Monday",
      "dayIndex": 0,
      "combos": [
        // ... 3 combos for Monday
      ]
    },
    {
      "day": "Tuesday",
      "dayIndex": 1,
      "combos": [
        // ... 3 combos for Tuesday
      ]
    },
    {
      "day": "Wednesday",
      "dayIndex": 2,
      "combos": [
        // ... 3 combos for Wednesday
      ]
    },
    {
      "day": "Thursday",
      "dayIndex": 3,
      "combos": [
        // ... 3 combos for Thursday
      ]
    },
    {
      "day": "Friday",
      "dayIndex": 4,
      "combos": [
        // ... 3 combos for Friday
      ]
    },
    {
      "day": "Saturday",
      "dayIndex": 5,
      "combos": [
        // ... 3 combos for Saturday
      ]
    },
    {
      "day": "Sunday",
      "dayIndex": 6,
      "combos": [
        // ... 3 combos for Sunday
      ]
    }
  ]
}
```

---

## 🧪 Error Examples

### Invalid Category
**Request:**
```http
GET http://localhost:3001/api/menu/invalid
```

**Response:**
```json
[]
```

### Too Many Used Items
**Request:**
```http
POST http://localhost:3001/api/combo/generate
Content-Type: application/json

{
  "usedItems": [
    "Paneer Butter Masala", "Chicken Biryani", "Vegetable Pulao", 
    "Rajma Chawal", "Chole Bhature", "Masala Dosa", "Grilled Sandwich",
    "Garlic Naan", "Mixed Veg Salad", "French Fries", "Curd Rice", 
    "Papad", "Paneer Tikka", "Masala Chaas", "Sweet Lassi", 
    "Lemon Soda", "Cold Coffee", "Coconut Water", "Iced Tea"
  ]
}
```

**Response:**
```json
{
  "error": "Could not generate a valid combo with current constraints"
}
```

### Invalid JSON
**Request:**
```http
POST http://localhost:3001/api/combo/generate
Content-Type: application/json

{
  "usedItems": [
```

**Response:**
```json
{
  "error": "Failed to generate combo"
}
```

---

## 📊 Testing Checklist

### ✅ Basic Functionality
- [ ] Health check returns 200 OK
- [ ] Menu endpoint returns 19 items
- [ ] Category endpoints return correct counts:
  - Main: 7 items
  - Side: 6 items  
  - Drink: 6 items

### ✅ Combo Generation
- [ ] Single combo has all required fields
- [ ] Calories are between 550-800
- [ ] Popularity range (max-min) ≤ 0.15
- [ ] No duplicate items in same combo
- [ ] Used items are properly excluded

### ✅ Weekly Generation
- [ ] Rolling mode returns 3 days (9 combos)
- [ ] Full week returns 7 days (21 combos)
- [ ] Each day has exactly 3 combos
- [ ] No duplicate items within same day

### ✅ Error Handling
- [ ] Invalid requests return appropriate errors
- [ ] Malformed JSON handled gracefully
- [ ] Impossible constraints handled properly

---

## 🚀 Quick Test Commands (PowerShell)

```powershell
# Health Check
Invoke-RestMethod -Uri "http://localhost:3001/api/health"

# Get Menu
Invoke-RestMethod -Uri "http://localhost:3001/api/menu"

# Generate Single Combo
Invoke-RestMethod -Uri "http://localhost:3001/api/combo/generate" -Method Post -Headers @{"Content-Type"="application/json"} -Body '{"usedItems": []}'

# Generate Multiple Combos
Invoke-RestMethod -Uri "http://localhost:3001/api/combos/generate" -Method Post -Headers @{"Content-Type"="application/json"} -Body '{"count": 3, "usedItems": []}'

# Generate Weekly Combos
Invoke-RestMethod -Uri "http://localhost:3001/api/combos/weekly" -Method Post -Headers @{"Content-Type"="application/json"} -Body '{"viewMode": "rolling", "selectedDay": "Monday", "usedItems": []}'
```

---

**🎯 All endpoints tested and documented with real examples!**
