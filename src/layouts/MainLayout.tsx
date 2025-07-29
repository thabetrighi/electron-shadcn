import React, { useState, useEffect } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { setAppLanguage } from '../helpers/language_helpers';
import { 
  Menu, 
  X, 
  Home, 
  ShoppingCart, 
  Package, 
  Users, 
  FolderTree, 
  Ruler, 
  FileText, 
  BarChart3, 
  Settings,
  Bell,
  Search,
  Moon,
  Sun,
  Globe,
  User
} from 'lucide-react';
import WindowControls from '../components/WindowControls';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Badge } from '../components/ui/badge';
import toast from 'react-hot-toast';

interface MainLayoutProps {
  children: React.ReactNode;
}

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
];

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();
  const { t, i18n } = useTranslation();

  // Navigation items with translations
  const navigation = [
    { name: t('navigation.dashboard', 'Dashboard'), href: '/', icon: Home },
    { name: t('navigation.pos', 'POS'), href: '/pos', icon: ShoppingCart, badge: 2 },
    { name: t('navigation.products', 'Products'), href: '/products', icon: Package },
    { name: t('navigation.categories', 'Categories'), href: '/categories', icon: FolderTree },
    { name: t('navigation.units', 'Units'), href: '/units', icon: Ruler },
    { name: t('navigation.users', 'Users'), href: '/users', icon: Users },
    { name: t('navigation.orders', 'Orders'), href: '/orders', icon: FileText },
    { name: t('navigation.reports', 'Reports'), href: '/reports', icon: BarChart3 },
    { name: t('navigation.settings', 'Settings'), href: '/settings', icon: Settings },
  ];

  // Close sidebar on mobile by default, but keep open on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    // Set initial state based on screen size
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Listen for language changes from other parts of the app
  useEffect(() => {
    const handleLanguageChanged = (event: CustomEvent) => {
      // Force re-render when language changes
      console.log('Language changed in MainLayout:', event.detail.language);
    };

    window.addEventListener('languageChanged', handleLanguageChanged as EventListener);
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChanged as EventListener);
    };
  }, []);

  const isActive = (href: string) => location.pathname === href;

  // Handle language change with proper error handling and feedback
  const handleLanguageChange = async (langCode: string) => {
    if (langCode === i18n.language) return;
    
    try {
      const success = await setAppLanguage(langCode, i18n);
      if (success) {
        const langName = languages.find(l => l.code === langCode)?.name || langCode;
      } else {
        throw new Error('Failed to change language');
      }
    } catch (error) {
      console.error('Failed to change language:', error);
      toast.error('Failed to change language');
    }
  };

  return (
    <div className={`h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 ${darkMode ? 'dark bg-gradient-to-br from-gray-900 to-gray-800' : ''}`}>
      {/* Custom Title Bar */}
      <div className="h-8 bg-white/95 backdrop-blur-sm border-b border-gray-200/50 flex items-center justify-between px-4 drag-region flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
            <ShoppingCart className="w-3 h-3 text-white" />
          </div>
          <span className="text-xs font-semibold text-gray-700">POS Pro - Modern Point of Sale</span>
        </div>
        <WindowControls className="no-drag" />
      </div>

      {/* Main Layout Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <div className={`hidden lg:flex flex-col transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'w-64' : 'w-0'
        }`}>
          <div className={`w-64 sidebar-gradient-bg backdrop-blur-sm border-gray-200/50 shadow-xl flex-shrink-0 overflow-hidden transition-all duration-300 flex flex-col h-full ${
            sidebarOpen ? 'opacity-100' : 'opacity-0'
          }`}>
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200/50 flex-shrink-0">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <ShoppingCart className="w-4 h-4 text-white" />
                </div>
                <div className="ml-3">
                  <h1 className="text-lg font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">POS Pro</h1>
                  <p className="text-xs text-gray-500 -mt-1">Point of Sale System</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent py-4 px-3">
              <div className="space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                        active
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25 scale-105'
                          : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900 hover:scale-105'
                      }`}
                    >
                      <Icon className={`mr-3 h-5 w-5 transition-transform ${active ? 'text-white scale-110' : 'text-gray-400 group-hover:text-gray-600 group-hover:scale-110'}`} />
                      <span className="flex-1 font-medium">{item.name}</span>
                      {item.badge && (
                        <Badge variant={active ? "secondary" : "outline"} className={`ml-auto text-xs ${active ? 'bg-white/20 text-white border-white/30' : ''}`}>
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  );
                })}
              </div>
            </nav>

            {/* Quick Actions */}
            <div className="p-4 border-t border-gray-200/50 bg-gradient-to-r from-blue-50 to-purple-50 flex-shrink-0">
              <Link to="/pos">
                <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105" size="lg">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Quick POS
                </Button>
              </Link>
            </div>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-gray-200/50 sidebar-footer-gradient flex-shrink-0">
              <div className="text-center">
                {/* App Info */}
                <div className="flex items-center justify-center mb-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm status-indicator">
                    <ShoppingCart className="w-3 h-3 text-white" />
                  </div>
                  <span className="ml-2 text-sm font-semibold text-gray-700">POS Pro</span>
                </div>
                
                {/* System Status */}
                <div className="mb-3 p-2 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-center text-xs text-green-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    System Online
                  </div>
                </div>

                {/* Version & Copyright */}
                <div className="text-xs text-gray-500 space-y-1 mb-3">
                  <p className="font-medium">Version 1.0.0</p>
                  <p className="text-gray-400">© 2025 Modern POS</p>
                  <p className="text-gray-400">RT DEV</p>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center space-x-2">
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-gray-200 rounded-full transition-all duration-200 hover:scale-110" title="Settings">
                    <Settings className="w-3 h-3 text-gray-500" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-blue-100 hover:text-blue-600 rounded-full transition-all duration-200 hover:scale-110" title="Help & Support">
                    <span className="text-xs font-bold">?</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-purple-100 hover:text-purple-600 rounded-full transition-all duration-200 hover:scale-110" title="About">
                    <span className="text-xs font-bold">i</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Navigation Bar */}
          <header className="h-14 bg-white/95 backdrop-blur-sm border-b border-gray-200/50 px-4 shadow-sm flex items-center flex-shrink-0">
            <div className="flex items-center justify-between w-full">
              {/* Left side */}
              <div className="flex items-center space-x-4">
                {/* Always visible toggle button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="hover:bg-gray-100 rounded-full p-2"
                  title={sidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
                >
                  <Menu className="w-5 h-5" />
                </Button>

                {/* Search Bar */}
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder={t('layout.searchPlaceholder', 'Search anything...')}
                      className="pl-10 pr-4 py-2 w-full bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Right side */}
              <div className="flex items-center space-x-2">
                {/* Quick POS Button */}
                <Link to="/pos">
                  <Button variant="outline" size="sm" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 hover:from-blue-600 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-200">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    POS
                  </Button>
                </Link>

                {/* Language Selector */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="hover:bg-gray-100 rounded-full">
                      <Globe className="w-4 h-4 mr-2" />
                      {languages.find(l => l.code === i18n.language)?.flag}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Language</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {languages.map((lang) => (
                      <DropdownMenuItem
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className="flex items-center"
                      >
                        <span className="mr-2">{lang.flag}</span>
                        {lang.name}
                        {i18n.language === lang.code && (
                          <span className="ml-auto text-blue-600">✓</span>
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Theme Toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDarkMode(!darkMode)}
                  className="hover:bg-gray-100 rounded-full p-2"
                  title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                  {darkMode ? (
                    <Sun className="w-4 h-4" />
                  ) : (
                    <Moon className="w-4 h-4" />
                  )}
                </Button>

                {/* Notifications */}
                <Button variant="ghost" size="sm" className="relative hover:bg-gray-100 rounded-full p-2" title="Notifications">
                  <Bell className="w-4 h-4" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                    3
                  </span>
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-gray-100">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/avatars/admin.png" alt="Admin" />
                        <AvatarFallback>AD</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">Admin User</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          admin@pos.com
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent p-6 bg-gradient-to-br from-gray-50/50 to-white">
            <div className="max-w-full">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
          />
          
          {/* Mobile Sidebar */}
          <div className="fixed top-8 bottom-0 left-0 w-64 sidebar-gradient-bg backdrop-blur-sm border-gray-200/50 shadow-xl transform transition-transform duration-300 ease-in-out flex flex-col">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200/50 flex-shrink-0">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <ShoppingCart className="w-4 h-4 text-white" />
                </div>
                <div className="ml-3">
                  <h1 className="text-lg font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">POS Pro</h1>
                  <p className="text-xs text-gray-500 -mt-1">Point of Sale System</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
                className="hover:bg-gray-100 rounded-full"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent py-4 px-3">
              <div className="space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                        active
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25 scale-105'
                          : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900 hover:scale-105'
                      }`}
                    >
                      <Icon className={`mr-3 h-5 w-5 transition-transform ${active ? 'text-white scale-110' : 'text-gray-400 group-hover:text-gray-600 group-hover:scale-110'}`} />
                      <span className="flex-1 font-medium">{item.name}</span>
                      {item.badge && (
                        <Badge variant={active ? "secondary" : "outline"} className={`ml-auto text-xs ${active ? 'bg-white/20 text-white border-white/30' : ''}`}>
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  );
                })}
              </div>
            </nav>

            {/* Quick Actions */}
            <div className="p-4 border-t border-gray-200/50 bg-gradient-to-r from-blue-50 to-purple-50 flex-shrink-0">
              <Link to="/pos" onClick={() => setSidebarOpen(false)}>
                <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105" size="lg">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Quick POS
                </Button>
              </Link>
            </div>

            {/* Mobile Sidebar Footer */}
            <div className="p-4 border-t border-gray-200/50 sidebar-footer-gradient flex-shrink-0">
              <div className="text-center">
                {/* App Info */}
                <div className="flex items-center justify-center mb-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm status-indicator">
                    <ShoppingCart className="w-3 h-3 text-white" />
                  </div>
                  <span className="ml-2 text-sm font-semibold text-gray-700">POS Pro</span>
                </div>
                
                {/* System Status */}
                <div className="mb-3 p-2 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-center text-xs text-green-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    System Online
                  </div>
                </div>

                {/* Version & Copyright */}
                <div className="text-xs text-gray-500 space-y-1 mb-3">
                  <p className="font-medium">Version 1.0.0</p>
                  <p className="text-gray-400">© 2025 Modern POS</p>
                  <p className="text-gray-400">RT DEV</p>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center space-x-2">
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-gray-200 rounded-full transition-all duration-200 hover:scale-110" title="Settings">
                    <Settings className="w-3 h-3 text-gray-500" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-blue-100 hover:text-blue-600 rounded-full transition-all duration-200 hover:scale-110" title="Help & Support">
                    <span className="text-xs font-bold">?</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-purple-100 hover:text-purple-600 rounded-full transition-all duration-200 hover:scale-110" title="About">
                    <span className="text-xs font-bold">i</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 