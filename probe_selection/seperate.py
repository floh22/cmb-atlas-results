# Python program seperate the nodes by country code

import json



# Opening JSON file
f = open('probe.json') 
data = json.load(f)

g = open('map_country.json')
c_map = json.load(g)

out_euro = []
out_asia = []
out_na = []
out_oc = []
out_sa = []
out_africa = []
out_me = []

for x in data: 
    cc = str.lower(x['country_code'])
    if cc in c_map['europe']:
        out_euro.append(x)
    if cc in c_map['oceania']:
        out_oc.append(x)
    if cc in c_map['africa']:
        out_africa.append(x)
    if cc in c_map['asia']:
        out_asia.append(x)
    if cc in c_map['north america']:
        out_na.append(x)
    if cc in c_map['south america']:
        out_sa.append(x)
    if cc in c_map['middle east']:
        out_euro.append(x) #in the list of datacenters were no datacenters listed for the middle east
        
    

# Transform python object back into json
with open('out_euro.json', 'w') as outfile:
    json.dump(out_euro, outfile)

with open('out_oc.json', 'w') as outfile:
    json.dump(out_oc, outfile)

with open('out_africa.json', 'w') as outfile:
    json.dump(out_africa, outfile)

with open('out_asia.json', 'w') as outfile:
    json.dump(out_asia, outfile)

with open('out_na.json', 'w') as outfile:
    json.dump(out_na, outfile)

with open('out_sa.json', 'w') as outfile:
    json.dump(out_sa, outfile)

# Closing file
f.close()
g.close()