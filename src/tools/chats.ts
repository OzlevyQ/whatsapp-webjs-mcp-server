import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { whatsAppConnection } from '../connection.js';
import { ChatActionArgs, ToolResult } from '../types.js';

// Get All Chats Tool
export const getChatsTool: Tool = {
  name: 'whatsapp_get_chats',
  description: 'Get all WhatsApp chats / קבל את כל הצ\'אטים של ווטסאפ',
  inputSchema: {
    type: 'object',
    properties: {
      limit: {
        type: 'number',
        description: 'Maximum number of chats to retrieve (default: 50) / מספר מקסימלי של צ\'אטים לקבלה',
        default: 50
      },
      type: {
        type: 'string',
        enum: ['all', 'private', 'group'],
        description: 'Type of chats to retrieve / סוג הצ\'אטים לקבלה',
        default: 'all'
      }
    }
  }
};

export async function getChats(args: { limit?: number; type?: 'all' | 'private' | 'group' }): Promise<ToolResult> {
  try {
    if (!whatsAppConnection.isConnected() || !whatsAppConnection.client) {
      return {
        isError: true,
        content: [{ type: 'text', text: 'WhatsApp client is not connected / לקוח ווטסאפ אינו מחובר' }]
      };
    }

    const allChats = await whatsAppConnection.client.getChats();
    
    let filteredChats = allChats;
    if (args.type === 'private') {
      filteredChats = allChats.filter((chat: any) => !chat.isGroup);
    } else if (args.type === 'group') {
      filteredChats = allChats.filter((chat: any) => chat.isGroup);
    }

    const limitedChats = filteredChats.slice(0, args.limit || 50);
    
    const chatList = limitedChats.map((chat: any) => ({
      id: chat.id._serialized,
      name: chat.name,
      isGroup: chat.isGroup,
      isReadOnly: chat.isReadOnly,
      unreadCount: chat.unreadCount,
      timestamp: chat.timestamp ? new Date(chat.timestamp * 1000).toISOString() : null,
      archived: chat.archived,
      pinned: chat.pinned,
      muteExpiration: chat.muteExpiration ? new Date(chat.muteExpiration * 1000).toISOString() : null,
      participantCount: chat.isGroup ? undefined : undefined
    }));

    return {
      content: [{
        type: 'text',
        text: `Found ${limitedChats.length} chats / נמצאו ${limitedChats.length} צ\'אטים:\n\n${JSON.stringify(chatList, null, 2)}`
      }]
    };
  } catch (error) {
    return {
      isError: true,
      content: [{
        type: 'text',
        text: `Failed to get chats / שגיאה בקבלת צ\'אטים: ${error instanceof Error ? error.message : 'Unknown error'}`
      }]
    };
  }
}

// Get Chat Info Tool
export const getChatInfoTool: Tool = {
  name: 'whatsapp_get_chat_info',
  description: 'Get detailed information about a specific chat / קבל מידע מפורט על צ\'אט ספציפי',
  inputSchema: {
    type: 'object',
    required: ['chatId'],
    properties: {
      chatId: {
        type: 'string',
        description: 'Chat ID to get information about / מזהה צ\'אט לקבלת מידע'
      }
    }
  }
};

