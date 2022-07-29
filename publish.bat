cd /d "%~dp0"
call npx webpack --mode production
call npm version patch --no-git-tag-version
call npm publish --access public