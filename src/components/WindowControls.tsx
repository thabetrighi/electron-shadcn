import React, { useState, useEffect } from 'react';
import { Minus, Square, Copy, X } from 'lucide-react';
import { Button } from './ui/button';

interface WindowControlsProps {
  className?: string;
}

export default function WindowControls({ className = '' }: WindowControlsProps) {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    // Listen for window state changes if available
    const checkMaximized = () => {
      // This would require additional IPC setup to get window state
      // For now, we'll track it locally
    };
    
    checkMaximized();
  }, []);

  const handleMinimize = () => {
    if (window.electronWindow) {
      window.electronWindow.minimize();
    }
  };

  const handleMaximize = () => {
    if (window.electronWindow) {
      window.electronWindow.maximize();
      setIsMaximized(!isMaximized);
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
        className="h-6 w-6 p-0 hover:bg-gray-200/80 rounded-sm transition-all duration-200 hover:scale-110"
        title="Minimize"
      >
        <Minus className="h-3 w-3 text-gray-600 hover:text-gray-800" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleMaximize}
        className="h-6 w-6 p-0 hover:bg-gray-200/80 rounded-sm transition-all duration-200 hover:scale-110"
        title={isMaximized ? "Restore" : "Maximize"}
      >
        {isMaximized ? (
          <Copy className="h-3 w-3 text-gray-600 hover:text-gray-800" />
        ) : (
          <Square className="h-3 w-3 text-gray-600 hover:text-gray-800" />
        )}
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClose}
        className="h-6 w-6 p-0 hover:bg-red-500 hover:text-white rounded-sm transition-all duration-200 hover:scale-110"
        title="Close"
      >
        <X className="h-3 w-3 text-gray-600 hover:text-white" />
      </Button>
    </div>
  );
} 