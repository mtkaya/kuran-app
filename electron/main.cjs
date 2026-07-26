const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');

// Keep a global reference of the window object
let mainWindow;

// Check if we're in development mode
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function createWindow() {
    // Create the browser window
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 800,
        minHeight: 600,
        icon: path.join(__dirname, '../public/icons/icon-512x512.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: true,
        },
        // Modern window styling
        titleBarStyle: 'default',
        backgroundColor: '#0a1929', // Dark background matching the app
        show: false, // Don't show until ready
    });

    // Load the app
    if (isDev) {
        // In development, load from Vite dev server
        mainWindow.loadURL('http://localhost:5173');
        // Open DevTools in development
        mainWindow.webContents.openDevTools();
    } else {
        // In production, load the built files
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    // Show window when ready to avoid flashing
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    // Handle external links — only pass safe protocols to the OS
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        try {
            const target = new URL(url);
            if (target.protocol === 'https:' || target.protocol === 'mailto:') {
                shell.openExternal(target.toString());
            }
        } catch {
            // Unparseable URL — drop it
        }
        return { action: 'deny' };
    });

    // Block in-window navigation away from the app
    mainWindow.webContents.on('will-navigate', (event, url) => {
        if (url !== mainWindow.webContents.getURL()) {
            event.preventDefault();
        }
    });

    // Emitted when the window is closed
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Create application menu
    const menuTemplate = [
        {
            label: 'Kur\'an-ı Kerim',
            submenu: [
                { role: 'about', label: 'Hakkında' },
                { type: 'separator' },
                { role: 'hide', label: 'Gizle' },
                { role: 'hideOthers', label: 'Diğerlerini Gizle' },
                { role: 'unhide', label: 'Tümünü Göster' },
                { type: 'separator' },
                { role: 'quit', label: 'Çıkış' }
            ]
        },
        {
            label: 'Düzenle',
            submenu: [
                { role: 'undo', label: 'Geri Al' },
                { role: 'redo', label: 'Yinele' },
                { type: 'separator' },
                { role: 'cut', label: 'Kes' },
                { role: 'copy', label: 'Kopyala' },
                { role: 'paste', label: 'Yapıştır' },
                { role: 'selectAll', label: 'Tümünü Seç' }
            ]
        },
        {
            label: 'Görünüm',
            submenu: [
                { role: 'reload', label: 'Yenile' },
                { role: 'forceReload', label: 'Zorla Yenile' },
                { type: 'separator' },
                { role: 'resetZoom', label: 'Gerçek Boyut' },
                { role: 'zoomIn', label: 'Yakınlaştır' },
                { role: 'zoomOut', label: 'Uzaklaştır' },
                { type: 'separator' },
                { role: 'togglefullscreen', label: 'Tam Ekran' }
            ]
        },
        {
            label: 'Pencere',
            submenu: [
                { role: 'minimize', label: 'Simge Durumuna Küçült' },
                { role: 'zoom', label: 'Yakınlaştır' },
                { type: 'separator' },
                { role: 'close', label: 'Kapat' }
            ]
        },
        {
            label: 'Yardım',
            submenu: [
                {
                    label: 'GitHub',
                    click: async () => {
                        await shell.openExternal('https://github.com/mtkaya/kuran-app');
                    }
                }
            ]
        }
    ];

    // Add DevTools menu item in development
    if (isDev) {
        menuTemplate[2].submenu.push(
            { type: 'separator' },
            { role: 'toggleDevTools', label: 'Geliştirici Araçları' }
        );
    }

    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
    createWindow();

    // On macOS it's common to re-create a window when the dock icon is clicked
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Handle certificate errors (for development)
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
    if (isDev) {
        event.preventDefault();
        callback(true);
    } else {
        callback(false);
    }
});
