# Cuisine Caravan - Homemade Food Catering Network

## Description

Cuisine Caravan is inspired by the burgeoning trend of online food ordering platforms. However, unlike mainstream services that cater to restaurants and large food chains, our platform is uniquely dedicated to independent vendors specializing in homemade cuisine. This focus ensures that only those offering authentic, home-cooked meals can participate, creating a niche marketplace that celebrates local culinary talents without the commercial noise.

## Features

* Registering as either customer/vendor/deliveryperson
* Vendor can create storefronts specifying name, title, tags, icon image, banner images, pickup locations.
* Each storefront can have multiple pickup locations.
* Vendor can add products to a storefront specifying product name, desc, tags, price, availability, and slideshow images.
* Vendor can monitor the orders under a storefront, as well as reviews and reports.
* Customers can search for products, or storefronts.
* Customers can go to storefront pages and view list of products.
* Customers can go to individual product pages via storefront's product list, or directly from search results.
* Product pages show product details, including product image slideshow.
* Customers can order a specific product by specifying quantity, and delivery location.
* Deliveryperson can find new delivery orders from the task finder.
* All parties can update an order's state depending on their role and the order's current state *(example: ordered/prepared/shipped/on-delivery/handed)*
* Customers can drop public reviews under storefronts, or file private reports.

## Running

In the local machine configuration, the react pages are served using the same server the backend api run on. As for such, the react build output directory is copied upon build. You don't have to manually copy/move it, the provided does it automatically for you.



## Prerequisites

Before you begin, ensure you have the following installed:
- **Git** - [Download & Install Git](https://git-scm.com/downloads)
- **Node.js** - [Download & Install Node.js](https://nodejs.org/en/download/) and the npm package manager.
- **MongoDB** - [Download & Install MongoDB](https://www.mongodb.com/try/download/community), and make sure it's running on your local machine.


## Installation

Follow these steps to get your development environment running:

### 1. Clone the Repository

Clone the project repository using git:

```bash
git clone https://github.com/mrinalinichava/cusine-caravan.git
cd cusine-caravan
```


### 2. Install Dependencies

### Backend Dependencies
cd backend
npm install

### Frontend Dependencies
cd ../frontend
npm install

### Database setup

Ensure MongoDB is running and create a new database named cuisine_caravan_db.

### Configure environment variables

DBLINK=your_mongodb_connection_string_here
JWT_SECRET=your_jwt_secret_here
PORT=3000

### Run Backend and Frontend

cd backend
npm start

cd ../frontend
npm start

### Access Platform

Open a web browser and navigate to http://localhost:3000 to interact with the platform.
