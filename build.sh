mkdir dist || 1
mkdir dist/server || 1
mkdir dist/server/node_modules || 1
cd server || exit
npm install || exit
npm run build || exit
cp -r dist/* ../dist/server || exit
cp -r node_modules ../dist/server || exit
cd .. || exit
cp -r client dist || exit
