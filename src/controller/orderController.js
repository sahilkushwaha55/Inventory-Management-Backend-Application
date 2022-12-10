const itemModel = require("../models/itemModel");
const orderLineItemModel = require("../models/orderLineItemModel");
const orderModel = require("../models/orderModel");


const creatOrderLineItem = async function (req, res) {
    try {
        const { productName, quantity } = req.body;
        if (!productName) return res.status(400).send({ status: false, message: "Please enter product Name" });
        if (typeof productName != "string") return res.status(400).send({ status: false, message: "Product name should be string only" })
        if (!quantity) return res.status(400).send({ status: false, message: "Please enter quantity" });
        if (typeof quantity != "number") return res.status(400).send({ status: false, message: "quantity should be number only" });
        if (quantity < 0) return res.status(400).send({ status: false, message: "Quantity can't be negative" });

        const prodcutData = await itemModel.findOne({ productName });
        if (!prodcutData) return res.status(400).send({ status: false, message: "No such product available" });
        const data = await orderLineItemModel.create({ productName, quantity, sellPrice: prodcutData.sellPrice });
        return res.status(201).send({ status: false, message: "Data Save", data });
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}


const orderCreate = async function (req, res) {
    try {
        const { invoiceNumber, customerName, customerFullAddress, orderLineItems } = req.body;
        if (!Object.keys(req.body).length) return res.status(400).send({ status: false, message: "Please enter data" });
        if (!invoiceNumber) return res.status(400).send({ status: false, message: "Please enter invoice number" });
        if (typeof invoiceNumber != "string") return res.status(400).send({ status: false, message: "Invoice Number should be string only" })
        if (!customerName) return res.status(400).send({ status: false, message: "Please enter customer name" });
        if (typeof customerName != "string") return res.status(400).send({ status: false, message: "Customer name should be string only" })
        if (!customerFullAddress) return res.status(400).send({ status: false, message: "Please enter customer address" });
        if (typeof customerFullAddress != "string") return res.status(400).send({ status: false, message: "customer address should be string only" });
        if (typeof grnLineItems != "object") return res.status(400).send({ status: false, message: "GrnLineItems should be array only" });
        if (!orderLineItems.length) return res.status(400).send({ status: false, message: "Please enter orderLineItem" });

        let set = new Set();
        for (let i = 0; i < orderLineItems.length; i++) {
            const orderData = await orderLineItemModel.findOne({ _id: orderLineItems[i], deleted: false });
            if (!orderData) return res.status(400).send({ status: false, message: "Not a valid orderLineItem" });
            if (set.has(orderLineItems[i])) return res.status(400).send({ status: false, message: `your add ${orderLineItems[i]} more than one time` })
            set.add(orderLineItems[i]);
        }
        for (let i = 0; i < orderLineItems.length; i++) {
            await orderLineItemModel.findOneAndUpdate(
                { _id: orderLineItems[i] },
                { $set: { deleted: true } }
            )
        }
        const data = await orderModel.create({ invoiceNumber, customerName, customerFullAddress, orderLineItems, date: new Date() });
        return res.status(201).send({ status: true, message: "Data Save", data });
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}


const getOrder = async function (req, res) {
    try {
        const data = req.query;
        if (data.invoiceNumber)
            data.invoiceNumber = { $regex: data.invoiceNumber.trim(), $options: 'i' }
        if (data.customerName)
            data.customerName = { $regex: data.customerName.trim(), $options: 'i' };
        if (data.customerFullAddress)
            data.customerFullAddress = { $regex: data.customerFullAddress.trim(), $options: 'i' };
        const orderData = await orderModel.find(data);
        return res.status(200).send({ status: true, data: orderData });
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}


const deleteOrder = async function (req, res) {
    try {
        const orderId = req.params.orderId;
        if (!mongoose.Types.ObjectId.isValid(orderId)) return res.status(400).send({ status: false, message: "Not a valid id" })
        const orderData = await grnModel.findOne({ _id: orderId, deleted: false });
        if (!orderData) return res.status(400).send({ status: false, message: "Not available to delete" });
        const data = await orderModel.findOneAndUpdate(
            { _id: orderId },
            { $set: { delete: true } },
            { new: true }
        );
        return res.status(200).send({ status: true, message: "Deleted", data });
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}


const updateOrder = async function (req, res) {
    try {
        const data = req.query;
        const orderId = req.params.id;
        const updateData = {};
        if (!Object.keys(data).length) return res.status(400).send({ status: false, message: "Please enter data to update" });
        if (data.invoiceNumber) {
            if (typeof data.invoiceNumber != "string") return res.status(400).send({ status: false, message: "invoice number should be string only" });
            updateData.invoiceNumber = data.invoiceNumber;
        }
        if (data.customerName) {
            if (typeof data.customerName != "string") return res.status(400).send({ status: false, message: "Vendor name should be string only" });
            updateData.customerName = data.customerName;
        }
        if (data.customerFullAddress) {
            if (typeof customerFullAddress != "string") return res.status(400).send({ status: false, message: "Vendor address should be string only" });
            updateData.customerFullAddress = data.customerFullAddress;
        }
        const grn = await orderModel.findOne({ _id: grnId, status: "GENERATED" });
        if (!grn) return res.status(400).send({ status: false, message: "No such grn available to update" });
        const updatedOrder = await orderModel.findOneAndUpdate(
            { _id: orderId },
            { $set: updateData },
            { new: true }
        )
        return res.status(200).send({ status: false, message: "Data Update", data: updatedOrder });
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}



const orderUpdateStatus = async function(req,res){
    try{
        const status = req.body.status;
        const orderId = req.params.id;
        const orderData = await orderModel.findOne({ _id : orderId, status : "GENERATED"});
        if(!orderData) return res.status(400).send({ status : false, message : "Not a valid order id"});
        if(status === "COMPLETED"){
            for(let i = 0;i<orderData.orderLineItems.length;i++){
                const orderLineItemData = await orderLineItemModel.findById(orderData.orderLineItems[i]);
                await itemModel.findOneAndUpdate(
                    {productName : orderLineItemData.productName},
                    { $inc : { quantity : -orderLineItemData.quantity}}
                )
            }
            return res.status(200).send({ status : true, message : "Completed order"});
        }
        if(status === "CANCELLED"){
            for(let i = 0;i<orderData.orderLineItems.length;i++){
                await orderLineItemModel.findOneAndUpdate(
                    {_id : orderData.grnLineItems[i]},
                    {$set : {deleted : false}}
                )
            }
            return res.status(200).send({ status : true, message : "Cancelled order"})
        }
        return res.status(400).send({ status : false, message : "You can only cancelled and completed order"})
    }
    catch(err){
        return res.status(500).send({ status : false, message : err.message});
    }
}

module.exports = { creatOrderLineItem, orderCreate, getOrder, deleteOrder, updateOrder, orderUpdateStatus };