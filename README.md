<h1 align="center">Connected Mobility Probe Report</h1>


## Introduction

## Access Technology Comparison and Analysis



![alt text](https://github.com/floh22/cmb-atlas-results/blob/master/images/average-ping-node-by-technology.png)
Fig 1.

These results were obtained by grouping all pings by the same node and then looking at the average, maximum, and minimum ping latency for every given node. These were then averaged across the node's specific connection technology.

### Wired 

Wired connections were the most stable of all technologies studied. The average best and worst case pings from wired connections within europe only had a range of 20ms, ranging from 29ms to 48.6ms, with the average at around 33ms. This small range shows that despite progress in wireless technologies, a physical connection is still the most reliable technology available and should be used when possible if reliability and low latency are priorities.

This was also the connection type where we could see the highest correlation between distance and latency. As we can see in Fig 2. and barring a few outliers, ping between server and device roughly linearly correlates to the distance between the device and our server. This Figure shows measurements from Europe, but all regions showed similar behavior.

![alt text](https://github.com/floh22/cmb-atlas-results/blob/master/images/cmb-plot-distance-latency.png)
Fig 2.
### Wifi

Wifi was observed to be the most stable and reliable of the wireless technologies. Our theory is that this is due to the relatively static and short range nature of wifi environments. We assume that nodes connected to the RIPE Atlas network and using WIFI connections are both stationary, and in relatively close proximity to the network access point. This provides the ideal enviromenment for a wifi connection, which would explain our stellar results from WIFI. 

In comparison to a wired connection, WIFI actually was observed to have an average ping 9ms slower, which is roughly in line with the overhead one could expect from the extra access point between the end device and the rest of the network.

Average worst case deviation from the average ping was observed at around 40ms higher, meaning that with a global average of 76ms, the average worst case ping times of 113ms deviated relatively little from the average.

### 3G / 4G / 5G

To our surprise, this was observed to the worst performing technology in normal circumstances. While we had expected starlink devices to have the highest average latency, under normal conditions mobile data pings were around 80ms globaly.

### Starlink


## Conclusion
