const remote = require('electron').remote;
const BrowserWindow = remote.BrowserWindow;




const redirect_uri = 'http://www.example.com/callback'; // Your redirect uri
const SpotifyWebApi = require('spotify-web-api-node');

const fs = require('fs');

let credentials = fs.readFileSync('clientCredentials.json');
var credentials_dict = JSON.parse(credentials);

const client_id = credentials_dict["client_id"]
const client_secret = credentials_dict["client_secret"];


const musicbutton = document.getElementById('music_button');
musicbutton.addEventListener('click', engageMusicPlayer);


document.getElementById("searchbar").addEventListener('change', spotifySearch);


searchInit = false;


function engageMusicPlayer()
  {
    authenticateSpotify();
    launchNcspot();
    
    //createSearch();      //might want a flag to check if this has been clicked before
    //musicbutton.classList.remove("music-off");
    //musicbutton.classList.add("music-on");
    
    //
    //musicbutton.removeEventListener('click',engageMusicPlayer);
    //musicbutton.addEventListener('click',disengageMusicPlayer);

    //document.getElementById("searchbar").removeEventListener('click', shiftUIup);
    //musicbutton.addEventListener('click',shiftUIdown);
    
  }

function engageUI()

  {
    //this is used as callback once ncspot is fully launched
    console.log("engaging UI");
    Keyboard.init();
    displaySearch(); // displays the search bar
    musicButtonOn(); // spins the music button and changes it to an X
    shiftUI();
    

  }



function disengageMusicPlayer()
{
  ytWindow.close();

  musicbutton.classList.remove("music-on");
  musicbutton.classList.add("music-off");
  musicbutton.style.backgroundImage = "url('images/play_button.png')";
  
  musicbutton.removeEventListener('click',disengageMusicPlayer);
  musicbutton.addEventListener('click',engageMusicPlayer);
}

async function launchNcspot()
{
  //here we make sure the session is always dead before launching in order to avoid duplicates
  const command = "lxterminal -- sh -c 'tmux kill-session -t ncspot_session; tmux new-session -s ncspot_session'; sleep 1; tmux send-keys -t ncspot_session ncspot; tmux send-keys -t ncspot_session Enter"

  const { exec } = require ('child_process');
  await exec (command,{shell:true}, (error, stdout, stderr) => {
    //this is our callback funciton that only engages once ncspot is fully launched
      engageUI();
    
    });
  return

}


function shiftUIdown()
{ //shifts UI when the X is clicked

  var spotifyWrap = document.getElementsByClassName('spotifyWrap')[0];
  var clock = document.getElementsByClassName('clock')[0];
  var ui_buttons = document.getElementsByClassName('UI_buttons')[0];
  var keyboard = document.getElementsByClassName('keyboard')[0];

  keyboard.classList.add("keyboard--down");
  keyboard.classList.remove("keyboard--up");
  clock.classList.remove("clock-up");
  spotifyWrap.classList.remove("spotifyWrap-up");
  ui_buttons.classList.remove("UI_buttons-up");

  
  clock.classList.add("clock-down");
  spotifyWrap.classList.add("spotifyWrap-down");
  ui_buttons.classList.add("UI_buttons-down");
}

function shiftUI()
{ //shifts UI when the music button is clicked but before there is input

  var spotifyWrap = document.getElementsByClassName('spotifyWrap')[0];
  var clock = document.getElementsByClassName('clock')[0];
  var ui_buttons = document.getElementsByClassName('UI_buttons')[0];
  var keyboard = document.getElementsByClassName('keyboard')[0];

  
  clock.classList.remove("clock-down");
  spotifyWrap.classList.remove("spotifyWrap-down");
  ui_buttons.classList.remove("UI_buttons-down");
  keyboard.classList.remove("keyboard--down");

  ui_buttons.classList.add("UI_buttons-up");
  clock.classList.add("clock-up");
  spotifyWrap.classList.add("spotifyWrap-up");
  keyboard.classList.add("keyboard--up");
  
  
  
}


function musicButtonOn()
{
  musicbutton.classList.remove("music-off");
  musicbutton.classList.add("music-on");
  musicbutton.style.backgroundImage = "url('images/cancel.jpg')";
  
}
 
function spotifySearch()
  {
    let searchString = document.getElementById("searchbar").value;
    //clearing the results between each run:
    let searchResults = document.getElementsByClassName('searchResults')[0];
    searchResults.innerHTML='';

    const command = "tmux send-keys -t ncspot_session f2; tmux send-keys -t ncspot_session "+searchString+"; tmux send-keys -t ncspot_session Enter"

    const { exec } = require ('child_process');
    let child= exec (command,{shell:true});
    //let child= exec (command2,{shell:true});

    child.stdout.on('data',
          function (data) {
              console.log('command output: ' + data);
          });
      child.stderr.on('data', function (data) {
          //throw errors
          console.log('stderr: ' + data);
      });

      child.on('close', function (code) {
          console.log('child process exited with code ' + code);
      });
      console.log("Search term: "+searchString);
      //we write the search results to our array
      //search_results.fill("");  to empty out the array
      //we wait 1 second for search results to load up -> eventually we should just have a regular wait loop of some sort polling
      setTimeout(displayClipboardContents, 1000);

      spotifyApiSearch();

    
  }


