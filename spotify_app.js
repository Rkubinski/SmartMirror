const remote = require('electron').remote;
const request = require('request')




//September 7 2020 approach - use existing wrapper for the api (spotify-web-api-node)
var SpotifyWebApi = require('spotify-web-api-node');
// credentials are optional

//Client credentials flow - doesnt give permission to actually play music lol
/*
// Create the api object with the credentials
var spotifyApi = new SpotifyWebApi({
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
);*/
const BrowserWindow = remote.BrowserWindow;
var fs = require('fs');
var authenticated = false;
if (authenticated == false)
{
  
  musicbutton = document.getElementById('music_button');
  musicbutton.addEventListener('click', () => {
  authenticateSpotify();     //might want a flag to check if this has been clicked before
  }); 
}

function authenticateSpotify()
{
  //authorization code flow - should link with my acc and allow me to play music
  var scopes = ['user-read-private', 'user-read-email','playlist-modify-public','playlist-modify-private','streaming','user-modify-playback-state']
  var redirectUri = 'https://example.com/callback'
  var state = "example-state"

  // Setting credentials can be done in the wrapper's constructor, or using the API object's setters.
  spotifyApi = new SpotifyWebApi({
    redirectUri: redirectUri,
    clientId: client_id
  });

  // Create the authorization URL
  var authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);
  console.log("AuthorizeURL:"+authorizeURL);

  authWindow = new BrowserWindow({
    width: 500,
    height: 500,
  transparent: true,
  frame: true,
  x:0,
  y:0,
  alwaysOnTop:true,
  resizable:false,
    webPreferences: {
      nodeIntegration: true
    }
  })
  authWindow.loadURL(authorizeURL)
  
  //we wait for authentication to succeed or fail
  authWindow.on('page-title-updated', function(event, title){
    url = authWindow.webContents.getURL();
  })

  var i = setInterval(function(){
    var newURL = authWindow.webContents.getURL();
    if(!newURL.includes("spotify")){ //If auth is done
      if(newURL.split("?")[1] != void(0)){
        clearInterval(i)
        console.log("new url: "+newURL);
        accessCode = newURL.split("?")[1].substring(5).split("&")[0]
        //fs.writeFile('spotifyAuth.txt', accessCode, function(err){
          //if (err) return console.log(err);
        //authWindow.close()
        //authWindow.loadURL()
        getTokens();
        sdkInit(authWindow);
        
        //});
      }
    }else{
      authWindow.show();
    }
  },5000)

  var authenticated = true;
   
}

function sdkInit(browserWin)
  {
    browserWin.onSpotifyWebPlaybackSDKReady = () => {
      
      const player = new Spotify.Player({
        name: 'Web Playback SDK Quick Start Player',
        getOAuthToken: cb => { cb(aToken); }
      });

  }
}

function getTokens()
  {

    var credentials = {
      clientId: client_id,
      clientSecret: client_secret,
      redirectUri: 'https://example.com/callback'
    };
    
    spotifyApi = new SpotifyWebApi(credentials);

    console.log("access code: "+accessCode);
    spotifyApi.authorizationCodeGrant(accessCode).then(
      function(data) {
        console.log('The token expires in ' + data.body['expires_in']);
        console.log('The access token is ' + data.body['access_token']);
        console.log('The refresh token is ' + data.body['refresh_token']);
    
        // Set the access token on the API object to use it in later calls
        aToken=data.body['access_token'];
        spotifyApi.setAccessToken(data.body['access_token']);
        spotifyApi.setRefreshToken(data.body['refresh_token']);
      },
      function(err) {
        console.log('Something went wrong!', err);
      }
    );
  }



function clearResults()
{
      //Cleaning up the div values prior to searching
      for(var i = 0; i < 4; i++) {
        console.log("Clearing...")
        var elementId = "result"+String(i+1);
        document.getElementById(elementId).innerHTML = "";
      }
}

songObjects=Array(4);
// Search tracks whose name, album or artist contains 'Love'
function spotifySearch() 
{
    let searchString = document.getElementById("searchbar").value;

    spotifyApi.searchTracks(searchString)
      .then(function(data) {
      console.log('Success, when searching by: '+searchString);
    clearResults();
      console.log(data.body)

    for(var i = 0; i < data.body.tracks.items.length; i++) {
      if (i <4)
      
      {
      //here we build our Song Object and add it to the right index of our array
      //note - we do not append/push because we dont want to grow the array, but rather keep the same length
      var elementId = "result"+String(i+1);
      var songObj = {name:data.body.tracks.items[i].name, 
                     artist: data.body.tracks.items[i].artists[0].name, 
                     div_associated: elementId,
                     uri: data.body.tracks.items[i].uri};
      songObjects[i] = songObj;
      var result_string = songObj.name + " - " + songObj.artist;
      
      document.getElementById(elementId).innerHTML = result_string;
      }
      else
      {
        break;
      }

    }
    }


  , function(err) {
    clearResults();
    console.log('Error, when searching by: '+searchString);
    console.error(err);
  });
}



//this will search through the songList and match the div ID that was clicked
function searchSongList(divElement)
{ div_clicked = divElement.id;
  
  for (var i = 0; i<4;i++)
    {
      if (songObjects[i].div_associated == div_clicked);
        {
          
          console.log("Name: "+ songObjects[i].name +  "Uri: "+songObjects[i].uri)
          return songObjects[i].uri;
        }
    }
}

function playSong(divElement)
  {

    uri = searchSongList(divElement);
    
    final_uri = uri.split(':')[2]
    console.log("Final URI " + final_uri);

    request.post('https://api.spotify.com/v1/me/player/queue?uri='+final_uri, {
        headers: {'Authorization': "Bearer " + aToken},
        json: true
        }, (error, res, body) => {
          if (error) {
            console.error(error)
            return
          }
          console.log(`statusCode: ${res.statusCode}`)
          //console.log(body);
          
        })
    spotifyApi.play({ uris:["spotify:track:5vRjgnpoB2v13cVspmwyOy","spotify:track:1IUhep4EzX4toHdjE3jQ2D"] })
    /* this doesnt seem to work, not sure why
    spotifyApi.play({ uris:[final_uri] }).then(
      function (data)
      {
        console.log("Current song: "+ data['is_playing']);
      },
    function(err) {
      console.log('Something went wrong: ', err);
    }


    );
    */
    
  }
