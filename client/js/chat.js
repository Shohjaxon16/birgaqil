// BirgaQil — Chat Module (Socket.io)
class ChatManager {
    constructor() {
        this.socket = null;
        this.currentChat = null;
        this.onlineUsers = [];
        this.typingTimeout = null;
    }

    connect() {
        if (!API.isLoggedIn()) return;
        const token = API.getToken();
        this.socket = io({ auth: { token } });

        this.socket.on('connect', () => console.log('🟢 Socket connected'));
        this.socket.on('disconnect', () => console.log('🔴 Socket disconnected'));

        this.socket.on('users:online', (users) => {
            this.onlineUsers = users;
            this.updateOnlineIndicators();
        });

        this.socket.on('message:receive', (msg) => {
            if (this.currentChat === msg.sender_id) {
                this.appendMessage(msg, false);
                this.socket.emit('messages:read', { senderId: msg.sender_id });
            }
            Toast.info(`Yangi xabar: ${msg.sender_username || 'Noma\'lum'}`);
        });

        this.socket.on('message:sent', (msg) => {
            this.appendMessage(msg, true);
        });

        this.socket.on('typing:show', (data) => {
            const el = document.getElementById('typing-indicator');
            if (el && this.currentChat === data.userId) {
                el.textContent = `${data.username} yozmoqda...`;
            }
        });

        this.socket.on('typing:hide', () => {
            const el = document.getElementById('typing-indicator');
            if (el) el.textContent = '';
        });

        this.socket.on('message:error', (data) => {
            Toast.error(data.error || 'Xabar yuborishda xatolik');
        });
    }

    sendMessage(receiverId, message) {
        if (!this.socket || !message.trim()) return;
        this.socket.emit('message:send', { receiverId, message: message.trim() });
    }

    startTyping(receiverId) {
        if (!this.socket) return;
        this.socket.emit('typing:start', { receiverId });
        clearTimeout(this.typingTimeout);
        this.typingTimeout = setTimeout(() => {
            this.socket.emit('typing:stop', { receiverId });
        }, 2000);
    }

    isUserOnline(userId) {
        return this.onlineUsers.some(u => u.id === userId);
    }

    updateOnlineIndicators() {
        document.querySelectorAll('[data-user-id]').forEach(el => {
            const dot = el.querySelector('.online-dot, .offline-dot');
            if (dot) {
                const isOnline = this.isUserOnline(el.dataset.userId);
                dot.className = isOnline ? 'online-dot' : 'offline-dot';
            }
        });
    }

    appendMessage(msg, isSent) {
        const container = document.getElementById('chat-messages');
        if (!container) return;
        const div = document.createElement('div');
        div.className = `message-bubble ${isSent ? 'message-sent' : 'message-received'}`;
        div.innerHTML = `
      <div>${escapeHtml(msg.message)}</div>
      <div class="message-time">${new Date(msg.created_at).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</div>
    `;
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }
}

window.chatManager = new ChatManager();
