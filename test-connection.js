import { WhatsAppConnectionManager } from './dist/connection.js';

console.log('🔄 מפעיל טסט חיבור / Starting connection test...');

const manager = new WhatsAppConnectionManager();

try {
  const result = await manager.loadExistingConnection();
  console.log('loadExistingConnection result:', result);
  
  if (result) {
    console.log('✅ Connection info loaded successfully');
    console.log('Connection info:', manager.getConnectionInfo());
  } else {
    console.log('❌ Failed to load connection info');
  }
} catch (error) {
  console.log('❌ Error in loadExistingConnection:', error.message);
  console.log('Full error:', error);
} 