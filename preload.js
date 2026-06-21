const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  loadClubs: () => ipcRenderer.invoke('load-clubs'),
  saveClubs: (content) => ipcRenderer.invoke('save-clubs', content),
  loadBookmarks: () => ipcRenderer.invoke('load-bookmarks'),
  saveBookmarks: (bookmarks) => ipcRenderer.invoke('save-bookmarks', bookmarks),
  loadNotifications: () => ipcRenderer.invoke('load-notifications'),
  saveNotifications: (notifications) => ipcRenderer.invoke('save-notifications', notifications),
  loadUsers: () => ipcRenderer.invoke('load-users'),
  saveUsers: (users) => ipcRenderer.invoke('save-users', users)
});
