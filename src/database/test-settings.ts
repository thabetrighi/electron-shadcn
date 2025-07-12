import { db } from './connection';
import { SettingsService } from './services/settings.service';
import { settings } from './schema';

async function testSettings() {
  try {
    console.log('🧪 Testing settings functionality...');
    
    // Test 1: Check if settings table exists
    console.log('\n1. Checking settings table...');
    const tableExists = await db.select().from(settings).limit(1);
    console.log('✅ Settings table exists');
    
    // Test 2: Initialize default settings
    console.log('\n2. Initializing default settings...');
    const initResult = await SettingsService.initializeDefaults();
    console.log('Init result:', initResult);
    
    // Test 3: Get all settings
    console.log('\n3. Getting all settings...');
    const allSettings = await SettingsService.getAll();
    console.log('All settings:', allSettings);
    
    // Test 4: Set a test setting
    console.log('\n4. Setting a test setting...');
    const setResult = await SettingsService.set('test_setting', 'test_value');
    console.log('Set result:', setResult);
    
    // Test 5: Get the test setting
    console.log('\n5. Getting the test setting...');
    const testValue = await SettingsService.get('test_setting');
    console.log('Test setting value:', testValue);
    
    // Test 6: Set a printer setting
    console.log('\n6. Setting a printer setting...');
    const printerResult = await SettingsService.set('printer.printerName', 'Test Printer');
    console.log('Printer setting result:', printerResult);
    
    // Test 7: Get printer settings
    console.log('\n7. Getting printer settings...');
    const printerSettings = await SettingsService.getByCategory('printing');
    console.log('Printer settings:', printerSettings);
    
    console.log('\n✅ Settings test completed successfully!');
    
  } catch (error) {
    console.error('❌ Settings test failed:', error);
  }
}

// Run the test
testSettings().then(() => {
  console.log('Test completed');
  process.exit(0);
}).catch((error) => {
  console.error('Test failed:', error);
  process.exit(1);
}); 