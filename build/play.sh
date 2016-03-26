#!/bin/bash


node ../../../../tiddlywiki.js \
	./playground \
	--verbose \
	--server 8080 $:/core/save/all \
	|| exit 1


