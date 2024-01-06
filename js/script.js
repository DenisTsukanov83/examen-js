$(document).ready(function () {
    const tabs = {
        tabs: $('.tab'),
        today: $('.today'),
        forecast: $('.farecast')
    }

    tabs.tabs.click((e) => {
        tabs.tabs.each(function () {
            $(this).removeClass('tabs-active')
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

    const time = {
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
        oneDay: 1000 * 60 * 60 * 24,
        oneHour: 1000 * 60 * 60,
        oneMinute: 1000 * 60
    }



    function getTime(time, upper) {
        let data = new Date(time * 1000);
        let prepand = upper ? data.getHours() >= 12 ? 'PM' : 'AM' : data.getHours() >= 12 ? 'pm' : 'am';
        return `${data.getHours() > 12 ? data.getHours() - 12 : data.getHours()}:${data.getMinutes() < 10 ? '0' + data.getMinutes() : data.getMinutes()} ${prepand}`;
    }

    function getDuration(sunset, sunrise) {
        let duration = new Date((sunset - sunrise) * 1000);
        return `${Math.trunc(duration / time.oneHour)}:${Math.trunc(duration % time.oneHour / time.oneMinute) < 10 ? '0' + Math.trunc(duration % time.oneHour / time.oneMinute) : Math.trunc(duration % time.oneHour / time.oneMinute)} hr`;
    }

    function getCurrentWeather(dataList) {
        let data = dataList.list[0];
        $('.today-current-temp div:first-child').html(`${JSON.stringify(Math.round(+data.main.temp - 273.15))}&deg;c`);
        $('.today-current-temp div:last-child').html(`Real Feel ${JSON.stringify(Math.round(+data.main.feels_like - 273.15))}&deg;c`);
        $('.today-current-weather div:first-child img').attr('src', `../img/iconsWeather/${data.weather[0].icon}.png`);
        $('.today-current-weather div:last-child').html(`${data.weather[0].description}`);
        $('.sunrise').html(`${getTime(dataList.city.sunrise, true)}`);
        $('.sunset').html(`${getTime(dataList.city.sunset, true)}`);
        $('.duration').html(`${getDuration(dataList.city.sunset, dataList.city.sunrise)}`);
    }

    function getHourlyWeather(col, dataList, index) {
        $(`${col}`).each((i, el) => {
            let date = new Date(dataList.list[index].dt_txt);
            console.log(dataList.list[index].weather[0].icon.match(/\d\d/)[0])
            switch (true) {
                case i == 0: $(el).html(`${date.getHours() > 12 ? date.getHours() - 12 : date.getHours()}${date.getHours() >= 12 ? 'pm' : 'am'}`);
                    break;
                case i == 1: $(el).attr('src', `../img/iconsWeather/${dataList.list[index].weather[0].icon.match(/\d\d/)[0]}${getDayOrNight(dataList)}.png`);
                    break;
                case i == 2: $(el).html(`${dataList.list[index].weather[0].description}`);
                    break;
                case i == 3: $(el).html(`${Math.round(+dataList.list[index].main.temp - 273.15)}&deg;`);
                    break;
                case i == 4: $(el).html(`${Math.round(+dataList.list[index].main.feels_like - 273.15)}&deg;`);
                    break;
                case i == 5: $(el).html(`${Math.round(dataList.list[index].wind.speed)} ${getDirectionOfTheWind(dataList.list[index].wind.deg)}`);
                    break;
            }
        });
    }

    function getDayOrNight(data) {
        let dayOrNight = '';
        const date = new Date();
        const currentDate = date.getTime();
        currentDate > data.city.sunrise * 1000 || currentDate < data.city.sunset * 1000 ? dayOrNight = 'd' : dayOrNight = 'n';
        return dayOrNight;
    }

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

    async function getCurrentPositionPromise() {
        return new Promise((res, rej) => {
            navigator.geolocation.getCurrentPosition(
                (position) => res(position),
                (e) => rej(e)
            )
        })
    }

    async function currentGeoPositionRequest() {
        try {
            /* const currentPosition = await getCurrentPositionPromise();
            return currentPosition */
            await getCurrentPositionPromise().then((data) => {
                let url = `http://api.openweathermap.org/geo/1.0/reverse?lat=${data.coords.latitude}&lon=${data.coords.longitude}&limit=5&appid=d2a0f08b173805303f97e6c81f81d80a`
                fetch(url)
                    .then(response => response.json())
                    .then(data => {
                        console.log(data[0].name)
                        getWeather(data[0].name);
                    })
            });
        } catch (e) {
            console.error('Error>>', e);
        }
    }
    currentGeoPositionRequest()
    
    $('.today-current-header div:last-child').html(`${time.currentDay}.${time.currentMonth > 9 ? time.currentMonth : `0${time.currentMonth}`}.${time.currentYear}`);


    async function getWeather(city = '') {
        if(city) {
            $('.header input').attr('value', city);
        }
        let url = `https://api.openweathermap.org/data/2.5/forecast?q=${city ? city : $('.header input').val()}&appid=d2a0f08b173805303f97e6c81f81d80a`;
        /* let url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=d2a0f08b173805303f97e6c81f81d80a` */

        await fetch(url)
            .then(response => response.json())
            .then(dataList => {
                console.log(dataList)
                getCurrentWeather(dataList);
                for (let i = 0; i < 5; i++) {
                    getHourlyWeather(`.col-${i + 1}`, dataList, i)
                }


            })
            .catch(console.error);
    }
    $('.header input').keydown((e) => {
        if (e.which == 13) {
            getWeather();
        }
    });


});