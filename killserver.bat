@echo off
echo Killing process on port 3000...

for /f "tokens=5" %%a in ('netstat -a -n -o ^| findstr :3000') do (
    echo Found process using port 3000 with PID %%a
    taskkill /PID %%a /F
)

echo Process on port 3000 has been terminated.
pause
