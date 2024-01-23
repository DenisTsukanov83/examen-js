$(document).ready(function () {

    const timeObj = {
        currentDate: new Date,
        get currentDay() {
            return this.currentDate.getDate();
        },
        get currentMonth() {
            return this.currentDate.getMonth() + 1;
        },
        get currentYear() {
            return this.currentDate.getFullYear();
        },
        days: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
        days2: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
        month: ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'],
        oneDay: 1000 * 60 * 60 * 24,
        oneHour: 1000 * 60 * 60,
        oneMinute: 1000 * 60
    }

    //Переключение табов
    $('.tab').click((e) => {
        $('.tab').each(function () {
            $(this).removeClass('tabs-active');
        });
        $(e.target).addClass('tabs-active');
        if ($(e.target).text() == 'Today') {
            $('.forecast').hide();
            $('.today').show();
        } else if ($(e.target).text() == '5-day forecast') {
            $('.forecast').show();
            $('.today').hide();
        }
    });

    //Получение локации пк
    $('.header-search input').val(`${moment.tz.guess().match(/\/\w{1,}/gi).toString().match(/\w{1,}/gi)[0]}`);
    

    //Получение данных о погоде
    function getWeather() {
        const inputCity = $('.header-search input').val();
        const localCity = moment.tz.guess().match(/\/\w{1,}/gi).toString().match(/\w{1,}/gi)[0];
        //Получение данных о местной погоде
        fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${localCity}&appid=d2a0f08b173805303f97e6c81f81d80a`)
            .then(localResponse => localResponse.json())
            .then(localWeater => {
                //Получение данных о погоде из input
                fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${inputCity}&appid=d2a0f08b173805303f97e6c81f81d80a`)
                    .then(inputResponse => inputResponse.json())
                    .then(inputWeather => {
                        //Получение времени по координатам
                        fetch(`http://api.timezonedb.com/v2.1/get-time-zone?key=D6OP7HHYL80J&format=json&by=position&lat=${inputWeather.city.coord.lat}&lng=${inputWeather.city.coord.lon}`)
                        .then(response => response.json())
                        .then(time => {
                            const currentTime = time.formatted;
                            console.log(localWeater)
                            console.log(inputWeather)

                            showCurrentWeather(inputWeather, localWeater, currentTime);
                            showHourlyWeather('.today-hourly-main', inputWeather, 0, currentTime);
                        })
                    })
            })
        //Получение данных о погоде
        
    }

    getWeather();

    //Показать текущую погоду
    function showCurrentWeather(inputData, localData, time) {
        $('.today-current-temp div:first-child').html(`${Math.round(+inputData.list[0].main.temp - 273.15)}&deg;c`);
        $('.today-current-temp div:last-child').html(`Real Feel ${Math.round(+inputData.list[0].main.feels_like - 273.15)}&deg;c`);
        $('.today-current-weather div:first-child img').attr('src', `img/iconsWeather/${inputData.list[0].weather[0].icon.match(/\d\d/)}${getDayOrNight(inputData, time)}.png`);
        $('.today-current-weather div:last-child').html(`${inputData.list[0].weather[0].description}`);
        $('.sunrise').html(`${getTime(inputData, localData, 'sunrise', true)}`);
        $('.sunset').html(`${getTime(inputData, localData, 'sunset', true)}`);
        $('.duration').html(`${getDuration(inputData)}`);
    }

    //Определить день или ночь
    function getDayOrNight(data, time) {
        const currentTime = new Date(time).getHours();
        const sunrise = new Date(data.city.sunrise * 1000).getHours();
        const sunset = new Date(data.city.sunset * 1000).getHours();
        console.log(currentTime, sunrise, sunset)
        let timeLetter = '';
        currentTime > sunrise && currentTime < sunset ? timeLetter = 'd' : timeLetter = 'n';
        return timeLetter;
    }

    //Получить время: заката, рассевета PM или AM
    function getTime(inputTime, localTime, time, upper) {
        let differentTimeZone = inputTime.city.timezone - localTime.city.timezone;
        let timesOfDay = '';
        if(time == 'sunrise') {
            timesOfDay = inputTime.city.sunrise;
        } else if(time == 'sunset') {
            timesOfDay = inputTime.city.sunset;
        }

        let data = new Date((timesOfDay + differentTimeZone) * 1000);
        let prepand = upper ? data.getHours() >= 12 ? 'PM' : 'AM' : data.getHours() >= 12 ? 'pm' : 'am';
        return `${data.getHours() > 12 ? data.getHours() - 12 : data.getHours()}:${data.getMinutes() < 10 ? '0' + data.getMinutes() : data.getMinutes()} ${prepand}`;
    }

    //Продолжительность дня
    function getDuration(data) {
        const duration = new Date((data.city.sunset - data.city.sunrise) * 1000);
        return `${Math.round(duration / timeObj.oneHour)}:${Math.round(duration % timeObj.oneHour / timeObj.oneMinute) < 10 ? '0' + Math.round(duration % timeObj.oneHour / timeObj.oneMinute) : Math.round(duration % timeObj.oneHour / timeObj.oneMinute)} hr`;
    }

    //Показать почасовую погоду
    function showHourlyWeather(parent, data, index, time) {
        let shift = 0;
        switch(true) {
            case index == 0: shift = 0;
            break;
            case index == 1: shift = 8;
            break;
            case index == 2: shift = 16;
            break;
            case index == 3: shift = 24;
            break;
            case index == 4: shift = 32;
            break;
        }
        
        for(let col = 0; col < 5; col++) {
            $(`${parent} .col-${col + 1}`).each((i, el) => {
                let date = new Date(data.list[col + shift].dt_txt);
                
                switch (true) {
                    case i == 0: $(el).html(`${date.getHours() > 12 ? date.getHours() - 12 : date.getHours()}${date.getHours() >= 12 ? 'pm' : 'am'}`);
                    break;
                    case i == 1: $(el).attr('src', `img/iconsWeather/${data.list[col + shift].weather[0].icon.match(/\d\d/)[0]}${getDayOrNight(data, time)}.png`);
                    break;
                    case i == 2: $(el).html(`${data.list[col + shift].weather[0].description}`);
                    break;
                    case i == 3: $(el).html(`${Math.round(+data.list[col + shift].main.temp - 273.15)}&deg;`);
                    break;
                    case i == 4: $(el).html(`${Math.round(+data.list[col + shift].main.feels_like - 273.15)}&deg;`);
                    break;
                    case i == 5: $(el).html(`${Math.round(data.list[col + shift].wind.speed)} ${getDirectionOfTheWind(data.list[col + shift].wind.deg)}`);
                    break;
                }
            });
        }
        
    }

    //Получить направление ветра
    function getDirectionOfTheWind(deg) {
        let direction = '';
        switch (true) {
            case deg > 349 && deg <= 360 || deg >= 0 && deg <= 11: direction = 'N';
                break;
            case deg > 11 && deg <= 34: direction = 'NNE';
                break;
            case deg > 34 && deg <= 56: direction = 'NE';
                break;
            case deg > 56 && deg <= 79: direction = 'ENE';
                break;
            case deg > 79 && deg <= 101: direction = 'E';
                break;
            case deg > 101 && deg <= 124: direction = 'ESE';
                break;
            case deg > 124 && deg <= 146: direction = 'SE';
                break;
            case deg > 146 && deg <= 169: direction = 'SSE';
                break;
            case deg > 169 && deg <= 191: direction = 'S';
                break;
            case deg > 191 && deg <= 214: direction = 'SSW';
                break;
            case deg > 214 && deg <= 236: direction = 'SW';
                break;
            case deg > 236 && deg <= 259: direction = 'WSW';
                break;
            case deg > 259 && deg <= 281: direction = 'W';
                break;
            case deg > 281 && deg <= 304: direction = 'WNW';
                break;
            case deg > 304 && deg <= 326: direction = 'NW';
                break;
            case deg > 326 && deg <= 349: direction = 'NNW';
                break;
        }
        return direction;
    }

    //Вывод текущей даты на страницу
    $('.today-current-header div:last-child').html(`${timeObj.currentDay}.${timeObj.currentMonth > 9 ? timeObj.currentMonth : `0${timeObj.currentMonth}`}.${timeObj.currentYear}`);

    //Ввод города через input, кнопкой "ENTER"
    $('.header input').keydown((e) => {
        if (e.which == 13) {
            getWeather();
        }
    });
});