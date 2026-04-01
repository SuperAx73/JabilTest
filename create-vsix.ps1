Add-Type -AssemblyName System.IO.Compression.FileSystem

$vsixPath = "c:\Users\4124279\Documents\git personal\JabilTest\JabilTest Visual Studio Extension\dist\jabiltest-language-support-visualstudio-1.0.1.vsix"
$sourcePath = "c:\Users\4124279\Documents\git personal\JabilTest\JabilTest Visual Studio Extension\dist\vsix-content"

if (Test-Path $vsixPath) { 
    Remove-Item $vsixPath -Force 
}

[System.IO.Compression.ZipFile]::CreateFromDirectory($sourcePath, $vsixPath, "Optimal", $false)

Get-Item $vsixPath | Select-Object Length, LastWriteTime
