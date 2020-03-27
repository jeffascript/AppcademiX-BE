const cheerio = require('cheerio')
const fecth = require('node-fetch')

const pageScraper = async (url) => {
    let request = await fecth(url)
    let html = await request.text()
    return cheerio.load(html)
}

module.exports = {pageScraper}