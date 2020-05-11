# fetch-tcu-node
TCU各種オリエンテーションサイト・お知らせサイト等の差分を取得してくるbotです。DiscordのWebhookに飛ばします。

## 導入

- コマンドの実行
```
git clone https://github.com/TCU-vRSA/fetch-tcu-node.git
cd fetch-tcu-node
yarn install
```

- `.env`ファイルの作成
```
WEBHOOK=DiscordのWebhook URL
```

- URL一覧ファイルの作成
現時点では、同梱のlist.txtファイルに、以下のURLが記載されています。文字コードは`UTF-8`にしてください。
```
https://grp.tcu.ac.jp/online/forstudents/
https://grp.tcu.ac.jp/kyoumu/
https://grp.tcu.ac.jp/kyoumu/orientation/sc/
https://grp.tcu.ac.jp/kyoumu/orientation/yc/
https://grp.tcu.ac.jp/kyoumu/orientation/tc/
https://grp.tcu.ac.jp/kyoumu/orientation/studyabroad/
https://grp.tcu.ac.jp/kyoumu/orientation/sc2/
https://grp.tcu.ac.jp/kyoumu/orientation/yc2/
https://grp.tcu.ac.jp/kyoumu/orientation/tc2/
```

## 実行
引数にURLリストを指定して下さい。
```
node ./main.js ./list.txt
```

後はお好みでcronを設定すると、定期的に巡回して、指定したDiscordチャンネルに差分情報を送信することができます。

## License
MIT License
