var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser = require('body-parser');
// var uid = require('rand-token').uid;
const PORT = 8080;

// State Holding Variables
let brands = [];
let products = [];
let users = [];

// Setup router
const myRouter = Router();
myRouter.use(bodyParser.json());

// declare server so it can be exported to the testing file
const server = http.createServer(function (request, response) {
    myRouter(request, response, finalHandler(request, response))
}).listen(PORT, error => {
    if (error) {
        return console.log("Error on Server Startup: ", error);
    }

    // Load initial brands
    fs.readFile("./initial-data/brands.json", "utf8", (error, data) => {
        if (error) throw error;
        // Create a varialbe to represent the data in the json file
        brands = JSON.parse(data);
        console.log(`Server setup: ${brands.length} brands loaded`);
    });

    // Load initial products
    fs.readFile("./initial-data/products.json", "utf8", (error, data) => {
        if (error) throw error;
        // Create a varialbe to represent the data in the json file
        products = JSON.parse(data);
        console.log(`Server setup: ${products.length} products loaded`);
    });


    console.log(`Server is listening on ${PORT}`);

});

myRouter.get('/api/brands', function (request, response) {
    // Return all the brands in the brands json file
    response.writeHead(200, ('Success'), {
        "Content-Type": "application/json"
    });
    return response.end(JSON.stringify(brands));
});

myRouter.get('/api/brands/:id/products', function (request, response) {

    //Need to compare the id from the request paramaters to match the id of products in data from the global variable products
    let matchingProduct = products.filter((product) => {
        return product.categoryId === request.params.id
    })

    // Write status of 404 if the matching product returns an empty array
    if (matchingProduct.length === 0) {
        response.writeHead(404, ('Error'), {
            "Content-Type": "html/text"
        })

        response.end(('Error 404: CategoryID was not found'))

    }

    response.writeHead(200, ('Success'), {
        "Content-Type": "application/json"
    });
    return response.end(JSON.stringify(matchingProduct));

});

myRouter.get('/api/products', function (request, response) {
    //spliting the url to grab the keyword we need to compare in our data
    const parsedURL = request.url.split("?");
    // Setting a variable equal to the keyword that is in the 1st index so we can compare
    const queryParams = queryString.parse(parsedURL[1]);

    //variables that are arrays with matching products
    let matchedName = products.filter((product) => {
       if (product.name === queryParams.name) {
           return product
       }
    });
    let matchedDescription = products.filter((product) => {
        if (product.description === queryParams.description) {
            return product
        }
    })

    //Edge case if our products.json file was empty and error should be thrown 
    if (products.length === 0) {
        response.writeHead(404), ('Error'), {
            "Content-Type": "html/text"
        }
        response.end('There were no products found');
    }



    //Edged case for if there is a query
    if (matchedName.length > 0 ) {
        response.writeHead(200, ('Success'), {
            "Content-Type": "application/json"
        });
    
        response.end(JSON.stringify(matchedName));
    } else if (matchedDescription.length > 0) {
        response.writeHead(200, ('Success'), {
            "Content-Type": "application/json"
        });
    
        response.end(JSON.stringify(matchedDescription));
    }



    response.writeHead(200, ('Success'), {
        "Content-Type": "application/json"
    });

    response.end(JSON.stringify(products));

});

// Used for testing
module.exports = server;