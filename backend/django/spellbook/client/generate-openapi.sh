#!/bin/sh
set -e

cd ..
python manage.py spectacular --file client/openapi.yaml --fail-on-warn --validate
