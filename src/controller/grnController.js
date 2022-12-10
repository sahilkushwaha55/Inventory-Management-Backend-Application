const mongoose = require("mongoose");
const grnLineItemModel = require("../models/grnLineItemModel");
const grnModel = require("../models/grnModel");
const itemModel = require("../models/itemModel");


const createGRNLine = async function (req, res) {
    try {
        const { productName, quantity } = req.body;
        if (!productName) return res.status(400).send({ status: false, message: "Please enter product name" });
        if (typeof productName != "string") return res.status(400).send({ status: false, message: "Product name should be string only" })
        if (!quantity) return res.status(400).send({ status: false, message: "Please enter product quantity" });
        if (typeof quantity != "number") return res.status(400).send({ status: false, message: "quantity should be number only" });
        if (quantity < 0) return res.status(400).send({ status: false, message: "Quantity can't be negative" });

        const productData = await itemModel.findOne({ productName });
        if (!productData) return res.status(400).send({ status: false, message: "No such product" });
        const data = await grnLineItemModel.create({ productName, quantity, stockPrice: productData.stockPrice });
        return res.status(201).send({ status: true, message: "Data Save", data });
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}


const grnCreate = async function (req, res) {
    try {
        const { invoiceNumber, vendorName, vendorFullAddress, grnLineItems } = req.body;
        if (!invoiceNumber) return res.status(400).send({ status: false, message: "Please enter invoice number" });
        if (typeof invoiceNumber != "string") return res.status(400).send({ status: false, message: "invoice number should be string only" });
        if (!vendorName) return res.status(400).send({ status: false, message: "Please enter vendor name" });
        if (typeof vendorName != "string") return res.status(400).send({ status: false, message: "Vendor name should be string only" });
        if (!vendorFullAddress) return res.status(400).send({ status: false, message: "Please enter vendor address" });
        if (typeof vendorFullAddress != "string") return res.status(400).send({ status: false, message: "Vendor address should be string only" });
        if (typeof grnLineItems != "object") return res.status(400).send({ status: false, message: "GrnLineItems should be array only" });
        if (!grnLineItems.length) return res.status(400).send({ status: false, message: "Please enter product" });

        let set = new Set();
        for (let i = 0; i < grnLineItems.length; i++) {
            const grnData = await grnLineItemModel.findOne({ _id: grnLineItems[i], deleted: false });
            if (!grnData) return res.status(400).send({ status: false, message: "Not a valid grnLineItem" });
            if (set.has(grnLineItems[i])) return res.status(400).send({ status: false, message: `You add ${grnLineItems[i]} more than one time` })
            set.add(grnLineItems[i]);
        }
        for (let i = 0; i < grnLineItems.length; i++) {
            await grnLineItemModel.findOneAndUpdate(
                { _id: grnLineItems[i] },
                { $set: { deleted: true } }
            )
        }
        const data = await grnModel.create({ invoiceNumber, vendorName, vendorFullAddress, grnLineItems, date: new Date() });
        return res.status(201).send({ status: true, message: "Data Save", data });
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}

const getGRN = async function (req, res) {
    try {
        const data = req.query;
        if (data.invoiceNumber)
            data.invoiceNumber = { $regex: data.invoiceNumber.trim(), $options: 'i' }
        if (data.vendorName)
            data.vendorName = { $regex: data.vendorName.trim(), $options: 'i' };
        if (data.vendorFullAddress)
            data.vendorFullAddress = { $regex: data.vendorFullAddress.trim(), $options: 'i' };
        const grnData = await grnModel.find(data);
        return res.status(200).send({ status: true, data: grnData });
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}

const grnDelete = async function (req, res) {
    try {
        const grnId = req.params.grnId;
        if (!mongoose.Types.ObjectId.isValid(grnId)) return res.status(400).send({ status: false, message: "Not a valid id" })
        const grnData = await grnModel.findOne({ _id: grnId, deleted: false });
        if (!grnData) return res.status(400).send({ status: false, message: "Not available to delete" });
        const data = await grnModel.findOneAndUpdate(
            { _id: grnId },
            { $set: { delete: true } },
            { new: true }
        );
        return res.status(200).send({ status: true, message: "Deleted", data });
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}


const updateGrn = async function (req, res) {
    try {
        const data = req.query;
        const grnId = req.params.id;
        const updateData = {};
        if (!Object.keys(data).length) return res.status(400).send({ status: false, message: "Please enter data to update" });
        if (data.invoiceNumber) {
            if (typeof data.invoiceNumber != "string") return res.status(400).send({ status: false, message: "invoice number should be string only" });
            updateData.invoiceNumber = data.invoiceNumber;
        }
        if (data.vendorName) {
            if (typeof data.vendorName != "string") return res.status(400).send({ status: false, message: "Vendor name should be string only" });
            updateData.vendorName = data.vendorName;
        }
        if (data.vendorFullAddress) {
            if (typeof vendorFullAddress != "string") return res.status(400).send({ status: false, message: "Vendor address should be string only" });
            updateData.vendorFullAddress = data.vendorFullAddress;
        }
        const grn = await grnModel.findOne({ _id: grnId, status: "GENERATED" });
        if (!grn) return res.status(400).send({ status: false, message: "No such grn available to update" });
        const updatedGrn = await grnModel.findOneAndUpdate(
            { _id: grnId },
            { $set: updateData },
            { new: true }
        )
        return res.status(200).send({ status: false, message: "Data Update", data: updatedGrn });
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}


const grnUpdateStatus = async function(req,res){
    try{
        const status = req.body.status;
        const grnId = req.params.id;
        const grnData = await grnModel.findOne({ _id : grnId, status : "GENERATED"});
        if(!grnData) return res.status(400).send({ status : false, message : "Not a valid grn id"});
        if(status === "COMPLETED"){
            for(let i = 0;i<grnData.grnLineItems.length;i++){
                const grnLineItemData = await grnLineItemModel.findById(grnData.grnLineItems[i]);
                await itemModel.findOneAndUpdate(
                    {productName : grnLineItemData.productName},
                    { $inc : { quantity : grnLineItemData.quantity}}
                )
            }
            return res.status(200).send({ status : true, message : "Completed GRN"});
        }
        if(status === "CANCELLED"){
            for(let i = 0;i<grnData.grnLineItems.length;i++){
                await grnLineItemModel.findOneAndUpdate(
                    {_id : grnData.grnLineItems[i]},
                    {$set : {deleted : false}}
                )
            }
            return res.status(200).send({ status : true, message : "Cancelled GRN"})
        }
        return res.status(400).send({ status : false, message : "You can only cancelled and completed grn"})
    }
    catch(err){
        return res.status(500).send({ status : false, message : err.message});
    }
}

module.exports = { createGRNLine, grnCreate, getGRN, grnDelete, updateGrn, grnUpdateStatus };