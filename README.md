# 🚀 WhatsApp Web.js MCP Server
## Advanced MCP Server for Complete WhatsApp Control

<div align="center">

![WhatsApp](https://img.shields.io/badge/WhatsApp-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![MCP](https://img.shields.io/badge/MCP-FF6B6B?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K&logoColor=white)

### 🌟 The Most Advanced WhatsApp Control System with Claude AI

*Complete WhatsApp control directly from Claude - send messages, manage chats, contacts and more*

[🎯 **Quick Install**](#-quick-installation) • [📱 **Features**](#-system-capabilities) • [🔧 **Setup**](#-mcp-configuration) • [🚀 **Examples**](#-usage-examples)

</div>

---

## 🎯 What is this?

This is an advanced **Model Context Protocol (MCP)** server that allows **Claude AI** to fully control your WhatsApp:

### ✨ **Key Features:**
- 🔄 **Auto Connection** - Detects existing sessions or shows new QR
- 🌐 **Advanced QR Interface** - Beautiful web interface opens automatically
- 📱 **20 Advanced Tools** for complete WhatsApp control
- 🌍 **Full Multilingual Support** - Hebrew RTL, bilingual messages
- 💾 **Session Persistence** - One-time setup, works forever
- 🚀 **Simple as it gets** - 3-command installation

---

## 📱 System Capabilities

### 📬 **Messaging & Communication**
- ✉️ **Text Messages** with full Unicode support
- 🖼️ **Media** - Images, videos, audio, documents
- 📝 **Media Captions** 
- 💬 **Message Replies** to specific messages
- 👤 **Mentions (@mentions)**
- 🔍 **Message Search** by text content
- ↗️ **Message Forwarding** between chats
- 🗑️ **Message Deletion** (for you or everyone)

### 💬 **Advanced Chat Management**
- 📋 **Chat Listing** (private/groups/all)
- ℹ️ **Detailed Chat Info**
- 📦 **Archive/Unarchive** chats
- 📌 **Pin/Unpin** important chats
- 🔇 **Mute/Unmute** with custom duration
- ✅ **Mark Read/Unread**
- 🧹 **Clear Messages** from chat
- ❌ **Delete Chat** completely

### 👥 **Contact Management**
- 📞 **Full Contact List**
- 🔍 **Search** by name or number
- 👤 **Detailed Contact Info**
- 🚫 **Block/Unblock** contacts
- 📸 **Profile Pictures**
- 📄 **About/Status Messages**
- 👥 **Common Groups**

---

## 🛠️ Quick Installation

### System Requirements:
- **Node.js** 18+ 
- **npm** 
- **Chrome/Chromium** (for whatsapp-web.js)

### 📦 Install in 3 Steps:

```bash
# 1. Clone the project
git clone https://github.com/ozlevyq/whatsapp-webjs-mcp-server.git
cd whatsapp-webjs-mcp-server

# 2. Install dependencies
npm install

# 3. Start - That's it!
npm start
```

**Done!** 🎉 The system will do everything automatically:
- ✅ Check for existing session
- 🌐 Open browser with QR if needed
- 📱 Connect to WhatsApp
- 🚀 Ready for Claude commands

---

## 🔧 MCP Configuration

### ⚙️ Add to Claude Desktop:

**Windows:**
```json
{
  "whatsapp": {
    "command": "node",
    "args": ["C:\\Users\\YourName\\path\\to\\whatsapp-webjs-mcp-server\\dist\\index.js"]
  }
}
```

**Mac:**
```json
{
  "whatsapp": {
    "command": "node",
    "args": ["/Users/YourName/path/to/whatsapp-webjs-mcp-server/dist/index.js"]
  }
}
```

**Linux:**
```json
{
  "whatsapp": {
    "command": "node",
    "args": ["/home/YourName/path/to/whatsapp-webjs-mcp-server/dist/index.js"]
  }
}
```

### 📍 Configuration File Locations:

**Windows:**
```
%APPDATA%\Claude\claude_desktop_config.json
```

**Mac:**
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Linux:**
```
~/.config/Claude/claude_desktop_config.json
```

---

## 🚀 Usage Examples

### 📱 **Send Message:**
```
Send to 972501234567@c.us: "Hello! How are you?"
```

### 📋 **Get Chats:**
```
Show me my chat list
```

### 🔍 **Search Contact:**
```
Search for contact named "John"
```

### 📬 **Get Recent Messages:**
```
Get the last 10 messages from the "Friends" group
```

### 💬 **Manage Chat:**
```
Archive the chat with John
Pin the "Work" group
Mute the chat with Mary for 24 hours
```

---

## 🎨 Advanced QR Interface

<div align="center">

![QR Interface](https://via.placeholder.com/600x400/25D366/FFFFFF?text=Beautiful+QR+Interface)

</div>

When connection is needed, the system:
- 🌐 Opens browser automatically
- 🎨 Shows beautiful multilingual interface
- 🔄 Updates in real-time
- ✅ Notifies when connected successfully

### 🌟 **QR Interface Features:**
- **Beautiful Design** - WhatsApp-style green theme
- **Real-time Updates** - Auto-refresh every 3 seconds
- **Multilingual** - English & Hebrew support
- **Responsive** - Works on desktop and mobile
- **Auto-cleanup** - QR disappears when connected

---

## 🔧 Troubleshooting

### ❓ **Browser doesn't open?**
Open manually: `http://localhost:3000`

### ❓ **"invalid wid" error?**
Use format: `number@c.us` (private) or `id@g.us` (groups)

### ❓ **Can't find chats?**
Run first: `whatsapp_get_chats` to get correct IDs

### ❓ **Session expired?**
The system will automatically show new QR code

### ❓ **Connection timeout?**
Make sure WhatsApp Web works in your browser first

---

## 📋 Available Tools

<details>
<summary><strong>📬 Messaging Tools (5)</strong></summary>

1. **whatsapp_send_message** - Send text messages
2. **whatsapp_send_media** - Send images, videos, documents
3. **whatsapp_get_messages** - Retrieve chat messages
4. **whatsapp_forward_message** - Forward messages
5. **whatsapp_delete_message** - Delete messages

</details>

<details>
<summary><strong>💬 Chat Management Tools (8)</strong></summary>

1. **whatsapp_get_chats** - List all chats
2. **whatsapp_get_chat_info** - Get chat details
3. **whatsapp_archive_chat** - Archive/unarchive chats
4. **whatsapp_pin_chat** - Pin/unpin chats
5. **whatsapp_mute_chat** - Mute/unmute chats
6. **whatsapp_mark_as_read** - Mark as read/unread
7. **whatsapp_clear_messages** - Clear chat messages
8. **whatsapp_delete_chat** - Delete chat completely

</details>

<details>
<summary><strong>👥 Contact Management Tools (7)</strong></summary>

1. **whatsapp_get_contacts** - List all contacts
2. **whatsapp_get_contact_info** - Get contact details
3. **whatsapp_block_contact** - Block/unblock contacts
4. **whatsapp_get_profile_picture** - Get profile pictures
5. **whatsapp_get_contact_about** - Get about/status
6. **whatsapp_get_common_groups** - Get shared groups
7. **whatsapp_search_contacts** - Search contacts

</details>

---

## 🚧 Development Status

- ✅ **Stable Release** - Working excellently
- 🔄 **Continuous Development** - Regular improvements
- 🆘 **Full Support** - Available for help
- 🌟 **Feature Requests** - Always welcome

### 🛣️ Roadmap:
- [ ] Group administration tools
- [ ] Business account features
- [ ] Message scheduling
- [ ] Bulk operations
- [ ] Analytics and reporting

---

## 🤝 Support & Contact

<div align="center">

**Developed by:** [Oz Levy](mailto:ozlevy@yadbarzel.info)

📧 **Email:** ozlevy@yadbarzel.info  
📱 **Phone:** +972-53-279-2278

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/yourusername)
[![Email](https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:ozlevy@yadbarzel.info)

</div>

### 💬 **Get Help:**
- 🐛 **Bug Reports** - Open an issue
- 💡 **Feature Requests** - Start a discussion  
- ❓ **Questions** - Check existing issues or ask
- 🤝 **Contributions** - Pull requests welcome

---

## 📜 License

**MIT License** - Free to use, share, and modify! 🎉

```
Copyright (c) 2024 Oz Levy

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 🌟 Contributing

We welcome contributions! Here's how:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### 🎯 **Areas for Contribution:**
- 🐛 Bug fixes
- ✨ New features
- 📚 Documentation improvements
- 🌍 Translations
- 🎨 UI/UX enhancements

---

<div align="center">

### 🌟 Love this project? Give it a star! ⭐

**We appreciate feedback, suggestions, and improvements!**

Made with ❤️ in Israel 🇮🇱

---

**⚡ Ready to control WhatsApp with AI? Start now!**

```bash
npm start
```

</div> 