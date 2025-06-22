import React from 'react';
import { Minus, Square, X } from 'lucide-react';
import { Button } from './ui/button';

interface WindowControlsProps {
  className?: string;
}

export default function WindowControls({ className = '' }: WindowControlsProps) {
  const handleMinimize = () => {
    if (window.electronWindow) {
      window.electronWindow.minimize();
    }
  };

  const handleMaximize = () => {
    if (window.electronWindow) {
      window.electronWindow.maximize();
    }
  };

  const handleClose = () => {
    if (window.electronWindow) {
      window.electronWindow.close();
    }
  };

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleMinimize}
        className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full transition-colors"
        title="Minimize"
      >
        <Minus className="h-4 w-4 text-gray-600" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleMaximize}
        className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full transition-colors"
        title="Maximize/Restore"
      >
        <Square className="h-4 w-4 text-gray-600" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClose}
        className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600 rounded-full transition-colors"
        title="Close"
      >
        <X className="h-4 w-4 text-gray-600 hover:text-red-600" />
      </Button>
    </div>
  );
} 