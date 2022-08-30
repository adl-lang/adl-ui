# ADL UI, Styled-Components libs and Storybook

## Local Dev

### Testing NPM Package

``` bash
cd adl-ui
yarn
yarn build
npm pack
npm link

cd ..
cd adl-ui-storybook
npm install
npm link @timbod7/adl-ui
npm run storybook
```
