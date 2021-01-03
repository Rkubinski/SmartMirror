function checkTime(i) {
            
            return (i < 10) ? "0" + i : i;
            
            }


function startTime() {

    var weekdaylist = ['Niedziela','Poniedzialek',"Wtorek","Sroda","Czwartek","Piatek","Sobota"];

    let hour = document.getElementById('hour');
    let minute = document.getElementById('minute');
    let second = document.getElementById('second');
    let day = document.getElementById('day');
    let month = document.getElementById('month');
    let year = document.getElementById('year');
    let weekday = document.getElementById('weekday');

    let date = new Date();

    day.innerHTML = checkTime(date.getDate());
    month.innerHTML = checkTime(date.getMonth()+1) ;
    year.innerHTML = checkTime(date.getFullYear());

    hour.innerHTML = checkTime(date.getHours());
    minute.innerHTML = checkTime(date.getMinutes());
    second.innerHTML = checkTime(date.getSeconds());
    weekday.innerHTML = weekdaylist[date.getDay()];
    t = setTimeout(function () {
    startTime()
    }, 500);
    }
    startTime();