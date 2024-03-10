# News Indo Scrapper

## Description

News Indo Scrapper is a package that allows you to scrape news articles from Indonesian news websites. It provides a simple and convenient way to extract relevant information from news articles, such as the title, author, date, and content.

## Features

- Scrape news articles from popular Indonesian news websites
- Extract relevant information from news articles
- Easy-to-use API for integrating with your projects

## Installation

You can install the package using npm:
```bash
npm install news-indo-scrapper
```


## Usage
```javascript
# for mojok.co site
const mojok = new MojokScrapper();


# scrape section
const results = scrapper
  .scrapeSections("esai",1);
console.log(results);
```
