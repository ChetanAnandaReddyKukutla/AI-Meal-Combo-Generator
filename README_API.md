# 🍽️ AI Meal Combo Generator - API Edition

A sophisticated meal combination generator featuring a modern React frontend and robust Express.js API backend. Generate perfectly balanced meal combinations with intelligent algorithms, real-time API connectivity, and graceful offline fallback.

## 🚀 Architecture Overview

### 🎯 Frontend (React + Vite)
- **Framework**: React 18 with modern hooks
- **Build Tool**: Vite for lightning-fast development
- **Styling**: Tailwind CSS with custom luxury theme
- **Animations**: Framer Motion for buttery-smooth interactions
- **State Management**: React Hooks with optimistic updates

### 🔧 Backend (Express.js API)
- **Framework**: Express.js with ES modules
- **CORS**: Cross-origin resource sharing enabled
- **Data Layer**: In-memory storage (database-ready architecture)
- **API Design**: RESTful endpoints with comprehensive error handling

## ✨ Key Features

- ✅ **API-First Architecture**: Clean separation between frontend and backend
- ✅ **Offline-First Design**: Graceful degradation when API is unavailable
- ✅ **Real-time Status**: Live API connection monitoring with visual indicators
- ✅ **Intelligent Generation**: Advanced algorithms with nutritional and taste constraints
- ✅ **Mobile-First UI**: Responsive design with glass-morphism aesthetic
- ✅ **Error Resilience**: Comprehensive error handling with user-friendly messages
- ✅ **Performance Optimized**: Optimistic updates and smart caching strategies

## 📋 API Documentation

### Base URL: `http://localhost:3001/api`

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| `GET` | `/health` | API health check | None |
| `GET` | `/menu` | Get all menu items | None |
| `GET` | `/menu/:category` | Get items by category | None |
| `POST` | `/combo/generate` | Generate single combo | `{usedItems: string[]}` |
| `POST` | `/combos/generate` | Generate multiple combos | `{count: number, usedItems: string[]}` |
| `POST` | `/combos/weekly` | Generate weekly plan | `{viewMode: string, selectedDay: string, usedItems: string[]}` |

### Example API Usage

```bash
# Check API health
curl http://localhost:3001/api/health

# Fetch all menu items
curl http://localhost:3001/api/menu

# Generate a single combo
curl -X POST http://localhost:3001/api/combo/generate \
  -H "Content-Type: application/json" \
  -d '{"usedItems": []}'

# Generate weekly combos
curl -X POST http://localhost:3001/api/combos/weekly \
  -H "Content-Type: application/json" \
  -d '{
    "viewMode": "rolling", 
    "selectedDay": "Monday", 
    "usedItems": []
  }'
```

## 🛠️ Quick Start Guide

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Installation & Setup

