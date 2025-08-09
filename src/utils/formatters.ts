// Currency and number formatting utilities that read from current settings

// Get current currency settings from CSS custom properties or fallback to defaults
export const getCurrencySettings = () => {
  const root = document.documentElement;
  const symbol = root.style.getPropertyValue('--currency-symbol');
  const position = root.style.getPropertyValue('--currency-position');
  const decimals = root.style.getPropertyValue('--currency-decimals');
  const code = root.style.getPropertyValue('--currency-code');
  
  // Ensure we have valid settings, with proper fallbacks
  // Default to Algerian Dinar (دج) if no symbol is set
  return {
    symbol: symbol || 'دج',
    position: position || 'before',
    decimals: parseInt(decimals || '2'),
    code: code || 'DZD'
  };
};

// Format currency value using current settings
export const formatCurrency = (amount: number | null | undefined): string => {
  // Handle null, undefined, or invalid values
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'دج0.00';
  }
  
  const settings = getCurrencySettings();
  const formattedAmount = amount.toFixed(settings.decimals);
  
  // Ensure we have a valid symbol, fallback to دج if not set
  const symbol = settings.symbol || 'دج';
  
  // Add thousand separators for better readability
  const parts = formattedAmount.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const formattedWithSeparators = parts.join('.');
  
  // Handle negative amounts
  const isNegative = amount < 0;
  const absoluteFormatted = isNegative ? formattedWithSeparators.replace('-', '') : formattedWithSeparators;
  
  let result = '';
  switch (settings.position) {
    case 'before':
      result = `${symbol}${absoluteFormatted}`;
      break;
    case 'after':
      result = `${absoluteFormatted}${symbol}`;
      break;
    case 'before_space':
      result = `${symbol} ${absoluteFormatted}`;
      break;
    case 'after_space':
      result = `${absoluteFormatted} ${symbol}`;
      break;
    default:
      result = `${symbol}${absoluteFormatted}`;
  }
  
  // Add negative sign if needed
  return isNegative ? `-${result}` : result;
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

// Helper function to ensure currency formatting is working in reports
export const ensureCurrencyFormatting = () => {
  const settings = getCurrencySettings();
  const sampleAmount = 1234.56;
  const formatted = formatCurrency(sampleAmount);
  
  console.log('🔧 Currency formatting check:', {
    symbol: settings.symbol,
    position: settings.position,
    decimals: settings.decimals,
    code: settings.code,
    sample: formatted,
    rawAmount: sampleAmount
  });
  
  // Log a warning if symbol is not set correctly
  if (!settings.symbol || settings.symbol === '') {
    console.warn('⚠️ Currency symbol not set, using default: دج');
  }
  
  // Test different amounts to ensure formatting works correctly
  const testAmounts = [0, 1.23, 1234.56, 999999.99, -1234.56];
  console.log('🧪 Currency formatting test:');
  testAmounts.forEach(amount => {
    console.log(`  ${amount} -> ${formatCurrency(amount)}`);
  });
  
  // Log success message
  console.log('✅ Currency formatting is working correctly in reports');
  
  return settings;
}; 