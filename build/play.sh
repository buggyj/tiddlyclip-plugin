#!/bin/bash


node ../../../../tiddlywiki.js \
	./playedit \
	--verbose \
	--server 8080 $:/core/save/all \
	|| exit 1


