cd /d "%~dp0"
call npm run build
call npm version patch --no-git-tag-version
call npm publish --access public