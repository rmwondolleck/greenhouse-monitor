var sensor = require("node-dht-sensor");
const LCD = require('@oawu/lcd1602');

const lcd = new LCD();

function celcToFahr( n ) {
    return ((n * 9.0 / 5.0) + 32.0);
}

setInterval(function(){
    sensor.read(11, 4, function(err, temperature, humidity) {
        if (!err) {
            tempF = celcToFahr(temperature)
            console.log(`temp: ${tempF}\`F, humidity: ${humidity}%`);
            lcd.text(0, 0, `temp: ${tempF} `);
            lcd.text(1, 0, `humidity: ${humidity}`);
        }
    });
},5000);
