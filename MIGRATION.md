# 🔄 Migration Guide: JSON to API Architecture

## Overview

This document outlines the transformation of the Combo Generator from a static JSON-based system to a dynamic API-driven architecture.

## 📋 What Changed

### 🔧 Architecture Changes

| Component | Before (JSON) | After (API) |
|-----------|---------------|-------------|
| **Data Source** | Static `menu.json` import | RESTful API endpoints |
| **Generation Logic** | Frontend-only | Backend API + Frontend fallback |
| **Error Handling** | Basic try-catch | Comprehensive API error handling |
| **State Management** | Simple React state | API state + connection monitoring |
| **Offline Support** | None | Graceful fallback to local data |

### 🆕 New Features

1. **API Server** (`server.js`)
   - Express.js backend with menu data
   - RESTful endpoints for all operations
   - CORS enabled for cross-origin requests
   - Comprehensive error handling

2. **API Service Layer** (`src/services/api.js`)
   - Centralized API communication
   - Error handling with custom ApiError class
   - Automatic retries and fallback logic

3. **Connection Monitoring**
   - Real-time API status indicator
   - Periodic health checks (every 30 seconds)
   - Visual feedback for connection state

4. **Enhanced Error Handling**
   - API-specific error messages
   - Graceful degradation to offline mode
   - User-friendly error notifications

## 🔄 Key Code Changes

### Frontend Changes

#### Before: Direct JSON Import
```javascript
import menuData from '../assets/menu.json';

const menu = {
  main: menuData.filter(item => item.category === 'main'),
  side: menuData.filter(item => item.category === 'side'),
  drink: menuData.filter(item => item.category === 'drink')
};
```

#### After: API Service
```javascript
import { menuApi, ApiError } from '../services/api';

// Load menu data from API
const initializeData = async () => {
  try {
    const items = await menuApi.getAllItems();
    setMenuData(items);
    setApiStatus('online');
  } catch (error) {
    setApiStatus('offline');
    // Fallback to local data
  }
};
```

#### Before: Local Generation Only
```javascript
const generateCombos = async () => {
  // Direct local generation logic
  const combo = generateSingleCombo(usedItems);
  setCombos([combo]);
};
```

#### After: API-First with Fallback
```javascript
const generateCombos = async () => {
  try {
    if (apiStatus === 'online') {
      // Use API for generation
      const weeklyData = await menuApi.generateWeeklyCombos(viewMode, selectedDay, usedItems);
      // Process API response
    } else {
      // Fallback to local generation
      await generateCombosLocally();
    }
  } catch (err) {
    // Handle API errors with fallback
  }
};
```

### Backend Implementation

#### New API Server (`server.js`)
```javascript
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// API endpoints
app.get('/api/menu', (req, res) => {
  res.json(menuItems);
});

app.post('/api/combos/weekly', (req, res) => {
  // Server-side combo generation
});
```

## 🛠️ Installation Changes

### New Dependencies
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
```

### New Scripts
```json
{
  "scripts": {
    "server": "node server.js",
    "dev:full": "concurrently \"npm run server\" \"npm run dev\""
  }
}
```

### Environment Configuration
```env
# New .env file
VITE_API_URL=http://localhost:3001/api
VITE_NODE_ENV=development
```

## 🚀 New Usage Patterns

### Development Workflow

#### Before
```bash
npm run dev  # Only frontend
```

#### After
```bash
# Option A: Both servers together
npm run dev:full

# Option B: Separate terminals
npm run server  # Terminal 1 - API
npm run dev     # Terminal 2 - Frontend
```

### API Testing
```bash
# Health check
curl http://localhost:3001/api/health

# Get menu items
curl http://localhost:3001/api/menu

# Generate combos
curl -X POST http://localhost:3001/api/combos/weekly \
  -H "Content-Type: application/json" \
  -d '{"viewMode": "rolling", "selectedDay": "Monday"}'
```

## 🎯 Benefits of API Architecture

### 🔒 Separation of Concerns
- **Frontend**: UI/UX and user interactions
- **Backend**: Business logic and data management
- **Clear boundaries**: Well-defined API contracts

### 📈 Scalability
- **Horizontal scaling**: API server can be scaled independently
- **Multiple clients**: Mobile app, web app, etc. can use same API
- **Database ready**: Easy to add persistent storage

### 🛡️ Error Resilience
- **Graceful degradation**: Works offline when API is down
- **Better error handling**: Specific error messages and recovery
- **User experience**: Clear status indicators and feedback

### 🔧 Maintainability
- **Code organization**: Clean separation of frontend/backend
- **Testing**: API endpoints can be tested independently
- **Documentation**: Clear API documentation and examples

## 🚨 Breaking Changes

### Import Changes
```javascript
// OLD - Direct import
import menuData from '../assets/menu.json';

// NEW - API service
import { menuApi } from '../services/api';
```

### State Management
```javascript
// OLD - Simple state
const [combos, setCombos] = useState([]);

// NEW - Enhanced state
const [menuData, setMenuData] = useState([]);
const [apiStatus, setApiStatus] = useState('checking');
const [isLoading, setIsLoading] = useState(true);
```

### Component Lifecycle
```javascript
// NEW - API initialization
useEffect(() => {
  const initializeData = async () => {
    // API connection and data loading
  };
  initializeData();
}, []);
```

## 🔮 Migration Benefits

1. **Future-Ready**: Easy to add database, authentication, etc.
2. **Better Testing**: API endpoints can be tested independently
3. **Performance**: Server-side generation can be optimized
4. **Flexibility**: Multiple clients can use the same API
5. **Monitoring**: API health checks and status monitoring
6. **Error Handling**: Comprehensive error recovery strategies

## 📝 Migration Checklist

- ✅ API server implemented with Express.js
- ✅ API service layer created for frontend
- ✅ Error handling and fallback mechanisms
- ✅ Connection status monitoring
- ✅ Environment configuration
- ✅ Updated scripts and dependencies
- ✅ Comprehensive documentation
- ✅ Backward compatibility maintained

## 🎉 Result

The application now features a robust, scalable architecture while maintaining all existing functionality and adding new capabilities like offline support and real-time status monitoring.

---

**Ready to explore the new API-powered Combo Generator!** 🚀