export async function getChatInfo(args: { chatId: string }): Promise<ToolResult> {
  try {
    if (!whatsAppConnection.isConnected() || !whatsAppConnection.client) {
      return {
        isError: true,
        content: [{ type: 'text', text: 'WhatsApp client is not connected / לקוח ווטסאפ אינו מחובר' }]
      };
    }

    const chat = await whatsAppConnection.client.getChatById(args.chatId);
    
    let chatInfo: any = {
      id: chat.id._serialized,
      name: chat.name,
      isGroup: chat.isGroup,
      isReadOnly: chat.isReadOnly,
      unreadCount: chat.unreadCount,
      timestamp: chat.timestamp ? new Date(chat.timestamp * 1000).toISOString() : null,
      archived: chat.archived,
      pinned: chat.pinned,
      muteExpiration: chat.muteExpiration ? new Date(chat.muteExpiration * 1000).toISOString() : null,
      participantCount: chat.isGroup ? undefined : undefined
    };

    // For group chats, try to get additional info
    if (chat.isGroup) {
      try {
        // Get group metadata separately if available
        const groupChat = chat as any;
        if (groupChat.groupMetadata) {
          chatInfo.groupMetadata = {
            creation: groupChat.groupMetadata.creation ? new Date(groupChat.groupMetadata.creation * 1000).toISOString() : null,
            owner: groupChat.groupMetadata.owner || null,
            desc: groupChat.groupMetadata.desc || null,
            descOwner: groupChat.groupMetadata.descOwner || null,
            descId: groupChat.groupMetadata.descId || null,
            restrict: groupChat.groupMetadata.restrict || false,
            announce: groupChat.groupMetadata.announce || false
          };
        }
      } catch (e) {
        // Group metadata might not be available
        console.log('Group metadata not available');
      }
    }

    return {
      content: [{
        type: 'text',
        text: `Chat information / מידע צ\'אט:\n\n${JSON.stringify(chatInfo, null, 2)}`
      }]
    };
  } catch (error) {
    return {
      isError: true,
      content: [{
        type: 'text',
        text: `Failed to get chat info / שגיאה בקבלת מידע צ\'אט: ${error instanceof Error ? error.message : 'Unknown error'}`
      }]
    };
  }
}

// Archive Chat Tool
export const archiveChatTool: Tool = {
  name: 'whatsapp_archive_chat',
  description: 'Archive or unarchive a chat / ארכב או בטל ארכוב של צ\'אט',
  inputSchema: {
    type: 'object',
    required: ['chatId'],
    properties: {
      chatId: {
        type: 'string',
        description: 'Chat ID to archive/unarchive / מזהה צ\'אט לארכוב/ביטול ארכוב'
      },
      archive: {
        type: 'boolean',
        description: 'True to archive, false to unarchive / אמת לארכוב, שקר לביטול ארכוב',
        default: true
      }
    }
  }
};

export async function archiveChat(args: { chatId: string; archive?: boolean }): Promise<ToolResult> {
  try {
    if (!whatsAppConnection.isConnected() || !whatsAppConnection.client) {
      return {
        isError: true,
        content: [{ type: 'text', text: 'WhatsApp client is not connected / לקוח ווטסאפ אינו מחובר' }]
      };
    }

    const chat = await whatsAppConnection.client.getChatById(args.chatId);
    const shouldArchive = args.archive !== false;
    
    // Fix: archive() method doesn't take parameters in WhatsApp Web.js
    if (shouldArchive) {
      await chat.archive();
    } else {
      await chat.unarchive();
    }
    
    return {
      content: [{
        type: 'text',
        text: `Chat ${shouldArchive ? 'archived' : 'unarchived'} successfully! / צ\'אט ${shouldArchive ? 'אורכב' : 'בוטל ארכובו'} בהצלחה!\nChat: ${chat.name || args.chatId}`
      }]
    };
  } catch (error) {
    return {
      isError: true,
      content: [{
        type: 'text',
        text: `Failed to archive chat / שגיאה בארכוב צ\'אט: ${error instanceof Error ? error.message : 'Unknown error'}`
      }]
    };
  }
}

// Pin Chat Tool
export const pinChatTool: Tool = {
  name: 'whatsapp_pin_chat',
  description: 'Pin or unpin a chat / נעץ או בטל נעיצה של צ\'אט',
  inputSchema: {
    type: 'object',
    required: ['chatId'],
    properties: {
      chatId: {
        type: 'string',
        description: 'Chat ID to pin/unpin / מזהה צ\'אט לנעיצה/ביטול נעיצה'
      },
      pin: {
        type: 'boolean',
        description: 'True to pin, false to unpin / אמת לנעיצה, שקר לביטול נעיצה',
        default: true
      }
    }
  }
};

