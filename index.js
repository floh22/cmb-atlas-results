const fs = require('fs');
const plot = require('nodeplotlib');

// Globals

var allMeasurements = [];
var nodeData = readNodeData();
var dataCenters = readDataCenters();


// File handling

function readDataCenters() {
    let rawdata = fs.readFileSync('dataCenters.json');
    let data = JSON.parse(rawdata);
    return data;
}

function readOverview() {
    let rawdata = fs.readFileSync('RIPE-Atlas-AllMeasurements.json');
    let measurements = JSON.parse(rawdata).results;
    return measurements;
}

function readNodeData() {
    let rawdata = fs.readFileSync('data.json');
    let data = JSON.parse(rawdata);

    let out = {};

    for (let node of data) {
        out[node.id] = {
            id: node.id,
            latitude: node.latitude,
            longitude: node.longitude,
            country_code: node.country_code,
            asn_v4: node.asn_v4,
            asn_v6: node.asn_v6
        }
    }
    return out;
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

        let id = measurement.id;
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

function loadFiles() {
    if (!nodeData) {
        nodeData = readNodeData();
    }
    let measurementTypes = fs.readdirSync('measurements');
    let filesLoaded = 0;
    for (const measurementType of measurementTypes) {

        let measurementsOfType = fs.readdirSync(`measurements/${measurementType}`);
        for (const measurementFile of measurementsOfType) {
            var fileNameNoEnding = measurementFile.split('.')[0];
            var file = fs.readFileSync(`measurements/${measurementType}/${measurementFile}`);
            var data = JSON.parse(file);
            data.measurementName = fileNameNoEnding;
            for (measurement of data) {
                measurement.category = measurementType.toLowerCase();
                measurement.region = fileNameNoEnding.split('-')[0].toLowerCase();
                let data = nodeData[measurement.prb_id];
                Object.assign(measurement, data);
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
    value: function (category) {
        let res = [];
        let isArray = Array.isArray(category);

        if (isArray) {
            for (const measurement of this) {
                if (category.includes(measurement.category)) {
                    res.push(measurement);
                }
            }

            return res;
        }

        for (const measurement of this) {
            if (measurement.category === category) {
                res.push(measurement);
            }
        }
        return res;
    }
});

Object.defineProperty(Array.prototype, 'byRegion', {
    value: function (region) {
        let res = [];
        let isArray = Array.isArray(region);

        if (isArray) {
            for (const measurement of this) {
                if (region.includes(measurement.region)) {
                    res.push(measurement);
                }
            }

            return res;
        }

        for (const measurement of this) {
            if (measurement.region === region) {
                res.push(measurement);
            }
        }
        return res;
    }
});

Object.defineProperty(Array.prototype, 'byCountryCode', {
    value: function (countryCode) {
        let res = [];
        let isArray = Array.isArray(countryCode);

        if (isArray) {
            for (const measurement of this) {
                if (countryCode.includes(measurement.country_code)) {
                    res.push(measurement);
                }
            }

            return res;
        }

        for (const measurement of this) {
            if (measurement.country_code === countryCode) {
                res.push(measurement);
            }
        }
        return res;
    }
});

Object.defineProperty(Array.prototype, 'byType', {
    value: function (type) {
        let res = [];
        let isArray = Array.isArray(type);

        if (isArray && type.includes('ping') && type.includes('traceroute')) {
            return this;
        }

        for (const measurement of this) {

            if (measurement.type === type) {
                res.push(measurement);
            }
        }
        return res;
    }
});

Object.defineProperty(Array.prototype, 'groupByNodes', {
    value: function (type) {
        let nodes = {};
        for (const measurement of this) {
            let nodeid = measurement.prb_id;
            if (nodes[nodeid] === undefined) {
                nodes[nodeid] = [];
            }
            nodes[nodeid].push(measurement);
        }

        return nodes;
    }
});

function getMeasurementsSortedByTimeOfDay(m) {
    let measurementsByTimeOfDay = {};
    if (m === undefined || m === null) {
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


function getMeasurementsByCountryCode(m) {

    let measurementsByCountryCode = {};
    if (m === undefined || m === null) {
        m = allMeasurements;
    }

    for (const measurement of m) {
        let countryCode = measurement.country_code;
        if (measurementsByCountryCode[countryCode] === undefined) {
            measurementsByCountryCode[countryCode] = [];
        }
        measurementsByCountryCode[countryCode].push(measurement);
    }

    return measurementsByCountryCode;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180)
}

function getDistanceBetweenCoordinates(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
}


// Single measurement handling

function getAveragePing(measurements) {
    if (measurements.length === 0) {
        return NaN;
    }
    let total = 0;
    for (const measurement of measurements) {
        if (isNaN(measurement.avg)) {
            continue;
        }
        total += measurement.avg;
    }

    return total / measurements.length;
}

function getWorstCaseAveragePing(measurements) {
    let total = 0;
    for (const measurement of measurements) {
        if (isNaN(measurement.max)) {
            continue;
        }
        total += measurement.max;
    }

    return total / measurements.length;
}

function getBestCaseAveragePing(measurements) {
    let total = 0;
    for (const measurement of measurements) {
        if (isNaN(measurement.min)) {
            continue;
        }
        total += measurement.min;
    }

    return total / measurements.length;
}

function getMeanPing(measurements, bucketSize) {
    let buckets = {};
    for (const measurement of measurements) {
        if (isNaN(measurement.avg)) {
            continue;
        }

        let bucket = Math.max(Math.floor(measurement.avg / bucketSize), 0) * bucketSize;
        if (bucket === 0) {
            bucket = 1;
        }

        if (buckets[bucket] === undefined) {
            buckets[bucket] = 0;
        }
        buckets[bucket]++;
    }

    let total = 0;
    let measurementCount = 0;
    for (const [bucket, bucketSize] of Object.entries(buckets)) {
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

function getAvereageAndMaxAndMinPing(measurements) {
    let total = 0;
    let max = 0;
    let min = 9999
    for (const measurement of measurements) {
        if (isNaN(measurement.avg)) {
            continue;
        }
        total += measurement.avg;
        if (measurement.avg > max) {
            max = measurement.avg;
        }
        if (measurement.avg < min) {
            min = measurement.avg;
        }
    }

    return {
        avg: total / measurements.length,
        max: max,
        min: min
    };
}


// Main

function init() {
    verifyFiles().then(() => {
        console.log('files verified');
        loadFiles();


        let euPing = allMeasurements.byType('ping').byRegion('europe');
        let asiaPing = allMeasurements.byType('ping').byRegion('asia');
        let ocePing = allMeasurements.byType('ping').byRegion('oce');
        let usPing = allMeasurements.byType('ping').byRegion('us');
        let saPing = allMeasurements.byType('ping').byRegion('sa');

        let euHome = euPing.byCategory('home');
        let asiaHome = asiaPing.byCategory('home');
        let oceHome = ocePing.byCategory('home');
        let usHome = usPing.byCategory('home');
        let saHome = saPing.byCategory('home');

        let euAvg = getAveragePing(euHome);
        let asiaAvg = getAveragePing(asiaHome);
        let oceAvg = getAveragePing(oceHome);
        let usAvg = getAveragePing(usHome);
        let saAvg = getAveragePing(saHome);

        console.log(`eu home avg ping: ${euAvg.toFixed(2)}`);
        console.log(`asia home avg ping: ${asiaAvg.toFixed(2)}`);
        console.log(`oce home avg ping: ${oceAvg.toFixed(2)}`);
        console.log(`us home avg ping: ${usAvg.toFixed(2)}`);
        console.log(`sa home avg ping: ${saAvg.toFixed(2)}`);


        console.log('----------');


        let euLTEAvg = getAveragePing(euPing.byCategory('lte'));
        let asiaLTEAvg = getAveragePing(asiaPing.byCategory('lte'));
        let oceLTEAvg = getAveragePing(ocePing.byCategory('lte'));
        let usLTEAvg = getAveragePing(usPing.byCategory('lte'));
        let saLTEAvg = getAveragePing(saPing.byCategory('lte'));

        console.log(`eu lte avg ping: ${euLTEAvg.toFixed(2)}`);
        console.log(`asia lte avg ping: ${asiaLTEAvg.toFixed(2)}`);
        console.log(`oce lte avg ping: ${oceLTEAvg.toFixed(2)}`);
        console.log(`us lte avg ping: ${usLTEAvg.toFixed(2)}`);
        console.log(`sa lte avg ping: ${saLTEAvg.toFixed(2)}`);

        console.log('----------');

        let euWifiAvg = getAveragePing(euPing.byCategory('wifi'));
        let asiaWifiAvg = getAveragePing(asiaPing.byCategory('wifi'));
        let oceWifiAvg = getAveragePing(ocePing.byCategory('wifi'));
        let usWifiAvg = getAveragePing(usPing.byCategory('wifi'));
        let saWifiAvg = getAveragePing(saPing.byCategory('wifi'));

        console.log(`eu wifi avg ping: ${euWifiAvg.toFixed(2)}`);
        console.log(`asia wifi avg ping: ${asiaWifiAvg.toFixed(2)}`);
        console.log(`oce wifi avg ping: ${oceWifiAvg.toFixed(2)}`);
        console.log(`us wifi avg ping: ${usWifiAvg.toFixed(2)}`);
        console.log(`sa wifi avg ping: ${saWifiAvg.toFixed(2)}`);

        console.log('----------');

        let euStarlinkAvg = getAveragePing(euPing.byCategory('sl'));
        let asiaStarlinkAvg = getAveragePing(asiaPing.byCategory('sl'));
        let oceStarlinkAvg = getAveragePing(ocePing.byCategory('sl'));
        let usStarlinkAvg = getAveragePing(usPing.byCategory('sl'));
        let saStarlinkAvg = getAveragePing(saPing.byCategory('sl'));

        console.log(`eu starlink avg ping: ${euStarlinkAvg.toFixed(2)}`);
        console.log(`asia starlink avg ping: ${asiaStarlinkAvg.toFixed(2)}`);
        console.log(`oce starlink avg ping: ${oceStarlinkAvg.toFixed(2)}`);
        console.log(`us starlink avg ping: ${usStarlinkAvg.toFixed(2)}`);
        console.log(`sa starlink avg ping: ${saStarlinkAvg.toFixed(2)}`);


        console.log('----------');


        //Latency vs distance plotting in europe

        let euByCountry = getMeasurementsByCountryCode(euPing);

        //print average ping for each country in EU
        for (const [countryCode, measurements] of Object.entries(euByCountry)) {
            console.log(`${countryCode}: ${getAveragePing(measurements).toFixed(2)}`);
        }

        console.log('----------');

        let pingMeasurements = allMeasurements.byType('ping');
        let measurementsByNodes = pingMeasurements.byCategory('home').groupByNodes();
        let nodeDataEuHome = [];
        for(const [node, measurements] of Object.entries(measurementsByNodes)) {
            let pingData = getAvereageAndMaxAndMinPing(measurements);
            nodeDataEuHome.push({node, ...pingData});
        }

        let avgAvg = nodeDataEuHome.map(x => x.avg).reduce((a, b) => a + b, 0) / nodeDataEuHome.length;
        let maxAvg = nodeDataEuHome.map(x => x.max).reduce((a, b) => a + b, 0) / nodeDataEuHome.length;
        let minAvg = nodeDataEuHome.map(x => x.min).reduce((a, b) => a + b, 0) / nodeDataEuHome.length;

        console.log(`home avg avg ping: ${avgAvg.toFixed(2)}`);
        console.log(`home avg max ping: ${maxAvg.toFixed(2)}`);
        console.log(`home avg min ping: ${minAvg.toFixed(2)}`);


        console.log('----------');

        let measurementsByNodesLTE = pingMeasurements.byCategory('lte').groupByNodes();

        let nodeDataEuLTE = [];
        for(const [node, measurements] of Object.entries(measurementsByNodesLTE)) {
            let pingData = getAvereageAndMaxAndMinPing(measurements);
            nodeDataEuLTE.push({node, ...pingData});
        }

        let avgAvgLTE = nodeDataEuLTE.map(x => x.avg).reduce((a, b) => a + b, 0) / nodeDataEuLTE.length;
        let maxAvgLTE = nodeDataEuLTE.map(x => x.max).reduce((a, b) => a + b, 0) / nodeDataEuLTE.length;
        let minAvgLTE = nodeDataEuLTE.map(x => x.min).reduce((a, b) => a + b, 0) / nodeDataEuLTE.length;

        console.log(`lte avg avg ping: ${avgAvgLTE.toFixed(2)}`);
        console.log(`lte avg max ping: ${maxAvgLTE.toFixed(2)}`);
        console.log(`lte avg min ping: ${minAvgLTE.toFixed(2)}`);


        console.log('----------');

        let measurementsByNodesWifi = pingMeasurements.byCategory('wifi').groupByNodes();

        let nodeDataEuWifi = [];
        for(const [node, measurements] of Object.entries(measurementsByNodesWifi)) {
            let pingData = getAvereageAndMaxAndMinPing(measurements);
            nodeDataEuWifi.push({node, ...pingData});
        }

        let avgAvgWifi = nodeDataEuWifi.map(x => x.avg).reduce((a, b) => a + b, 0) / nodeDataEuWifi.length;
        let maxAvgWifi = nodeDataEuWifi.map(x => x.max).reduce((a, b) => a + b, 0) / nodeDataEuWifi.length;
        let minAvgWifi = nodeDataEuWifi.map(x => x.min).reduce((a, b) => a + b, 0) / nodeDataEuWifi.length;

        console.log(`wifi avg avg ping: ${avgAvgWifi.toFixed(2)}`);
        console.log(`wifi avg max ping: ${maxAvgWifi.toFixed(2)}`);
        console.log(`wifi avg min ping: ${minAvgWifi.toFixed(2)}`);


        console.log('----------');

        let measurementsByNodesStarlink = pingMeasurements.byCategory('sl').groupByNodes();

        let nodeDataEuStarlink = [];
        for(const [node, measurements] of Object.entries(measurementsByNodesStarlink)) {
            let pingData = getAvereageAndMaxAndMinPing(measurements);
            nodeDataEuStarlink.push({node, ...pingData});
        }

        let avgAvgStarlink = nodeDataEuStarlink.map(x => x.avg).reduce((a, b) => a + b, 0) / nodeDataEuStarlink.length;
        let maxAvgStarlink = nodeDataEuStarlink.map(x => x.max).reduce((a, b) => a + b, 0) / nodeDataEuStarlink.length;
        let minAvgStarlink = nodeDataEuStarlink.map(x => x.min).reduce((a, b) => a + b, 0) / nodeDataEuStarlink.length;

        console.log(`starlink avg avg ping: ${avgAvgStarlink.toFixed(2)}`);
        console.log(`starlink avg max ping: ${maxAvgStarlink.toFixed(2)}`);
        console.log(`starlink avg min ping: ${minAvgStarlink.toFixed(2)}`);

        let trace1 = {
            x: ['avg', 'max', 'min'],
            y: [avgAvg, maxAvg, minAvg],
            name: 'home',
            type: 'bar'
        }

        let trace2 = {
            x: ['avg', 'max', 'min'],
            y: [avgAvgLTE, maxAvgLTE, minAvgLTE],
            name: 'lte',
            type: 'bar'
        }

        let trace3 = {
            x: ['avg', 'max', 'min'],
            y: [avgAvgWifi, maxAvgWifi, minAvgWifi],
            name: 'wifi',
            type: 'bar'
        }

        let trace4 = {
            x: ['avg', 'max', 'min'],
            y: [avgAvgStarlink, maxAvgStarlink, minAvgStarlink],
            name: 'starlink',
            type: 'bar'
        }

        let data = [trace1, trace2, trace3, trace4];

        let boxLayout = {
            barmode: 'group',
            title: {
                text: 'Observed ping by technology',
                font: {
                    family: 'Courier New, monospace',
                    size: 24
                },
                xref: 'paper',
            },
            /*
            xaxis: {
                title: {
                    text: 'Technologies',
                    font: {
                        family: 'Courier New, monospace',
                        size: 18,
                    }
                },
            },
            */
            yaxis: {
                title: {
                    text: 'Ping latency in ms',
                    font: {
                        family: 'Courier New, monospace',
                        size: 18,
                    }
                }
            }
        };

        plot.plot(data, boxLayout);


        return;

        let euDistanceAndLatency = [];
        for (const m of allMeasurements.byType('ping').byRegion('europe').byCategory('home')) {
            let distance = getDistanceBetweenCoordinates(m.latitude, m.longitude, dataCenters['eu'].latitude, dataCenters['eu'].longitude);
            let latency = m.avg;

            if (latency <= 0 || latency >= 200) {
                continue;
            }

            euDistanceAndLatency.push({ distance, latency });
        }



        //scatter plot
        const plotData = [{
            x: euDistanceAndLatency.map(x => x.distance),
            y: euDistanceAndLatency.map(x => x.latency),
            mode: 'markers',
            type: 'scatter',
        }];


        //box plot 

        /* bad idea.
        //ground distanceAndLatency by 100km groups
        let latencyByDistanceBinned = {};
        for (const d of euDistanceAndLatency) {
            let distanceGroup = Math.floor(d.distance / 100);
            if (!latencyByDistanceBinned[distanceGroup]) {
                latencyByDistanceBinned[distanceGroup] = [];
            }

            latencyByDistanceBinned[distanceGroup].push(d.latency);
        }

        let distances = Object.entries(latencyByDistanceBinned);

        let boxData = [];
        let i = 0;
        for (const dist of distances) {
            let name = `${i * 100} - ${(i + 1) * 100}km`;
            boxData.push({
                y: dist,
                type: 'box',
                name: name,
            });
            i++;
        }

        // plot.plot(boxData);

        */

        var layout = {
            title: {
                text: 'Latency by distance in Europe',
                font: {
                    family: 'Courier New, monospace',
                    size: 24
                },
                xref: 'paper',
            },
            xaxis: {
                title: {
                    text: 'Distance in km',
                    font: {
                        family: 'Courier New, monospace',
                        size: 18,
                    }
                },
            },
            yaxis: {
                title: {
                    text: 'Ping latency in ms',
                    font: {
                        family: 'Courier New, monospace',
                        size: 18,
                    }
                }
            }
        };

        plot.plot(plotData, layout);


        //as we can see, ping latency is closely related to distance, except for outliers such as Iran since nodes here were offline
    });
}


init();

//keep alive
setInterval(() => {
    console.log('still alive');
}
    , 1000 * 60 * 60);
