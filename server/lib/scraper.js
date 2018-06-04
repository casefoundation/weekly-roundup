
const scrape = require('html-metadata');
const request = require('request');
const tldr = require('node-tldr');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const uuid = require('uuid/v4');

const browsers = {};

const fromJsonLd = (jsonld = {}) => {
  let schemaObj = jsonld;
  if (Array.isArray(jsonld)) {
    jsonld.forEach(x => {
      if (x.headline || x.author || x.publisher || x.datePublished) {
        schemaObj = x;
      }
    });
  }
  const filteredObj = {};
  if (schemaObj.headline) {
    filteredObj.title = schemaObj.headline;
  }
  if (schemaObj.publisher) {
    filteredObj.source = schemaObj.publisher.name;
  }
  if (schemaObj.datePublished) {
    filteredObj.published = schemaObj.datePublished;
  }
  if (schemaObj.description) {
    filteredObj.description = schemaObj.description;
  }
  return filteredObj;
};

const fromGeneral = (general = {}) => {
  const filteredObj = {};
  if (general.title) {
    filteredObj.title = general.title;
  }
  return filteredObj;
};

const fromSchemaOrg = (items = []) => {
  let schemaObj = {};
  items.forEach(x => {
    if (x.properties.headline || x.properties.publisher || x.properties.datePublished) {
      schemaObj = x;
    }
  });
  const filteredObj = {};
  if (schemaObj.headline) {
    filteredObj.title = schemaObj.headline;
  }
  if (schemaObj.publisher) {
    filteredObj.source = schemaObj.publisher.name;
  }
  if (schemaObj.datePublished) {
    filteredObj.published = schemaObj.datePublished;
  }
  if (schemaObj.description) {
    filteredObj.description = schemaObj.description;
  }
  return filteredObj;
};

const fromOpenGraph = (og = {}) => {
  const filteredObj = {};
  if (og.title) {
    filteredObj.title = og.title;
  }
  if (og.site_name) {
    filteredObj.source = og.site_name;
  }
  if (og.description) {
    filteredObj.description = og.description;
  }
  return filteredObj;
};

const fromTwitter = (t = {}) => {
  const filteredObj = {};
  if (t.title) {
    filteredObj.title = t.title;
  }
  if (t.site) {
    filteredObj.source = t.site;
  }
  if (t.description) {
    filteredObj.description = t.description;
  }
  return filteredObj;
};

const formatData = (metadata) => {
  const analyzedData = {
    title: '',
    source: '',
    published: '',
    description: '',
  };
  if (metadata.twitter) {
    Object.assign(analyzedData, fromTwitter(metadata.twitter));
  }
  if (metadata.openGraph) {
    Object.assign(analyzedData, fromOpenGraph(metadata.openGraph));
  }
  if (metadata.general) {
    Object.assign(analyzedData, fromGeneral(metadata.general));
  }
  if (metadata.schemaOrg && metadata.schemaOrg.items) {
    Object.assign(analyzedData, fromSchemaOrg(metadata.schemaOrg.items));
  }
  if (metadata.jsonLd) {
    Object.assign(analyzedData, fromJsonLd(metadata.jsonLd));
  }
  // Last effort to scrape title: Websites commonly end their titles with '| site-name'
  if ((!analyzedData.source || analyzedData.source.startsWith('@')) && analyzedData.title) {
    const i = analyzedData.title.lastIndexOf('|');
    if (i && i < analyzedData.title.length - 1) {
      analyzedData.source = analyzedData.title.substr(i + 1).trim();
    }
  }
  if (analyzedData.published && typeof analyzedData.published === 'string') {
    const timestamp = Date.parse(analyzedData.published)
    if (!isNaN(timestamp)) {
      analyzedData.published = new Date(timestamp).toISOString()
    } else {
      analyzedData.published = null
    }
  }
  return analyzedData;
};

const staticScrape = (url) => {
  return scrape({
    url,
    jar: request.jar(),
    headers: {
      'User-Agent': 'webscraper',
    },
  })
    .then((metadata) => {
      return new Promise((resolve) => {
        tldr.summarize(url, (result, failure) => {
          if (failure) {
            console.log(failure);
          }
          const analyzedData = formatData(metadata);
          const summary = result.summary ? result.summary.join(' ') : '';
          resolve(Object.assign(analyzedData, { summary: summary || analyzedData.description }));
        });
      });
    });
};

const dynamicScrape = (url) => {
  return puppeteer.launch()
    .then((browser) => {
      // keep track of browsers to avoid memory leaks
      const id = uuid();
      browsers[id] = browser;
      return browser.newPage()
        .then((page) => {
          // Set 1 min timeout for loading a page
          page.setDefaultNavigationTimeout(60000);
          return page.goto(url)
            .then(() => {
              return page.content()
                .then((content) => {
                  const $ = cheerio.load(content);
                  return scrape.parseAll($)
                    .then((metadata) => {
                      return new Promise((resolve) => {
                        tldr.summarize($, (result, failure) => {
                          if (failure) {
                            console.log(failure);
                          }
                          const analyzedData = formatData(metadata);
                          browser.close()
                            .then(() => {
                              // remove browser from dictionary
                              delete browsers[id];
                              // resolve with final scraped data
                              const summary = result.summary ? result.summary.join(' ') : '';
                              resolve(Object.assign(analyzedData, { summary: summary || analyzedData.description }));
                            });
                        });
                      });
                    });
                });
            });
        })
        .catch((err) => {
          console.log(err);
          browser.close();
        });
    });
};

exports.getBrowsers = () => browsers;

exports.scrape = (url = '') => {
  if (!url.startsWith('http')) {
    url = `http://${url}`;
  }

  // Scrape dynamic content if static content produces no summary
  return staticScrape(url)
    .then((staticData) => {
      if (!staticData.summary) {
        return dynamicScrape(url)
          .then((dynamicData) => {
            return {
              title: staticData.title ? staticData.title : dynamicData.title,
              source: staticData.source ? staticData.source : dynamicData.source,
              published: staticData.published ? staticData.published : dynamicData.published,
              summary: dynamicData.summary,
            };
          });
      }
      return staticData;
    });
};
