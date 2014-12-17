#!/bin/bash

# Set up the build output directory

if [  -z "$TW5_BUILD_OUTPUT" ]; then
    TW5_BUILD_OUTPUT=.
fi

if [  ! -d "$TW5_BUILD_OUTPUT" ]; then
    TW5_BUILD_OUTPUT=.
fi

echo "Using TW5_BUILD_OUTPUT as [$TW5_BUILD_OUTPUT]"

node ../../../../tiddlywiki.js \
	./demo \
	--verbose \
	--rendertiddler $:/core/save/all $TW5_BUILD_OUTPUT/tiddlyclip.html text/plain \
	|| exit 1


