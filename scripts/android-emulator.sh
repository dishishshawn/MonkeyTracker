#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
android_sdk="$project_root/.tools/android-sdk"
android_avd="$project_root/.tools/android-user/avd"
node_bin="$project_root/.tools/node/bin"

export ANDROID_HOME="$android_sdk"
export ANDROID_SDK_ROOT="$android_sdk"
export ANDROID_AVD_HOME="$android_avd"
export PATH="$node_bin:$android_sdk/platform-tools:$android_sdk/emulator:$PATH"

if ! adb devices | awk 'NR > 1 && $2 == "device" { found = 1 } END { exit !found }'; then
  emulator @medium_phone -accel on -gpu auto -no-boot-anim >"$project_root/.tools/android-emulator.log" 2>&1 &
  adb wait-for-device

  for boot_try in $(seq 1 60); do
    if [[ "$(adb shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" == "1" ]]; then
      break
    fi
    sleep 2
  done
fi

exec npx expo start --localhost --android
