const itemModel = require("../models/itemModel");


const createItem = async function (req, res) {
    try {
        const { productName, quantity, sellPrice, stockPrice } = req.body;
        if (!Object.keys(req.body).length) return res.status(400).send({ status: false, message: "Please enter data" });
        if (!sellPrice) return res.status(400).send({ status: false, message: "Please enter sell price" });
        if (!stockPrice) return res.status(400).send({ status: false, message: "Please enter stock price" });
        if (!quantity) return res.status(400).send({ status: false, message: "Please enter product quantity" });
        const product = await itemModel.create({ productName, quantity, sellPrice, stockPrice });
        res.status(201).send({ status: true, message: "New Product added", product });
    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message });
    }
}


const getItem = async function (req, res) {
    try {
        const data = req.query;
        if (data.productName) {
            data.productName = { $regex: data.productName.trim(), $options: 'i' }
        }
        const itemData = await itemModel.find(data);
        res.status(200).send({ status: true, message: "result", itemData });
    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message });
    }
}

module.exports = { createItem, getItem };