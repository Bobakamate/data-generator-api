const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const User = require('./models/User'); // Ensure the correct path to the User.js file
const bcrypt = require('bcryptjs');

const app = express();
const port = 3000;
const secretKey = 'your_secret_key'; // Change this to a more secure key

// Middleware
app.use(express.json());
app.use(cors());  // Enable CORS for all routes

// Connection to MongoDB Atlas
const uri = 'mongodb+srv://bobakamate:boba@cluster0.ga3jksq.mongodb.net/dataGeneratorDB?retryWrites=true&w=majority';
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000 // Ajouter cette option pour gérer les erreurs de sélection du serveur
}).then(() => {
    console.log('Connected to MongoDB Atlas');
}).catch(err => {
    console.error('Error connecting to MongoDB Atlas', err);
});

// Root route
app.get('/', (req, res) => {
    res.send('API is working');
});

// Create a user
// Create a user
app.post('/api/users', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if username and password are provided
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        // Create a new user instance
        const user = new User({ username, password });

        // Save the user to the database
        await user.save();

        // Generate a JWT token
        const token = jwt.sign({ userId: user._id }, '48f234b26ecdd84220f1a8a85d13496874041d6b1eab09c4506ae152c2bebd0a', { expiresIn: '1h' });


        // Send the token and user information in the response
        res.status(201).json({ user, token ,projects: []});
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(400).json({ error: 'Error creating user' });
    }
});


// Authenticate a user
// Authenticate a user
app.post('/api/users/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

          const token = jwt.sign({ userId: user._id }, '48f234b26ecdd84220f1a8a85d13496874041d6b1eab09c4506ae152c2bebd0a', { expiresIn: '1h' });

 
        res.json({ user, token, projects: user.projects });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error ${error}' });
    }
});

// Get user's projects
app.get('/api/users/:id/projects', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).send();
        }
        res.send(user.projects);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Add a project to a user
// Add or update a project for a user
app.put('/api/users/:id/projects', async (req, res) => {
    
        const userId = req.params.id;
        const projectData = req.body;

        console.log('Received User ID:', userId); // Log l'ID utilisateur
        console.log('Received Project Data:', projectData); // Log les données du projet

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Cherche l'index du projet à mettre à jour ou ajouter
        const projectIndex = user.projects.findIndex(project => project.id === projectData.id);

        if (projectIndex !== -1) {
            user.projects.splice(projectIndex, 1); // Supprime le projet existant
        }

        user.projects.unshift(projectData); // Ajoute le projet mis à jour ou nouveau au début de la liste
        await user.save();
        
        console.log('Updated User Projects:', user.projects); // Log les projets mis à jour

        res.json(user.projects); // Retourne la liste des projets mise à jour
     
});


// Delete a project from a user by project ID
app.delete('/api/users/:userId/projects/:projectId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }

        // Find the index of the project to delete
        const projectIndex = user.projects.findIndex(project => project.id === parseInt(req.params.projectId, 10));
        if (projectIndex === -1) {
            return res.status(404).send({ error: 'Project not found' });
        }

        // Remove the project from the user's projects array
        user.projects.splice(projectIndex, 1);

        await user.save();
        res.send(user.projects);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Get all users
app.get('/api/users/all', async (req, res) => {
    try {
        const users = await User.find();
        res.send(users);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Error-handling middleware
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.send({
        error: {
            status: err.status || 500,
            message: err.message,
        },
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
