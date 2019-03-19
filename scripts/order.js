//increments a given item's input field by 1 
exports.addItem = (code) =>
{
    let itemAmount = document.getElementById(`${code}-val`).value
    
    //checks if input is empty or not before incrementing 
    itemAmount = itemAmount ? parseInt(itemAmount) + 1 : 1;
    document.getElementById(`${code}-val`).value = itemAmount;
}

//decreases a given item's input field by 1
exports.removeItem = (code) =>
{
    let itemAmount = document.getElementById(`${code}-val`).value

    //will not apply if value 0 or it does not exist
    if(itemAmount > 0 && itemAmount)
    {
        itemAmount = parseInt(itemAmount) - 1;
        document.getElementById(`${code}-val`).value = itemAmount;
    }
}


//checks to see if order fulfills the minimum needed for the item
exports.checkOrder = (code) =>
{
    let item = window.products.filter((product) => product.code == code)[0];
    if(item)
    {
        let itemAmount = parseInt(document.getElementById(`${code}-val`).value)
        let amountInCart = window.cart[`${code}`] ? parseInt(window.cart[`${code}`].amount) : 0; 

        //if amount is equal to or greater than minimum pack size and the amount adding is greater than 0 then try to add it to the cart
        if (parseInt(itemAmount) + parseInt(amountInCart) >= item.packs.sort((a, b) => a.amount-b.amount)[0].amount && itemAmount > 0 )
        {
            addToCart(code, parseInt(itemAmount) + parseInt(amountInCart));
            document.getElementById(`${code}-val`).value = null;
        }else
        {
            alert("Not enough to fulfill minimum order")
        }
    }
}

//tries to add an order to the cart based on the item code and amount given
const addToCart= (code, amount) =>
{
    let item = window.products.filter((product) => product.code == code)[0];
    if(item)
    {
        let order = generateOrderObject(item, amount);
        
        //if there is an order object check to see if an order for this item already exists
        //else display error message
        if(order)
        {
            //if an order already exists then update the cart interface else create the interface for the new order
            if(window.cart[`${code}`])
            {
                window.cart[`${code}`] = order;
                updateCart(code);
            } else
            {
                window.cart[`${code}`] = order;
                createCartRow(code);
            }
            
            //set new total and and display the place order button
            let newTotal = Object.keys(window.cart)
            .reduce((total, itemCode) => (parseFloat(total) + parseFloat(window.cart[`${itemCode}`].cost)).toFixed(2), 0)
            
            document.getElementById("order-total").innerHTML = `Total $${newTotal}`
            document.getElementById("place-order").style.display = "block"
        } else
        {
            alert("Sorry there is no way we can fulfill this order.\n\nPlease try entering another amount.")
        }
    }
}

//completely removes order from cart and updates the interface to match
const removeFromCart = (code) =>
{
    if(window.cart[`${code}`])
    {
        var element = document.getElementById(`${code}-cart-row`);
        element.parentNode.removeChild(element);
        delete window.cart[`${code}`];

        //if no items in the cart hide 'place order' button, else update total value
        if (Object.keys(window.cart).length == 0)
        {
            document.getElementById("place-order").style.display = "none"
        } else
        {
            //new total is the sum of all the orders totals
            let newTotal = Object.keys(window.cart)
            .reduce((total, itemCode) => (parseFloat(total) + parseFloat(window.cart[`${itemCode}`].cost)).toFixed(2), 0)
            
            document.getElementById("order-total").innerHTML = `Total $${newTotal}`
        }
    } 
}

//calculates whether or not an order can be fulfilled or not and returns an order object if succesfull
const generateOrderObject = (item, amount) =>
{
    //reorder the packs for a given object to be from most in a pack to least in a pack
    let packs = item.packs.sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount) );
    
    //set and initialise basic tracking variables
    let unfilledAmount = amount
    let orderCost = 0;
    let orderPacks = 0;
    lineItems = [];

    //for each pack check:
    //  - if we have already fullfilled order
    //  - if amount in a pack is less than what is unfullfilled
    //  - if we use this pack multple times and theres a remainder will another pack that we offer be able fully fulfill this order
    packs.forEach((pack) => 
    {
        if (unfilledAmount != 0 && 
            pack.amount <= unfilledAmount && 
            packs.filter((otherPack) => (unfilledAmount % pack.amount) % otherPack.amount == 0 ).length != 0 )
        {
            //number of packs to be used
            let numOfPacks = Math.floor(unfilledAmount / pack.amount);
            orderPacks += numOfPacks;
            orderCost +=  pack.cost * numOfPacks;
            unfilledAmount = unfilledAmount % pack.amount

            //add line item to the array
            lineItems.push(`${numOfPacks > 1 ? numOfPacks + " packs": "1 pack"} of ${pack.amount} @ $${pack.cost} each \n`)
        } 
    })

    //if we were able to fulfill return an order object else return null
    if(unfilledAmount == 0)
    {
        return {name: item.name, amount: amount, lineItems: lineItems, cost: orderCost.toFixed(2), packs: orderPacks}
    }else
    {
        return null
    }
}

