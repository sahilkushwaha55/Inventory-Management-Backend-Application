const express = require("express");
const router = express.Router();
const itemController = require("../controller/itemController");
const grnController = require("../controller/grnController");
const orderContoller = require("../controller/orderController")

router.post("/item",itemController.createItem);
router.get("/item",itemController.getItem);
router.post("/grnLine",grnController.createGRNLine);
router.post("/grn",grnController.grnCreate);
router.get("/grn",grnController.getGRN);
router.delete("/grn:grnId", grnController.grnDelete);
router.put("/grn/:id",grnController.updateGrn);
router.put("/grn/update-status", grnController.grnUpdateStatus);
router.post("orderLine", orderContoller.creatOrderLineItem);
router.post("/order", orderContoller.orderCreate);
router.get("/order", orderContoller.getOrder);
router.delete("/order", orderContoller.deleteOrder);
router.put("/order/:id", orderContoller.updateOrder);
router.put("/order/update-status", orderContoller.orderUpdateStatus);

module.exports = router;