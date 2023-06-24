#!/bin/bash


node ../../../../tiddlywiki.js \
	./demoedittb \
	--verbose \
	--server 8089 $:/core/save/all \
	|| exit 1


