import type { i18n } from "i18next";
import { translations } from "@/localization/translations";

const languageLocalStorageKey = "lang";

export async function setAppLanguage(lang: string, i18n: i18n) {
  console.log('setAppLanguage: Setting language to:', lang);
  
  try {
    // Change language
    await i18n.changeLanguage(lang);
    console.log('setAppLanguage: Changed i18n language');
    
    // Update document attributes
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    if (lang === 'ar') {
      document.documentElement.classList.add('rtl');
    } else {
      document.documentElement.classList.remove('rtl');
    }
    
    // Save to localStorage
    localStorage.setItem(languageLocalStorageKey, lang);
    console.log('setAppLanguage: Saved to localStorage');
    
    // Save to database if available
    if (window.database?.settings) {
      await window.database.settings.set('language', lang);
      console.log('setAppLanguage: Saved to database');
    }
    
    // Force a re-render
    window.dispatchEvent(new CustomEvent('languageChanged', { 
      detail: { language: lang } 
    }));
    console.log('setAppLanguage: Dispatched languageChanged event');
    
    return true;
  } catch (error) {
    console.error('setAppLanguage: Failed to set language:', error);
    return false;
  }
}

export async function updateAppLanguage(i18n: i18n) {
  try {
    let targetLang = null;
    
    // First try to get language from database
    if (window.database?.settings) {
      const result = await window.database.settings.get('language');
      if (result?.success && result.data) {
        targetLang = result.data;
        console.log('updateAppLanguage: Found language in database:', targetLang);
      }
    }
    
    // If not in database, try localStorage
    if (!targetLang) {
      targetLang = localStorage.getItem(languageLocalStorageKey);
      console.log('updateAppLanguage: Found language in localStorage:', targetLang);
    }
    
    // If we found a language and it's different from current, apply it
    if (targetLang && targetLang !== i18n.language) {
      return await setAppLanguage(targetLang, i18n);
    }
    
    // If no stored language found, set default language
    if (!targetLang) {
      return await setAppLanguage('en', i18n);
    }
    
    return true;
  } catch (error) {
    console.error('updateAppLanguage: Failed to update language:', error);
    return false;
  }
}

export async function initializeLanguageFromDatabase(i18n: i18n) {
  try {
    let targetLang = null;
    
    // First try database
    if (window.database?.settings) {
      const result = await window.database.settings.get('language');
      if (result?.success && result.data) {
        targetLang = result.data;
        console.log('initializeLanguageFromDatabase: Found language in database:', targetLang);
      }
    }
    
    // Then try localStorage
    if (!targetLang) {
      targetLang = localStorage.getItem(languageLocalStorageKey);
      console.log('initializeLanguageFromDatabase: Found language in localStorage:', targetLang);
    }
    
    // If we found a language and it's different from current, apply it
    if (targetLang && targetLang !== i18n.language) {
      const success = await setAppLanguage(targetLang, i18n);
      if (success) {
        return targetLang;
      }
    }
    
    // If no stored language found, set default language
    if (!targetLang) {
      const success = await setAppLanguage('en', i18n);
      if (success) {
        return 'en';
      }
    }
    
    return i18n.language;
  } catch (error) {
    console.error('initializeLanguageFromDatabase: Failed to initialize language:', error);
    return i18n.language;
  }
}
