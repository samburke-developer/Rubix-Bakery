# Rubix Bakery

This is a simple bakery ordering application that is built with Electron, the open-source framework developed and maintained by Github.

To run:
``` 
npm i -D electron@latest 
npm clone https://github.com/samburke-developer/Rubix-Bakery.git
cd Rubix-Bakery
npm install
npm start 
```

The application allow users to add multiple items to a cart and then place an order.

When adding items to the cart the system verifies if the order is possible by making sure there is more the minimum amount of items to fulfill order and that there is a combination of packs that can satisfy the amount exactly.

When the user places an order the they are shown a receipt that contains a breakdown of their order as well as the total.

This application was built on top of the [Electron Quick Start Application](https://electronjs.org/docs/tutorial/quick-start).

[order.js](https://github.com/samburke-developer/Rubix-Bakery/blob/master/scripts/order.js) is the script that handles all the heavy lifting in the application such as handling user interactions and updating the interface.

I have used [pug](https://pugjs.org/api/getting-started.html) as a templating language to fast track development.

[products.json](https://github.com/samburke-developer/Rubix-Bakery/blob/master/data/products.json) contains all the data about the items available to order.

