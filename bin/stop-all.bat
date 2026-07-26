@echo off
title Mobi - Shutting Down
echo Stopping all services...

echo Stopping backend...
taskkill /f /fi "WINDOWTITLE eq Mobi-Backend*" 2>nul
taskkill /f /im node.exe 2>nul

echo Stopping frontend...
taskkill /f /fi "WINDOWTITLE eq Mobi-Frontend*" 2>nul

echo Done. All services stopped.
