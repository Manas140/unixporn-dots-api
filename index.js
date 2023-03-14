const http = require("http");
const https = require("https");
const fs = require("fs");

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/api')) {
    const url = req.url.split('/');

    if ( ["dotfiles", "gtk-themes", "icons"].includes(url[2])) {
      https.get('https://raw.githubusercontent.com/unixporn-dots/unixporn-dots.github.io/main/js/assets/' + url[2] + '.js', resp => {
        res.writeHead(200, {"Content-Type": "application/json"});
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

          if (url[3]) {
            let i = 0
            while (i < data.length) {
              if (data[i].title.toLowerCase() == url[3].toLowerCase() ) {
                json = data[1];
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
    fs.readFile('./index.html', function (err, html) {
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
