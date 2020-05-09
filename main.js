require('dotenv').config();

const fs = require('fs');
const axios = require('axios');
const sanitizeFilename = require('sanitize-filename');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const diff = require('diff');

async function main() {
  const file = process.argv[2];
  console.log('Webサイト差分チェッカー for TCU');
  if(!file) {
    console.log('URLリストが指定されていません。終了します。');
    process.exit(1);
  }
  console.log(`${file}を読み込みます。`);
  const url_list = await readUrlList(file);
  console.log(`${url_list.length}件のURLを読み込みました。`);

  // 一次保存先フォルダがなければdlフォルダを作る
  if (!fs.existsSync('./dl/')) {
    fs.mkdirSync('./dl/');
  };

  // 実行
  for(item in url_list) {
    console.log(`${url_list[item]} の読み込みを開始します……`);
    const file_name = sanitizeFilename(url_list[item], {replacement: '-'}).replace(/\./g, '-') + '.txt';
    const path = './dl/';
    const fetch_data = await fetchUrl(url_list[item]);
    fs.readFile(path + file_name, 'utf-8', async (err, data) => {
      if(err) {
        console.log('初回読み込みのため、データを保存します。');
        fs.writeFile(path + file_name, fetch_data, 'utf-8', err => {
          if(err) { throw err; };
          console.log('保存が終了しました。');
        })
      }
      else {
        const diffs = diffContent(data, fetch_data);
        if(diffs.length) {
          await postDiscord(url_list[item], diffs);
        } else {
          console.log(`${url_list[item]} の変更点はありませんでした。`);
        }
        fs.writeFile(path + file_name, fetch_data, 'utf-8', err => {
          if(err) { throw err; };
        })
      }
    });
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

function diffContent(before, after) {
  const before_dom = new JSDOM(before);
  const before_script = before_dom.window.document.getElementsByTagName('script');
  for (let i = 0; i < before_script.length; i++) {
    const e = before_script[i];
    if(e) {
      e.parentNode.removeChild(e);
    }
  }
  const before_body = before_dom.window.document.body.outerHTML;

  const after_dom = new JSDOM(after);
  const after_script = after_dom.window.document.getElementsByTagName('script');
  for (let i = 0; i < after_script.length; i++) {
    const e = after_script[i];
    if(e) {
      e.parentNode.removeChild(e);
    }
  }
  const after_body = after_dom.window.document.body.outerHTML;

  result = diff.diffLines(before_body, after_body);
  let diffs = [];
  result.forEach(item => {
    if(item.added) {
      diffs.push('追記: ' + item.value);
    }
    else if(item.removed) {
      diffs.push('削除: ' + item.value);
    }
  });

  return diffs;
}

function postDiscord(url, contents) {
  const tmp = {
    "username": "TCU変更通知Bot(Node版)",
    "avatar_url": "https://pbs.twimg.com/profile_images/1250820091018539008/4uztlH6f_400x400.jpg",
    "content": `${url} に変更がありました。`,
    "embeds": [
      {
        "fields": []
      }
    ]
  };
  contents.forEach(item => {
    const t = {
      "name": "変更点",
      "value": item
    }
    tmp.embeds[0].fields.push(t);
  })
  const config = {
    headers: {
      'Accept': 'application/json',
      'Content-type': 'application/json',
    }
  }
  return new Promise((resolve, reject) => {
    axios.post(process.env.WEBHOOK, tmp, config)
      .then(result => {
        console.log('変更点をDiscordに送信しました。');
        resolve();
      })
      .catch(err => {
        reject(err);
      })
  })
}

main();