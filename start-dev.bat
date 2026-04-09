@echo off
start "Preprueba Web" cmd /k "cd /d C:\Users\vivim\preprueba\apps\web && npm run dev"
start "Preprueba API" cmd /k "cd /d C:\Users\vivim\preprueba\apps\api && npm run dev"
