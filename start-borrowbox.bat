@echo off
title BorrowBox - Community Sharing & Borrowing Platform
echo ========================================================
echo   Starting BorrowBox (BCA FYUGP Mini Project)
echo   "Don't Buy It. Borrow It. Share It. Reuse It."
echo ========================================================
echo.
echo Starting backend server on http://localhost:5000...
echo Starting frontend client on http://localhost:5173...
echo.
timeout /t 2 >nul
start http://localhost:5173
call npm.cmd run dev
pause

