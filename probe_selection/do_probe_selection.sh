#! /bin/bash

#create folders
echo "create folders"
mkdir home
mkdir lte
mkdir starlink
mkdir wifi

#copy files to folders
echo "copy files to folders"
cp get_id.py home
cp get_id.py lte
cp get_id.py starlink
cp get_id.py wifi

cp seperate.py home
cp seperate.py lte
cp seperate.py starlink
cp seperate.py wifi

cp map_country.json home
cp map_country.json lte
cp map_country.json starlink
cp map_country.json wifi

#get probe list
echo "get probe list"
wget  https://ftp.ripe.net/ripe/atlas/probes/archive/meta-latest
bunzip2 meta-latest
mv meta-latest.out data.json
 
#filter probes
echo "filter probes"
python3 filter_probes.py

#move filtered probes to folders
echo "move filtered probes to folders"
mv wifi.json wifi/probe.json
mv home.json home/probe.json
mv mobile_data.json lte/probe.json
mv starlink.json starlink/probe.json

#seperate probes according to continet according to country code  
echo "seperate probes according to continet according to country code"
cd wifi 
python3 seperate.py
cd ../home 
python3 seperate.py
cd ../lte 
python3 seperate.py
cd ../starlink 
python3 seperate.py

#create list of probe IDs
echo "create list of probe IDs"
cd ../wifi 
python3 get_id.py
cd ../home 
python3 get_id.py
cd ../lte 
python3 get_id.py
cd ../starlink 
python3 get_id.py

echo
echo "done list of probes and ID can be found in the corresponding folders"