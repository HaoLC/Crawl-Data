const chalk = require("chalk");
const replaceall = require("replaceall");
const { v4: uuidv4 } = require("uuid");
const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;

const fs = require("fs");

const WooCommerce = new WooCommerceRestApi({
  url: "https://basestore.online/",
  consumerKey: "ck_5a5469cbe5e5bcfe02d1b68ef6231b5b6d74c13f",
  consumerSecret: "cs_5f4cb055a593dde39c90e34bcad70ac5bf092f12",
  wpAPI: true,
  version: "wc/v3",
});

module.exports = {
  update: updateVariations,
};

function updateVariations(id, data) {
  var _listvariants = [];

  data.variants.forEach((element) => {
    var _linkImage =
      "https://blog.rahulbhutani.com/wp-content/uploads/2020/05/Screenshot-2018-12-16-at-21.06.29.png";
    try {
      element.recommended_pots.forEach((v) => {
        _linkImage = v.default_image;
        return;
      });
    } catch (error) {
      console.log(error);
    }
    var _listattributes = [];

    try {
      Object.keys(element.attributes).map(function (key, index) {
        var id = key === "plant-height-exact-cm" ? 2 : 3;
        var option = element.attributes[key].name;
        _listattributes.push({
          id,
          option,
        });
      });
    } catch (error) {
      console.log(error);
    }

    var sku = element.sku;
    var regular_price = (
      element.price +
      Math.floor(Math.random() * (10 - 1 + 1)) +
      1
    ).toString();
    var sale_price = element.price.toString();
    var manage_stock = true;
    var stock_quantity = Math.floor(Math.random() * (120 - 40 + 1)) + 40;
    var stock_status = "instock";
    var image = {
      src: _linkImage,
    };
    var attributes = _listattributes;
    // };
    _listvariants.push({
      sku,
      regular_price,
      sale_price,
      manage_stock,
      stock_quantity,
      stock_status,
      image,
      attributes,
    });
  });

  var baseURL = "products/" + id + "/variations";

  console.log(chalk.yellow("==========> start update  " + id));

  console.log(chalk.green(_listvariants.length));

  for (let index = 0; index < _listvariants.length; index++) {
    const element = _listvariants[index];
    WooCommerce.post(baseURL, element)
      .then((_) => {
        console.log(chalk.blue("==========> update succ " + id));
      })
      .catch((_) => {
        console.log(chalk.red("==========> update error " + id));
        // console.log(chalk.red(error.response.data));
      });
  }
}
