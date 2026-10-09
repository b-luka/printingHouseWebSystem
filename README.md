# printingHouseWebSystem
Web system for printing houses, admins and customers, written using the MEAN stack. Access the web system at [](http://localhost:4200)

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

Once you launch the emulator, you can interact with it using the following commands. 

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
