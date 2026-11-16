const route = require('express').Router();
const data = require('../mydata');

/**
 * Every handler now awaits the database call and ALWAYS sends a response.
 * The original increment/decrement/delete handlers never ended the request
 * (their res.redirect was commented out), so those API calls hung forever,
 * and write routes redirected before the write had finished.
 */
const asyncHandler = (fn) => (req, res) =>
    Promise.resolve(fn(req, res)).catch((err) => {
        console.error(err);
        res.status(500).send({error: 'internal server error'});
    });

// To get Cart items from the database
route.get('/getcart', asyncHandler(async (req, res) => {
    const cart = await data.getCart();
    res.send(cart);
}));

// To add an item to the cart
route.post('/addtocart', asyncHandler(async (req, res) => {
    if (!req.body.product) {
        return res.status(400).send({error: 'product is required'});
    }
    await data.addToCart(req.body.product);
    res.redirect('/myapi/cart');
}));

// To checkout from the cart
route.post('/checkout', asyncHandler(async (req, res) => {
    await data.cartCheckout(req.body.name);
    res.redirect('/myapi/cart');
}));

// To decrease the quantity of a particular Cart item by 1
route.post('/decrementCart', asyncHandler(async (req, res) => {
    if (req.body.id == null) {
        return res.status(400).send({error: 'id is required'});
    }
    const item = await data.decrementCart(req.body.id);
    res.send(item === null ? {removed: true} : item);
}));

// To increase the quantity of a particular Cart item by 1
route.post('/incrementCart', asyncHandler(async (req, res) => {
    if (req.body.id == null) {
        return res.status(400).send({error: 'id is required'});
    }
    const item = await data.incrementCart(req.body.id);
    if (!item) {
        return res.status(404).send({error: 'cart item not found'});
    }
    res.send(item);
}));

// To delete a Cart item from the Cart (Database)
route.post('/delfromcart', asyncHandler(async (req, res) => {
    if (req.body.id == null) {
        return res.status(400).send({error: 'id is required'});
    }
    const deleted = await data.delFromCart(req.body.id);
    res.send({deleted});
}));

// To count the number of products in the Cart
route.get('/countproducts', asyncHandler(async (req, res) => {
    const count = await data.noofproducts();
    res.send('' + count); // CONVERT INTO A STRING ELSE INTEGERS ARE SENT AS STATUS CODE
}));

// To calculate the total amount of the Cart items
route.get('/totalamount', asyncHandler(async (req, res) => {
    const amount = await data.totalamount();
    res.send('' + amount); // CONVERT INTO A STRING ELSE INTEGERS ARE SENT AS STATUS CODE
}));

// this file is the route file for cart

module.exports = route;
