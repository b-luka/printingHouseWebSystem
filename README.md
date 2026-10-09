# printingHouseWebSystem
Web system for printing houses, admins and customers, written using the MEAN stack. Access the web system at [localhost:4200](http://localhost:4200).

## Features:
* Front page for unlogged users where they can browse products but not add them to their carts or purchase them.
* Login/register window, all registrations must be manually approved by the system admin.
* Individual client page, where they can browse products, add them to their cart and checkout, check and change their user data and view order history.
* Corporate client page, where they can browse products, add them to their cart and start a public procurement, notifying all printing houses via email and wait for offers before closing the procurement.
* Printing house page, where they can change client order statuses, add products (manually or via JSON in bulk), update stock and place offers for procurements.
* Admin page, where they can approve pending registration requests, edit user data and view various statistics.

## Required packages:
* MongoDB
* Node.js
* Angular
* Express

## Setup Commands:
* **Install backend dependencies:**
  ```bash
  npm install express mongoose cors dotenv bcryptjs jsonwebtoken multer pdfkit nodemailer image-size bcrypt
  npm install -D typescript ts-node nodemon @types/node @types/express @types/cors @types/bcryptjs @types/jsonwebtoken @types/multer @types/pdfkit @types/nodemailer @types/image-size @types/bcrypt
  ```
* **Start the backend:**
  ```bash
  tsc
  npm run serve
  ```
* **Install frontend dependencies:**
  ```bash
  npm install chart.js ng2-charts --legacy-peer-deps
  ```
* **Start the frontend:**
  ```bash
  ng serve
  ```
---

## License
This project is open-source and available under the [MIT License](LICENSE).
