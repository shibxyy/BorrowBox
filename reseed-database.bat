@echo off
title Reset & Reseed BorrowBox Database
echo ========================================================
echo   Reseeding BorrowBox Database
echo ========================================================
echo.
if exist "server\borrowbox.db" (
  echo Deleting existing database...
  del /f /q "server\borrowbox.db"
)
if exist "server\borrowbox.db-wal" (
  del /f /q "server\borrowbox.db-wal"
)
if exist "server\borrowbox.db-shm" (
  del /f /q "server\borrowbox.db-shm"
)
echo Populating fresh demo data (Users, Categories, Items, Requests, Reviews)...
node server\src\seed\seedData.js
echo.
echo Database successfully reseeded!
pause