//event listener that detects whether or not the user has clicked outside the receipt when it is being displayed
window.addEventListener('click', function(e)
{   
    if(document.getElementById('receipt').style.display == "block")
    {
        //if receipt is showing and user hasn't clicked on the the content or the place order button, then hide the receipt
        if (document.getElementById('receipt-content').contains(e.target) || document.getElementById('btn-order').contains(e.target)){
        } else{
            document.getElementById('receipt').style.display = "none"
        }
    }
});

//called when the place order button clicked
//creates receipt and displays the result to the user
exports.order = () =>
{
    createReciept();
    document.getElementById('receipt').style.display = "block"
}

//updates the interface of an exisiting order in cart
const updateCart = (code) =>
{
    let order = window.cart[`${code}`]
    document.getElementById(`${code}-total-amount`).innerHTML = `Total ${order.amount} (${order.packs > 1? `${order.packs} packs` : "1 pack"})`;
    document.getElementById(`${code}-total-cost`).innerHTML = `Total $${order.cost}`;

    //removes old line items from the cart before we generate new ones
    var oldLineItems = document.getElementById(`${code}-line-items`);
    var fc = oldLineItems.firstChild;
    while( fc ) {
        oldLineItems.removeChild( fc );
        fc = oldLineItems.firstChild;
    }

    //genrerates the interface for the new line items
    let itemLineItemsContainer = document.createElement("div");
    order.lineItems.forEach((line) => {
        let itemLineItem = document.createElement("p");
        let itemLineItemText = document.createTextNode(`${line}`);
        itemLineItem.appendChild(itemLineItemText)
        itemLineItemsContainer.appendChild(itemLineItem)
        
    })

    //sets the carts line items
    document.getElementById(`${code}-line-items`).appendChild(itemLineItemsContainer)
}

//creates the interface for a receipt 
const createReciept  = () =>
{
    //Remove all child elements of the recepit that may have been generated earlier
    var oldReceipt = document.getElementById("receipt-content");
    var fc = oldReceipt.firstChild;
    while( fc ) {
        oldReceipt.removeChild( fc );
        fc = oldReceipt.firstChild;
    }

    let cart = window.cart
    let receipt = document.getElementById("receipt-content");

    //loop through each item in the cart and build recipt using the orders information
    Object.keys(window.cart).forEach((code) =>
    {
        let itemTotalLine = document.createElement("div");
        itemTotalLine.classList.add("row");
        itemTotalLine.classList.add("receipt-item-line");
        
        let itemNameContainer = document.createElement("div");
        itemNameContainer.classList.add("col-sm-8");
        
        let itemName = document.createElement("p");
        let itemNameText = document.createTextNode(`${cart[code].amount} x ${cart[code].name}'s`)

        itemName.appendChild(itemNameText)
        itemNameContainer.appendChild(itemName)
        itemTotalLine.appendChild(itemNameContainer)

        let itemTotalContainer = document.createElement("div");
        itemTotalContainer.classList.add("col-sm-4");
        
        let itemTotal = document.createElement("p");
        let itemTotalText = document.createTextNode(`$${cart[code].cost}`)
        
        itemTotal.appendChild(itemTotalText)
        itemTotalContainer.appendChild(itemTotal)
        itemTotalLine.appendChild(itemTotalContainer)
        
        cart[code].lineItems.forEach((line) => 
        {
            let itemLineItemLine  = document.createElement("div");
            itemLineItemLine.classList.add("row");
            let itemLineItemContainer = document.createElement("div");
            itemLineItemContainer.classList.add("col-sm-12");
            
            let lineItem = document.createElement("p");
            lineItem.classList.add("receipt-line-item");
            let lineItemText = document.createTextNode(`${line}`)

            lineItem.appendChild(lineItemText)
            itemLineItemContainer.appendChild(lineItem)
            itemLineItemLine.appendChild(itemLineItemContainer)
            itemTotalLine.appendChild(itemLineItemLine)
        })
        receipt.appendChild(itemTotalLine)
    })
    
    let receiptTotal = document.createElement("div");
    receiptTotal.classList.add("row");
    receiptTotal.classList.add("receipt-line-total");
    
    let itemNameContainer = document.createElement("div");
    itemNameContainer.classList.add("col-sm-8");
    
    let itemName = document.createElement("p");
    let itemNameText = document.createTextNode(`Total`)

    itemName.appendChild(itemNameText)
    itemNameContainer.appendChild(itemName)
    receiptTotal.appendChild(itemNameContainer)

    let itemTotalContainer = document.createElement("div");
    itemTotalContainer.classList.add("col-sm-4");
    
    let itemTotal = document.createElement("p");
    let itemTotalText = document.createTextNode(`$${Object.keys(window.cart).reduce((total, itemCode) => (parseFloat(total) + parseFloat(window.cart[`${itemCode}`].cost)).toFixed(2), 0)}`)
    
    itemTotal.appendChild(itemTotalText)
    itemTotalContainer.appendChild(itemTotal)
    receiptTotal.appendChild(itemTotalContainer)
    receipt.appendChild(receiptTotal)
    
}

