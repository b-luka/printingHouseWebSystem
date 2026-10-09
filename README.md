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
* **Start backend:**
  ```bash
  tsc
  npm run serve
  ```
* **Install frontend dependencies:**
  ```bash
  npm install chart.js ng2-charts --legacy-peer-deps
  ```
* **Start frontend:**
  ```bash
  ng serve
  ```
---

## Usage & Commands

Once you start both the frontend and the backend, access the web system

### Supported Commands:

| Command | Options (Flags) | Arguments | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `echo` | None | `[input]` | Prints the provided text to the screen. | `echo "Hello World"` |
| `date` | None | None | Displays the current system date. | `date` |
| `time` | None | None | Displays the current system time. | `time` |
| `head` | `-n[lines]` | `[input]` | Outputs the first `n` lines of a file. | `head -n5 file.txt` |
| `prompt`| None | `[input]`| Changes the default terminal prompt indicator. | `prompt "#"` |
| `touch`| None | `[input_file]` | Creates a new empty file, if it doesn't exist. | `touch new_file.txt` |
| `rm` | None | `[input_file]` | Removes files. | `rm old_file.txt` |
| `truncate`| None | `[input_file]` | Removes the contents of a file. | `truncate file.txt` |
| `tr` | None | `[input] [set1] [set2]`| Translates or deletes every occurence of a string. | `tr "Hello World!" " " "-"` |
| `wc` | `-w`, `-c` | `[input]` | Counts words or characters in a given input. | `wc -l notes.txt` |
| `batch` | None | `[input]` | Reads and executes commands from the input (careful with recursion!) | `batch commands.bat` |

* **`[input]`**: *accepts either a string (surrounded by quotation marks), a file (provided as the relative path) or, if nothing is provided, will read from the console until it detects EOF (Ctrl + Z).*
* **`[input_file]`**: *accepts only files as input and will not work otherwise.*

### I/O Redirection:
* **`>` (Overwrite):** Redirects standard output of a command to a file, overwriting its content.
  ```bash
  echo "Hello World" > output.txt
  ```
* **`>>` (Append):** Redirects standard output of a command, appending it to the end of a file.
  ```bash
  date >> log.txt
  ```
* **`<` (Input):** Redirects a file's content into the standard input of a command.
  ```bash
  wc -w < input.txt
  ```

### Pipelines (`|`):
You can connect the output of one command directly into the input of another.
* **Basic pipeline:**
  ```bash
  echo "hello terminal" | wc -c
  ```
* **Pipeline combined with redirection:**
  ```bash
  echo input.txt | head -n1 | wc -w > output.txt
  ```

## License
This project is open-source and available under the [MIT License](LICENSE).
