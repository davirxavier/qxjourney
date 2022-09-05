mkdir dist || 1
mkdir dist/server || 1
cd server
npm run build
mv dist/* ../dist/server
cd ..
cp -r client dist
