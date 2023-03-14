const http = require("http");
const https = require("https");
const path = require('path');
const qs = require('querystring');
const fs = require("fs");

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/api')) {
    res.writeHead(200, {"Content-Type": "application/json"});
    const url = req.url.split('/');
    let path = url[2];
    let query = null;
    if (url[2] && url[2].includes('?')) {
      const q = url[2].split('?');
      path = q[0];
      query = qs.parse(q[1]);
    }

    if ( ['dotfiles', 'gtk-themes', 'icons'].includes(path)) {
      https.get('https://raw.githubusercontent.com/unixporn-dots/unixporn-dots.github.io/main/js/assets/' + path + '.js', resp => {
        let data = [];

        resp.on('data', chunk => {
          data.push(chunk);
        }); 

        resp.on('end', () => {
          data = Buffer.concat(data).toString()
          data = data.split('\n');
          data.splice(0,1);
          data.splice(data.length - 1, 1);
          data = eval(`[\n${data.join('\n')}`); 
          
          let json = null;
          
          if (query && query.title) {
            let i = 0
            while (i < data.length) {
              if (data[i].title.toLowerCase() == query.title.toLowerCase() ) {
                json = data[i];
                break;
              }
              i++;
            }
            if (!json) {
              json = { "status": "No entry with such title" };
            }
          } else {
            json = data;
          }

          res.end(JSON.stringify(json));
        });

      }).on('error', err => { 
        res.end(`{ "status": "${err}" }`);
      });
    } else {
      res.end(`{ "status": "Not a valid path" }`)
    }
  }
  else if (req.url === "/home" ) {  
    const file = path.join(process.cwd(), 'home.html');
    fs.readFile(file, function (err, html) {
      if (err) {
        throw err; 
      }
      res.writeHead(200, {"Content-Type": "text/html"});  
      res.write(html);  
      res.end();
    })
  }
  else if (req.url === "/") { 
    res.writeHead(301, {Location: "https://unixporn-dots.github.io"});  
    res.end();
  }
  else {
    res.writeHead(404, {"Content-Type": "text/plain"})
    res.end("404: Page Not Found");
  }
})

server.listen(8080, "127.0.0.1", () => {
  console.log("active on 127.0.0.1:8080")
})
