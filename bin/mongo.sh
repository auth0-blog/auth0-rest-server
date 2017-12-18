#!/bin/bash

function start {
  docker container ls | grep secured-wildcard-mongo

  if [[ $? == 0 ]]
    then
      echo 'MongoDB for RestFlex is already running.'
      exit 1
  fi

  if [[ $2 == 'local' ]]
    then
      docker run --name secured-wildcard-mongo \
        -p 27017:27017 \
        -d mongo
    else
      docker run --name secured-wildcard-mongo \
        --network digituz \
        -p 27017:27017 \
        -d mongo
  fi
}

function stop {
  docker stop secured-wildcard-mongo
}


function rm {
  docker stop secured-wildcard-mongo
  docker rm secured-wildcard-mongo
}

case "$1" in
  start)
    start
    ;;
  stop)
    stop
    ;;
  rm)
    rm
    ;;
  *)
    echo $"Usage: $0 {start|stop}"
    exit 1
esac
