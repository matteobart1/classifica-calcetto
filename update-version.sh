#!/bin/bash
GIT_HASH=$(git rev-parse --short HEAD)
BUILD_DATE=$(date +"%d/%m/%Y %H:%M:%S")
VERSION_STRING="Versione: $GIT_HASH (build $BUILD_DATE)"
sed -i "s/%%VERSION%%/$VERSION_STRING/" index.html
