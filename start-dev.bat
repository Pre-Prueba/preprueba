@echo off
start "Preprueba Web" cmd /k "cd /d D:\preprueba\apps\web && npm run dev"
start "Preprueba API" cmd /k "cd /d D:\preprueba\apps\api && npm run dev"
