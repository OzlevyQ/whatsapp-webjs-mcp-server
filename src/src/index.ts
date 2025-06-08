#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema
} from '@modelcontextprotocol/sdk/types.js';

// Import our types
import { ToolResult } from './types.js';

import { whatsAppConnection } from './connection.js';
import { qrServer } from './qr-server.js';

// Import messaging tools
import {
  sendMessageTool,
  sendMediaTool,
  getMessagesTool,
  forwardMessageTool,
  deleteMessageTool,
  sendMessage,
  sendMedia,
  getMessages,
  forwardMessage,
  deleteMessage
} from './tools/messaging.js';

// Import chat tools
import {
  getChatsTool,
  getChatInfoTool,
  archiveChatTool,
  pinChatTool,
  muteChatTool,
  markAsReadTool,
  clearMessagesTool,
  deleteChatTool,
  getChats,
  getChatInfo,
  archiveChat,
  pinChat,
  muteChat,
  markAsRead,
  clearMessages,
  deleteChat
} from './tools/chats.js';

// Import contact tools
import {
  getContactsTool,
  getContactInfoTool,
  blockContactTool,
  getProfilePicTool,
  getContactAboutTool,
  getCommonGroupsTool,
  searchContactsTool,
  getContacts,
  getContactInfo,
  blockContact,
  getProfilePic,
  getContactAbout,
  getCommonGroups,
  searchContacts
} from './tools/contacts.js';

// Define all tools
const allTools = [
  // Messaging tools
  sendMessageTool,
  sendMediaTool,
  getMessagesTool,
  forwardMessageTool,
  deleteMessageTool,
  
  // Chat management tools
  getChatsTool,
  getChatInfoTool,
  archiveChatTool,
  pinChatTool,
  muteChatTool,
  markAsReadTool,
  clearMessagesTool,
  deleteChatTool,
  
  // Contact management tools
  getContactsTool,
  getContactInfoTool,
  blockContactTool,
  getProfilePicTool,
  getContactAboutTool,
  getCommonGroupsTool,
  searchContactsTool
];

// Tool handlers map
const toolHandlers: { [key: string]: (args: any) => Promise<ToolResult> } = {
  // Messaging handlers
  'whatsapp_send_message': sendMessage,
  'whatsapp_send_media': sendMedia,
  'whatsapp_get_messages': getMessages,
  'whatsapp_forward_message': forwardMessage,
  'whatsapp_delete_message': deleteMessage,
  
  // Chat management handlers
  'whatsapp_get_chats': getChats,
  'whatsapp_get_chat_info': getChatInfo,
  'whatsapp_archive_chat': archiveChat,
  'whatsapp_pin_chat': pinChat,
  'whatsapp_mute_chat': muteChat,
  'whatsapp_mark_as_read': markAsRead,
  'whatsapp_clear_messages': clearMessages,
  'whatsapp_delete_chat': deleteChat,
  
  // Contact management handlers
  'whatsapp_get_contacts': getContacts,
  'whatsapp_get_contact_info': getContactInfo,
  'whatsapp_block_contact': blockContact,
  'whatsapp_get_profile_picture': getProfilePic,
  'whatsapp_get_contact_about': getContactAbout,
  'whatsapp_get_common_groups': getCommonGroups,
  'whatsapp_search_contacts': searchContacts
};

// Smart connection function - automatically handles everything
async function smartConnect() {
  console.error('🚀 מתחיל חיבור חכם לווטסאפ / Starting smart WhatsApp connection...');
  
  try {
    // Check if we have existing session
    const hasExistingSession = await whatsAppConnection.loadExistingConnection();
    
    if (hasExistingSession) {
      console.error('✅ נמצא session קיים / Found existing session');
      // Try to connect with existing session
      await whatsAppConnection.connectWithExistingSession();
    } else {
      console.error('⚠️ אין session - מתחיל הגדרה חדשה / No session - starting fresh setup');
      
      // Start QR server first (non-blocking)
      qrServer.start().then(qrURL => {
        console.error(`🌐 דפדפן נפתח אוטומטית: ${qrURL}`);
        console.error('🌐 Browser opening automatically:', qrURL);
        console.error('📱 סרוק את הקוד שיופיע בדפדפן / Scan the code that will appear in browser');
      }).catch(qrError => {
        console.error('⚠️ שגיאה בשרת QR, אבל ממשיך... / QR server error, but continuing...');
      });
      
      // Start fresh connection
      await whatsAppConnection.connect();
    }
    
  } catch (error) {
    console.error('❌ שגיאה בחיבור חכם / Smart connection error:', error);
    throw error;
  }
}

