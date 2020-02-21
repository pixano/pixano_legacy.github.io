## Dependencies

- NodeJS

## How to use

```
# Install application dependencies
npm i --no-package-lock
# If Pixano element modules not published in NPM registry, link local path:
npm i --no-save file:../pixano-elements/packages/core file:../pixano-elements/packages/graphics-2d file:../pixano-elements/packages/graphics-3d
# Build application
npm run build
# Run application
nodejs server/server.js /path/to/workspace/
```