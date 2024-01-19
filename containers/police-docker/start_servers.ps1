Write-Host "Starting"
$ENV:HOME = 'c:/Users/MT DIAMOND'
cd "C:\Users\MT DIAMOND\desarrollo\ejflab\containers\police-docker"
docker compose up -d
Write-Host "Finished"