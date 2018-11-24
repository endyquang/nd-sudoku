npm run build
cd dist
git init
git add .
git commit -m "deploy"
git push https://github.com/endyquang/nudoku.git master:gh-pages