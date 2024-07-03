#!/usr/bin/env bash
# git pull updates and deploy

git pull

rm -r /var/www/imagihub/*
cp -r dist/* /var/www/imagihub/

