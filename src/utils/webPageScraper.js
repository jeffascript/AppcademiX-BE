const cheerio = require('cheerio')
const fetch = require('node-fetch')

const pageScraper = async (url) => {
    let request = await fetch(url)
    let html = await request.text()
    return cheerio.load(html)
}

module.exports = {pageScraper}