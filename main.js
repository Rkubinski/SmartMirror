const {app, BrowserWindow} = require('electron');
const path = require('path');


function createWindow() {

    win = new BrowserWindow({
    resizable: true,
    webPreferences: {
        nodeIntegration: true
    }
    })

   

    
    //load html files
    win.loadFile(path.join(__dirname,'index.html'));
    //musicWindow.loadURL('file://' + __dirname + '/music_player.html');
    //win.setFullScreen(true);
    win.toggleDevTools();
    win.setAlwaysOnTop(true, 'screen');
    win.on('closed', () => {win = null;})

    


}






//run window on start
app.on('ready', createWindow)








app.on('window-all-closed',()=> {
    if(process.platform !== 'darwin')
         {app.quit();}
})

