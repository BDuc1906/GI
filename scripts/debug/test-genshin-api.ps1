# test-genshin-api.ps1
# Chạy 1 lần, tự động test tất cả endpoint cần thiết, gom hết vào 1 file
# duy nhất — bạn chỉ cần upload lại đúng 1 file đó cho tôi.
#
# Cách chạy: mở PowerShell tại thư mục bất kỳ, dán từng dòng hoặc lưu
# thành file "test-genshin-api.ps1" rồi chạy:
#   powershell -ExecutionPolicy Bypass -File test-genshin-api.ps1

$ErrorActionPreference = "Continue"
$output = "genshin-api-test-results.txt"
Remove-Item $output -ErrorAction SilentlyContinue

function Test-Endpoint {
    param([string]$Name, [string]$Url)
    Add-Content $output "`n===== $Name =====`nURL: $Url`n"
    try {
        $res = Invoke-RestMethod -Uri $Url -TimeoutSec 15
        $json = $res | ConvertTo-Json -Depth 10 -Compress
        # Giới hạn 3000 ký tự mỗi endpoint - đủ để xem cấu trúc field,
        # không cần in hết nếu response quá dài (vd /all)
        if ($json.Length -gt 3000) {
            Add-Content $output ($json.Substring(0, 3000) + "... [CẮT BỚT, còn $($json.Length) ký tự]")
        } else {
            Add-Content $output $json
        }
    } catch {
        Add-Content $output "LỖI: $($_.Exception.Message)"
    }
}

Test-Endpoint "Danh sách loại dữ liệu"        "https://genshin.jmp.blue/"
Test-Endpoint "Danh sách slug nhân vật"       "https://genshin.jmp.blue/characters"
Test-Endpoint "Chi tiết 1 nhân vật (Albedo)"  "https://genshin.jmp.blue/characters/albedo?lang=en"
Test-Endpoint "Danh sách slug vũ khí"         "https://genshin.jmp.blue/weapons"
Test-Endpoint "Chi tiết 1 vũ khí"             "https://genshin.jmp.blue/weapons/aquila-favonia?lang=en"
Test-Endpoint "Danh sách slug thánh di vật"   "https://genshin.jmp.blue/artifacts"
Test-Endpoint "Chi tiết 1 bộ thánh di vật"    "https://genshin.jmp.blue/artifacts/gladiators-finale?lang=en"
Test-Endpoint "Danh sách slug nguyên liệu"    "https://genshin.jmp.blue/materials"
Test-Endpoint "Chi tiết 1 nguyên liệu (Mora)" "https://genshin.jmp.blue/materials/mora?lang=en"
Test-Endpoint "Danh sách slug bí cảnh"        "https://genshin.jmp.blue/domains"

Write-Host "`nXONG! Kết quả đã lưu vào: $((Get-Item $output).FullName)"
Write-Host "Upload file đó vào chat cho Claude."
