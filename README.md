# MET・WAT 計算（PWA）
距離・時間・上り量・体重から、ACSM歩行式で MET と WAT を計算する **オフライン対応PWA**。

## 使い方（最速）
1. フォルダをサーバに配置（GitHub Pages / Netlify / Vercel など）
2. スマホでURLを開き「ホーム画面に追加」
3. 以後オフラインでも動作（初回アクセス時にキャッシュ）

## ローカル確認（PC）
cd metwat-pwa-v2
python3 -m http.server 8080
# http://localhost:8080 を開く（file:// はSW不可）
