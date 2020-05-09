const fs = require('fs');
const axios = require('axios');

async function main() {
  const file = process.argv[2];
  console.log('Webサイト差分チェッカー for TCU');
  if(!file) {
    console.log('URLリストが指定されていません。終了します。');
    process.exit(1);
  }
  console.log(`${file}を読み込みます。`);
  const url_list = await readUrlList(file);
  // console.log(url_list);
  console.log(`${url_list.length}件のURLを読み込みました。`);
}

function readUrlList(file) {
  return new Promise((resolve, reject) => {
    fs.readFile(file, 'utf-8', (err, data) => {
      if(err) { throw err; };
      const url_list = data.split(/\r\n|\r|\n/);
      resolve(url_list);
    })
  }) 
}

main();