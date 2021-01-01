//file: index.js
const rp = require("request-promise");
const cheerio = require("cheerio");
const fs = require("fs");
const URL = `https://www.patchplants.com/gb/en/w/product-type/pots/`;

const options = {
  uri: URL,
  transform: function (body) {
    return cheerio.load(body);
  },
};

(async function crawler() {
  try {
    var $ = await rp(options);
  } catch (error) {
    return error;
  }

  var listProduct = $(
    ".small-12.medium-8.large-9.column > .row > .gallery.gallery--listing.js-product-wrap > .gallery__item.gallery__item--listing"
  );

  let listLink = [];

  for (let i = 0; i < listProduct.length; i++) {
    let product = $(listProduct[i]);
    let linkTitle = "link";

    let chaperTitle = product.find(
      ".card.card--available > .card__header > .link-negative"
    );

    let _title = chaperTitle.get()[0];
    let title = $(_title).attr("href");

    console.log(title);
    try {
      listLink.push({
        linkTitle,
        title,
      });
    } catch (error) {}
  }
  // Lưu dữ liệu về máy
  fs.writeFileSync("link.json", JSON.stringify(listLink));
})();
