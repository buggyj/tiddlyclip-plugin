#!/bin/bash


node ../../../../tiddlywiki.js \
	./demoeditcard \
	--verbose \
	--server 8089 $:/core/save/all \
	|| exit 1


