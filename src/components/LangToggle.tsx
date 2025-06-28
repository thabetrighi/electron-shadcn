import React, { useEffect, useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import langs from "@/localization/langs";
import { useTranslation } from "react-i18next";
import { Globe, Settings } from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "@tanstack/react-router";
import { setAppLanguage } from "@/helpers/language_helpers";

interface LangToggleProps {
  variant?: 'toggle' | 'select';
  showLabel?: boolean;
  showSettingsLink?: boolean;
}

export default function LangToggle({ 
  variant = 'toggle', 
  showLabel = false, 
  showSettingsLink = false 
}: LangToggleProps) {
  const { i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState<string | null>(null);
  const [isChanging, setIsChanging] = useState(false);

  // Initialize current language after app is ready
  useEffect(() => {
    const initLanguage = async () => {
      // Wait for a short delay to ensure app initialization is complete
      await new Promise(resolve => setTimeout(resolve, 100));
      setCurrentLang(i18n.language);
    };
    initLanguage();
  }, []);

  // Update current language when i18n language changes
  useEffect(() => {
    if (i18n.language) {
      setCurrentLang(i18n.language);
    }
  }, [i18n.language]);

  // Listen for language change events
  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent) => {
      const { language } = event.detail;
      if (language) {
        setCurrentLang(language);
      }
    };

    window.addEventListener('languageChanged', handleLanguageChange as EventListener);
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange as EventListener);
    };
  }, []);

  const handleLanguageChange = async (newLang: string) => {
    if (isChanging || newLang === currentLang) return;
    
    console.log('Changing language from', currentLang, 'to', newLang);
    setIsChanging(true);
    
    try {
      const success = await setAppLanguage(newLang, i18n);
      
      if (success) {
        setCurrentLang(newLang);
        const langName = langs.find(l => l.key === newLang)?.nativeName || newLang;
        toast.success(`Language changed to ${langName}`, {
          icon: '🌐',
          duration: 2000
        });
      } else {
        throw new Error('Failed to change language');
      }
    } catch (error) {
      console.error('Failed to change language:', error);
      toast.error('Failed to change language');
    } finally {
      setIsChanging(false);
    }
  };

  // Don't render until we have the current language
  if (!currentLang) {
    return null;
  }

  if (variant === 'select') {
    return (
      <div className="flex items-center gap-2">
        {showLabel && (
          <div className="flex items-center gap-1 text-sm font-medium text-gray-700">
            <Globe className="w-4 h-4" />
            Language
          </div>
        )}
        <div className="text-xs text-gray-500 mr-2">
          Current: {currentLang}
        </div>
        <Select
          value={currentLang}
          onValueChange={handleLanguageChange}
          disabled={isChanging}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            {langs.map((lang) => (
              <SelectItem key={lang.key} value={lang.key}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{lang.prefix}</span>
                  <span>{lang.nativeName}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {showSettingsLink && (
          <Link to="/settings">
            <Button variant="outline" size="sm" className="ml-2">
              <Settings className="w-4 h-4 mr-1" />
              Settings
            </Button>
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {showLabel && (
        <div className="flex items-center gap-1 text-sm font-medium text-gray-700">
          <Globe className="w-4 h-4" />
          Language
        </div>
      )}
      <div className="text-xs text-gray-500 mr-2">
        Current: {currentLang}
      </div>
      <ToggleGroup
        type="single"
        onValueChange={handleLanguageChange}
        value={currentLang}
        className="bg-gray-100 rounded-lg p-1"
        disabled={isChanging}
      >
        {langs.map((lang) => (
          <ToggleGroupItem 
            key={lang.key} 
            value={lang.key}
            className="flex items-center gap-1 px-3 py-1 rounded-md transition-all data-[state=on]:bg-white data-[state=on]:shadow-sm hover:bg-gray-200"
          >
            <span className="text-base">{lang.prefix}</span>
            <span className="text-sm font-medium">{lang.nativeName}</span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      {showSettingsLink && (
        <Link to="/settings">
          <Button variant="outline" size="sm" className="ml-2">
            <Settings className="w-4 h-4 mr-1" />
            Settings
          </Button>
        </Link>
      )}
    </div>
  );
}
