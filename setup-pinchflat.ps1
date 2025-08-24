Write-Host "🚀 Setting up Pinchflat for YouTube downloads..." -ForegroundColor Green
Write-Host ""

Write-Host "📁 Creating directories..." -ForegroundColor Yellow
if (!(Test-Path "pinchflat-config")) { New-Item -ItemType Directory -Name "pinchflat-config" }
if (!(Test-Path "pinchflat-downloads")) { New-Item -ItemType Directory -Name "pinchflat-downloads" }

Write-Host "✅ Directories created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Directory structure:" -ForegroundColor Cyan
Write-Host "   pinchflat-config/     - Configuration files" -ForegroundColor White
Write-Host "   pinchflat-downloads/  - Downloaded videos" -ForegroundColor White
Write-Host ""

Write-Host "🐳 Starting Pinchflat with Docker Compose..." -ForegroundColor Yellow
docker-compose -f docker-compose.pinchflat.yml up -d

Write-Host ""
Write-Host "🎯 Pinchflat is now running!" -ForegroundColor Green
Write-Host "🌐 Access the web interface at: http://localhost:8945" -ForegroundColor Cyan
Write-Host ""
Write-Host "📚 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Open http://localhost:8945 in your browser" -ForegroundColor White
Write-Host "   2. Create your first download rule" -ForegroundColor White
Write-Host "   3. Add YouTube channels or playlists" -ForegroundColor White
Write-Host "   4. Let Pinchflat handle the rest!" -ForegroundColor White
Write-Host ""
Write-Host "💡 To stop Pinchflat: docker-compose -f docker-compose.pinchflat.yml down" -ForegroundColor Gray
Write-Host "💡 To view logs: docker-compose -f docker-compose.pinchflat.yml logs -f" -ForegroundColor Gray
Write-Host ""
Read-Host "Press Enter to continue..."
