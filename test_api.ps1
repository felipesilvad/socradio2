# PowerShell script to test the API
# Fix URL encoding for spaces

Write-Host "🧪 Testing Global Playback API..." -ForegroundColor Green

# Test health endpoint
Write-Host "`n1. Testing health endpoint..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3001/health" -UseBasicParsing
    Write-Host "✅ Health: $($health | ConvertTo-Json -Compress)" -ForegroundColor Green
} catch {
    Write-Host "❌ Health failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test station by name (URL encoded)
Write-Host "`n2. Testing Main Station..." -ForegroundColor Yellow
try {
    $station = Invoke-RestMethod -Uri "http://localhost:3001/api/playback/state-by-name/Main%20Station" -UseBasicParsing
    Write-Host "✅ Main Station: $($station | ConvertTo-Json -Compress)" -ForegroundColor Green
} catch {
    Write-Host "❌ Main Station failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test playlist endpoint
Write-Host "`n3. Testing playlist endpoint..." -ForegroundColor Yellow
try {
    # First get station ID
    $stationData = Invoke-RestMethod -Uri "http://localhost:3001/api/playback/state-by-name/Main%20Station" -UseBasicParsing
    if ($stationData.stationId) {
        $playlist = Invoke-RestMethod -Uri "http://localhost:3001/api/playback/playlist/$($stationData.stationId)" -UseBasicParsing
        Write-Host "✅ Playlist: $($playlist | ConvertTo-Json -Compress)" -ForegroundColor Green
    } else {
        Write-Host "❌ No station ID found" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Playlist failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎯 API testing complete!" -ForegroundColor Green
