 find ../tw5 -type f -exec ls {} \; 2> /dev/null| cut -c 8- | ./twfileshelper.sh >../tw5/tiddlywiki.files
