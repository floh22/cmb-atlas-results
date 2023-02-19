<h1 align="center">Connected Mobility Probe Report</h1>


## Introduction

# Mesurment Steps



## Probe Selection

To rerun our probe selection run the bash script do_probe_selection.sh in the [probe_selection folder](https://github.com/floh22/cmb-atlas-results/tree/master/probe_selection).

This should first download the newest list of probes and filter with the same filters we applied. 
Our selection was based on the probe list published on 11-Feb-2023 as found [here](https://ftp.ripe.net/ripe/atlas/probes/archive/2023/02/20230210.json.bz2)
To reproduce our filter on this date change the url in line 29 to this. 
Our filtered list can be found in the archive file probe_list.zip.

## Filter settings 
This sction describes our filter settings for the different types of probes. 

### Starlink
| Filter | Description |
| ----------- | ----------- |
| asn_v4 == 14593 \|\| asn_v6 == 14593| We filtered the probes by the ASN accociated with starlink |
| status == 1| we only uesd nodes that were reported as active| 

We did not filter by starlink in tags as this did not generate additional nodes.

#### Mobile Data
| Filter | Description |
| ----------- | ----------- |
| status == 1| we only uesd nodes that were reported as active| 
| tags don't contain ['dsl', 'vdsl', 'vdsl2', 'adsl', 'fibre' or 'ftth']| we considere only wireless nodes without a wired connection to ISP|
| tags don't contain  'datacenter'| we considered only nodes that were not installed in datacenters|
|tags contain at least one of  ['3g', '4g', 'lte', '5g', 'mobile'] |we considered only nodes that are taged with mobile technologie|

 
#### Home WI-FI:
| Filter | Description |
| ----------- | ----------- |
| status == 1| we only uesd nodes that were reported as active|
| tags don't contain ['dsl', 'vdsl', 'vdsl2', 'adsl', 'fibre' or 'ftth']| we considere only wireless nodes without a wired connection to ISP|
| tags don't contain  'datacenter'| we considered only nodes that were not installed in datacenters|
|tags contain at least one of ['wifi-mesh', 'system-wifi', 'public-wifi', 'wifi', 'wi-fi', 'free-wifi', 'wlan'] | we considered only nodes that are taged with wifi|


### Home LAN
| Filter | Description |
| ----------- | ----------- |
| status == 1| we only uesd nodes that were reported as active|
|tags contain at least one of ['dsl', 'vdsl', 'vdsl2', 'adsl', 'cabel', 'fibre' or 'ftth']|we considere only nodes with a wired connection to ISP|
|tags don't contain  ['wifi-mesh', 'system-wifi', 'public-wifi', 'wifi', 'wi-fi', 'free-wifi', 'wlan'] | we don't considered  nodes that are taged with wifi|
|tags don't contain  ['3g', '4g', 'lte', '5g', 'mobile'] |we don't considered  nodes that are taged with mobile technologie|
|tags contaion one of ['home', 'office' , or 'academic'] | we only considere probes taht are taged as home or office or academic|
|country_code in list of country codes of either wifi, mobile or starlink| to esnure that we have nearby nodes we considered as many nodes that had the same country code as the others up to a maximum number of five per country.|

## Measurments 

We performed measurmets over two differrent time horizons. 
One long term another over a shorter timeframe with mesurments more often. 

The results of the long term measurments can be found [here](https://github.com/floh22/cmb-atlas-results/tree/master/long_term_measurements/measurements), the results of the other measurment [here](https://github.com/floh22/cmb-atlas-results/tree/master/measurements)

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
