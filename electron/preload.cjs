const { contextBridge, ipcRenderer, webFrame } = require('electron')

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electronAPI', {
    zoomIn: () => {
      webFrame.setZoomLevel(webFrame.getZoomLevel() + 0.5)
    },
    zoomOut: () => {
      webFrame.setZoomLevel(webFrame.getZoomLevel() - 0.5)
    },
    minimizeApp: () => {
      ipcRenderer.send('window-minimize')
    },
    toggleMaximizeApp: () => {
      ipcRenderer.send('window-maximize')
    },
    closeApp: () => {
      ipcRenderer.send('window-close')
    },
    send: (channel, data) => {
      // whitelist channels
      let validChannels = ['window-close', 'window-minimize', 'music-play', 'music-pause']
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data)
      }
    },
    receive: (channel, func) => {
      let validChannels = ['music-progress', 'music-status']
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender` 
        ipcRenderer.on(channel, (event, ...args) => func(...args))
      }
    },
    invoke: (channel, data) => {
      let validChannels = ['dialog:selectFolder', 'music:scanFolder', 'dialog:selectImage']
      if (validChannels.includes(channel)) {
        return ipcRenderer.invoke(channel, data)
      }
    }
  }
)
