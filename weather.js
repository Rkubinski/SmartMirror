var weather = require('openweather-apis');
 
weather.setLang('pl');
weather.setCity('Montreal');
weather.setUnits('metric');

weather.setAPPID("1cb8282ba83f96fd3e4b8737a91e1274");

const temp_button = document.getElementById('temperature_button');
temp_button.addEventListener('click', 
getWeather);


function getWeather()
    {
    
    temp_button.removeEventListener('click',getWeather);
    temp_button.classList.add('display-temp');
    temp_button.classList.remove('hide-temp');
    weather.getAllWeather(function(err, JSONObj){
    console.log(JSONObj);
    
    

    var temperature = JSONObj.main.temp;
    var hi = JSONObj.main.temp_max;
    var lo = JSONObj.main.temp_min;


    if (hi == "undefined" || lo=="undefined")
        { var temp_string = "temp: "+ temperature;}

    else
    {
        var temp_string = "temp: "+ temperature +"<br></br>"+ "max: "+ hi+"<br></br>"+"low: "+lo;
    }
    
    

    if (document.getElementById("temp_values") == null)
    {
    console.log("Temp values doesnt exist.. creating it an displaying it");
    var temperature_div = document.createElement("div");
    temperature_div.id = "temp_values";

    document.getElementsByClassName("weather")[0].appendChild(temperature_div);
    console.log("Temp string is: "+temp_string);
    temperature_div.innerHTML = temp_string;
    temperature_div.style.position = 'absolute';
    temperature_div.top = 0;
    temperature_div.style.left= '75%';
    }
    
    else{
    console.log('Temp values exists but was hidden.. displaying now');
    var temperature_div = document.getElementById("temp_values");
    temperature_div.style.display='block';
    
    }
    
    temp_button.addEventListener('click',function(){hideWeather(temperature_div);});
});

    }

function hideWeather(temperature_div)
{   
    temp_button.classList.add('hide-temp');
    temp_button.classList.remove('display-temp');
    console.log("Executing weather value hiding");
    temperature_div.style.display='none';
    temp_button.removeEventListener('click',hideWeather);
    temp_button.addEventListener('click', getWeather);
    
}