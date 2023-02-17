const fs = require('fs');

// File handling

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

var allMeasurements = [];

function loadFiles() {
    let measurementTypes = fs.readdirSync('measurements');
    let filesLoaded = 0;
    for (const measurementType of measurementTypes) {

        let measurementsOfType = fs.readdirSync(`measurements/${measurementType}`);
        for (const measurementFile of measurementsOfType) {
            var fileNameNoEnding = measurementFile.split('.')[0];
            var file = fs.readFileSync(`measurements/${measurementType}/${measurementFile}`);
            var data = JSON.parse(file);
            data.measurementName = fileNameNoEnding;
            for(measurement of data) {
                measurement.category = measurementType;
                measurement.region = fileNameNoEnding.split('-')[0];
            }

            allMeasurements.push(...data);

            console.log(`loaded ${fileNameNoEnding}`);
            filesLoaded++;
        }
    }

    console.log(`loaded ${filesLoaded} files`);
}

// Category filtering

Object.defineProperty(Array.prototype, 'byCategory', {
    value: function(category) { 
        let res = [];
        for (const measurement of this) {
            if(measurement.category === category) {
                res.push(measurement);
            }
        }
        return res;
    }
});

Object.defineProperty(Array.prototype, 'byRegion', {
    value: function(region) {
        let res = [];
        for (const measurement of this) {
            if(measurement.region === region) {
                res.push(measurement);
            }
        }
        return res;
    }
});

Object.defineProperty(Array.prototype, 'byType', {
    value: function(type) {
        let res = [];
        for (const measurement of this) {
            if(measurement.type === type) {
                res.push(measurement);
            }
        }
        return res;
    }
});



function getMeasurementsSortedByTimeOfDay(m) {
    let measurementsByTimeOfDay = {};
    if(m === undefined || m === null)
    {
        m = allMeasurements;
    }
    
    for (const measurement of m) {
        let timestamp = measurement.timestamp;
        let timeOfDay = new Date(timestamp * 1000).getHours();
        if (measurementsByTimeOfDay[timeOfDay] === undefined) {
            measurementsByTimeOfDay[timeOfDay] = [];
        }
        measurementsByTimeOfDay[timeOfDay].push(measurement);
    }

    return measurementsByTimeOfDay;
}


// Single measurement handling

function getAveragePing(measurements) {
    let total = 0;
    for (const measurement of measurements) {
        if(isNaN(measurement.avg)) {
            continue;
        }
        total += measurement.avg;
    }

    return total / measurements.length;
}

function getMaxPing(measurements) {
    let total = 0;
    for (const measurement of measurements) {
        if(isNaN(measurement.max)) {
            continue;
        }
        total += measurement.max;
    }

    return total / measurements.length;
}


function getNumberOfMeasurementsByPing(measurements, bucketSize) {
    let buckets = {};
    for (const measurement of measurements) {
        if(isNaN(measurement.avg)) {
            continue;
        }

        let bucket = Math.max(Math.floor(measurement.avg / bucketSize), 0) * bucketSize;
        if(bucket === 0) {
            bucket = 1;
        }

        if (buckets[bucket] === undefined) {
            buckets[bucket] = 0;
        }
        buckets[bucket]++;
    }

    return buckets;
}

function getMeanPing(measurementsInBuckets) {
    let total = 0;
    let measurementCount = 0;
    for (const [bucket, bucketSize] of Object.entries(measurementsInBuckets)) {
        total += bucket * bucketSize;
        measurementCount += bucketSize;
    }

    return total / measurementCount;
}

function getMedianPing(measurements) {
    let sortedMeasurements = measurements.sort((a, b) => a.avg - b.avg);
    let middle = Math.floor(sortedMeasurements.length / 2);
    if (sortedMeasurements.length % 2) {
        return sortedMeasurements[middle].avg;
    }
    else {
        return (sortedMeasurements[middle - 1].avg + sortedMeasurements[middle].avg) / 2.0;
    }
}




// Main

function init() {
    verifyFiles().then(() => {
        console.log('files verified');
        loadFiles();

        /*
        console.log(`home average ping: ${homeAveragePing}`);
        console.log(`home mean ping: ${homeMeanPing}`);

        console.log(`wifi average ping: ${wifiAveragePing}`);
        console.log(`wifi mean ping: ${wifiMeanPing}`);

        console.log(`lte average ping: ${lteAveragePing}`);
        console.log(`lte mean ping: ${lteMeanPing}`);

        console.log(`sl average ping: ${slAveragePing}`);
        console.log(`sl mean ping: ${slMeanPing}`);
        */

        /*
        console.log(`home max ping: ${getMaxPing(homeMeasurements)}`);
        console.log(`wifi max ping: ${getMaxPing(wifiMeasurements)}`);
        console.log(`sl max ping: ${getMaxPing(slMeasurements)}`);
        */

        /*
        let pingMeasurements = allMeasurements.byType('ping');
        let europeanPingMeasurements = pingMeasurements.byRegion('Europe');
        let europeanPingMeasurementsByTimeOfDay = getMeasurementsSortedByTimeOfDay(europeanPingMeasurements);
        
        let euPingTimeOfDayHome = {};
        let euPingTimeOfDayStarlink = {};
        for (const [timeOfDay, measurements] of Object.entries(europeanPingMeasurementsByTimeOfDay)) {
            euPingTimeOfDayHome[timeOfDay] = getAveragePing(measurements.byCategory('home'));
            euPingTimeOfDayStarlink[timeOfDay] = getAveragePing(measurements.byCategory('SL'));
        }

        console.log(euPingTimeOfDayHome);
        console.log(euPingTimeOfDayStarlink);
        */


        let euHome = allMeasurements.byType('ping').byRegion('Europe').byCategory('home');
        let asiaHome = allMeasurements.byType('ping').byRegion('Asia').byCategory('home');
        let oceHome = allMeasurements.byType('ping').byRegion('OCE').byCategory('home');
        let usHome = allMeasurements.byType('ping').byRegion('US').byCategory('home');
        let saHome = allMeasurements.byType('ping').byRegion('SA').byCategory('home');

        let euAvg = getAveragePing(euHome);
        let asiaAvg = getAveragePing(asiaHome);
        let oceAvg = getAveragePing(oceHome);
        let usAvg = getAveragePing(usHome);
        let saAvg = getAveragePing(saHome);

        console.log(`eu avg ping: ${euAvg.toFixed(2)}`);
        console.log(`asia avg ping: ${asiaAvg.toFixed(2)}`);
        console.log(`oce avg ping: ${oceAvg.toFixed(2)}`);
        console.log(`us avg ping: ${usAvg.toFixed(2)}`);
        console.log(`sa avg ping: ${saAvg.toFixed(2)}`);

    });
}


init();

//keep alive
setInterval(() => {
    console.log('still alive');
}
, 1000 * 60 * 60);
