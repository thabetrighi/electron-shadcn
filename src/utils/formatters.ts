// Currency and number formatting utilities that read from current settings

// Get current currency settings from CSS custom properties or fallback to defaults
export const getCurrencySettings = () => {
  const root = document.documentElement;
  return {
    symbol: root.style.getPropertyValue('--currency-symbol') || '$',
    position: root.style.getPropertyValue('--currency-position') || 'before',
    decimals: parseInt(root.style.getPropertyValue('--currency-decimals') || '2'),
    code: root.style.getPropertyValue('--currency-code') || 'USD'
  };
};

// Format currency value using current settings
export const formatCurrency = (amount: number | null | undefined): string => {
  // Handle null, undefined, or invalid values
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '$0.00';
  }
  
  const settings = getCurrencySettings();
  const formattedAmount = amount.toFixed(settings.decimals);
  
  switch (settings.position) {
    case 'before':
      return `${settings.symbol}${formattedAmount}`;
    case 'after':
      return `${formattedAmount}${settings.symbol}`;
    case 'before_space':
      return `${settings.symbol} ${formattedAmount}`;
    case 'after_space':
      return `${formattedAmount} ${settings.symbol}`;
    default:
      return `${settings.symbol}${formattedAmount}`;
  }
};

// Format percentage
export const formatPercentage = (value: number | null | undefined, decimals: number = 1): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }
  return `${value.toFixed(decimals)}%`;
};

// Format number with thousand separators
export const formatNumber = (value: number | null | undefined, decimals: number = 0): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
};

// Format date according to user preferences
export const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) return '-';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
    
    // Try to get date format from settings or use default
    const dateFormat = document.documentElement.style.getPropertyValue('--date-format') || 'MM/DD/YYYY';
    
    const options: Intl.DateTimeFormatOptions = {};
    
    switch (dateFormat) {
      case 'DD/MM/YYYY':
        options.day = '2-digit';
        options.month = '2-digit';
        options.year = 'numeric';
        return dateObj.toLocaleDateString('en-GB', options);
      case 'YYYY-MM-DD':
        return dateObj.toISOString().split('T')[0];
      case 'DD.MM.YYYY':
        options.day = '2-digit';
        options.month = '2-digit';
        options.year = 'numeric';
        return dateObj.toLocaleDateString('de-DE', options);
      case 'DD MMM YYYY':
        options.day = '2-digit';
        options.month = 'short';
        options.year = 'numeric';
        return dateObj.toLocaleDateString('en-US', options);
      case 'MMM DD, YYYY':
        options.month = 'short';
        options.day = '2-digit';
        options.year = 'numeric';
        return dateObj.toLocaleDateString('en-US', options);
      default: // MM/DD/YYYY
        options.month = '2-digit';
        options.day = '2-digit';
        options.year = 'numeric';
        return dateObj.toLocaleDateString('en-US', options);
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

// Format date and time according to user preferences
export const formatDateTime = (date: Date | string | null | undefined): string => {
  if (!date) return '-';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
    
    const timeFormat = document.documentElement.style.getPropertyValue('--time-format') || '12h';
    
    const dateOptions: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    };
    
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: timeFormat === '12h'
    };
    
    const formattedDate = dateObj.toLocaleDateString('en-US', dateOptions);
    const formattedTime = dateObj.toLocaleTimeString('en-US', timeOptions);
    
    return `${formattedDate} at ${formattedTime}`;
  } catch (error) {
    console.error('Error formatting date time:', error);
    return 'Invalid Date';
  }
};

// Test function to verify settings are working
export const testCurrentSettings = () => {
  console.log('=== CURRENT SETTINGS TEST ===');
  console.log('Currency Settings:', getCurrencySettings());
  console.log('Sample amounts formatted:');
  const testAmounts = [12.50, 1234.56, 999999.99, 0.05];
  testAmounts.forEach(amount => {
    console.log(`${amount} -> ${formatCurrency(amount)}`);
  });
  console.log('Date Format:', formatDate(new Date()));
  console.log('DateTime Format:', formatDateTime(new Date()));
  console.log('========================');
}; 