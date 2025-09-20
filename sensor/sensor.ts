<<<<<<< HEAD
<<<<<<< HEAD
import LCD from "@oawu/lcd1602";
=======
import LCD from '@oawu/lcd1602';
const sensor = require("../build/Release/node_dht_sensor");
>>>>>>> 27c2c41 (Initial commit from create-react-router)
=======
import LCD from "@oawu/lcd1602";
>>>>>>> 7ae74a6 (fix history)

const lcd = new LCD();

// Type definition for the sensor.read callback
type SensorCallback = (err: Error | null, temperature: number, humidity: number) => void;

function celcToFahr(n: number): number {
    return (n * 9.0 / 5.0) + 32.0;
}

<<<<<<< HEAD
<<<<<<< HEAD
var sensor = require("node-dht-sensor");

=======
>>>>>>> 27c2c41 (Initial commit from create-react-router)
=======
var sensor = require("node-dht-sensor");

>>>>>>> 7ae74a6 (fix history)
setInterval(() => {
    sensor.read(11, 4, (err: Error | null, temperature: number, humidity: number): void => {
        if (!err) {
            const tempF = celcToFahr(temperature);
            console.log(`temp: ${tempF}\`F, humidity: ${humidity}%`);
            lcd.text(0, 0, `temp: ${tempF} `);
            lcd.text(1, 0, `humidity: ${humidity}`);
        }
    });
}, 5000);