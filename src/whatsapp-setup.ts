#!/usr/bin/env node

// Import from whatsapp-web.js with CommonJS compatibility
import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;

import qrcode from 'qrcode-terminal';
import fs from 'fs-extra';
import path from 'path';

const SESSION_PATH = path.join(process.cwd(), '.wwebjs_auth');
const CONNECTION_INFO_PATH = path.join(process.cwd(), 'whatsapp-connection.json');

class WhatsAppSetup {
  private client: any;

  constructor() {
    console.log('🔄 מתחיל התחברות לווטסאפ / Starting WhatsApp connection...');
    
    this.client = new Client({
      authStrategy: new LocalAuth({
        dataPath: SESSION_PATH
      }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ]
      }
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.client.on('qr', (qr: string) => {
      console.log('\n📱 סרוק את קוד ה-QR עם ווטסאפ / Scan QR code with WhatsApp:');
      console.log('────────────────────────────────────────────────');
      qrcode.generate(qr, { small: true });
      console.log('────────────────────────────────────────────────');
    });

    this.client.on('authenticated', () => {
      console.log('✅ אימות הצליח! / Authentication successful!');
    });

    this.client.on('auth_failure', (msg: any) => {
      console.log('❌ שגיאת אימות / Authentication failed:', msg);
      process.exit(1);
    });

    this.client.on('ready', async () => {
      console.log('🎉 ווטסאפ מוכן לשימוש! / WhatsApp is ready!');
      
      // Get client info
      const info = this.client.info;
      const connectionInfo = {
        isReady: true,
        clientInfo: {
          wid: info.wid._serialized,
          pushname: info.pushname,
          me: info.me._serialized,
          platform: info.platform,
          connected: true,
          setupTime: new Date().toISOString()
        },
        sessionPath: SESSION_PATH,
        lastConnection: new Date().toISOString()
      };

      // Save connection info
      await this.saveConnectionInfo(connectionInfo);
      
      console.log('💾 פרטי החיבור נשמרו בהצלחה / Connection details saved successfully');
      console.log(`📁 מיקום קבצי Session: ${SESSION_PATH}`);
      console.log(`📄 קובץ מידע חיבור: ${CONNECTION_INFO_PATH}`);
      console.log('\n🚀 כעת אתה יכול להריץ את שרת ה-MCP!');
      console.log('Now you can run the MCP server!');
      
      // Keep alive for a bit to ensure session is saved
      setTimeout(() => {
        console.log('\n✨ הגדרה הושלמה! השרת יכול להתחבר אוטומטית כעת');
        console.log('Setup completed! Server can now connect automatically');
        process.exit(0);
      }, 3000);
    });

    this.client.on('disconnected', (reason: any) => {
      console.log('🔌 התנתק מווטסאפ / Disconnected from WhatsApp:', reason);
      if (reason === 'LOGOUT') {
        this.cleanup();
      }
    });
  }

  private async saveConnectionInfo(info: any) {
    try {
      await fs.writeJson(CONNECTION_INFO_PATH, info, { spaces: 2 });
      console.log('💾 Connection info saved to:', CONNECTION_INFO_PATH);
    } catch (error) {
      console.error('❌ Failed to save connection info:', error);
    }
  }

  private async cleanup() {
    try {
      await fs.remove(SESSION_PATH);
      await fs.remove(CONNECTION_INFO_PATH);
      console.log('🧹 Session data cleaned up');
    } catch (error) {
      console.error('❌ Cleanup error:', error);
    }
  }

  public async initialize() {
    try {
      console.log('🔄 מאתחל לקוח ווטסאפ / Initializing WhatsApp client...');
      await this.client.initialize();
    } catch (error) {
      console.error('❌ Initialization error:', error);
      process.exit(1);
    }
  }

  public async logout() {
    try {
      await this.client.logout();
      await this.cleanup();
      console.log('👋 התנתקת בהצלחה / Logged out successfully');
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
const setup = new WhatsAppSetup();

if (args.includes('--logout')) {
  setup.logout().then(() => process.exit(0));
} else {
  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n👋 יוצא מהתוכנית / Exiting...');
    process.exit(0);
  });

  // Start setup
  setup.initialize();
} 