//Creates the interface for the row that contains new items in the cart by linking the given code to whats in the order
const createCartRow = (code) =>
{
    let item = window.products.filter((product) => product.code == code)[0];
    let order = window.cart[`${code}`]
    
    let cart = document.getElementById("cart-items");
    let cartContainer = document.createElement("div");
    cartContainer.setAttribute('id', `${code}-cart-row`);

    cart.appendChild(cartContainer)

    let cartRow = document.createElement("div");
    cartRow.classList.add("row");
    cartRow.classList.add("col-sm-12");
    
    let itemTitle = document.createElement("div");
    itemTitle.classList.add("cart-item-title");
    
    let title = document.createElement("h6");
    let tileText = document.createTextNode(`${item.name}`);
    

    let clearButton = document.createElement("button");
    clearButton.classList.add("close");
    clearButton.setAttribute("type", `button`);
    clearButton.addEventListener('click', function() {
        removeFromCart(code);
    }, false);


    title.appendChild(tileText)
    itemTitle.appendChild(title)
    cartRow.appendChild(itemTitle)
    cartRow.appendChild(clearButton)

    let cartInfo = document.createElement("div");
    cartInfo.classList.add("row");

    let itemImageContainer = document.createElement("div");
    itemImageContainer.classList.add("col-sm-3");
    let itemImage = document.createElement("img");
    itemImage.classList.add("cart-img")
    itemImage.src= item.img;

    itemImageContainer.appendChild(itemImage)

    let packInfo = document.createElement("div");
    packInfo.classList.add("col-sm-6");

    let itemTotal = document.createElement("p");
    itemTotal.setAttribute("id", `${code}-total-amount`);
    let itemTotalText = document.createTextNode(`Total ${order.amount} (${order.packs > 1? `${order.packs} packs` : "1 pack"})`);
    itemTotal.appendChild(itemTotalText)

    packInfo.appendChild(itemTotal)


    //Create line items area
    let itemLineItemsContainer = document.createElement("div");
    itemLineItemsContainer.setAttribute("id", `${code}-line-items`);
    order.lineItems.forEach((line) => {
        let itemLineItems = document.createElement("p");
        let itemLineItemsText = document.createTextNode(`${line}`);
        itemLineItems.appendChild(itemLineItemsText)
        itemLineItemsContainer.appendChild(itemLineItems)  
    })
    
    packInfo.appendChild(itemLineItemsContainer)

    let totalContainer = document.createElement("div");
    totalContainer.classList.add("col-sm-3");

    let total = document.createElement("p");
    total.setAttribute("id", `${code}-total-cost`);
    let totalText = document.createTextNode(`Total $${order.cost}`);

    total.appendChild(totalText)
    totalContainer.appendChild(total)

    cartInfo.appendChild(itemImageContainer)
    cartInfo.appendChild(packInfo)
    cartInfo.appendChild(totalContainer)

    cartContainer.appendChild(cartRow)
    cartContainer.appendChild(cartInfo)
}