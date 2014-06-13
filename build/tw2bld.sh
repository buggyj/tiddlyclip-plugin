#!/bin/bash

cat ../tw2/tw2info.js>../tw2release/tiddlyclip.js
echo "//{{{">>../tw2release/tiddlyclip.js
cat ../common/tidpaste.js>>../tw2release/tiddlyclip.js
cat ../tw2/messagebox.js>>../tw2release/tiddlyclip.js
cat ../tw2/tw2formats.js>>../tw2release/tiddlyclip.js
cat ../tw2/convert.js>>../tw2release/tiddlyclip.js
echo "//}}}">>../tw2release/tiddlyclip.js
