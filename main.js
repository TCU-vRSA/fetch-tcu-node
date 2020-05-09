const fs = require('fs');
const axios = require('axios');
const sanitizeFilename = require('sanitize-filename');

async function main() {
  const file = process.argv[2];
  console.log('Webサイト差分チェッカー for TCU');
  if(!file) {
    console.log('URLリストが指定されていません。終了します。');
    process.exit(1);
  }
  console.log(`${file}を読み込みます。`);
  const url_list = await readUrlList(file);
  console.log(url_list);
  console.log(`${url_list.length}件のURLを読み込みました。`);

  // 一次保存先フォルダがなければdlフォルダを作る
  if (!fs.existsSync('./dl/')) {
    fs.mkdirSync('./dl/');
  };

  // 実行
  for(item in url_list) {
    const file_name = sanitizeFilename(url_list[item], {replacement: '-'}).replace(/\./g, '-') + '.txt';
    const path = './dl/';
    const fetch_data = await fetchUrl(url_list[item]);
    fs.readFile(path + file_name, 'utf-8', (err, data) => {
      if(err) {
        fs.writeFile(path + file_name, fetch_data, 'utf-8', err => {
          if(err) {
            console.log(err);
          }
        })
      }
    })
    console.log(file_name);
    // await fetchUrl(url_list[item]);
  }
}

function readUrlList(file) {
  return new Promise((resolve, reject) => {
    fs.readFile(file, 'utf-8', (err, data) => {
      if(err) { throw err; };
      const url_list = data.split(/\r\n|\r|\n/);
      resolve(url_list);
    });
  });
}

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    axios.get(url)
      .then(response => {
        resolve(response.data);
      })
  })
}

main();