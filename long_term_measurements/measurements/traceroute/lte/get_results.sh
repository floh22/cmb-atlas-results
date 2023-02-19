#! /bin/bash

my_var=1

grep '/results\|description' measurments_my.json | tr -d '",' | while read -r line
do
    if [ $my_var == 1 ]
    then
        description=$line
        my_var=0
    else
        line_w="${line/result:}"
        file=$(echo $line_w | tr -d '//?=:.')
        file="${file/httpsatlasripenetapiv2measurements}"
        file="${file/resultsformatjson}"
        echo -n {\"description\":\" > $file.json
        echo -n $description >> $file.json
        echo -n \",\"data\": >> $file.json
        curl -H "Authorization: Key 91225175-1751-4e49-b466-1d94416f3bb2"  $line_w >> $file.json
        echo -n } >>  $file.json
        my_var=1
    fi

    
done


#echo ${grep /results measurments_my.json | tr -d '"'|//result:}

#test2="${test//result:}"
#echo $test