# About

<b>Name:</b> MyCart

<b>Description:</b> Shopping cart implementation using React, NodeJs, MySQL, ExpressJs, axios, cors, sequelize, Babel, 
Webpack, and Electron. (MERN Stack)

## Prerequisites
<a href="https://nodejs.org/">NodeJS</a> and <a href="https://dev.mysql.com/downloads/mysql/">MySQL Community Server</a> should be installed. 

## Installation
```
git clone https://github.com/nishantsahoo/ShoppingCart-React-NodeJs.git
```

## Execution steps

<h3> 1. Web Application</h3>

##### Step 1: Install all node modules using npm
```
cd API_Node_Folder
npm install
cd ..
cd Front_End_React_Folder
npm install
```

##### Step 2: Create the table "shoppingcart" using MySQL
Open the MySQL Command Line Client and execute the following code
```
create database shoppingcart
```

##### Step 3: Execute ./API_Node_Folder/seedProductsTable.js file to add products into the products table

##### Step 4: Execute the webpack file
*Note: Use "watch" with webpack to develop and deploy continuously*
```
cd Front_End_React_Folder
.\node_modules\.bin\webpack --watch
```

##### Step 5: Start the API(Express) server
*Note: Express server hosted at localhost:9000*
```
cd API_Node_Folder
npm start
```

##### Step 6: Start the Client (React) server
*Note: React server hosted at localhost:8000*
```
cd Front_End_React_Folder
npm run webapp
```

##### Step 7: Open the browser and navigate to ``` http://localhost:8000/ ```

<h3> 2. Desktop Application</h3>

##### Step 1: Install all node modules using npm
```
cd API_Node_Folder
npm install
cd ..
cd Front_End_React_Folder
npm install
```

##### Step 2: Create the table "shoppingcart" using MySQL
Open the MySQL Command Line Client and execute the following code
```
create database shoppingcart
```

##### Step 3: Execute ./API_Node_Folder/seedProductsTable.js file to add products into the products table

##### Step 4: Execute the webpack file
*Note: Use "watch" with webpack to develop and deploy continuously*
```
cd Front_End_React_Folder
.\node_modules\.bin\webpack --watch
```

##### Step 5: Start the API(Express) server
*Note: Express server hosted at localhost:9000*
```
cd API_Node_Folder
npm start
```

##### Step 6: Launch the desktop application
```
cd Front_End_React_Folder
```
```
npm start
```
or
```
npm run desktopapp
```

## Database settings
*Database name: shoppingcart*

*Username: root*

*Password: root*


#### 1. MySQL connection 
``` 
const db = new Sequelize('shoppingcart', 'root', 'root', {
    host: 'localhost',
    dialect: 'mysql',
    pool: {
        max: 10,
        min: 0,
        idle: 1000
    }
});
```

#### 2. Tables

1. Products
    ``` 
    id: {
        type: INTEGER,
        primaryKey: true,
    },
    name: STRING,
    price: INTEGER,
    quantity: INTEGER
    ```
    
2. Cart
    ```
    id: {
        type: INTEGER,
        primaryKey: true,
    },
    name: STRING,
    price: INTEGER,
    quantity: INTEGER,
    amount: INTEGER
    ```

## APIs

##### 1. Products: 
``` /myapi/products/ ```

  1. ``` /getproducts ```: To get all products from the products table
  2. ``` /addtoproducts ```: To add a product to the products table
  
##### 2. Cart 
``` /myapi/cart/ ```

  1. ``` /getcart ```: To get all cart items from the cart table
  2. ``` /addtocart ```: To add a product to the cart
  3. ``` /checkout ```: To checkout from the cart (Removes all products from the cart)
  4. ``` /decrementCart ```: To decrease the quantity of a particular cart item
  5. ``` /incrementCart ```: To increase the quantity of a particular cart item
  6. ``` /delfromcart ```: To delete a particular cart item from the cart
  7. ``` /countproducts ```: To count the number of products in a cart
  8. ``` /totalamount ```: To calculate the total amount to be paid
  

## Fork improvements

Backend hardening of the cart API (`API_Node_Folder/`):

* **Fixed `addToCart` upsert** — the original fired BOTH an update and an
  unconditional `create`, so re-adding a product crashed on a duplicate primary
  key and adding a new one threw an unhandled rejection (`increment` on null).
  It is now a proper find-then-update-or-create with atomic `amount` updates.
* **Hanging requests fixed** — `incrementCart` / `decrementCart` / `delfromcart`
  never sent any response (the `res.redirect` was commented out), so those API
  calls hung forever. Every route now awaits the DB call and always responds,
  with an `asyncHandler` wrapper that turns failures into HTTP 500 instead of
  unhandled rejections, plus 400/404 validation.
* **Quantity floor** — decrementing at quantity 1 now removes the line instead
  of drifting to zero/negative quantities and negative amounts.
* **Dead-code cleanup** — removed always-truthy `if (promise)` checks and
  double queries in `getCart` / `noofproducts` / `totalamount`.
* **Repository hygiene** — removed committed `.idea/` IDE configuration.
