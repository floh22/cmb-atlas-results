import json




# Opening JSON file containing probe list
f = open('data.json')
data = json.load(f)

# Opening JSON file to map country code to continent
g = open('map_country.json')
c_map = json.load(g)

#Filter active probes
output_data_active = [x for x in data if x.get('status') == 1]
#write all active to file
with open('active.json', 'w') as outfile:
    json.dump(output_data_active, outfile)

# Opening JSON file containing connected probe list
m = open('active.json')
active = json.load(m)


#Filter for starlink 
output_dict_starlink = [x for x in active if x.get('asn_v4') == 14593 or x.get('asn_v6') == 14593
]
#write starlink to file
with open('starlink.json', 'w') as outfile:
    json.dump(output_dict_starlink, outfile)



#Filter for mobile data
output_dict_mobile = [x for x in active if ('dsl' not in x['tags'] and 'vdsl' not in x['tags'] and 'vdsl2' not in x['tags'] 
    and 'adsl' not in x['tags'] and 'fibre' not in x['tags'] and 'datacenter' not in x['tags'] and 'ftth' not in x['tags']) 
    and ('3g' in x['tags'] or '4g' in x['tags'] or 'lte' in x['tags'] or '5g' in x['tags'] or 'mobile' in x['tags']) 
    and ('home' in x['tags'] or 'office' in x['tags'] or 'academic' in x['tags'] ) 
    ]
#write mobile data to file 
with open('mobile_data.json', 'w') as outfile:
    json.dump(output_dict_mobile, outfile)


#Filter for WIFI
output_dict_wifi = [x for x in active if ('dsl' not in x['tags'] and 'vdsl' not in x['tags'] and 'vdsl2' not in x['tags'] 
    and 'adsl' not in x['tags'] and 'fibre' not in x['tags'] and 'datacenter' not in x['tags'] and 'ftth' not in x['tags'])
    and ('home' in x['tags'] or 'office' in x['tags'] or 'academic' in x['tags'] )
    and ('wifi-mesh' in x['tags'] or 'system-wifi' in x['tags'] or 'public-wifi' in x['tags'] or 'wifi' in x['tags'] or 'wi-fi' in x['tags'] or 'free-wifi' in x['tags'] or 'wlan' in x['tags'])
     ]
#write wifi to file 
with open('wifi.json', 'w') as outfile:
    json.dump(output_dict_wifi, outfile)

#List of all contry codes that are in at least one of LTE or wifi or starlink 
# as found by: 
# grep country_code wifi.json | sort | uniq -c >> code.txt
# grep country_code mobile_data.json | sort | uniq -c >> code.txt
# grep country_code starlink.json | sort | uniq -c >> code.txt
list_countrycode = ["AT", "AU", "BG", "CA", "CH", "CL", "CZ", "DE", "DK", "ES", "FI", "FR", "GB", "GR", "HK", "ID", "IE", "IN", "IR", "IT", "JP", "KZ", "LV", "MN", "NL", "NO", "NZ", "PL", "RE", "RU", "SA", "SE", "SI", "SK", "TN", "TR", "UA", "US", "AU", "AZ", "BE", "BG", "BR", "CA", "CH", "CN", "CO","CZ","DE", "ES", "FI", "FR", "GB", "GR", "IL", "IN", "IR", "IT", "JP", "KZ", "MY", "NA", "NL", "PK", "RS", "RU", "SE", "SG", "TR", "UA", "US", "UZ", "VE"]

#Filter all home probes that are nearby 
output_dict_home = [x for x in active if ('dsl'  in x['tags'] or 'vdsl'  in x['tags'] or 'vdsl2'  in x['tags'] 
    or 'adsl'  in x['tags'] or 'fibre'  in x['tags']  or 'ftth'  in x['tags'] or 'cabel'  in x['tags'])
    and (x['country_code'] in list_countrycode)
    and ('home' in x['tags'] or 'office' in x['tags'] or 'academic' in x['tags'])
    and ('wifi-mesh' not in x['tags']  and 'system-wifi'  not in  x['tags']  and 'public-wifi'  not in  x['tags']  and 'wifi'  not in  x['tags']  and 'wi-fi'  not in  x['tags']  and 'free-wifi'  not in  x['tags']  and 'wlan'  not in  x['tags'])
    ]
#write all home to file 
with open('all_home.json', 'w') as outfile:
    json.dump(output_dict_home, outfile)

# Opening JSON file containing all home probe list
n = open('all_home.json')
all_home = json.load(n)

zahler = {}
output_dict = []

#If we find more than 5 probes per country only take 5
for x in all_home:
    cc = x['country_code']
    if cc not in zahler:
       zahler[cc] = 0

for x in all_home:
    cc = x['country_code']
    if zahler[cc] < 5:
        output_dict.append(x)
        zahler[cc] = zahler[cc] + 1

#write max 5 per country home probes to file 
with open('home.json', 'w') as outfile:
    json.dump(output_dict, outfile)

# Show json
output_json = json.dumps(output_dict)
print (output_json)

# Closing files
f.close()
g.close()
m.close()
n.close()