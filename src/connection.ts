#!/usr/bin/env node

// Import from whatsapp-web.js with CommonJS compatibility
import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;

import qrcode from 'qrcode-terminal';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { WhatsAppConnectionData, McpWhatsAppServer } from './types.js';
import { qrServer } from './qr-server.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use absolute paths based on the project directory
const PROJECT_ROOT = path.join(__dirname, '..');
const SESSION_PATH = path.join(PROJECT_ROOT, '.wwebjs_auth');
const CONNECTION_INFO_PATH = path.join(PROJECT_ROOT, 'whatsapp-connection.json');
const QR_CODE_PATH = path.join(PROJECT_ROOT, 'whatsapp-qr.txt');

export class WhatsAppConnectionManager implements McpWhatsAppServer {
  public client: any = null;
  public connectionData: WhatsAppConnectionData;
  private sessionDir: string;
  private connectionFile: string;
  private _isConnected = false;
  private connectionInfo: any = null;
  private currentQR: string | null = null;

  constructor() {
    this.sessionDir = path.join(__dirname, '..', 'session');
    this.connectionFile = path.join(this.sessionDir, 'connection.json');
    
    this.connectionData = {
      isAuthenticated: false,
      isReady: false,
      sessionPath: this.sessionDir
    };

    console.error('🔄 מנהל חיבורים ווטסאפ מתחיל / WhatsApp Connection Manager starting...');
    console.error('📁 נתיב פרויקט:', PROJECT_ROOT);
    console.error('📁 נתיב session:', SESSION_PATH);
    console.error('📁 נתיב חיבור:', CONNECTION_INFO_PATH);
  }

  private async saveQRCode(qr: string, qrText: string): Promise<void> {
    try {
      this.currentQR = qrText;
      
      // Update QR server and start if not running
      await qrServer.updateQR(qr);
      
      // Also save QR as text file for backup
      const qrContent = `WhatsApp QR Code - ${new Date().toLocaleString('he-IL')}
=================================================

סרוק את קוד ה-QR הזה עם ווטסאפ בטלפון:
Scan this QR code with WhatsApp on your phone:

${qrText}

=================================================
פתח את ווטסאפ בטלפון > הגדרות > מכשירים מקושרים > קשר מכשיר
Open WhatsApp on phone > Settings > Linked Devices > Link Device
`;
      
      await fs.writeFile(QR_CODE_PATH, qrContent, 'utf8');
      console.error(`📄 קוד QR נשמר לקובץ: ${QR_CODE_PATH}`);
      console.error('🌐 קוד QR זמין גם בדפדפן / QR code also available in browser');
      
    } catch (error) {
      console.error('❌ שגיאה בשמירת קוד QR / Error saving QR code:', error);
    }
  }

  private async clearQRCode(): Promise<void> {
    try {
      this.currentQR = null;
      
      // Clear QR from server
      qrServer.clearQR();
      
      if (await fs.pathExists(QR_CODE_PATH)) {
        await fs.remove(QR_CODE_PATH);
      }
    } catch (error) {
      console.error('❌ שגיאה בניקוי קוד QR / Error clearing QR code:', error);
    }
  }

  public getCurrentQR(): string | null {
    return this.currentQR;
  }

