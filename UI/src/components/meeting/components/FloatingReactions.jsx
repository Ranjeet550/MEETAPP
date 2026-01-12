import React from 'react';
import '../features/reactions.css';

const FloatingReactions = ({ reactions = [] }) => {
  if (!reactions || reactions.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-40 w-full h-full">
      {reactions
        .filter(reaction => {
          if (!reaction) return false;
          if (typeof reaction === 'string') return true;
          return reaction.emoji || reaction.reaction;
        })
        .map((reaction, idx) => {
          // Handle both object with emoji property and direct emoji string
          const emoji = typeof reaction === 'string' 
            ? reaction 
            : (reaction.emoji || reaction.reaction || '');
          if (!emoji) return null;
          
          // Random horizontal position for variety (Google Meet style)
          const randomLeft = Math.random() * 70 + 15; // 15% to 85%
          // Random starting delay for staggered effect
          const randomDelay = Math.random() * 0.2;
          
          return (
            <div
              key={reaction.id || idx}
              className="absolute text-3xl sm:text-4xl md:text-5xl lg:text-6xl reaction-float select-none"
              style={{
                left: `${randomLeft}%`,
                bottom: '15%',
                animationDelay: `${randomDelay}s`,
                transform: 'translateY(0)',
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
              }}
            >
              {emoji}
            </div>
          );
        })}
    </div>
  );
};

export default FloatingReactions;