
const date = require(__dirname + "/date.js");

exports.formatItem = function(items) {

  // Render the items found (not default items)
  const day = date.getDate();
  for (var i = 0; i < items.length; i++) {
    if (items[i].list != null) {
      if (items[i].list === day.toLowerCase()) {
        const itemListAndName = "General - " + items[i].name;
        items[i].name = itemListAndName;
      } else {
        const listNameCap = items[i].list.charAt(0).toUpperCase() + items[i].list.slice(1)
        const itemListAndName = listNameCap + " - " + items[i].name;
        items[i].name = itemListAndName;
      }
    }
  }
  return items

}