  async connect(): Promise<void> {
    try {
      console.error('🔄 מתחבר לווטסאפ / Connecting to WhatsApp...');
      
      // Ensure session directory exists
      await fs.ensureDir(this.sessionDir);
      
      // Load existing connection data
      await this.loadConnectionData();

      // Initialize WhatsApp client with LocalAuth
      this.client = new Client({
        authStrategy: new LocalAuth({
          clientId: 'whatsapp-mcp-server',
          dataPath: this.sessionDir
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

      // Event handlers
      this.client.on('qr', async (qr: string) => {
        console.error('\n⚠️ Session פג תוקף - נדרש QR חדש / Session expired - New QR required!');
        console.error('📱 סרוק את קוד ה-QR עם ווטסאפ / Scan QR code with WhatsApp:');
        
        // Generate QR code but write to stderr to avoid stdout pollution
        try {
          // Capture stdout to redirect QR to stderr
          const originalWrite = process.stdout.write;
          let qrOutput = '';
          
          // Temporarily override stdout.write to capture QR code
          process.stdout.write = function(string: any, encoding?: any, fd?: any) {
            qrOutput += string;
            return true;
          } as any;
          
          // Generate QR code
          qrcode.generate(qr, { small: true });
          
          // Restore original stdout.write
          process.stdout.write = originalWrite;
          
          // Write captured QR to stderr
          process.stderr.write(qrOutput);
          
          // Save QR code to file for easy viewing
          await this.saveQRCode(qr, qrOutput);
        } catch (error) {
          console.error('QR Code:', qr);
        }
      });

      this.client.on('ready', async () => {
        console.error('✅ החיבור לווטסאפ מוכן! / WhatsApp connection ready!');
        this.connectionData.isReady = true;
        this.connectionData.isAuthenticated = true;
        this.connectionData.connectedAt = new Date();
        this._isConnected = true;
        
        // Clear QR code file since we're now connected
        await this.clearQRCode();
        
        if (this.client) {
          this.connectionData.clientInfo = await this.client.info;
        }
        
        await this.saveConnectionData();
      });

      this.client.on('authenticated', async () => {
        console.error('🔐 אומת בהצלחה / Successfully authenticated');
        this.connectionData.isAuthenticated = true;
        
        // Clear QR code file since we're authenticated
        await this.clearQRCode();
      });

      this.client.on('auth_failure', (msg: any) => {
        console.error('❌ כשל באימות / Authentication failed:', msg);
        this.connectionData.isAuthenticated = false;
      });

      this.client.on('disconnected', async (reason: any) => {
        console.error('🔌 התנתק מווטסאפ / Disconnected from WhatsApp:', reason);
        this.connectionData.isReady = false;
        this.connectionData.isAuthenticated = false;
        await this.saveConnectionData();
      });

      // Initialize the client
      await this.client.initialize();
      
    } catch (error) {
      console.error('❌ שגיאה בהתחברות / Connection error:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      console.error('🔌 מתנתק מווטסאפ / Disconnecting from WhatsApp...');
      await this.client.destroy();
      this.client = null;
      this.connectionData.isReady = false;
      await this.saveConnectionData();
      
      // Stop QR server
      await qrServer.stop();
      
      console.error('✅ התנתק בהצלחה / Successfully disconnected');
    }
  }

  isConnected(): boolean {
    return this._isConnected && this.client !== null;
  }

  async saveConnectionData(): Promise<void> {
    try {
      await fs.ensureDir(this.sessionDir);
      const dataToSave = {
        ...this.connectionData,
        connectedAt: this.connectionData.connectedAt?.toISOString()
      };
      await fs.writeJSON(this.connectionFile, dataToSave, { spaces: 2 });
      console.error('💾 נתוני החיבור נשמרו / Connection data saved');
    } catch (error) {
      console.error('❌ שגיאה בשמירת נתוני החיבור / Error saving connection data:', error);
    }
  }

  async loadConnectionData(): Promise<void> {
    try {
      if (await fs.pathExists(this.connectionFile)) {
        const data = await fs.readJSON(this.connectionFile);
        this.connectionData = {
          ...data,
          connectedAt: data.connectedAt ? new Date(data.connectedAt) : undefined,
          sessionPath: this.sessionDir
        };
        console.error('📂 נתוני החיבור נטענו / Connection data loaded');
      }
    } catch (error) {
      console.error('❌ שגיאה בטעינת נתוני החיבור / Error loading connection data:', error);
    }
  }

  async getConnectionStatus(): Promise<any> {
    if (!this.client) {
      return {
        connected: false,
        authenticated: false,
        ready: false,
        message: 'Client not initialized'
      };
    }

    try {
      const state = await this.client.getState();
      return {
        connected: this.isConnected(),
        authenticated: this.connectionData.isAuthenticated,
        ready: this.connectionData.isReady,
        state,
        clientInfo: this.connectionData.clientInfo,
        connectedAt: this.connectionData.connectedAt
      };
    } catch (error) {
      return {
        connected: false,
        authenticated: this.connectionData.isAuthenticated,
        ready: this.connectionData.isReady,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  public async loadExistingConnection(): Promise<boolean> {
    try {
      // Check if connection info exists
      if (!await fs.pathExists(CONNECTION_INFO_PATH)) {
        console.error('❌ לא נמצא מידע חיבור קיים / No existing connection info found');
        console.error('📝 הרץ תחילה: npm run setup');
        console.error('📝 First run: npm run setup');
        return false;
      }

      // Check if session folder exists
      if (!await fs.pathExists(SESSION_PATH)) {
        console.error('❌ לא נמצאו קבצי session / No session files found');
        console.error('📝 הרץ תחילה: npm run setup');
        console.error('📝 First run: npm run setup');
        return false;
      }

      // Load connection info
      this.connectionInfo = await fs.readJson(CONNECTION_INFO_PATH);
      console.error('📖 טוען מידע חיבור קיים / Loading existing connection info...');
      console.error(`👤 משתמש: ${this.connectionInfo.clientInfo?.pushname || 'Unknown'}`);
      console.error(`🕐 חיבור אחרון: ${this.connectionInfo.lastConnection}`);

      return true;
    } catch (error) {
      console.error('❌ שגיאה בטעינת מידע חיבור / Error loading connection info:', error);
      return false;
    }
  }

  public async connectWithExistingSession(): Promise<void> {
    if (!await this.loadExistingConnection()) {
      throw new Error('No existing session found. Please run setup first.');
    }

    console.error('🔄 מתחבר עם session קיים / Connecting with existing session...');
    
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

    try {
      await this.client.initialize();
      console.error('⏳ ממתין לחיבור... / Waiting for connection...');
    } catch (error) {
      console.error('❌ שגיאה באתחול לקוח / Client initialization error:', error);
      throw error;
    }
  }

  private setupEventHandlers() {
    if (!this.client) return;

    this.client.on('qr', async (qr: string) => {
      console.error('\n⚠️ Session פג תוקף - נדרש QR חדש / Session expired - New QR required!');
      console.error('📱 סרוק את קוד ה-QR עם ווטסאפ / Scan QR code with WhatsApp:');
      
      // Generate QR code but write to stderr to avoid stdout pollution
      try {
        // Capture stdout to redirect QR to stderr
        const originalWrite = process.stdout.write;
        let qrOutput = '';
        
        // Temporarily override stdout.write to capture QR code
        process.stdout.write = function(string: any, encoding?: any, fd?: any) {
          qrOutput += string;
          return true;
        } as any;
        
        // Generate QR code
        qrcode.generate(qr, { small: true });
        
        // Restore original stdout.write
        process.stdout.write = originalWrite;
        
        // Write captured QR to stderr
        process.stderr.write(qrOutput);
        
        // Save QR code to file for easy viewing
        await this.saveQRCode(qr, qrOutput);
      } catch (error) {
        console.error('QR Code:', qr);
      }
    });

    this.client.on('authenticated', async () => {
      console.error('✅ אימות הצליח! / Authentication successful!');
      
      // Clear QR code file since we're authenticated
      await this.clearQRCode();
    });

    this.client.on('auth_failure', (msg: string) => {
      console.error('❌ שגיאת אימות / Authentication failed:', msg);
      this._isConnected = false;
    });

    this.client.on('ready', async () => {
      console.error('🎉 ווטסאפ מחובר ומוכן! / WhatsApp connected and ready!');
      this._isConnected = true;
      
      // Clear QR code file since we're now connected
      await this.clearQRCode();
      
      // Update connection info
      if (this.client?.info) {
        const info = this.client.info;
        this.connectionInfo = {
          ...this.connectionInfo,
          clientInfo: {
            wid: info.wid._serialized,
            pushname: info.pushname,
            me: info.me._serialized,
            platform: info.platform,
            connected: true,
            lastConnected: new Date().toISOString()
          },
          lastConnection: new Date().toISOString()
        };

        await this.saveConnectionInfo();
        console.error('💾 מידע חיבור עודכן / Connection info updated');
      }
    });

    this.client.on('disconnected', (reason: string) => {
      console.error('🔌 התנתק מווטסאפ / Disconnected from WhatsApp:', reason);
      this._isConnected = false;
      
      if (reason === 'LOGOUT') {
        console.error('👋 משתמש התנתק / User logged out');
        this.cleanup();
      }
    });

    this.client.on('message', (message: any) => {
      // Optional: Log incoming messages for debugging
      // console.error('📨 New message:', message.body);
    });
  }

  private async saveConnectionInfo() {
    try {
      await fs.writeJson(CONNECTION_INFO_PATH, this.connectionInfo, { spaces: 2 });
    } catch (error) {
      console.error('❌ שגיאה בשמירת מידע חיבור / Error saving connection info:', error);
    }
  }

  private async cleanup() {
    try {
      await fs.remove(SESSION_PATH);
      await fs.remove(CONNECTION_INFO_PATH);
      console.error('🧹 נתוני session נוקו / Session data cleaned up');
    } catch (error) {
      console.error('❌ שגיאה בניקוי / Cleanup error:', error);
    }
  }

  public getConnectionInfo() {
    return this.connectionInfo;
  }
}

// Export singleton instance
export const whatsAppConnection = new WhatsAppConnectionManager(); 