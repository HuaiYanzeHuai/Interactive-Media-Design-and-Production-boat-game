@echo off
:: =============================================
:: begin.bat   （已适配 start.html 在 lib 文件夹）
:: 双击此文件 → 自动启动游戏（lib/start.html）
:: 请把这个 begin.bat 放在游戏根目录（和 lib 文件夹同级）
:: =============================================

echo.
echo =============================================
echo     正多边形海战 启动器（v2）
echo     start.html 已位于 lib 文件夹
echo =============================================
echo.
echo 正在启动浏览器并打开游戏首页...

:: 正确打开 lib 里的 start.html（支持中文路径）
start "" "lib\start.html"

:: 如果你想强制使用 Chrome（取消下面一行的注释即可）
:: start "" "chrome.exe" "lib\start.html"

:: 如果你想强制使用 Edge（取消下面一行的注释即可）
:: start "" "msedge.exe" "lib\start.html"

echo.
echo 游戏已启动！请在浏览器中点击【PVP】进入对战。
echo （背景音乐会自动播放）
echo.
echo 祝你玩得开心！^_^

:: 延迟2秒自动关闭黑窗
timeout /t 2 /nobreak >nul
exit