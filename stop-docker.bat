@echo off
REM ============================================
REM VoltX Docker Stop Script (Windows)
REM ============================================

echo.
echo 🛑 Stopping VoltX Application...
echo.

docker-compose down

echo.
echo ✅ All services stopped!
echo.
echo To remove all data (including database), run:
echo docker-compose down -v
echo.
pause
