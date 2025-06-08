import fs from 'fs-extra';
import path from 'path';

const SESSION_PATH = path.join(process.cwd(), '.wwebjs_auth');
const CONNECTION_INFO_PATH = path.join(process.cwd(), 'whatsapp-connection.json');

async function testLoadExistingConnection() {
  try {
    console.log('=== Testing loadExistingConnection ===');
    
    // Check if connection info exists
    console.log('Checking CONNECTION_INFO_PATH:', CONNECTION_INFO_PATH);
    const connectionExists = await fs.pathExists(CONNECTION_INFO_PATH);
    console.log('Connection file exists:', connectionExists);
    
    if (!connectionExists) {
      console.log('❌ לא נמצא מידע חיבור קיים / No existing connection info found');
      return false;
    }

    // Check if session folder exists
    console.log('Checking SESSION_PATH:', SESSION_PATH);
    const sessionExists = await fs.pathExists(SESSION_PATH);
    console.log('Session folder exists:', sessionExists);
    
    if (!sessionExists) {
      console.log('❌ לא נמצאו קבצי session / No session files found');
      return false;
    }

    // Load connection info
    console.log('Loading connection info from:', CONNECTION_INFO_PATH);
    const connectionInfo = await fs.readJson(CONNECTION_INFO_PATH);
    console.log('📖 טוען מידע חיבור קיים / Loading existing connection info...');
    console.log(`👤 משתמש: ${connectionInfo.clientInfo?.pushname || 'Unknown'}`);
    console.log(`🕐 חיבור אחרון: ${connectionInfo.lastConnection}`);

    return true;
  } catch (error) {
    console.log('❌ שגיאה בטעינת מידע חיבור / Error loading connection info:', error);
    console.log('Error details:');
    console.log('- Message:', error.message);
    console.log('- Stack:', error.stack);
    return false;
  }
}

const result = await testLoadExistingConnection();
console.log('\n=== Final Result ===');
console.log('loadExistingConnection would return:', result); 