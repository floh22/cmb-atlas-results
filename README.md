<h1 align="center">Connected Mobility Probe Report</h1>


## Introduction

## Probe Selection

To rerun our probe selection run the bash script do_probe_selection.sh in the probe_selection folder

This should first download the newest list of probes and filter with the same filters we applied. 
Or selection was based on the probe list published on 11-Feb-2023 as found here:(https://ftp.ripe.net/ripe/atlas/probes/archive/2023/02/20230210.json.bz2)
To reproduce our filter on this date change the url in line 29 to this. 
Our filtered list can be found in the archive file probe_list.zip.

## Filter settings 

Starlink: 
    -> asn: asn_v4 == 14593 || asn_v6 == 14593
    -> status: status == 1
    # not uses because it did not generate additional nodes -> starlink-tag: starlink in tags 

Mobile Data:
    -> status: status == 1
    -> not connected via wire to ISP: utput_dict = [x for x in data if 'dsl' not in x['tags'] and 'vdsl' not in x['tags'] and 'vdsl2' not in x['tags'] 
    and 'adsl' not in x['tags'] and 'fibre' not in x['tags'] and 'datacenter' not in x['tags'] and 'ftth' not in x['tags']  ]
    -> is taged with mobile technologie: output_dict = [x for x in data if '3g' in x['tags'] or '4g' in x['tags'] or 'lte' in x['tags'] or '5g' in x['tags'] or 'mobile' in x['tags']]
 

Home WI-FI:
    -> status: status == 1
    -> not connected via wire to ISP: utput_dict = [x for x in data if 'dsl' not in x['tags'] and 'vdsl' not in x['tags'] and 'vdsl2' not in x['tags'] 
    and 'adsl' not in x['tags'] and 'fibre' not in x['tags'] and 'datacenter' not in x['tags'] and 'ftth' not in x['tags']  ]
    -> taged as wifi connected: output_dict = [x for x in data if 'wifi-mesh' in x['tags'] or 'system-wifi' in x['tags'] or 'public-wifi' in x['tags'] or 'wifi' in x['tags'] or 'wi-fi' in x['tags'] or 'free-wifi' in x['tags'] or 'wlan' in x['tags']]
    

Home LAN:
    -> status: status == 1
    -> is taged as wired to ISP: output_dict = [x for x in data if 'dsl'  in x['tags'] or 'vdsl'  in x['tags'] or 'vdsl2'  in x['tags'] or 'adsl'  in x['tags'] or 'fibre'  in x['tags']  or 'ftth'  in x['tags'] or 'cabel'  in x['tags']]
    -> is not wireless connected: output_dict = [x for x in data if 'wifi-mesh' not in x['tags']  and 'system-wifi'  not in  x['tags']  and 'public-wifi'  not in  x['tags']  and 'wifi'  not in  x['tags']  and 'wi-fi'  not in  x['tags']  and 'free-wifi'  not in  x['tags']  and 'wlan'  not in  x['tags']]
    -> is nearby to wireles nodes as defined by in same country: output_dict = [x for x in data if x['country_code'] in list_countrycode ]
    -> is taged as home or office or academi: output_dict = [x for x in data if 'home' in x['tags'] or 'office' in x['tags'] or 'academic' in x['tags']] 



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
