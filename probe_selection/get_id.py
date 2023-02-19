# Python program to create list of probe IDs 

import json


e = open('out_euro.json')
euro = json.load(e)

o = open('out_oc.json')
oceania = json.load(o)

a1 = open('out_africa.json')
africa = json.load(a1)

a2 = open('out_asia.json')
asia = json.load(a2)

n = open('out_na.json')
na = json.load(n)

s = open('out_sa.json')
sa = json.load(s)


out_euro = [x['id'] for x in euro ]
out_oc = [x['id'] for x in oceania ]
out_afic  = [x['id'] for x in africa ]
out_asia = [x['id'] for x in asia ]
out_na = [x['id'] for x in na ]
out_sa = [x['id'] for x in sa ]




with open('id_out_euro.json', 'w') as outfile:
    json.dump(out_euro, outfile)

with open('id_out_oc.json', 'w') as outfile:
    json.dump(out_oc, outfile)

with open('id_out_afic.json', 'w') as outfile:
    json.dump(out_afic, outfile)

with open('id_out_asia.json', 'w') as outfile:
    json.dump(out_asia, outfile)

with open('id_out_na.json', 'w') as outfile:
    json.dump(out_na, outfile)

with open('id_out_sa.json', 'w') as outfile:
    json.dump(out_sa, outfile)


