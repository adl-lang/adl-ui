# adl-ui

A toolkit for generating user interface components from ADL type definitions.

## code structure

* `model/` - the underlying state and events for adl derived UI elements
* `ui/` - a view implementation in terms of raw styled components
* `mui/` - a view implementation in terms of the material ui framework
* `*-stories/` - storybook stories for each of the above

in any given application either model+ui or model+mui should be used

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

## reuse in another project

1) copy `src/model` and either `src/mui` or `src/ui` to a folder in your target project.

2) Ensure that your target project has adl generated typescript code to satisfy the following imports:

```
@/adl-gen/runtime
@/adl-gen/sys/types
@/adl-gen/sys/adlast
@/adl-gen/common/ui
```
3) Update the target project's `package.json` to include either material-ui (if you used `src/mui`) or styled
components (if you used `src/ui`



