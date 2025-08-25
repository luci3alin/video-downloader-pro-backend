@echo off
echo 🚀 Setting up Pinchflat for YouTube downloads...
echo.

echo 📁 Creating directories...
if not exist "pinchflat-config" mkdir pinchflat-config
if not exist "pinchflat-downloads" mkdir pinchflat-downloads

echo ✅ Directories created successfully!
echo.
echo 📋 Directory structure:
echo    pinchflat-config/     - Configuration files
echo    pinchflat-downloads/  - Downloaded videos
echo.

echo 🐳 Starting Pinchflat with Docker Compose...
docker-compose -f docker-compose.pinchflat.yml up -d

echo.
echo 🎯 Pinchflat is now running!
echo 🌐 Access the web interface at: http://localhost:8945
echo.
echo 📚 Next steps:
echo    1. Open http://localhost:8945 in your browser
echo    2. Create your first download rule
echo    3. Add YouTube channels or playlists
echo    4. Let Pinchflat handle the rest!
echo.
echo 💡 To stop Pinchflat: docker-compose -f docker-compose.pinchflat.yml down
echo 💡 To view logs: docker-compose -f docker-compose.pinchflat.yml logs -f
echo.
pause
