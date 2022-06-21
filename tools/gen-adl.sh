#!/bin/bash
reporoot="$( cd -- "$(dirname "$BASH_SOURCE")/.." >/dev/null 2>&1 ; pwd -P )"
deno run --quiet --unstable --allow-all $reporoot/deno/gen-adl.ts
