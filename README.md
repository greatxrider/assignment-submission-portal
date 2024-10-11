# Assignment Submission Portal

## Objective
This project is a backend system for an assignment submission portal that allows users to upload assignments and enables admins to accept or reject these assignments.

## Scenario
The system supports two types of users:
- **Users** can upload assignments.
- **Admins** can view and manage assignments.

### Assignment Structure
An assignment is represented as an object in JSON format:
```json
{
    "userId": "Soumik",
    "task": "Hello World",
    "admin": "Alok"
}
```

## Requirements

### Database
- Uses MongoDB for data storage.

### User Types
- **Users:**
    - Can register and log in.
    - Can upload assignments.

- **Admins:**
    - Can register and log in.
    - Can view assignments tagged to them.
    - Can accept or reject assignments.

### Endpoints

#### User Endpoints
- `POST /register` - Register a new user.
- `POST /login` - User login.
- `POST /upload` - Upload an assignment.
- `GET /admins` - Fetch all admins.

#### Admin Endpoints
- `POST /register` - Register a new admin.
- `POST /login` - Admin login.
- `GET /assignments` - View assignments tagged to the admin.
- `POST /assignments/:id/accept` - Accept an assignment.
- `POST /assignments/:id/reject` - Reject an assignment.

### Validation
- All inputs are validated.
- Proper error messages are provided for invalid inputs.

### User Management
- Implemented user management functionality.
- (Optional) OAuth2 for user authentication.

### Modularity
- Code is modular and well-structured for readability and maintainability.

## Deliverables
- A fully functional backend system that meets the requirements.
- Proper documentation on how to set up and run the system.
- Clear and concise comments in the code for readability.

## Important Installation and Setup Guidelines for Successful Operation
    - The App Will Not Function Without Following These Guidelines

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/assignment-submission-portal.git
   cd assignment-submission-portal
    ```
    
2. **Install dependencies**

    ```bash
   npm install
    ```

3. **Set Up MongoDB Database and Configure Connection on config.js**

   To set up your MongoDB database and configure the necessary connection details, follow these steps:

   - **Create a MongoDB Database**:
     1. Go to the [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) website and sign in to your account or create a new one if you don't have an account.
     2. Once logged in, click on the **"Create a New Cluster"** button.
     3. Choose the **Free Tier** option to set up a free database. Follow the prompts to configure your cluster (you can choose your preferred cloud provider and region).
     4. After your cluster is created, click on **"Database Access"** in the left sidebar and add a new database user with appropriate permissions (read and write).
     5. Next, go to **"Network Access"** and allow access from your IP address by clicking **"Add IP Address"**. You can also choose **"Allow Access from Anywhere"** for development purposes (not recommended for production).
     6. After your database is set up, click on **"Connect"** to obtain your connection string.

   - **Configure Connection in Your Project**:
     1. In your project folder, locate the `config.js` file. This file is typically where configuration settings are stored.
     2. Open `config.js` and find the `mongoUrl` key. Replace the existing value with your MongoDB connection string. It should look something like this:

        ```javascript
        'mongoUrl': 'INSERT_YOUR_MONGODB_CONNECTION_STRING_HERE',
        ```

     3. Ensure you include any required credentials (username and password) in the connection string.

   - **Configure Facebook Authentication**:
     1. Facebook authentication is used for Oauth2 requirements therefore, visit the [Facebook Developers](https://developers.facebook.com/) site and create a new app.
     2. Once the app is created, navigate to the **"Settings"** > **"Basic"** section to find your **App ID** and **App Secret**.
     3. Go back to your `config.js` file and update the Facebook configuration section with your credentials:

        ```javascript
        'facebook': {
            clientId: 'INSERT_YOUR_FACEBOOK_APP_ID_HERE',
            clientSecret: 'INSERT_YOUR_FACEBOOK_APP_SECRET_HERE'
        }
        ```

   - **Set Secret Key**:
     1. Ensure the `secretKey` in `config.js` is set for your application:

        ```javascript
        'secretKey': 'INSERT_YOUR_SECRET_KEY_HERE',
        ```
     2. Update the Facebook SDK Initialization:
        - Navigate to public/index.html
        - Inside the contents of `index.html`, replace the placeholder `YOUR_APP_ID` with the actual app ID you obtained earlier from Facebook Developers.
  
        ```javascript
            // Initialize the Facebook SDK
            window.fbAsyncInit = function () {
            FB.init({
                appId: 'YOUR_APP_ID', // Your app ID
                xfbml: true,
                version: 'v2.10' // Use the latest version available
            });
            FB.AppEvents.logPageView();

            // Check the login status on page load
            FB.getLoginStatus(function (response) {
                statusChangeCallback(response);
            });
            };
        ```

        By following these steps, you will have successfully set up your MongoDB database and configured the necessary connection details for the project.
    <br>
4. **Setting Up OpenSSL for HTTPS**
   - Because Facebook OAuth requires HTTPS, this project uses HTTPS to ensure secure communication. To achieve this, you need to set up OpenSSL and generate the necessary certificates.

   - To set up HTTPS for your project, you will need to generate a private key and a self-signed certificate using OpenSSL. Follow the instructions below to install OpenSSL and create the necessary files.
    <br>

    **Confirm OpenSSL Installation**

      - OpenSSL is typically installed by default on both macOS and Windows. To check if it's installed, open your terminal and enter:

        ```bash
        which openssl
        ```
      - If OpenSSL is not located, follow the steps below to install it.
    <br>

    **Install OpenSSL**

    - For MacOS
      - Use Homebrew to install OpenSSL:

        ```bash
        brew install openssl
        ```

    - For Windows
      1. Visit the [OpenSSL website](https://slproweb.com/products/Win32OpenSSL.html) to download the Developer OpenSSL Windows installer.
      2. Choose **Win64 OpenSSL** latest version.
    <br>
    **3. Generate Private Key and Self-Signed Certificate**

      3. **Navigate to the bin folder:**
          - In your terminal, navigate to the `assignment-submission-portal/bin` folder (the bin folder inside the project directory):

            ```bash
            cd path/to/assignment-submission-portal/bin
            ```
      4. **Create the private key and self-signed certificate:**
          - Type the following command to generate a private key and self-signed certificate:

            ```bash
            openssl req -nodes -new -x509 -keyout server.key -out server.cert
            ```
      5. **Fill in the prompts:**
          - You can press Enter through the first five prompts. When asked for the Common Name, enter localhost. Enter your email address when prompted.

    **4. Verify Certificate Files**
      - After running the command, you should see two new files in your `assignment-submission-portal/bin` folder:
        - `server.key`
        - `server.cert`
      - If you accidentally created these files outside of the bin folder, move them back to the bin folder.
    <br>

5. **Start the server:**

    ```bash
   npm start
    ```

6. **Use tools like Postman or Insomnia to test the API endpoints**

## License

This project is licensed under the MIT License. See the LICENSE file for more details.

## Contact

For more information, feel free to reach out:

- **GitHub:** [greatxrider](https://github.com/greatxrider)
- **Email:** [daligdig.jephmari@gmail.com](mailto:daligdig.jephmari@gmail.com)
- **Twitter:** [@mrjephdev](https://twitter.com/mrjephdev)
- **Instagram:** [@imyouritguy](https://instagram.com/imyouritguy)
- **YouTube:** [@mrjephdev](https://youtube.com/@mrjephdev)
