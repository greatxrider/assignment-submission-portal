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

## Installation and Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/assignment-submission-portal.git
   cd assignment-submission-portal
    ```

2. **Install dependencies**

    ```bash
   npm install
    ```

3. **Set up your MongoDB database and configure the connection in the .env file.**

4. **Start the server:**

    ```bash
   npm start
    ```

5. **Use tools like Postman or Insomnia to test the API endpoints**

## Documentation

Refer to the API documentation for detailed information about the endpoints and their usage.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.

## Submission

Please submit your completed project via a GitHub repository link. Ensure that your repository is public or provide access to the reviewers.

## Contact

For more information, feel free to reach out:

- **GitHub:** [greatxrider](https://github.com/greatxrider)
- **Email:** [daligdig.jephmari@gmail.com](mailto:daligdig.jephmari@gmail.com)
- **Twitter:** [@mrjephdev](https://twitter.com/mrjephdev)
- **Instagram:** [@imyouritguy](https://instagram.com/imyouritguy)
- **YouTube:** [@mrjephdev](https://youtube.com/@mrjephdev)
