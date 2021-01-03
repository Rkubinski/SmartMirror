const remote = require('electron').remote;
const BrowserWindow = remote.BrowserWindow;

const musicbutton = document.getElementById('music_button');
musicbutton.addEventListener('click', () => {
createSearch();      //might want a flag to check if this has been clicked before
ytWindow = initYoutube();
}); 

document.getElementById("searchbar").addEventListener('change', youtubeSearch);


searchInit = false;

function initYoutube()
{
  var ytWindow = new BrowserWindow({
    width: 1024,
    height: 768,
  transparent: true,
  frame: true,
  x:0,
  y:0,
  
    webPreferences: {
      nodeIntegration: true
    }

  })

  ytWindow.loadURL('https://music.youtube.com')

  return ytWindow
}




function initSearch()
  {
    console.log("Initializing the search...");
    ytWindow.webContents.executeJavaScript(`document.getElementsByClassName("search-icon")[0].click()`);
    searchInit = true;
    

  }


 
function youtubeSearch()
  {
    if (searchInit == false)
      {initSearch();}
    document.getElementById("greenSearchButton").style.display = "block";
    let searchString = document.getElementById("searchbar").value;
    var search_command = "document.getElementsByClassName('ytmusic-search-box')[4].value="+'"'+searchString+'"';
    var eventCreationCommand = "var event = new Event('input', {bubbles: true, cancelable: true, });";
    var eventExecutionCommand = "document.getElementsByClassName('ytmusic-search-box')[4].dispatchEvent(event)";
    var suggestionAcquisitionCommand = "el = document.getElementById('suggestions'); \
    for (i =0; i < el.childElementCount;i++) \
      {let val = el.childNodes[i].childNodes[4].title; \
      if (i == 0) \
        {fs.writeFileSync('./suggestions.txt', val);}\
      else { \
        fs.appendFileSync('./suggestions.txt', val);} \
      } \
    "


    ytWindow.webContents.executeJavaScript(search_command);
    ytWindow.webContents.executeJavaScript(eventCreationCommand);
    ytWindow.webContents.executeJavaScript(eventExecutionCommand);
    //ytWindow.webContents.executeJavaScript(suggestionAcquisitionCommand);
    //ytWindow.webContents.document.getElementById('suggestions');


    //console.log(ytWindow.webContents.executeJavaScript("document.getElementById('suggestions')"));
    /*
    
      */

    //ytWindow.webContents.executeJavaScript('console.log(document.getElementsByClassName("input"))');
    //ytWindow.webContents.executeJavaScript('console.log(document.getElementById("suggestion-0"))');
  
  }

function searchForTerm()
{
  let searchString = document.getElementById("searchbar").value;
  let baseURL = "https://music.youtube.com/search?q=";
  let finalURL = baseURL+searchString;
  ytWindow.loadURL(finalURL)
}



function createSearch() {
  document.getElementsByClassName('roundedCorners')[0].style.display = "block";
  document.getElementById('searchbar').style.display = "block";
  document.getElementById('searchicon').style.display = "block";
}



//option 1: wait for full string before clicking search
//reclick search every new keystroke
//option 3: click the search bar again! to type

