import React from 'react';
import { COLOR_PALETTE } from '../constants/config.js';

const ColorPalette = ({ isVisible, onColorSelect, onClose }) => {
  if (!isVisible) return null;

  return (
    <>
      <div className="fixed inset-0 z-30" onClick={onClose}></div>
      <div className="absolute bottom-full mb-2 -right-108 bg-white rounded-lg p-2 shadow-2xl z-40 flex gap-2 animate-fade-in">
        {COLOR_PALETTE.map((color) => (
          <button
            key={color}
            onClick={() => onColorSelect(color)}
            className="w-8 h-8 rounded-full border-2 border-gray-200 cursor-pointer transition-transform transform hover:scale-125 hover:z-10 hover:border-blue-500 ring-offset-2 focus:ring-2 focus:ring-blue-400 outline-none"
            style={{ backgroundColor: color }}
            aria-label={`Color ${color}`}
          />
        ))}
      </div>
    </>
  );
};

export default ColorPalette;