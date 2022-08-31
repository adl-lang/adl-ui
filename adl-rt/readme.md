

see https://dev.to/binjospookie/exports-in-package-json-1fl2

```
find dist -name "*.js" | sed 's!\(dist/adl-gen/\(.*\).js\)!"./\2": "./\1",!'

find dist -name "*.d.ts" | sed 's!\(dist/adl-gen/\(.*\).d.ts\)!"\2": ["\1"],!'
```