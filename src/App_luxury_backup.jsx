import React from 'react';
import ComboGenerator from './components/ComboGenerator';

function App() {
  return (
    <div className="min-h-screen bg-luxury luxury-grid relative overflow-hidden">
      {/* Luxury floating particles background */}
      <div className="particles-luxury">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="particle-luxury"
            style={{
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${Math.random() * 4 + 6}s`
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <header className="text-center mb-12 pt-8">
          <h1 className="text-6xl md:text-7xl font-heading font-bold text-text-light mb-6 luxury-text">
            🍽️ AI MEAL CURATOR
          </h1>
          <p className="text-xl md:text-2xl text-text font-light mb-4">
            Exquisite Culinary Intelligence for the Discerning Palate
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-accent to-accent-secondary mx-auto rounded-full luxury-glow"></div>
        </header>
        
        <ComboGenerator />
      </div>

      {/* Subtle ambient light effects */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-secondary/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-card/10 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}

export default App;
