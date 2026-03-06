
// Local Storage Service to replace the SQLite backend for Netlify compatibility
const USERS_KEY = 'anime_chat_users';
const MESSAGES_KEY = 'anime_chat_messages';

export const db = {
  // Auth
  signup: (username, email, password) => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    if (users.find(u => u.email === email || u.username === username)) {
      throw new Error("User already exists");
    }
    users.push({ username, email, password });
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return { success: true, username };
  },

  login: (email, password) => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) throw new Error("Invalid credentials");
    return { success: true, username: user.username };
  },

  // Chat
  getHistory: (username, persona, sessionId) => {
    const allMessages = JSON.parse(localStorage.getItem(MESSAGES_KEY) || '[]');
    return allMessages.filter(m => 
      m.username === username && 
      (!persona || m.persona === persona) && 
      (!sessionId || m.session_id === sessionId)
    );
  },

  getLatestSession: (username, persona) => {
    const allMessages = JSON.parse(localStorage.getItem(MESSAGES_KEY) || '[]');
    const personaMsgs = allMessages.filter(m => m.username === username && m.persona === persona);
    if (personaMsgs.length === 0) return null;
    return personaMsgs[personaMsgs.length - 1].session_id;
  },

  saveMessage: (msg) => {
    const allMessages = JSON.parse(localStorage.getItem(MESSAGES_KEY) || '[]');
    allMessages.push({ ...msg, timestamp: new Date().toISOString() });
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(allMessages));
    return { success: true };
  },

  clearHistory: (username, persona) => {
    let allMessages = JSON.parse(localStorage.getItem(MESSAGES_KEY) || '[]');
    if (persona) {
      allMessages = allMessages.filter(m => !(m.username === username && m.persona === persona));
    } else {
      allMessages = allMessages.filter(m => m.username !== username);
    }
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(allMessages));
    return { success: true };
  }
};
