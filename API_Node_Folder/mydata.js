const Sequelize = require('sequelize');
const db = new Sequelize('shoppingcart', 'root', 'root', {
    host: 'localhost',
    dialect: 'mysql',
    pool: {
        max: 10,
        min: 0,
        idle: 1000
    }
});

const Product = db.define('products', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: Sequelize.STRING,
    price: Sequelize.INTEGER,
    quantity: Sequelize.INTEGER
}); // used to define the Table Product

const CartProduct = db.define('carts', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: Sequelize.STRING,
    price: Sequelize.INTEGER,
    quantity: Sequelize.INTEGER,
    amount: Sequelize.INTEGER
}); // used to define the Table

db.sync({}); // executes db.define

function getProducts () { return Product.findAll(); }

function addToProducts(product) {
    return Product.create(
        {
            name: product.name,
            price: product.price,
            quantity: 1,
        });
}

/**
 * Rewritten as a proper upsert.
 *
 * The original fired BOTH an update on the (possibly non-existent) row
 * AND an unconditional `create`, so adding an existing product crashed
 * on a duplicate primary key and adding a new one crashed on
 * `cartItem.increment` of null (unhandled rejection).
 */
async function addToCart (product) {
    const cartItem = await CartProduct.findById(product.id);
    if (cartItem) {
        await cartItem.increment('quantity', {by: product.quantity});
        await cartItem.increment('amount', {by: product.price * product.quantity});
        return cartItem.reload();
    }
    return CartProduct.create(
        {
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: product.quantity,
            amount: product.amount
        });
}

function getCart() {
    // The old version evaluated `if (CartProduct.findAll())` — a Promise is
    // always truthy — and queried the table twice.
    return CartProduct.findAll();
}

/**
 * Decrement with a floor: at quantity 1 the line is removed entirely
 * instead of drifting to 0 / negative quantities and negative amounts.
 */
async function decrementCart(cartItemID) {
    const cartItem = await CartProduct.findById(cartItemID);
    if (!cartItem) {
        return null;
    }
    if (cartItem.quantity <= 1) {
        await cartItem.destroy();
        return null;
    }
    await cartItem.decrement('quantity', {by: 1});
    await cartItem.decrement('amount', {by: cartItem.price});
    return cartItem.reload();
}

async function incrementCart(cartItemID) {
    const cartItem = await CartProduct.findById(cartItemID);
    if (!cartItem) {
        return null;
    }
    await cartItem.increment('quantity', {by: 1});
    await cartItem.increment('amount', {by: cartItem.price});
    return cartItem.reload();
}

function noofproducts() {
    return CartProduct.sum('quantity').then((sum) => sum || 0);
}

function totalamount() {
    return CartProduct.sum('amount').then((sum) => sum || 0);
}

function cartCheckout(data) { return CartProduct.destroy({ where: {}}); }

function delFromCart(cartItemID) {
    return CartProduct.destroy(
        {
            where:
                {
                    id: cartItemID
                }
        });
}

module.exports = {
    getProducts,
    addToCart,
    addToProducts,
    getCart,
    cartCheckout,
    noofproducts,
    totalamount,
    delFromCart,
    incrementCart,
    decrementCart
};