1. **Clone and navigate to project**
   ```bash
   git clone <repository-url>
   cd Combo_Generator_app2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup** (`.env` file included)
   ```env
   VITE_API_URL=http://localhost:3001/api
   VITE_NODE_ENV=development
   ```

4. **Start the full application**
   ```bash
   # Option A: Start both servers together
   npm run dev:full
   
   # Option B: Start separately
   npm run server    # Terminal 1 - API Server (port 3001)
   npm run dev       # Terminal 2 - Frontend (port 5173+)
   ```

5. **Access the application**
   - Frontend: http://localhost:5173 (or assigned port)
   - API: http://localhost:3001

## 📜 Available Scripts

```json
{
  "dev": "vite",                    // Frontend development server
  "build": "vite build",            // Production build
  "server": "node server.js",       // API server
  "dev:full": "concurrently \"npm run server\" \"npm run dev\"", // Both servers
  "preview": "vite preview",        // Preview production build
  "lint": "eslint . --ext js,jsx"   // Code linting
}
```

## 🎯 User Guide

### Smart Features
- **View Modes**: Switch between 3-day rolling view and full week planning
- **API Status**: Real-time connection indicator (🟢 Online / 🔴 Offline)
- **Intelligent Constraints**: Auto-balances calories (550-800) and popularity scores
- **No Duplicates**: Prevents item repetition within sessions
- **Offline Continuity**: Seamless fallback to local generation when API is down

### Usage Flow
1. **Connection**: App automatically connects to API on startup
2. **Generation**: Click "Generate Combos" for new meal combinations
3. **Monitoring**: Watch API status indicator for connection health
4. **History**: Review and manage previous generations
5. **Flexibility**: Switch between rolling 3-day and full week views

## 📊 Data Structures

### Menu Item Schema
```json
{
  "item_name": "Paneer Butter Masala",
  "category": "main",           // main | side | drink
  "calories": 450,
  "taste_profile": "spicy",     // spicy | sweet | savory
  "popularity_score": 0.9       // 0.0 - 1.0
}
```

### Generated Combo Schema
```json
{
  "main": { /* menu item */ },
  "side": { /* menu item */ },
  "drink": { /* menu item */ },
  "totalCalories": 750,
  "tasteProfile": "spicy",      // dominant taste
  "popularityRange": {
    "min": 0.85,
    "max": 0.95
  },
  "day": "Monday",
  "dayIndex": 0
}
```

## 🚦 Error Handling & Resilience

### Frontend Resilience
- **API Failure**: Automatic fallback to local generation
- **Network Issues**: Graceful offline mode with visual indicators
- **Loading States**: Skeleton screens and progress indicators
- **User Feedback**: Toast notifications for all major actions

### Backend Robustness
- **Input Validation**: Comprehensive request validation
- **Error Responses**: Structured error messages with status codes
- **CORS Handling**: Proper cross-origin request management
- **Graceful Failures**: Meaningful error messages for debugging

## 🎨 UI/UX Features

### Design System
- **Glass Morphism**: Modern frosted glass aesthetic
- **Smooth Animations**: Framer Motion powered micro-interactions
- **Responsive Grid**: CSS Grid and Flexbox for all screen sizes
- **Dark Theme**: Elegant dark mode with accent colors
- **Loading States**: Engaging loading animations and skeletons

### Accessibility
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: Semantic HTML and ARIA labels
- **Color Contrast**: WCAG compliant color ratios
- **Focus Management**: Clear focus indicators and logical tab order

## 🧪 Testing & Development

### API Testing
```bash
# Test all endpoints
curl http://localhost:3001/api/health
curl http://localhost:3001/api/menu
curl http://localhost:3001/api/menu/main

# Test combo generation
curl -X POST http://localhost:3001/api/combo/generate \
  -H "Content-Type: application/json" \
  -d '{"usedItems": ["Paneer Butter Masala"]}'
```

### Development Workflow
1. Start API server: `npm run server`
2. Start frontend: `npm run dev`
3. Test endpoints using curl or Postman
4. Monitor console for real-time logs
5. Use browser DevTools for frontend debugging

## 🔮 Future Roadmap

### Near Term
- [ ] **Database Integration**: PostgreSQL/MongoDB for persistent storage
- [ ] **User Authentication**: JWT-based user accounts
- [ ] **Preferences**: Dietary restrictions and personal preferences
- [ ] **Caching**: Redis for improved API performance

### Long Term
- [ ] **AI Enhancement**: Machine learning for personalized recommendations
- [ ] **Social Features**: Share combos and community ratings
- [ ] **Recipe Integration**: Link to cooking instructions and videos
- [ ] **Nutritional Tracking**: Comprehensive nutrition analysis
- [ ] **Mobile App**: React Native companion app

## 📁 Project Structure

```
├── src/
│   ├── components/          # React components
│   │   ├── ComboCard.jsx   # Individual combo display
│   │   ├── ComboGenerator.jsx # Main application logic
│   │   └── ...
│   ├── services/           # API service layer
│   │   └── api.js         # API client with error handling
│   └── assets/            # Static assets and fallback data
├── server.js              # Express.js API server
├── .env                   # Environment configuration
├── package.json           # Dependencies and scripts
└── README.md             # This file
```

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Install dependencies (`npm install`)
4. Start development servers (`npm run dev:full`)
5. Make your changes
6. Test both API and frontend thoroughly
7. Commit changes (`git commit -m 'Add amazing feature'`)
8. Push to branch (`git push origin feature/amazing-feature`)
9. Create Pull Request

### Code Standards
- **ESLint**: Follow the configured linting rules
- **Prettier**: Use consistent code formatting
- **Comments**: Document complex logic and API integrations
- **Testing**: Ensure both API and frontend work correctly

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team**: For the excellent React framework
- **Tailwind CSS**: For the utility-first CSS framework
- **Framer Motion**: For beautiful animation capabilities
- **Express.js**: For the robust web framework
- **Vite**: For the blazing-fast build tool

---

**🚀 Built with passion using React, Express.js, and modern web technologies**

*Ready to generate some delicious meal combinations? Start both servers and enjoy!* 🍽️✨
