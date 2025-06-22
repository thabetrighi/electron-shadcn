import React, { useState } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
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

interface MainLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'POS', href: '/pos', icon: ShoppingCart, badge: 2 },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Categories', href: '/categories', icon: FolderTree },
  { name: 'Units', href: '/units', icon: Ruler },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Orders', href: '/orders', icon: FileText },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
];

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');
  const location = useLocation();

  const isActive = (href: string) => location.pathname === href;

  return (
    <div className={`h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 ${darkMode ? 'dark bg-gradient-to-br from-gray-900 to-gray-800' : ''}`}>
      {/* Custom Title Bar */}
      <div className="h-12 bg-white/95 backdrop-blur-sm border-b border-gray-200/50 flex items-center justify-between px-4 drag-region">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
            <ShoppingCart className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-gray-700">POS Pro - Modern Point of Sale</span>
        </div>
        <WindowControls className="no-drag" />
      </div>

      {/* Sidebar */}
      <div className={`fixed top-12 bottom-0 left-0 z-50 w-64 bg-white/95 backdrop-blur-sm border-r border-gray-200/50 shadow-xl transform transition-all duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200/50">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <ShoppingCart className="w-4 h-4 text-white" />
            </div>
            <span className="ml-3 text-lg font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">Navigation</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden hover:bg-gray-100 rounded-full"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent mt-2 px-3">
          <div className="space-y-1 pb-4">
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
        <div className="p-4 border-t border-gray-200/50 bg-gradient-to-r from-blue-50 to-purple-50">
          <Link to="/pos">
            <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105" size="lg">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Quick POS
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'} pt-12`}>
        {/* Top Navigation Bar */}
        <header className="h-16 bg-white/95 backdrop-blur-sm border-b border-gray-200/50 px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between">
            {/* Left side */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="w-5 h-5" />
              </Button>

              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search anything..."
                  className="pl-10 w-64 bg-gray-50/50 border-gray-200/50 focus:bg-white focus:border-blue-300 transition-all duration-200"
                />
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
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
                  <Button variant="ghost" size="sm">
                    <Globe className="w-4 h-4 mr-2" />
                    {languages.find(l => l.code === currentLang)?.flag}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Language</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {languages.map((lang) => (
                    <DropdownMenuItem
                      key={lang.code}
                      onClick={() => setCurrentLang(lang.code)}
                      className="flex items-center"
                    >
                      <span className="mr-2">{lang.flag}</span>
                      {lang.name}
                      {currentLang === lang.code && (
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
              >
                {darkMode ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </Button>

              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  3
                </span>
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
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
        <main className="h-[calc(100vh-7rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent p-6 bg-gradient-to-br from-gray-50/50 to-white">
          <div className="max-w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Sidebar Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
} 