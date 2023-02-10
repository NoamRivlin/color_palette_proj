const playwright = require('playwright');
const path = require('path');
const jimp = require('jimp');
const express = require('express');

const app = express();
const port = 8000;
let id = 4;
app.get('/getColors/:url', async (req, res) => {
  // const { url } = req.params;
  try {
    // const url = 'https://www.google.com/';
    const url =
      'https://www.google.com/url?sa=t&rct=j&q=&esrc=s&source=web&cd=&cad=rja&uact=8&ved=2ahUKEwjK1paqmf78AhVPUKQEHROPAWEQFnoFCLgBEAE&url=https%3A%2F%2Fwww.enzuzo.com%2Flearn%2Fthe-best-cookie-banner-examples-weve-seen-in-2022&usg=AOvVaw17R014llcwFavaErB8kJjc';
    id += 1;
    console.log('id', id);
    await downloadScreenshotFromUrl(url, id);
    // const palette = await getImagePalette(`./screenshots/${id}.png`);
    // maor part start --------------------------
    (async function () {
      await jimp.read(`./screenshots/${id}.jpeg`, function (err, image) {
        let width = image.bitmap.width;
        let height = image.bitmap.height;
        let allColors = [];
        for (let i = 0; i < width; i++) {
          for (let j = 0; j < height; j++) {
            allColors.push(image.getPixelColor(i, j));
          }
        }
        res.json(allColors);
      });
    })();
    // maor part end --------------------------
    // console.log("pallet", palette);
    // if (!palette) {
    //   res.send("pallet not found");
    //   return;
    // }
    // res.json({ palette });
  } catch (error) {
    console.log(error);
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
// getImagePalette works
const getImagePalette = async (filePath) => {
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
      .slice(0, 5)
      .map((element) => Number(element[0]));

    return sortedArray;
  }
  //problem: retrun a:255, a is to be between 1 and 0....
  const convertIntToRGB = (arr) => {
    arr.forEach((element, index, arr) => {
      arr[index] = jimp.intToRGBA(element);
    });
    return arr;
  };
  jimp.read(filePath, function (err, image) {
    // image.getPixelColor(0, 0); // returns the colour of that pixel e.g. 0xFFFFFFFF
    let width = image.bitmap.width;
    let height = image.bitmap.height;
    const allColors = [];
    for (let i = 0; i < width; i++) {
      for (let j = 0; j < height; j++) {
        allColors.push(image.getPixelColor(i, j));
      }
    }
    frequentRgbColors = convertIntToRGB(getMostFrequent(allColors));
    // console.log(frequentRgbColors);
    return frequentRgbColors;
    // console.log(convertIntToRGB(getMostFrequent(allColors)));
    // return convertIntToRGB(getMostFrequent(allColors));
    // console.log(jimp.intToRGBA(image.getPixelColor(0, 0)));
  });
  return frequentRgbColors;
};

const downloadScreenshotFromUrl = async (url, id) => {
  const browser = await playwright.chromium.launch();
  const context = await browser.newContext();
  // ^^^^^incognito: true, by default
  const page = await context.newPage();
  await page.setViewportSize({
    width: 320,
    height: 480,
    deviceScaleFactor: 1,
  });
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
    // await page.click('text=Disable', { timeout: 100 });
    // await page.click('text=Decline');
    // await page.click('text=Deny');
    // await page.click('text=Accept'); // to accept cookies but could lead to unwanted behaviour....
    // await page.click('text=Allow'); // to accept cookies but could lead to unwanted behaviour....
    try {
      await page.click('text=Reject', { timeout: 100 });
    } catch {
      try {
        await page.click('text=Reject All', { timeout: 100 });
      } catch {
        try {
          await page.click('text=Disable', { timeout: 100 });
        } catch {
          try {
            await page.click('text=Decline', { timeout: 100 });
          } catch {
            try {
              await page.click('text=Deny', { timeout: 100 });
            } catch {}
          }
        }
      }
    } finally {
      const screenshot = await page.screenshot({
        path: `./screenshots/${id}.jpeg`,
        type: 'jpeg',
        fullPage: true,
        quality: 50,
      });
      console.log(`screenshot ${id}`, screenshot);
      // console.log(page); lots of data, no mention of pixels

      await browser.close();
    }
    // await page.locator;
    // overwrites if same name file exists
    // const screenshot = await page.screenshot({
    //   path: `./screenshots/${id}.png`,
    // });
    // console.log(`screenshot ${id}`, screenshot);
    // console.log(page); lots of data, no mention of pixels

    // await browser.close();
  } catch (error) {
    console.log(error);
    await browser.close();
  }
};
// downloadScreenshotFromUrl(id);
