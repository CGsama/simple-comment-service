@echo off
for /F "usebackq tokens=1,2 delims==" %%i in (`wmic os get LocalDateTime /VALUE 2^>NUL`) do if '.%%i.'=='.LocalDateTime.' set ldt=%%j
REM set ldt=%ldt:~0,4%-%ldt:~4,2%-%ldt:~6,2% %ldt:~8,2%:%ldt:~10,2%:%ldt:~12,6%
set ldt=%ldt:~0,4%-%ldt:~4,2%-%ldt:~6,2%
docker build -t cgsama/simple-comment-service:%ldt% -t cgsama/simple-comment-service:latest .
pause