#!/bin/bash

# download selenium server if doesn't exist
if [ ! -f "selenium-server-standalone-2.52.0.jar" ]; then
    echo "downloading selenium server standalone..."
    wget -q http://selenium-release.storage.googleapis.com/2.52/selenium-server-standalone-2.52.0.jar
fi

echo "starting selenium server..."
java -jar selenium-server-standalone-2.52.0.jar > selenium-server.log 2>&1 < /dev/null &
SELENIUM_PID=$!
# wait for server to be ready before continuing
while ! nc -z localhost 4444; do sleep 1; done

# run tests (with a 10 min timeout)
./node_modules/.bin/mocha --timeout 600000 imdb.js

echo "killing selenium server PID $SELENIUM_PID"
kill $SELENIUM_PID
