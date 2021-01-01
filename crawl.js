require("rootpath")();

const rp = require("request-promise");
const { v4: uuidv4 } = require("uuid");
const cheerio = require("cheerio");
const fs = require("fs");
const replaceall = require("replaceall");
const chalk = require("chalk");
const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;
const updateVariations = require("script/update_product_variations");

const URL = `https://www.patchplants.com`;

const WooCommerce = new WooCommerceRestApi({
  url: "https://basestore.online/",
  consumerKey: "ck_5a5469cbe5e5bcfe02d1b68ef6231b5b6d74c13f",
  consumerSecret: "cs_5f4cb055a593dde39c90e34bcad70ac5bf092f12",
  wpAPI: true,
  version: "wc/v3",
});

(async function crawler() {
  var config = require("./link.json");
  var _listURL = [];
  config.forEach(function callback(currentValue, index, array) {
    _listURL.push(URL + currentValue.title);
  });

  for (let index = 0; index < _listURL.length; index++) {
    const element = _listURL[index];
    console.log(
      chalk.yellow(
        "=======> START " +
          index +
          "/" +
          _listURL.length +
          " " +
          _listURL[index]
      )
    );
    const optionsURL = {
      uri: element,
      transform: function (body) {
        return cheerio.load(body);
      },
    };

    try {
      var $ = await rp(optionsURL);
    } catch (error) {
      return error;
    }

    var listProductImage = $(
      ".hero-space__product-section.hero-space__mobile-section-no-margin.row.align-middle.section.js-product-section > .hero-space__carousel.small-12.large-6.column.animated.fadeIn.delay-1s.slow"
    );
    var _image = listProductImage.find(
      ".slick.js-slick.pdp-slick.pdp-slick-mobile-no-margin.hero-space__pdp-slick > .fouc-slick"
    );

    var _listImage = [];

    try {
      for (let index = 0; index < _image.length; index++) {
        try {
          const element = $(_image[index]);
          let _linkImage = element.get()[0];
          let src = $(_linkImage).attr("src");
          if (src !== undefined) {
            _listImage.push({ src });
          }
        } catch (error) {
          console.log(chalk.red("======> image error"));
          console.log(chalk.red(error));
        }
      }
    } catch (error) {
      console.log(chalk.red(error));
    }
    var productDetail = $(
      ".hero-space__product-section.hero-space__mobile-section-no-margin.row.align-middle.section.js-product-section > .hero-space__details-container.small-12.large-5"
    );
    var price = productDetail.find("#product-details");

    var _test = price
      .toString()
      .replace(
        '<div class="product__add-to-bag js-product-detail" id="product-details" data-new-pdp="" data-pdp="true" data-product-data="',
        ""
      );
    var _test = price
      .toString()
      .replace(
        '<div class="product__add-to-bag js-product-detail" id="product-details" data-new-pdp="true" data-pdp="true" data-product-data="',
        ""
      );
    // var _test = price
    //   .toString()
    //   .replace(
    //     '<div class="product__add-to-bag js-product-detail" id="product-details" data-new-pdp="" data-pdp="true" data-product-data="',
    //     ""
    //   );

    var _test = _test.toString().replace('" data-isinstock="True"></div>', "");
    var _test = replaceall("&quot;", '"', _test);
    var mydatas;
    try {
      mydatas = JSON.parse(_test);
    } catch (error) {
      console.log(error);
      mydatas = {};
    }

    var _price;
    try {
      if (mydatas.variants.length == 0) {
        _price = 0;
      } else {
        _price = mydatas.variants[0].price;
      }
    } catch (error) {
      _price = Math.floor(Math.random() * (120 - 40 + 1)) + 40;
    }

    var topTips;
    try {
      topTips = mydatas.detail.top_tips;
    } catch (error) {
      topTips = "";
    }

    var body;
    try {
      body = mydatas.detail.about.body;
    } catch (error) {
      body = "";
    }

    var _listattributesTemp = [];
    var _listattributes = [];
    var _listattributes1 = [];

    try {
      mydatas.variants.forEach((element) => {
        try {
          Object.keys(element.attributes).map(function (key, index) {
            var name = key;
            var visible = true;
            var variation = true;
            var _listOptionHeight = [];
            var _listOptionexact = [];
            var _option = element.attributes[key].name;
            var id = key == "plant-height-exact-cm" ? 2 : 3;
            var name =
              key == "plant-height-exact-cm"
                ? "Plant height exact cm"
                : "Plant height";
            if (key == "plant-height-exact-cm") {
              _listOptionHeight.push(_option);
            } else {
              _listOptionexact.push(_option);
            }
            var options =
              key == "plant-height-exact-cm"
                ? _listOptionHeight
                : _listOptionexact;
            _listattributesTemp.push({
              id,
              name,
              visible,
              variation,
              options,
            });
          });
        } catch (error) {
          console.log(error);
        }
      });

      var valueArr = _listattributesTemp.map(function (item) {
        return item.name;
      });
      var isDuplicate = valueArr.some(function (item, idx) {
        return valueArr.indexOf(item) != idx;
      });

      if (isDuplicate) {
        var _listOptionHeight = [];
        var _listOptionexact = [];
        _listattributesTemp.map(function (item) {
          if (item.id === 2) {
            var valueArr = _listOptionexact.map(function (item) {
              return item.name;
            });
            var isDuplicate = valueArr.some(function (item, idx) {
              return valueArr.indexOf(item) != idx;
            });
            if (!isDuplicate) _listOptionexact.push(item.options[0]);
          } else {
            var valueArr = _listOptionHeight.map(function (item) {
              return item.name;
            });
            var isDuplicate = valueArr.some(function (item, idx) {
              return valueArr.indexOf(item) != idx;
            });
            if (!isDuplicate) _listOptionHeight.push(item.options[0]);
          }
          var visible = true;
          var variation = true;
          var id = item.id === 2 ? 2 : 3;
          var name = item.id === 2 ? "Plant height exact cm" : "Plant height";
          var options = item.id === 2 ? _listOptionHeight : _listOptionexact;

          _listattributes.push({
            id,
            name,
            visible,
            variation,
            options,
          });
        });

        function getUniqueListBy(arr, key) {
          return [...new Map(arr.map((item) => [item[key], item])).values()];
        }

        _listattributes1 = getUniqueListBy(_listattributes, "id");
      } else {
        _listattributes1 = _listattributesTemp;
      }
    } catch (error) {}

    var _listDefaultattributes = [];
    try {
      _listattributes1.forEach((element) => {
        var id = element.id;
        var name = element.name;
        var option = element.options[0];
        _listDefaultattributes.push({
          id,
          name,
          option,
        });
      });
    } catch (error) {}

    const data = {
      name: mydatas.name === undefined ? "" : mydatas.name,
      type: "variable",
      featured: false,
      description:
        topTips === undefined
          ? ""
          : topTips + " " + body === undefined
          ? ""
          : body + mydatas.summary === undefined
          ? ""
          : mydatas.summary + " " + mydatas.description === undefined
          ? ""
          : mydatas.description,
      short_description: topTips === undefined ? "" : topTips,
      price: _price,
      categories: [
        {
          id: 16,
          name: "Live Plants",
          slug: "live-plants",
        },
      ],
      on_sale: true,
      purchasable: true,
      manage_stock: true,
      stock_quantity: Math.floor(Math.random() * (200 - 40 + 1)) + 40,
      stock_status: "instock",
      average_rating: (
        (Math.floor(Math.random() * (50 - 45 + 1)) + 45) /
        10
      ).toString(),
      rating_count: Math.floor(Math.random() * (100 - 10 + 1)) + 10,
      images: _listImage,
      attributes: _listattributes1,
      default_attributes: _listDefaultattributes,
    };

    console.log(chalk.yellow("=======> POST WOO " + index));

    WooCommerce.post("products", data)
      .then((response) => {
        console.log(chalk.green(response.data.name));
        console.log(chalk.green(response.data.id));
        try {
          updateVariations.update(response.data.id, mydatas);
        } catch (error) {
          console.log(chalk.red(error));
        }
      })
      .catch((error) => {
        console.log(chalk.red("=====> WOO ERROR " + index));
      });
  }
})();