// Start the server
async function main() {
  console.error('🎯 מתחיל שרת WhatsApp MCP (אוטומטי) / Starting WhatsApp MCP Server (Automatic)');
  
  try {
    // Smart connection - handles everything automatically
    await smartConnect();
    
    // Start MCP server
    const server = new Server(
      { name: 'whatsapp-mcp-server', version: '1.0.0' },
      { capabilities: { resources: {}, tools: {} } }
    );

    // Register tools
    server.setRequestHandler(ListToolsRequestSchema, async () => {
      return { tools: allTools };
    });

    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      if (!toolHandlers[name]) {
        throw new Error(`Unknown tool: ${name}`);
      }
      
      try {
        const result = await toolHandlers[name](args || {});
        
        // Map our ToolResult format to MCP SDK format
        if (result.isError) {
          throw new Error(result.content[0]?.text || 'Tool execution failed');
        }
        
        return {
          content: result.content
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `Tool execution error: ${error instanceof Error ? error.message : 'Unknown error'}`
          }],
          isError: true
        };
      }
    });

    // Add connection status resource
    server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [
          {
            uri: 'whatsapp://connection/status',
            name: 'WhatsApp Connection Status',
            description: 'Current WhatsApp connection status / סטטוס חיבור ווטסאפ נוכחי',
            mimeType: 'application/json'
          },
          {
            uri: 'whatsapp://connection/info',
            name: 'WhatsApp Connection Info',
            description: 'WhatsApp connection information / מידע חיבור ווטסאפ',
            mimeType: 'application/json'
          },
          {
            uri: 'whatsapp://qr/current',
            name: 'WhatsApp QR Code',
            description: 'Current WhatsApp QR code for scanning / קוד QR נוכחי לסריקה',
            mimeType: 'text/plain'
          }
        ]
      };
    });

    server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;
      
      if (uri === 'whatsapp://connection/status') {
        const isConnected = whatsAppConnection.isConnected();
        return {
          contents: [{
            uri,
            mimeType: 'application/json',
            text: JSON.stringify({
              connected: isConnected,
              timestamp: new Date().toISOString(),
              status: isConnected ? 'מחובר / Connected' : 'לא מחובר / Disconnected'
            }, null, 2)
          }]
        };
      }
      
      if (uri === 'whatsapp://connection/info') {
        const connectionInfo = whatsAppConnection.getConnectionInfo();
        return {
          contents: [{
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(connectionInfo || { message: 'No connection info available' }, null, 2)
          }]
        };
      }
      
      if (uri === 'whatsapp://qr/current') {
        const currentQR = whatsAppConnection.getCurrentQR();
        if (currentQR) {
          return {
            contents: [{
              uri,
              mimeType: 'text/plain',
              text: `WhatsApp QR Code - ${new Date().toLocaleString('he-IL')}
=================================================

סרוק את קוד ה-QR הזה עם ווטסאפ בטלפון:
Scan this QR code with WhatsApp on your phone:

${currentQR}

=================================================
פתח את ווטסאפ בטלפון > הגדרות > מכשירים מקושרים > קשר מכשיר
Open WhatsApp on phone > Settings > Linked Devices > Link Device`
            }]
          };
        } else {
          return {
            contents: [{
              uri,
              mimeType: 'text/plain',
              text: 'אין קוד QR זמין כרגע. השרת מחובר או לא נדרש QR.\nNo QR code available. Server is connected or QR not required.'
            }]
          };
        }
      }
      
      throw new Error(`Unknown resource: ${uri}`);
    });

    // Start stdio server
    const transport = new StdioServerTransport();
    await server.connect(transport);
    
    console.error('✅ שרת MCP פועל! / MCP Server running!');
    console.error('📱 סטטוס ווטסאפ:', whatsAppConnection.isConnected() ? 'מחובר / Connected' : 'ממתין לחיבור / Waiting for connection');
    console.error('🔧 כלים זמינים / Available tools:', allTools.length);
    
  } catch (error) {
    console.error('❌ שגיאה בהפעלת השרת / Server startup error:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.error('\n👋 מכבה את השרת / Shutting down server...');
  await whatsAppConnection.disconnect();
  await qrServer.stop();
  process.exit(0);
});

// Start the server
main().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
}); 