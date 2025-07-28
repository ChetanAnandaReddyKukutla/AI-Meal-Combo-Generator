# 🍽️ AI Meal Combo Generator

A sophisticated React application that generates perfectly balanced meal combinations using AI-driven algorithms. Built with React, Tailwind CSS, and Framer Motion for a beautiful, responsive user experience.

## 🖼️ Application Preview

![AI Meal Combo Generator Screenshot](screenshots/app-preview.png)

*Experience the elegant meal planning interface with intelligent combo generation, taste profiling, and nutritional balance.*

## ✨ Features

- **Smart Combo Generation**: Creates 3 unique meal combinations per day
- **Nutritional Balance**: Ensures each combo has 550-800 calories
- **Popularity Matching**: Maintains popularity scores within ±0.15 range
- **Taste Profiling**: Categorizes combos as spicy, sweet, savory, or mixed
- **3-Day Memory**: Prevents repeated combinations across rolling 3-day periods
- **Unique Items**: No item overlap within daily combo sets
- **Beautiful UI**: Animated cards with gradient backgrounds and smooth transitions
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

## 🛠️ Technology Stack

- **Frontend**: React 18 with functional components and hooks
- **Styling**: Tailwind CSS for responsive, utility-first design
- **Animations**: Framer Motion for smooth transitions and interactions
- **Icons**: Lucide React for modern, consistent iconography
- **Build Tool**: Vite for fast development and optimized builds

## 🚀 Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. **Clone or navigate to the project directory**:
   ```bash
   cd Combo_Generator_app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## 📊 Menu Data

The application uses a curated menu dataset with 19 items across three categories:

- **Main Courses** (7 items): Paneer Butter Masala, Chicken Biryani, Vegetable Pulao, etc.
- **Side Dishes** (6 items): Garlic Naan, Mixed Veg Salad, French Fries, etc.  
- **Beverages** (6 items): Sweet Lassi, Cold Coffee, Masala Chaas, etc.

Each item includes:
- Calorie count
- Taste profile (spicy, sweet, savory)
- Popularity score (0.0 - 1.0)

## 🧠 Algorithm Logic

### Combo Generation Constraints

1. **Calorie Range**: Total calories must be between 550-800
2. **Popularity Coherence**: All items must have popularity scores within ±0.15
3. **Uniqueness**: No item can appear in multiple combos on the same day
4. **Historical Memory**: No combo can repeat from the last 9 generated combos (3 days)
5. **Balance**: Each combo must contain exactly 1 main, 1 side, and 1 drink

### Taste Profile Logic

- **Single Profile**: If all 3 items share the same taste profile
- **Mixed Profile**: If items have different taste profiles

### Rolling Memory System

- Maintains the last 9 combos (3 days × 3 combos per day)
- Compares combos using canonical sorting (alphabetical by item name)
- Automatically purges older combos beyond 3-day window

## 🎨 User Interface

### Components

- **ComboGenerator**: Main logic and state management
- **ComboCard**: Individual combo display with animations
- **TasteBadge**: Colored badges for taste profiles

### Visual Features

- Gradient backgrounds with purple-to-blue theme
- Animated cards with staggered reveal timing
- Color-coded calorie indicators (green/yellow/red)
- Category-specific icons and backgrounds
- Responsive grid layout (1/2/3 columns based on screen size)

## 🔧 Project Structure

```
src/
├── App.jsx                 # Main application component
├── main.jsx               # React application entry point
├── index.css              # Global styles and Tailwind imports
├── components/
│   ├── ComboGenerator.jsx # Core logic and state management
│   ├── ComboCard.jsx      # Individual combo display
│   └── TasteBadge.jsx     # Taste profile badges
└── assets/
    └── menu.json          # Menu item database
```

## 🎯 Usage

1. **Launch the App**: Open the application in your browser
2. **Generate Combos**: Click the "Generate Combos" button
3. **View Results**: Browse through 3 unique meal combinations
4. **New Day**: Click again to simulate the next day with fresh combos
5. **Memory Tracking**: Notice how the app prevents repeats from previous days

## 📱 Responsive Design

- **Mobile**: Single column layout with touch-friendly buttons
- **Tablet**: Two-column grid for optimal space usage
- **Desktop**: Three-column layout showcasing all combos

## 🚨 Error Handling

The application includes robust error handling for:
- Insufficient valid combinations
- Memory constraint conflicts
- API-like processing delays (simulated)

## 🔮 Future Enhancements

- Dietary restriction filters (vegetarian, vegan, gluten-free)
- Custom calorie range selection
- Export combos to calendar or meal planning apps
- Nutritional macro tracking (protein, carbs, fats)
- User preference learning over time

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**Happy meal planning! 🍽️✨**
