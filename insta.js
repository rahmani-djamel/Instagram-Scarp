const express = require('express')
const axios = require('axios')
const app = express()
const fs = require('fs')
const path = require('path')
const puppeteer = require('puppeteer')
const port = 3000
const bodyParser = require('body-parser');
const { Console } = require('console')
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-origin", "*")
    res.setHeader('Access-Control-Allow-Methods', "GET,POST,PUT,DELETE,OPTIONS")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    next();
  })
  app.get('/testing', (req,res) =>{
	const arr = []
	const directoryPath = path.join(__dirname, 'public/images');
	fs.readdir(directoryPath, function (err, files) {
    //handling error
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    }
	res.send(files)
});
})

  app.get('/',  async(req,res) =>{
   // console.log( await scrapeInstgram('hello'))
	res.sendFile(__dirname +'/inf.html')
})
app.get('/get',  async(req,res) =>{
    //
    const directory = 'public/images';

    fs.readdir(directory, (err, files) => {
      if (err) throw err;

      for (const file of files) {
        fs.unlink(path.join(directory, file), err => {
          if (err) throw err;
        });
      }
    });
    console.log(req.query.foo)
    var response = await scrapeInstgram(req.query.foo)

     response.forEach((el,index) => {

        getFromUrl(el.link,index)
    })
     var len = []
     len.push(response.length)
   // console.log(response)
   res.send(len)
 })
//benz.dounia_officiel
async function scrapeInstgram(profile) {
    const browser = await puppeteer.launch({args: ["--proxy-server='direct://'", '--proxy-bypass-list=*']})
	const page = await browser.newPage()
    await page.setDefaultNavigationTimeout(0);
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36')
	await page.goto("https://storiesig.info/fr/")
    await page.waitForSelector('#header > div.container > div > form > input');
	 await page.type('#header > div.container > div > form > input', profile);
     await page.click('#header > div.container > div > form > button');
	await page.waitFor(5000)
    //let elements = document.getElementsByClassName(' div.download-button.mt-3');
    var allImage = await page.evaluate(() => {
		var allimagessarr = []
		document.querySelectorAll("a").forEach(img => {
			var link = img.getAttribute("href")
			allimagessarr.push({
				link:link,
			})
		})
		return allimagessarr
	}).then(result => {
        var arr = []
        result.forEach(el => {
            if(el.link.includes("media") || el.link.includes("https://scontent")  || el.link.includes("https://instagram"))
              arr.push(el)
        })
        return arr
    }).catch(err => {
        console.log(err)
    })
    await browser.close();
	return allImage
    //return elements
    }

    function	 getFromUrl(arr,i)
    {
        if(arr.includes("media") ){
            axios({
                method: "get",
                url: arr,
                responseType: "stream"
                }).then(async function (response) {
                await response.data.pipe(fs.createWriteStream("public/images/vdo"+i+".mp4"));
            });
       }else{
        axios({
            method: "get",
            url: arr,
            responseType: "stream"
            }).then(async function (response) {
            await response.data.pipe(fs.createWriteStream("public/images/img"+i+".jpeg"));
        });

       }

            //console.log(allImage)
    }


  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })