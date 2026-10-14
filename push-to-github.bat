@echo off
title Push Frontend to GitHub
echo ========================================================
echo   Pushing Frontend to https://github.com/chsaikumar377-byte/bus-railway-reservation-frontend
echo ========================================================
echo.
echo Please make sure you have created the repository on GitHub:
echo https://github.com/new with name: bus-railway-reservation-frontend
echo.
pause
git branch -M main
git remote remove origin 2>nul
git remote add origin https://github.com/chsaikumar377-byte/bus-railway-reservation-frontend.git
git push -u origin main
echo.
echo If prompted, authenticate with your GitHub credentials or Personal Access Token.
pause
