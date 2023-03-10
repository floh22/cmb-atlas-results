<h1 align="center">Connected Mobility Probe Report</h1>


# Introduction

Global measurement platforms such as RIPE Atlas allows users to measure internet acitivity and network accessibility through physical and software probes. The availiability of these platforms enables users to troubleshoot issues and identify bottlenecks when accessing different network service from various locations around the world. The objective of this assignment is to identify the major factors which affect the overall internet performance in terms of the routing path between clients and servers, as well as the last-mile technology used for communicatoin.

# Measurement Steps


In this chapter we describe how we set up our measurements. In the first subsection we describe how we filtered out around 400 probes out of the over 12.8K probes that are deployed within the RIPE Atlas network. In the second subsection we describe what the parameters were that we used to conduct the measurements. In the last subsection we disscuss if and how our probe selection represents the global mobile connectivity.



## Probe Selection

To reproduce our probe selection we provide the shell script do_probe_selection.sh in [probe_selection folder](https://github.com/floh22/cmb-atlas-results/tree/master/probe_selection). 

The script has the following packages as prerequisites:
- wget
- python3
- bunzip2


It does the following steps to retrieve suitable nodes. 
1. Some setup, like creating folders and moving/copying files
2. Retrieving the latest probe list provided by RIPE Atlas
3. Filter the probes as per description below
4. Separate the probes by type and continent 
5. Move the probe list to the desognated folders

The probe selection we used is based on the list as provided by RIPE Atlas on 11-Feb-2023 and can be retrieved [here](https://ftp.ripe.net/ripe/atlas/probes/archive/2023/02/20230210.json.bz2). To reproduce our result list with the provided scripted please exchange the url in line 29 in the do_probe_selection.sh file with this link [https://ftp.ripe.net/ripe/atlas/probes/archive/2023/02/20230210.json.bz2](https://ftp.ripe.net/ripe/atlas/probes/archive/2023/02/20230210.json.bz2). 



In the following section the filter criteria are explained. 

### Starlink
| Filter | Description |
| ----------- | ----------- |
| asn_v4 == 14593 \|\| asn_v6 == 14593| We filtered by the Autonomous System Number associated with Starlink|
| status == 1| We only used nodes that were reported as active| 

We did not filter by starlink in tags as this did not generate additional nodes.

#### Mobile Data
| Filter | Description |
| ----------- | ----------- |
| status == 1| we only used nodes that were reported as active|
| tags don't contain ['dsl', 'vdsl', 'vdsl2', 'adsl', 'fibre' or 'ftth']| we consider only wireless nodes without a wired connection to ISP|
| tags don't contain  'datacenter'| we considered only nodes that were not installed in datacenters|
|tags contain at least one of  ['3g', '4g', 'lte', '5g', 'mobile'] |we considered only nodes that are tagged with mobile technologie|

#### Home WI-FI:
| Filter | Description |
| ----------- | ----------- |
| status == 1| we only used nodes that were reported as active|
| tags don't contain ['dsl', 'vdsl', 'vdsl2', 'adsl', 'fibre' or 'ftth']| we consider only wireless nodes without a wired connection to ISP|
| tags don't contain  'datacenter'| we considered only nodes that were not installed in datacenters|
|tags contain at least one of ['wifi-mesh', 'system-wifi', 'public-wifi', 'wifi', 'wi-fi', 'free-wifi', 'wlan'] | we considered only nodes that are tagged with wifi|

### Home LAN
| Filter | Description |
| ----------- | ----------- |
| status == 1| we only used nodes that were reported as active|
|tags contain at least one of ['dsl', 'vdsl', 'vdsl2', 'adsl', 'cabel', 'fibre' or 'ftth']|we consider only nodes with a wired connection to ISP|
|tags don't contain  ['wifi-mesh', 'system-wifi', 'public-wifi', 'wifi', 'wi-fi', 'free-wifi', 'wlan'] | we don't considered  nodes that are tagged with wifi|
|tags don't contain  ['3g', '4g', 'lte', '5g', 'mobile'] |we don't considered  nodes that are tagged with mobile technologie|
|tags contain one of ['home', 'office' , or 'academic'] | we only consider probes that are tagged as home or office or academic|
|country_code in list of country codes of either wifi, mobile or starlink| to ensure that we have nearby nodes we considered as many nodes that had the same country code as the others up to a maximum number of five per country.|


## Measurements

We performed measurements over two different time horizons.
One long term another over a shorter time frame with measurements more often.


The results of the long term measurements can be found [here](https://github.com/floh22/cmb-atlas-results/tree/master/long_term_measurements/measurements), the results of the other measurement [here](https://github.com/floh22/cmb-atlas-results/tree/master/measurements)

In the following two parts we describe the parameters that we used to gather our measurements. First the parameters we used for the ping measurements, second the traceroute measurements. In general the parameters between the two different time horizons are the same except where it is highlighted. 

### Ping parameters
|Parameter| Setting|
| ----------- | ----------- |
| Target | google server on the same continent (exception Africa which also uses europe ): <br/><ul><li>us-central1.gce.cloudharmony.net</li><li>europe-west3.gce.cloudharmony.net</li><li>asia-northeast2.gce.cloudharmony.net</li><li>australia-southeast1.gce.cloudharmony.net</li><li>southamerica-east1.gce.cloudharmony.net</li></ul>|
| Interval (s) | <ul><li>Long time frame: 21600</li><li>Short time frame: 1800</li></ul>|
| Packets | 3|
| Size | 48 |
| Address Family | IPV4 |
| Resolve on Probe |False |



### Traceroute parameters
|Parameter| Setting|
| ----------- | ----------- |
| Target | google server on the same continent (exception Africa which also uses europe ): <br/><ul><li>us-central1.gce.cloudharmony.net</li><li>europe-west3.gce.cloudharmony.net</li><li>asia-northeast2.gce.cloudharmony.net</li><li>australia-southeast1.gce.cloudharmony.net</li><li>southamerica-east1.gce.cloudharmony.net</li></ul>|
| Interval (s) | <ul><li>Long time frame: 86400</li><li>Short time frame: 21600</li></ul>|
| Protocol | TCP |
| Address Family | IPV4 |
| Response Timeout (ms)| 4000 |
| Packets | 3 |
| Port | 80 |
| Size | 48 |
| Paris | 16 |
| Maximum Hops | 32 |
| Resolve on Probe | False |

## Disscusion

By choosing our nodes like described above we cannot claim that it represents the global mobile connectivity. The selected nodes do massively overrepresent internet users in Europe and North-America and even here it has been shown that the average connection of a RIPE probe is better than a typical connection of a given region [[1]].
A proposed reason behind this overrepresentation of above average connection is that this lies in the voluntary of the RIPE Atlas platform. As the participating hosts of the probes are donating some of their network capacity, it is inferred that they have an above average connection where a few bytes more traffic are not of much consequence [[1]].
This is a problem that is inherent with the platform and not with our selection of nodes, so we are able to say that given the use of the RIPE Atlas our probe selection represents the  global mobile connectivity. 

<p align="center">
  <img src="./images/countries.png" alt="Probe Location in pie chart"/>
</p>
<p align="center">
Fig 2. Probe Location by country
</p>

# Results and Discussion

The analysis was conducted using latency as the major metric, and the experiments were varied based on 2 factors namely (1) the impact of different technologies used by networks, (2) the impact of distance between the probes and the cloud centers.

## Access Technology Comparison and Analysis

<p align="center">
  <img src="./images/average-ping-node-by-technology.png" alt="average, minimum, and maximum ping latency with technology"/>
</p>

<p align="center">
    Fig 3. Variation of average, minimum, and maximum ping latency with technology.
</p>

These results were obtained by grouping all pings by the same node and then looking at the average, maximum, and minimum ping latency for every given node. These were then averaged across the node's specific connection technology.

### Wired 

Wired connections were the most stable of all technologies studied. The average best and worst case pings from wired connections within europe only had a range of 20ms, ranging from 29ms to 48.6ms, with the average at around 33ms. This small range shows that despite progress in wireless technologies, a physical connection is still the most reliable technology available and should be used when possible if reliability and low latency are priorities.

This was also the connection type where we could see the highest correlation between distance and latency. As we can see in Fig 2. and barring a few outliers, ping between server and device roughly linearly correlates to the distance between the device and our server. This Figure shows measurements from Europe, but all regions showed similar behavior.

<p align="center">
<img src="https://github.com/floh22/cmb-atlas-results/blob/master/images/cmb-plot-distance-latency.png?raw=True" alt="alt text"/>
</p>

<p align="center">
Fig 4. Variation of latency with probe-data center distance in Europe.
</p>

### WiFi

WiFi was observed to be the most stable and reliable of the wireless technologies. Our theory is that this is due to the relatively static and short range nature of wifi environments. We assume that nodes connected to the RIPE Atlas network and using WiFi connections are both stationary, and in relatively close proximity to the network access point. This provides the ideal enviromenment for a WiFi connection, which would explain our stellar results from WiFi. 

In comparison to a wired connection, WiFi was observed to have an average ping 9ms slower, which is roughly in line with the overhead one could expect from the extra access point between the end device and the rest of the network.

Average worst case deviation from the average ping was observed at around 40ms higher, meaning that with a global average of 76ms, the average worst case ping times of 113ms deviated relatively little from the average. This little deviation makes WiFi the most comparable technology to a wired connection, though again, we are relatively sure this is due to the testing environment.

### 3G / 4G / 5G

<p align="center">
    <img alt="TR proportion second to last hop" src="./images/tr_prop.png" >
</p>

<p align="center">
Fig 5. Proportion of time required by the first and second hop to the last hop in a traceroute.
</p>

To our surprise, this was observed to the worst performing technology in normal circumstances. While we had expected starlink devices to have the highest average latency, under normal conditions mobile data pings were around 80ms globaly.
When looking into what contributed to the delay we find interesting data hiding in the traceroute.
By comparing how much the first two hops contributed to the overall delay we found no significant change between mobile data connections compared to wired connections.
When comparing the contribution the last mile had on the total delay in Europe and Asia for mobile data to the same last mile contribution in wired scenarios we found no significant change.
This is an indication that if edge computing would be deployed a connection based on mobile data connections could experience an equal improvement in delay reduction.


### Starlink

On average, starlink performed very similarly to wired connections. Global average pings for starlink devices were measured to be within 2 - 4ms when averaging each devices pings. Certain regions however benefitted less from the satelite network than others. Regions such as the EU with a relatively dense and well connected wired population in average an additional 20ms latency on starlink connections instead of wired ones, whereas nodes in australia for example had comparable performance from both technologies in many cases.

Where we perceive starlink's current biggest weakness to be is within its reliability. Over the course of one week we saw at least five different occurances where performance of the starlink technology strongly decreased for short durations, most noticable during the end of our testing period, with one occurance where pings using the starlink network failed entirely for over an hour. This suggests that starlink suffers from short term outages and performance issues, as can be seen in Fig 6. Long term study on Feb 18th at 11:00 and the Short term study on Feb 14th at 04:00.

Additionally, the starlink network also seems to have longer periods of general instability, as can be seen in Fig 6. Long term study during the last day of observation. Performance on this day was degraded during multiple times and multiple pings were non responsive, leading to lower average ping times shown since pings that could not be received had a latency of 0ms, dropping the average significantly during this period.

We can however conclude that when the starlink network does function properly, it allows for performance rivaling that of wired connections, and with further maturity of the technology and cross satelite communication, stability issues may become less common and the network a reliable and fast option, even for those in densly populated areas.

<p align="center">
  <img alt="Starlink short term results graph" src="./images/SL_short.png" width="45%">
&nbsp; &nbsp; &nbsp; &nbsp;
  <img alt="Starlink long term results graph" src="./images/SL_long_term.png" width="45%">
</p>

<p align="center">
Fig 6. Starlink ping average in both long and short term tests respectively
</p>




<p align="center">
  <img alt="Home long term results graph" src="./images/Home_short.png" width="45%">
&nbsp; &nbsp; &nbsp; &nbsp;
  <img alt="Wireless long term results graph" src="./images/LTE_short.png" width="45%">
</p>

<p align="center">
Fig 7. Home and Wireless ping average in long term tests
</p>

# Conclusion
RIPE Atlas as Global measurement platform provides various insights into the inner operations of the internet. While various factors affect the performance of the network, this report focuses mainly on the last-mile technology and the probe-data center distance. First, a direct proprtional relationship cannot be made between distance and latency, due to various other factors such as technology, network traffic and anomolies. However, a strong correlation exists between these two. Furthermore, in terms of technology, wired communication offers the maximum reliability, whereas the stability of starlink changes sporadically. Thus, based on our observations we can conclude that (1) the distance plays a significant role in the overall latency of communication; (2) despite the distance, the last mile-carrier should have high reliability to ensure stability of communication within the network; and (3) the measurement platform, time of measurement and various other anomolies can also have significant impact when finding the variation of latency with different factors.

# References

[[1]] The Khang Dang, Nitinder Mohan, Lorenzo Corneo, Aleksandr Zavodovski, J??rg Ott, and Jussi Kangasharju. 2021. Cloudy with a chance of short RTTs: analyzing cloud connectivity in the internet. In Proceedings of the 21st ACM Internet Measurement Conference (IMC '21). Association for Computing Machinery, New York, NY, USA, 62???79.


[[2]] Lorenzo Corneo, Maximilian Eder, Nitinder Mohan, Aleksandr Zavodovski, Suzan Bayhan, Walter Wong, Per Gunningberg, Jussi Kangasharju, and J??rg Ott. 2021. Surrounded by the Clouds: A Comprehensive Cloud Reachability Study. In Proceedings of the Web Conference 2021 (WWW '21). Association for Computing Machinery, New York, NY, USA, 295???304.


[1]: <https://doi.org/10.1145/3487552.3487854> "The Khang Dang, Nitinder Mohan, Lorenzo Corneo, Aleksandr Zavodovski, J??rg Ott, and Jussi Kangasharju. 2021. Cloudy with a chance of short RTTs: analyzing cloud connectivity in the internet. In Proceedings of the 21st ACM Internet Measurement Conference (IMC '21). Association for Computing Machinery, New York, NY, USA, 62???79." 


[2]: <https://doi.org/10.1145/3442381.3449854> "Lorenzo Corneo, Maximilian Eder, Nitinder Mohan, Aleksandr Zavodovski, Suzan Bayhan, Walter Wong, Per Gunningberg, Jussi Kangasharju, and J??rg Ott. 2021. Surrounded by the Clouds: A Comprehensive Cloud Reachability Study. In Proceedings of the Web Conference 2021 (WWW '21). Association for Computing Machinery, New York, NY, USA, 295???304."