export async function pinChat(args: { chatId: string; pin?: boolean }): Promise<ToolResult> {
  try {
    if (!whatsAppConnection.isConnected() || !whatsAppConnection.client) {
      return {
        isError: true,
        content: [{ type: 'text', text: 'WhatsApp client is not connected / לקוח ווטסאפ אינו מחובר' }]
      };
    }

    const chat = await whatsAppConnection.client.getChatById(args.chatId);
    const shouldPin = args.pin !== false;
    
    // Fix: pin() method doesn't take parameters in WhatsApp Web.js
    if (shouldPin) {
      await chat.pin();
    } else {
      await chat.unpin();
    }
    
    return {
      content: [{
        type: 'text',
        text: `Chat ${shouldPin ? 'pinned' : 'unpinned'} successfully! / צ\'אט ${shouldPin ? 'ננעץ' : 'בוטלה נעיצתו'} בהצלחה!\nChat: ${chat.name || args.chatId}`
      }]
    };
  } catch (error) {
    return {
      isError: true,
      content: [{
        type: 'text',
        text: `Failed to pin chat / שגיאה בנעיצת צ\'אט: ${error instanceof Error ? error.message : 'Unknown error'}`
      }]
    };
  }
}

// Mute Chat Tool
export const muteChatTool: Tool = {
  name: 'whatsapp_mute_chat',
  description: 'Mute or unmute a chat / השתק או בטל השתקה של צ\'אט',
  inputSchema: {
    type: 'object',
    required: ['chatId'],
    properties: {
      chatId: {
        type: 'string',
        description: 'Chat ID to mute/unmute / מזהה צ\'אט להשתקה/ביטול השתקה'
      },
      mute: {
        type: 'boolean',
        description: 'True to mute, false to unmute / אמת להשתקה, שקר לביטול השתקה',
        default: true
      },
      duration: {
        type: 'number',
        description: 'Mute duration in seconds (default: 8 hours = 28800) / משך השתקה בשניות',
        default: 28800
      }
    }
  }
};

export async function muteChat(args: { chatId: string; mute?: boolean; duration?: number }): Promise<ToolResult> {
  try {
    if (!whatsAppConnection.isConnected() || !whatsAppConnection.client) {
      return {
        isError: true,
        content: [{ type: 'text', text: 'WhatsApp client is not connected / לקוח ווטסאפ אינו מחובר' }]
      };
    }

    const chat = await whatsAppConnection.client.getChatById(args.chatId);
    const shouldMute = args.mute !== false;
    
    if (shouldMute) {
      const duration = args.duration || 28800; // 8 hours default
      const until = new Date(Date.now() + duration * 1000);
      await chat.mute(until);
    } else {
      await chat.unmute();
    }
    
    return {
      content: [{
        type: 'text',
        text: `Chat ${shouldMute ? 'muted' : 'unmuted'} successfully! / צ\'אט ${shouldMute ? 'הושתק' : 'בוטלה השתקתו'} בהצלחה!\nChat: ${chat.name || args.chatId}${shouldMute ? `\nDuration: ${args.duration || 28800} seconds` : ''}`
      }]
    };
  } catch (error) {
    return {
      isError: true,
      content: [{
        type: 'text',
        text: `Failed to mute chat / שגיאה בהשתקת צ\'אט: ${error instanceof Error ? error.message : 'Unknown error'}`
      }]
    };
  }
}

// Mark as Read Tool
export const markAsReadTool: Tool = {
  name: 'whatsapp_mark_as_read',
  description: 'Mark chat as read or unread / סמן צ\'אט כנקרא או לא נקרא',
  inputSchema: {
    type: 'object',
    required: ['chatId'],
    properties: {
      chatId: {
        type: 'string',
        description: 'Chat ID to mark as read/unread / מזהה צ\'אט לסימון כנקרא/לא נקרא'
      },
      read: {
        type: 'boolean',
        description: 'True to mark as read, false to mark as unread / אמת לסימון כנקרא, שקר לסימון כלא נקרא',
        default: true
      }
    }
  }
};

