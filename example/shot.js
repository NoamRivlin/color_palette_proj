const playwright = require('playwright');
const path = require('path');
const jimp = require('jimp');
const express = require('express');

const app = express();
const port = 8000;
let id = 0;
// asterisk will grab everything after /url/
app.get('/getColors/url/*', async (req, res) => {
  //problem: when using url from params, there's no delay
  // which lead to some sites to not finish loading
  const url = req.params[0];
  console.log('url', url);
  if (!url) {
    res.status(401).send('url not found');
    return;
  }
  // time to cimpletion range from 4 to 15 seconds...
  try {
    // const url = 'https://www.google.com/';

    //log website
    // const url =
    //   'https://www.google.com/url?sa=t&rct=j&q=&esrc=s&source=web&cd=&cad=rja&uact=8&ved=2ahUKEwjK1paqmf78AhVPUKQEHROPAWEQFnoFCLgBEAE&url=https%3A%2F%2Fwww.enzuzo.com%2Flearn%2Fthe-best-cookie-banner-examples-weve-seen-in-2022&usg=AOvVaw17R014llcwFavaErB8kJjc';

    // takes long time to validate/load site
    // const url = 'https://cardwiz.com/';
    id += 1;
    console.log('id', id);
    await downloadScreenshotFromUrl(url, id);
    const palette = await getImagePalette(`./screenshots/${id}.jpeg`, res);
    console.log('pallet', palette);
    if (!palette) {
      res.status(401).send('pallet not found');
      return;
    }
    res.status(200).json({ palette });
  } catch (error) {
    console.log(error);
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
// getImagePalette works
const getImagePalette = async (filePath) => {
  console.log('start getImagePalette');
  let frequentRgbColors = null;

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
      // slice gives us an arr with the 7 most freq pixel rgb
      .slice(0, 7)
      .map((element) => Number(element[0]));
    return sortedArray;
  }
  // return a:255-> full visibility
  const convertIntToRGB = (arr) => {
    arr.forEach((element, index, arr) => {
      arr[index] = jimp.intToRGBA(element);
    });
    return arr;
  };
  try {
    const image = await jimp.read(filePath);
    // image.getPixelColor(0, 0); // returns the colour of that pixel e.g. 0xFFFFFFFF
    let width = image.bitmap.width;
    let height = image.bitmap.height;
    const allColors = [];
    for (let i = 0; i < width; i++) {
      for (let j = 0; j < height; j++) {
        allColors.push(image.getPixelColor(i, j));
      }
    }
    // console.log('allColors', allColors); - array of numbers
    frequentRgbColors = convertIntToRGB(getMostFrequent(allColors));
    console.log(frequentRgbColors);
    console.log('end getImagePalette');
    return frequentRgbColors;
  } catch (error) {
    console.log(error);
  }
};

const downloadScreenshotFromUrl = async (url, id) => {
  const browser = await playwright.chromium.launch();
  const context = await browser.newContext();
  // ^^^^^incognito: true, by default
  const page = await context.newPage();

  // sets as phone view for less pixels
  // but sometimes websites look differently on phones...
  // await page.setViewportSize({
  //   width: 320,
  //   height: 480,
  //   deviceScaleFactor: 1,
  // });

  try {
    await page.goto(url);
    // await page.waitForLoadState();
    await clickOption(page, id);
    // await page.waitForLoadState();
    // some website have images/animation that show only when scrolling
    await page.evaluate(scroll, { direction: 'down', speed: 'slow' });
  } catch (error) {
    console.log(error);
  } finally {
    // overwrites if same name file exists
    const screenshot = await page.screenshot({
      path: `./screenshots/${id}.jpeg`,
      type: 'jpeg',
      fullPage: true,
    });
    console.log(`screenshot ${id}`, screenshot);
    console.log('end screen download');
  }
};

//  get rid of cookies attempts
// func looks better
async function clickOption(page, id) {
  //  playwright built in method doesn't alwyas works...
  // long timeout to ensure page loads
  await page
    .click('text=Reject', { timeout: 1500 })
    .catch(() => page.click('text=Reject All', { timeout: 100 }))
    .catch(() => page.click('text=Disable', { timeout: 100 }))
    .catch(() => page.click('text=Decline', { timeout: 100 }))
    .catch(() => page.click('text=Deny', { timeout: 100 }))
    .catch(() => page.click('text=לא תודה', { timeout: 100 }))
    .catch(() => page.click('text=לא ', { timeout: 100 }))
    .catch(() => {});
}

let scroll = async (args) => {
  const { direction, speed } = args;
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const scrollHeight = () => document.body.scrollHeight;
  const start = direction === 'down' ? 0 : scrollHeight();
  const shouldStop = (position) =>
    direction === 'down' ? position > scrollHeight() : position < 0;
  const increment = direction === 'down' ? 100 : -100;
  const delayTime = speed === 'slow' ? 50 : 10;
  console.error(start, shouldStop(start), increment);
  for (let i = start; !shouldStop(i); i += increment) {
    window.scrollTo(0, i);
    await delay(delayTime);
  }
};
