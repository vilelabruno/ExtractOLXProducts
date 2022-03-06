var express = require('express');
var ncp = require('ncp').ncp;
var randomWords = require('random-words');
ncp.limit = 16;
var router = express.Router();
var bodyParser = require('body-parser');
const dotenv = require('dotenv');
dotenv.config();
var request = require('request');

router.use(bodyParser.urlencoded({
    extended: true
}));
router.use(bodyParser.json());

const mongo = require('mongodb').MongoClient;
const puppeteer = require('puppeteer-extra');

// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function cs(response) {
    carType = "polo"
    // That's it, the rest is puppeteer usage as normal 😊
    puppeteer.launch({
        ignoreHTTPSErrors: true,
        args: [
          '--log-level=3', // fatal only
          '--start-maximized',
          '--no-default-browser-check',
          '--disable-infobars',
          '--disable-web-security',
          '--disable-site-isolation-trials',
          '--no-experiments',
          '--ignore-gpu-blacklist',
          '--ignore-certificate-errors',
          '--ignore-certificate-errors-spki-list',
          '--disable-gpu',
          '--disable-default-apps',
          '--enable-features=NetworkService',
          '--disable-setuid-sandbox',
          '--no-sandbox'
        ],
        ignoreDefaultArgs: ['--enable-automation'],
        headless: false ,
        userDataDir: "./session"}).then(async browser => {
        const page = await browser.newPage()
        //await page.setViewport({ width: 800, height: 600 })
        await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36');
        await page.setRequestInterception(true);
        page.on('request', request => {
            //console.log(request.url());
            //.........................
            request.continue();
        });
        await page.setDefaultNavigationTimeout(0);
        console.log("browser opened!");

        
        pageCount = 1;
        while (true){

            await page.goto("https://sp.olx.com.br/autos-e-pecas/carros-vans-e-utilitarios?o="+pageCount+"&q="+carType);
            await page.waitForNavigation({waitUntil: 'networkidle0',});
            
            for (i = 0; i < 58; i++){

                try{  
                    car = {}
                    await page.evaluate((i)=>{
                        iList = document.getElementById("ad-list");
                        li = iList.getElementsByTagName("li");
                        li[i].getElementsByTagName("a")[0].click();
                    },i);
                    await page.waitForNavigation({waitUntil: 'networkidle0',});
                
                    car = await page.evaluate(()=>{
                        car = {}
                        function getElementsByText(str, tag = 'a') {
                            return Array.prototype.slice.call(document.getElementsByTagName(tag)).filter(el => el.textContent.trim() === str.trim());
                        }
                        a = getElementsByText('Ver descrição completa');
                        a[0].click();

                        return car;
                    });
                    await page.waitForTimeout(5000);
                    mongo.connect("mongodb://" + MONGOHOST + ":27017/", {
                        useNewUrlParser: true,
                        useUnifiedTopology: true
                    }, (err, client) => {
                        if (err) {
                            console.error(err)
                            return
                        }
                    
                        const db = client.db('olx');
                        const ct = db.collection(carType);

                        //ct.insertOne(car)
                    })
                } catch(e){

                }
                if (i == 2) await page.waitForTimeout(100000);
            }
            pageCount++;
        }
        response.send(element.split(":")[1]);
      
        await browser.close();
        //TODO verify if can send a message of error or not, and send

    });
}
cs("t");
router.post('/', function(request, response){
    cs(response);
    //response.send('1');
});

module.exports = router;