function GetPingData(measurement) {
    if (measurement.type !== 'ping') {
        throw new Error('Measurement is not a ping measurement');
    }

    let pingData = {};
    pingData.max = measurement.max;
    pingData.min = measurement.min;
    pingData.avg = measurement.avg;
}


function getAveragePing(measurements) {
    let total = 0;
    for (const measurement of measurements) {
        total += measurement.avg;
    }

    return total / measurements.length;
}

function getNumberOfMeasurementsByPing(measurements, bucketSize) {
    let buckets = {};
    for (const measurement of measurements) {
        let bucket = Math.floor(measurement.avg / bucketSize);
        if (buckets[bucket] === undefined) {
            buckets[bucket] = 0;
        }
        buckets[bucket]++;
    }

    return buckets;
}

function getMeanPing(measurements) {
    let total = 0;
    for (const bucket in measurements) {
        total += bucket * measurements[bucket];
    }

    return total / measurements.length;
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