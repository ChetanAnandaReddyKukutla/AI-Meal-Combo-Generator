import React from 'react';
import ComboGenerator from './components/ComboGenerator';

function App() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Elegant gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-background opacity-90"></div>

      {/* Floating luxury particles */}
      <div className="absolute inset-0">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-accent rounded-full animate-float opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              boxShadow: '0 0 8px rgba(191, 161, 129, 0.4)'
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Premium header */}
        <div className="text-center mb-16">
          <h1 className="font-heading text-7xl font-bold text-text-light mb-2 text-luxury">
            AI Meal Combo
          </h1>
          <h2 className="font-heading text-3xl font-medium text-accent mb-8">
            Generator
          </h2>
          <div className="flex justify-center items-center space-x-6 text-text opacity-80">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
              <span className="font-body text-sm tracking-wide">Premium Experience</span>
            </div>
            <div className="w-px h-4 bg-accent opacity-40"></div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-accent-light rounded-full animate-pulse"></div>
              <span className="font-body text-sm tracking-wide">AI Curated</span>
            </div>
          </div>
        </div>

        <ComboGenerator />
      </div>
    </div>
  );
}

export default App;
