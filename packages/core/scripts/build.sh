rm -rf ./dist
pnpx tsc --project ./tsconfig.json --outDir ./dist/cjs --module CommonJS
pnpx tsc --project ./tsconfig.json --outDir ./dist/esm --module ES2015
