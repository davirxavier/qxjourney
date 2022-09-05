mkdir dist || 1
mkdir dist/server || 1
cd server || exit
npm install || exit
npm run build || exit
mv dist/* ../dist/server || exit
mv node_modules ../dist/server || exit
cd .. || exit
cp -r client dist || exit
