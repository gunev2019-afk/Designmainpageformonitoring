@echo off
echo ================================
echo Clearing ts-node cache...
echo ================================
echo.

if exist node_modules\.cache (
    rmdir /s /q node_modules\.cache
    echo Cache cleared successfully!
) else (
    echo Cache folder not found. Nothing to clear.
)

echo.
echo ================================
echo Done! Now run: npm run dev
echo ================================
pause
