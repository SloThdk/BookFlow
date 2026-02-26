@echo off
echo Starting BookFlow dev server on port 3014...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3014" ^| find "LISTENING"') do taskkill /F /PID %%a 2>nul
if exist .next\server\dev\server.lock del /f .next\server\dev\server.lock 2>nul
start "" "http://localhost:3014"
call npm run dev -- --port 3014
