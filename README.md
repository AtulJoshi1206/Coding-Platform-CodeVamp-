Here's the updated `README.md` file summarizing the project's development and including the details about resources and challenges:

```markdown
# CodeVamp

**CodeVamp** is a full-stack online coding platform designed for the Tally competition. It features a coding editor, playground, and leaderboard, supporting multiple programming languages with a user-friendly interface, including light and dark modes.

## Project Structure

The project is divided into two main parts: the frontend and the backend.

### Frontend

The frontend is built using HTML, CSS, and React, and includes the following components:

- **Home Page**: Displays three options to navigate to the code editor, playground, and leaderboard, with a background image and a dark/light mode toggle.
- **Code Editor**: Features a problem list on the far left, problem explanation on the top right, and a 'Run' or 'Submit' button at the bottom right.
- **Playground**: Provides an interactive coding environment for users to test their code.
- **Leaderboard**: Shows a leaderboard with top-performing users.

#### Frontend Directory Structure
![image](https://github.com/user-attachments/assets/88777264-9b9b-49fc-9a09-27eac15a5b50)

![image](https://github.com/user-attachments/assets/9e269f4a-bcb4-4afc-a8dd-bd8a66600851)

![image](https://github.com/user-attachments/assets/20a021cf-4b7a-4547-ab6b-3e542bccabe2)

- `public/` - Contains static assets.
- `src/` - Contains the main application files:
  - `assets/` - Assets like images and fonts.
  - `components/` - Contains `CodeEditor.html`, `Playground.html`, `Leaderboard.html`, and `Home.html`.
  - `styles/` - CSS files for styling.
  - `index.html` - Main HTML file.
  - `App.html` - Entry point for the frontend application.
![image](https://github.com/user-attachments/assets/a3513681-1f74-4538-846a-c94a59788c2f)

### Backend

The backend handles server-side operations and includes a database component. It is structured as follows:

- **PyDrome**: Used for Python code compilation.
- **Flask**: Lightweight framework for the backend server.
- **SQLAlchemy**: ORM tool for database interaction.
- **PyMongo**: For MongoDB integration, used to manage data.

#### Backend Directory Structure

- `server.js` - Main server file.
- `Dockerfile` - Docker configuration for the backend.
- `routes/` - Defines API endpoints.
- `models/` - Contains database schema and data models.
- `controllers/` - Implements request handling and business logic.

### Setup and Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/codevamp.git
   cd codevamp
   ```

2. **Install dependencies:**

   - For the frontend:

     ```bash
     cd frontend
     npm install
     ```

   - For the backend:

     ```bash
     cd backend
     npm install
     ```

3. **Run the application:**

   - Start the backend server:

     ```bash
     cd backend
     npm start
     ```

   - Open a new terminal and start the frontend server:

     ```bash
     cd frontend
     npm start
     ```

4. **Access the application:**

   Open your browser and go to `http://localhost:3000` to view the application.

### Features

- **Code Editor**: Syntax highlighting and code execution for multiple languages.
- **Playground**: Interactive environment for code testing.
- **Leaderboard**: Displays top users based on performance.
- **Dark/Light Mode**: Toggle between themes.

### Acknowledgments

Special thanks to the following for their support and resources:

- **ChatGPT**: For providing guidance and suggestions throughout the development process.
- **YouTube**: For tutorials and educational content that helped shape the project.
- **Google**: For tools and resources aiding in research and development.
- **Seniors and Mentors**: For invaluable advice and feedback, with special thanks to mentors for their exceptional support.

### Challenges

Efforts to integrate C and C++ support faced technical challenges, including compatibility issues and difficulties in setting up compilers, resulting in less successful outcomes for these languages.

### Contributing

Contributions are welcome! Please fork the repository and submit a pull request with your changes. Ensure your code adheres to the project's standards.

### License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

### Contact

For any questions or inquiries, please contact:

- **Email**: atul.joshi1206@.com
- **GitHub**: [yourusername](https://github.com/AtulJoshi1206)
```

This README file provides a comprehensive overview of the project, including its structure, setup, features, acknowledgments, and challenges faced.
