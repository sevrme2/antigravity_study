const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1180,
    height: 850,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    title: "고려대학교 중앙동아리 통합 플랫폼 - KU Club Hub",
    autoHideMenuBar: true
  });

  mainWindow.loadFile('index.html');
  
  // Development helper
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// File paths
const CLUBS_CSV_PATH = path.join(__dirname, 'clubs.csv');
const BOOKMARKS_JSON_PATH = path.join(__dirname, 'bookmarks.json');
const NOTIFICATIONS_JSON_PATH = path.join(__dirname, 'notifications.json');
const USERS_JSON_PATH = path.join(__dirname, 'users.json');

// Helper to check and create files if they don't exist
function ensureFileExists(filePath, defaultContent = '') {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, defaultContent, 'utf-8');
  }
}

// IPC Handlers
ipcMain.handle('load-clubs', () => {
  ensureFileExists(CLUBS_CSV_PATH, 'id,name,category,keyword,status,start_date,end_date,period_text,activities,join_method,contact,location\n');
  return fs.readFileSync(CLUBS_CSV_PATH, 'utf-8');
});

ipcMain.handle('save-clubs', (event, content) => {
  fs.writeFileSync(CLUBS_CSV_PATH, content, 'utf-8');
  return { success: true };
});

ipcMain.handle('load-bookmarks', () => {
  ensureFileExists(BOOKMARKS_JSON_PATH, '[]');
  const content = fs.readFileSync(BOOKMARKS_JSON_PATH, 'utf-8');
  try {
    return JSON.parse(content);
  } catch (e) {
    return [];
  }
});

ipcMain.handle('save-bookmarks', (event, bookmarks) => {
  fs.writeFileSync(BOOKMARKS_JSON_PATH, JSON.stringify(bookmarks, null, 2), 'utf-8');
  return { success: true };
});

ipcMain.handle('load-notifications', () => {
  ensureFileExists(NOTIFICATIONS_JSON_PATH, '[]');
  const content = fs.readFileSync(NOTIFICATIONS_JSON_PATH, 'utf-8');
  try {
    return JSON.parse(content);
  } catch (e) {
    return [];
  }
});

ipcMain.handle('save-notifications', (event, notifications) => {
  fs.writeFileSync(NOTIFICATIONS_JSON_PATH, JSON.stringify(notifications, null, 2), 'utf-8');
  return { success: true };
});

ipcMain.handle('load-users', () => {
  ensureFileExists(USERS_JSON_PATH, '[]');
  const content = fs.readFileSync(USERS_JSON_PATH, 'utf-8');
  try {
    return JSON.parse(content);
  } catch (e) {
    return [];
  }
});

ipcMain.handle('save-users', (event, users) => {
  fs.writeFileSync(USERS_JSON_PATH, JSON.stringify(users, null, 2), 'utf-8');
  return { success: true };
});
