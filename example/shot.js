const playwright = require('playwright');
const path = require('path');
const jimp = require('jimp');
const express = require('express');

const app = express();
const port = 8000;
let id = 0;
app.get('/getColors/:url', async (req, res) => {
  // const { url } = req.params;
  const url = 'https://www.facebook.com/';
  id += 1;
  try {
    await downloadScreenshotFromUrl(url, id);
    const pallet = await getImagePallet(`./screenshots/${id}.png`);
    console.log(pallet);
    res.json({ pallet: pallet });
  } catch (error) {
    console.log(error);
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

const getImagePallet = async (filePath) => {
  jimp.read(filePath, function (err, image) {
    image.getPixelColor(0, 0); // returns the colour of that pixel e.g. 0xFFFFFFFF
    // console.log(image);
    let width = image.bitmap.width;
    let height = image.bitmap.height;
    const allColors = [];
    for (let i = 0; i < width; i++) {
      for (let j = 0; j < height; j++) {
        allColors.push(image.getPixelColor(i, j));
      }
    }
    // console.log(convertIntToRGB(getMostFrequent(allColors)));
    return convertIntToRGB(getMostFrequent(allColors));
    // console.log(jimp.intToRGBA(image.getPixelColor(0, 0)));
  });

  function getMostFrequent(arr) {
    const frequencyMap = {};

    arr.forEach((element) => {
      if (frequencyMap[element]) {
        frequencyMap[element]++;
      } else {
        frequencyMap[element] = 1;
      }
    });

    const sortedArray = Object.entries(frequencyMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map((element) => Number(element[0]));

    return sortedArray;
  }

  const convertIntToRGB = (arr) => {
    arr.forEach((element, index, arr) => {
      arr[index] = jimp.intToRGBA(element);
    });
    return arr;
  };
};

const downloadScreenshotFromUrl = async (url, id) => {
  const browser = await playwright.chromium.launch();
  const context = await browser.newContext();
  // ^^^^^incognito: true, by default
  const page = await context.newPage();
  try {
    // await page.goto('https://tph-berlin.net/');
    await page.goto(url);
    // await page.goto(
    //   'https://www.cookiebot.com/en/uk-ie-cookie-banner/?utm_source=google&utm_medium=cpc&utm_campaign=il-generic&utm_device=c&utm_term=cookie%20acceptance%20popup&utm_content=il-eng-cookie-popup&matchtype=e&gclid=CjwKCAiA_vKeBhAdEiwAFb_nrdc2B7OXyTAzcAts_fxpJrZRK2xI7sJ9TjZvx9Pm2J3NoRUZhP-jyxoCwBwQAvD_BwE'
    // );

    // get rid of cookies attempts. gets stuck. maybe because it doesnt find text sometimes
    // maybe a bigass swtich case to figure out which happens\succeed
    // await page.click('text=Reject'); //
    // await page.click('text=Reject All');
    // await page.click('text=Disable');
    // await page.click('text=Deny');
    // await page.click('text=Accept'); // to accept cookies but could lead to unwanted behaviour....
    // await page.click('text=Allow'); // to accept cookies but could lead to unwanted behaviour....
    // overwrites if same name file exists
    const screenshot = await page.screenshot({
      path: `./screenshots/${id}.png`,
    });
    // console.log(page); lots of data, no mention of pixels

    // const img = new Image();
    // img.src = './screenshots';

    // context.drawImage(img, 0, 0);
    // data = context.getImageData(x, y, 1, 1).data;
    await browser.close();
  } catch (error) {
    console.log(error);
    await browser.close();
  }
};
