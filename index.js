const fs = require('fs');

function readOverview() {
    let rawdata = fs.readFileSync('RIPE-Atlas-AllMeasurements.json');
    let measurements = JSON.parse(rawdata).results;
    return measurements;
}


async function downloadMeasurements(measurements) {
    if (!fs.existsSync('measurements')) {
        fs.mkdirSync('measurements');
    }

    for await (const measurement of measurements) {
        let desc = measurement.description;

        // Change these to fit your description format
        let descComponents = desc.split(' ');
        let region = descComponents[0];
        let mobilityType = descComponents[1];
        let measurementType = descComponents[descComponents.length - 1];
        //end of variable destription format

        let id= measurement.id;
        let measurementName = `${region}-${mobilityType}-${measurementType}-${id}`;

        if (!fs.existsSync(`measurements/${mobilityType}`)) {
            fs.mkdirSync(`measurements/${mobilityType}`);
        }

        if (fs.existsSync(`measurements/${mobilityType}/${measurementName}.json`)) {
            continue;
        }

        console.log(`downloading measurement ${measurementName}`);
        let response = await fetch(measurement.result);

        if (!response.ok) {
            console.log(`error downloading measurement ${measurementName}`);
            continue;
        }

        let rawMeasurementData = await response.text();

        fs.writeFileSync(`measurements/${mobilityType}/${measurementName}.json`, rawMeasurementData);
        console.log(`downloaded measurement ${region}-${mobilityType}-${measurementType}`);
    }
}

async function verifyFiles() {
    let measurements = readOverview();
    console.log(`` + measurements.length + ` measurements found`);
    await downloadMeasurements(measurements);
}

var measurements = {};

function loadFiles() {
    let measurementTypes = fs.readdirSync('measurements');
    let filesLoaded = 0;
    for (const measurementType of measurementTypes) {
        measurements[measurementType] = [];

        let measurementsOfType = fs.readdirSync(`measurements/${measurementType}`);
        for (const measurementFile of measurementsOfType) {
            var fileNameNoEnding = measurementFile.split('.')[0];
            var file = fs.readFileSync(`measurements/${measurementType}/${measurementFile}`);
            var data = JSON.parse(file);
            data.measurementName = fileNameNoEnding;
            measurements[measurementType].push(data);

            console.log(`loaded ${fileNameNoEnding}`);
            filesLoaded++;
        }
    }

    console.log(`loaded ${filesLoaded} files`);


    console.log(measurements['home'][0]);
}

function init() {
    verifyFiles().then(() => {
        console.log('files verified');
        loadFiles();
    });
}


init();

//keep alive
setInterval(() => {
    console.log('still alive');
}
, 1000 * 60 * 60);
