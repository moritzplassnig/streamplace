#!/bin/bash

set -o errexit
set -o nounset
set -o pipefail

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

docker rm -f shoko > /dev/null || :;

prettylog() {
  name="$1"
  color="$2"
  while IFS= read -r line; do
    echo -en "\e[38;05;${color}m[${name}]\e[38;05;231m "
    echo "$line"
  done
}

function run() {
  name="$1"
  path="$name"
  color="$2"
  if [[ -f "$SK_SECRET_DIRECTORY/$name.sh" ]]; then
    source "$SK_SECRET_DIRECTORY/$name.sh"
  fi
  cd "$DIR/../apps/$path" && npm run dev 2>&1 | prettylog "$name" "$color" &
  sleep 1
}
export NODE_PATH="$(realpath "$DIR/../apps")"
# export DEBUG_LEVEL="debug"
run sk-schema 4
# run sk-code 190
run shoko 208
run sk-client 196
run mpeg-munger 214
run sk-time 94
run bellamie 201
run gort 6
run pipeland 40
wait

# for i in {0..255}; do echo -e "\e[38;05;${i}m\\\e[38;05;${i}m"; done