async function pull_and_draw_text(list_pos)
  {
    var text = await navigator.clipboard.readText();
    console.log('Text that will be used from iteration: '+list_pos+" is: "+text);
    
    //create the div with the search resultss
    let searchResults = document.getElementsByClassName('searchResults')[0];
    let searchResult = document.createElement('div');
    
    searchResults.appendChild(searchResult);
    searchResult.setAttribute('height','15%');
    let top_margin = 50+15*list_pos;
    top_margin = top_margin+"%"
    searchResult.setAttribute('top',top_margin);
    searchResult.setAttribute('position','absolute');
    
    searchResult.innerHTML = text;
    return
  }

function createResultDiv(text, list_pos)
{
  let searchResults = document.getElementsByClassName('searchResults')[0];
    let searchResult = document.createElement('div');
    
    searchResults.appendChild(searchResult);
    searchResult.setAttribute('height','15%');
    let top_margin = 50+15*list_pos;
    top_margin = top_margin+"%"
    searchResult.setAttribute('top',top_margin);
    searchResult.setAttribute('position','absolute');
    
    searchResult.innerHTML = text;

    searchResult.onclick = function(){playSong(list_pos);}
}

async function playSong(list_pos)
  {
    console.log("Playing the: "+list_pos+" song.")
    var command = "tmux send-keys -t ncspot_session Home;"
    //command = command + "tmux send-keys -t ncspot_session Down;"

    for (var i =0;i<list_pos+1;i++)
      {
        
        command = command + "tmux send-keys -t ncspot_session Down;"
      }
  
    command = command + "tmux send-keys -t ncspot_session Enter"


    const { exec } = require ('child_process');
    await exec (command,{shell:true});

  }



async function fetchSingleSearchResult(list_pos)
  {//tmux send-keys -t ncspot_session Home;
    var command = "tmux send-keys -t ncspot_session Home;"
    //command = command + "tmux send-keys -t ncspot_session Down;"

    for (var i =0;i<list_pos;i++)
      {
        
        command = command + "tmux send-keys -t ncspot_session Down;"
      }
  
    command = command + "tmux send-keys -t ncspot_session C-x"


    const { exec } = require ('child_process');
    await exec (command,{shell:true});
  
  return 
  }




function displaySearch() {
  //this function is executed when the user clicks on the search bar to type in a search term

  document.getElementsByClassName('spotifyWrap')[0].style.display = "block";
  

}

function hideSearch()
  {
    document.getElementsByClassName('spotifyWrap')[0].style.display = "none";
  }



function authenticateSpotify()
{
  // Create the api object with the credentials
  spotifyApi = new SpotifyWebApi({
    
    redirectUri: 'https://example.com/callback',
    clientId: client_id,
    clientSecret: client_secret
  });

  // Retrieve an access token.
 spotifyApi.clientCredentialsGrant().then(
  function(data) {
    console.log('The access token expires in ' + data.body['expires_in']);
    console.log('The access token is ' + data.body['access_token']);

    // Save the access token so that it's used in future calls
    spotifyApi.setAccessToken(data.body['access_token']);
  },
  function(err) {
    console.log('Something went wrong when retrieving an access token', err);
  }
);
}



songObjects=Array(3);
  // Search tracks whose name, album or artist contains 'Love'
function spotifyApiSearch() 
  {
      let searchString = document.getElementById("searchbar").value;
      
      spotifyApi.searchTracks(searchString)
        .then(function(data) {
        console.log('Success, when searching by: '+searchString);

        console.log(data.body)
  
      for(var i = 0; i < 3; i++) {
        
        
        
        //here we build our Song Object and add it to the right index of our array
        //note - we do not append/push because we dont want to grow the array, but rather keep the same length

        var songObj = {name:data.body.tracks.items[i].name, 
                       artist: data.body.tracks.items[i].artists[0].name, 
                       uri: data.body.tracks.items[i].uri};
        songObjects[i] = songObj;
        var result_string = songObj.name + " - " + songObj.artist;
        createResultDiv(result_string, i);
        //console.log("Result from spotify api: "+result_string)
        

  
      }
      }
  
  
    , function(err) {

      console.log('Error, when searching by: '+searchString);
      console.error(err);
    });
  }