# adl-ui

A toolkit for generating user interface components from ADL type definitions.

## dev usage

Install tools locally, and make them available in the curent shell (yarn, node, deno, and adl tools):

```
source deno/local-setup.sh
```

Install node packages and generate code from adl:

```
yarn
```

Run the storybook and open in the default browser:

```
yarn storybook
```

If you change the adl (`adl/**.adl`) and want to regenerate the typescript code, just rerun `yarn`.

