const orderModel = require("./models/PurchaseOrder");
const XLSX = require("xlsx");

const exporttoExcel = async () => {
  try {
    const orders = await orderModel.find({}).lean();

    // Attempt to read the existing workbook
    let wb;
    try {
      wb = XLSX.readFile("../orders.xlsx");
    } catch (err) {
      wb = XLSX.utils.book_new();
    }

    // Read existing data from the sheets
    const existingOrdersSheet = wb.Sheets["orders"];
    const existingProductDataSheet = wb.Sheets["productdata"];

    const existingOrdersData = existingOrdersSheet ? XLSX.utils.sheet_to_json(existingOrdersSheet) : [];
    const existingProductData = existingProductDataSheet ? XLSX.utils.sheet_to_json(existingProductDataSheet) : [];

    // Create a Set of existing orderNumbers for quick lookup
    const existingOrderNumbers = new Set(existingOrdersData.map(order => order.orderNumber));

    // Filter out orders that already exist
    const newOrders = orders.filter(order => !existingOrderNumbers.has(order.orderNumber));

    if (newOrders.length === 0) {
      console.log("No new orders to export.");
      return;
    }

    // Format new orders and their products
    const formattedData = newOrders.map(item => ({
      orderNumber: item.orderNumber || "N/A",
      supplier: item.supplier || "halden",
      email: item.email || "N/A",
      status: item.status || "N/A",
      orderedBy: item.orderedBy || "N/A",
      urgency: item.urgency || "N/A",
      remark: item.remarks || "N/A"
    }));

    const productData = newOrders.flatMap(order =>
      order.products.map(item => ({
        orderNumber: order.orderNumber || "N/A", // Include orderNumber for reference
        name: item.name || "N/A",
        quantity: item.quantity || "N/A",
        price: item.price || "N/A"
      }))
    );

    // Append new data to existing data
    const updatedOrdersData = existingOrdersData.concat(formattedData);
    const updatedProductData = existingProductData.concat(productData);

    // Create new sheets with updated data
    const updatedOrdersSheet = XLSX.utils.json_to_sheet(updatedOrdersData);
    const updatedProductDataSheet = XLSX.utils.json_to_sheet(updatedProductData);

    // Replace or append sheets in the workbook
    if (wb.SheetNames.includes("orders")) {
      wb.Sheets["orders"] = updatedOrdersSheet;
    } else {
      XLSX.utils.book_append_sheet(wb, updatedOrdersSheet, "orders");
    }

    if (wb.SheetNames.includes("productdata")) {
      wb.Sheets["productdata"] = updatedProductDataSheet;
    } else {
      XLSX.utils.book_append_sheet(wb, updatedProductDataSheet, "productdata");
    }

    // Write the updated workbook to file
    XLSX.writeFile(wb, "../orders.xlsx");

    console.log("New orders exported to Excel successfully.");
  } catch (err) {
    console.error("Error Exporting Data", err);
  }
};


module.exports=exporttoExcel;