#!/bin/bash

rm -r published/

dotnet publish -c Release src/Keepi.Web/ -o published/