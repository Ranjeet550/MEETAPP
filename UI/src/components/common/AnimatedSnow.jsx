import { useState, useEffect } from 'react';

const AnimatedSnow = ({ snowflakeCount = 50 }) => {
  const [snowflakes, setSnowflakes] = useState([]);

  useEffect(() => {
    const generateSnowflakes = () => {
      const flakes = [];
      for (let i = 0; i < snowflakeCount; i++) {
        flakes.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 4 + 2,
          speed: Math.random() * 2 + 1,
          opacity: Math.random() * 0.8 + 0.2,
          drift: Math.random() * 2 - 1,
        });
      }
      setSnowflakes(flakes);
    };

    generateSnowflakes();
  }, [snowflakeCount]);

  useEffect(() => {
    const animateSnow = () => {
      setSnowflakes(prevFlakes =>
        prevFlakes.map(flake => ({
          ...flake,
          y: flake.y > 100 ? -5 : flake.y + flake.speed * 0.1,
          x: flake.x + flake.drift * 0.05,
        }))
      );
    };

    const interval = setInterval(animateSnow, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {snowflakes.map(flake => (
        <div
          key={flake.id}
          className="absolute rounded-full bg-white animate-pulse"
          style={{
            left: `${flake.x}%`,
            top: `${flake.y}%`,
            width: `${flake.size}px`,
            height: `${flake.size}px`,
            opacity: flake.opacity,
            transform: `translateX(${Math.sin(flake.y * 0.01) * 10}px)`,
            transition: 'all 0.05s linear',
          }}
        />
      ))}
    </div>
  );
};

export default AnimatedSnow;