export async function markAsRead(args: { chatId: string; read?: boolean }): Promise<ToolResult> {
  try {
    if (!whatsAppConnection.isConnected() || !whatsAppConnection.client) {
      return {
        isError: true,
        content: [{ type: 'text', text: 'WhatsApp client is not connected / לקוח ווטסאפ אינו מחובר' }]
      };
    }

    const chat = await whatsAppConnection.client.getChatById(args.chatId);
    const shouldMarkRead = args.read !== false;
    
    if (shouldMarkRead) {
      // Use sendSeen() to mark as read
      await chat.sendSeen();
    } else {
      // Use markUnread() to mark as unread
      await chat.markUnread();
    }
    
    return {
      content: [{
        type: 'text',
        text: `Chat marked as ${shouldMarkRead ? 'read' : 'unread'} successfully! / צ\'אט סומן כ${shouldMarkRead ? 'נקרא' : 'לא נקרא'} בהצלחה!\nChat: ${chat.name || args.chatId}`
      }]
    };
  } catch (error) {
    return {
      isError: true,
      content: [{
        type: 'text',
        text: `Failed to mark chat / שגיאה בסימון צ\'אט: ${error instanceof Error ? error.message : 'Unknown error'}`
      }]
    };
  }
}

// Clear Messages Tool
export const clearMessagesTool: Tool = {
  name: 'whatsapp_clear_messages',
  description: 'Clear all messages in a chat / נקה את כל ההודעות בצ\'אט',
  inputSchema: {
    type: 'object',
    required: ['chatId'],
    properties: {
      chatId: {
        type: 'string',
        description: 'Chat ID to clear messages from / מזהה צ\'אט לניקוי הודעות'
      }
    }
  }
};

export async function clearMessages(args: { chatId: string }): Promise<ToolResult> {
  try {
    if (!whatsAppConnection.isConnected() || !whatsAppConnection.client) {
      return {
        isError: true,
        content: [{ type: 'text', text: 'WhatsApp client is not connected / לקוח ווטסאפ אינו מחובר' }]
      };
    }

    const chat = await whatsAppConnection.client.getChatById(args.chatId);
    await chat.clearMessages();
    
    return {
      content: [{
        type: 'text',
        text: `Chat messages cleared successfully! / הודעות הצ\'אט נוקו בהצלחה!\nChat: ${chat.name || args.chatId}`
      }]
    };
  } catch (error) {
    return {
      isError: true,
      content: [{
        type: 'text',
        text: `Failed to clear messages / שגיאה בניקוי הודעות: ${error instanceof Error ? error.message : 'Unknown error'}`
      }]
    };
  }
}

// Delete Chat Tool
export const deleteChatTool: Tool = {
  name: 'whatsapp_delete_chat',
  description: 'Delete a chat / מחק צ\'אט',
  inputSchema: {
    type: 'object',
    required: ['chatId'],
    properties: {
      chatId: {
        type: 'string',
        description: 'Chat ID to delete / מזהה צ\'אט למחיקה'
      }
    }
  }
};

export async function deleteChat(args: { chatId: string }): Promise<ToolResult> {
  try {
    if (!whatsAppConnection.isConnected() || !whatsAppConnection.client) {
      return {
        isError: true,
        content: [{ type: 'text', text: 'WhatsApp client is not connected / לקוח ווטסאפ אינו מחובר' }]
      };
    }

    const chat = await whatsAppConnection.client.getChatById(args.chatId);
    await chat.delete();
    
    return {
      content: [{
        type: 'text',
        text: `Chat deleted successfully! / צ\'אט נמחק בהצלחה!\nChat: ${chat.name || args.chatId}`
      }]
    };
  } catch (error) {
    return {
      isError: true,
      content: [{
        type: 'text',
        text: `Failed to delete chat / שגיאה במחיקת צ\'אט: ${error instanceof Error ? error.message : 'Unknown error'}`
      }]
    };
  }
} 