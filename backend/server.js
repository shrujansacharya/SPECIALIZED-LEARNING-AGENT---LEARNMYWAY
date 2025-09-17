// learnmyway-backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const admin = require('firebase-admin');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { Server } = require("socket.io");
const { PeerServer } = require('peer');
const { PythonShell } = require('python-shell');
const fetch = require('node-fetch');
const pdf = require('pdf-parse');
const Tesseract = require('tesseract.js');
const googlePlacesProxy = require('./google-places-proxy');

require('dotenv').config();

const app = express();

app.use(cors({
  origin: '*',
  methods: 'GET,POST,PUT,DELETE,OPTIONS',
  allowedHeaders: 'Content-Type,Authorization'
}));

app.use(express.json());

// Authentication Middleware
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;

    const mongoUser = await User.findOne({ firebaseUid: decodedToken.uid });
    if (!mongoUser) {
      return res.status(404).json({ error: 'User not found in database' });
    }
    req.mongoUser = mongoUser;

    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

// Configure Multer for profile image storage
const profileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/profile_images/');
  },
  filename: function (req, file, cb) {
    cb(null, `${req.params.firebaseUid}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const uploadProfile = multer({ storage: profileStorage });

// Configure Multer for study material storage
const materialStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/materials/');
  },
  filename: function (req, file, cb) {
    cb(null, `${req.body.subject}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const uploadMaterial = multer({ storage: materialStorage });

// Initialize Firebase Admin SDK
const serviceAccount = require('./firebase-service-account.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// MongoDB User Schema
const userSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  dob: String,
  class: String,
  email: { type: String, required: true, unique: true },
  learningStyle: { type: String, default: null },
  interests: { type: String, default: null },
  role: { type: String, enum: ['student', 'teacher'], default: 'student' },
  profileImage: { type: String, default: null },
  performance: [{
    level: { type: String, enum: ['weak', 'average', 'good'] },
    subjects: [String]
  }],
  generatedThemeImages: { type: [String], default: [] }
});
const User = mongoose.model('User', userSchema);

// MongoDB Material Schema
const materialSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  filePath: { type: String, required: true },
  subject: { type: String, required: true },
  comment: { type: String },
  uploadedBy: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  targetStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});
const Material = mongoose.model('Material', materialSchema);

// MongoDB Session Schema
const sessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  sessionName: { type: String, required: true },
  subject: { type: String },
  topic: { type: String },
  description: { type: String },
  joinLink: { type: String, required: true },
  scheduledTime: { type: Date, default: Date.now },
  uploadedBy: { type: String, required: true },
  targetClass: { type: String, default: 'All' },
});
const Session = mongoose.model('Session', sessionSchema);

// Serve static files (uploaded images and materials)
app.use('/uploads/profile_images', express.static('uploads/profile_images'));
app.use('/uploads/materials', express.static('uploads/materials'));
app.use('/uploads/theme_images', express.static('uploads/theme_images'));

// Google Places API proxy
app.use('/api/google-places', googlePlacesProxy);

// Create HTTP server and attach the express app
const server = http.createServer(app);

// Initialize socket.io with the http server and force websocket transport
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  transports: ["websocket"]
});

// Socket middleware for authentication
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    socket.user = decoded;
    const user = await User.findOne({ firebaseUid: decoded.uid });
    if (user && user.role === 'student' && user.class) {
      socket.join(`class-${user.class}`);
    }
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

// Initialize PeerJS Server and attach it to the same http server
const peerServer = PeerServer({
  port: parseInt(process.env.REACT_APP_PEER_PORT || '5000'),
  path: '/peerjs',
  allow_discovery: true,
  debug: 1,
});

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('join-session', async ({ sessionId, peerId, userName, isHost }) => {
    socket.join(sessionId);
    console.log(`User ${userName} (${peerId}) joined session ${sessionId}`);
    socket.to(sessionId).emit('user-joined', { peerId, userName, isHost });
  });

  socket.on('chat-message', ({ sessionId, ...message }) => {
    io.to(sessionId).emit('chat-message', message);
  });

  socket.on('update-state', ({ sessionId, peerId, isMuted, isVideoOff }) => {
    io.to(sessionId).emit('update-state', { peerId, isMuted, isVideoOff });
  });

  socket.on('force-mute-student', ({ sessionId, peerId }) => {
    io.to(sessionId).emit('force-mute', { peerId });
  });

  socket.on('kick-student', ({ sessionId, peerId }) => {
    io.to(sessionId).emit('kicked', { peerId });
  });

  socket.on('end-session', ({ sessionId }) => {
    io.to(sessionId).emit('session-ended');
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// --- API Endpoints ---
app.post('/api/register', async (req, res) => {
  try {
    const { firebaseUid, name, dob, class: userClass, email } = req.body;
    const newUser = new User({ firebaseUid, name, dob, class: userClass, email });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/user/:firebaseUid', authenticate, async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.params.firebaseUid });
    if (!user) return res.status(404).send('User not found.');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching user.' });
  }
});

app.put('/api/user/:firebaseUid/upload-image', authenticate, uploadProfile.single('profileImage'), async (req, res) => {
  try {
    const firebaseUid = req.params.firebaseUid;
    const profileImagePath = req.file ? `/uploads/profile_images/${req.file.filename}` : null;
    if (!profileImagePath) {
      return res.status(400).json({ error: 'No image file provided.' });
    }
    const updatedUser = await User.findOneAndUpdate(
      { firebaseUid: firebaseUid },
      { profileImage: profileImagePath },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).send('User not found.');
    }
    res.status(200).json({ profileImage: updatedUser.profileImage });
  } catch (error) {
    console.error('Error uploading profile image:', error);
    res.status(500).json({ error: 'Server error uploading image.' });
  }
});

app.put('/api/user/:firebaseUid/learning-style', authenticate, async (req, res) => {
  try {
    const { learningStyle, interests, generatedThemeImages } = req.body;
    const updatedUser = await User.findOneAndUpdate(
      { firebaseUid: req.params.firebaseUid },
      { learningStyle, interests, generatedThemeImages },
      { new: true }
    );
    if (!updatedUser) return res.status(404).send('User not found.');
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/teachers/students', async (req, res) => {
  try {
    const { class: studentClass } = req.query;
    const filter = { role: 'student' };
    if (studentClass && studentClass !== 'All') {
      filter.class = studentClass;
    }
    const students = await User.find(filter);
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching students.' });
  }
});

app.put('/api/teachers/students/:id', async (req, res) => {
  try {
    const { name, dob, class: userClass, email, learningStyle, interests } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, dob, class: userClass, email, learningStyle, interests },
      { new: true }
    );
    if (!updatedUser) return res.status(404).send('Student not found.');
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/teachers/students/:id/performance', async (req, res) => {
  try {
    const { id } = req.params;
    const { level, subjects } = req.body;

    if (!level || !subjects) {
      return res.status(400).json({ error: 'Level and subjects are required.' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        $push: {
          performance: {
            level,
            subjects
          }
        }
      },
      { new: true }
    );

    if (!updatedUser) return res.status(404).send('Student not found.');
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating student performance:', error);
    res.status(500).json({ error: 'Server error updating student performance.' });
  }
});

app.delete('/api/teachers/students/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const userToDelete = await User.findById(id);
    if (!userToDelete) {
      return res.status(404).send('Student record not found in MongoDB.');
    }

    const firebaseUid = userToDelete.firebaseUid;

    if (firebaseUid) {
      try {
        await admin.auth().deleteUser(firebaseUid);
        console.log('Successfully deleted user from Firebase Auth:', firebaseUid);
      } catch (firebaseError) {
        if (firebaseError.code === 'auth/user-not-found') {
          console.log('User not found in Firebase Auth, proceeding with MongoDB deletion:', firebaseUid);
        } else {
          console.error('Error deleting user from Firebase Auth:', firebaseError.message);
          return res.status(500).json({ error: 'Failed to delete from Firebase. Please check your service account permissions.' });
        }
      }
    }

    const deletedUser = await User.findByIdAndDelete(id);

    if (deletedUser) {
        console.log('Successfully deleted user from MongoDB:', id);
        res.status(200).send('Student record deleted successfully.');
    } else {
        res.status(404).send('Student record not found in MongoDB.');
    }
  } catch (error) {
    console.error('Server error during student deletion:', error);
    res.status(500).json({ error: 'Server error deleting student.' });
  }
});

app.post('/api/teachers/upload-material', uploadMaterial.single('material'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }
    const { subject, comment, targetStudents } = req.body; 
    
    if (!subject) {
      return res.status(400).send('Subject not specified.');
    }

    const newMaterial = new Material({
      fileName: req.file.originalname,
      filePath: `/uploads/materials/${req.file.filename}`,
      subject: subject,
      comment: comment || '',
      uploadedBy: "teacher",
      timestamp: new Date(),
      targetStudents: targetStudents ? JSON.parse(targetStudents) : [],
    });

    await newMaterial.save();
    
    io.emit('session-notification', newMaterial);
    
    res.status(200).json({ message: 'Material uploaded and assigned successfully.', material: newMaterial });

  } catch (error) {
    console.error('Error uploading material:', error);
    res.status(500).json({ error: 'Server error uploading material.' });
  }
});

app.get('/api/materials', authenticate, async (req, res) => {
  try {
    const user = req.mongoUser;
    let filter = {};

    if (user.role === 'student') {
      filter = { targetStudents: user._id };
    } 
    
    const materials = await Material.find(filter).populate('targetStudents', 'name class');
    
    res.json(materials);
  } catch (error) {
    console.error('Error fetching materials:', error);
    res.status(500).json({ error: 'Server error fetching materials.' });
  }
});

app.delete('/api/materials/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const material = await Material.findById(id);
    if (!material) {
      return res.status(404).send('Material not found.');
    }

    const filePath = path.join(__dirname, 'public', material.filePath);
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Error deleting file from disk:', err);
      }
    });

    await Material.findByIdAndDelete(id);
    res.status(200).send('Material deleted successfully.');
  } catch (error) {
    console.error('Error deleting material:', error);
    res.status(500).json({ error: 'Server error deleting material.' });
  }
});

app.post('/api/materials/analyze', authenticate, async (req, res) => {
  try {
    const { filePath, comment } = req.body;

    if (!filePath) {
      return res.status(400).json({ error: 'filePath is required.' });
    }

    const fullPath = path.join(__dirname, filePath.substring(1));

    if (!fs.existsSync(fullPath)) {
      console.error(`File not found at path: ${fullPath}`);
      return res.status(404).json({ error: 'File not found on server.' });
    }

    const fileExtension = path.extname(filePath).toLowerCase();
    let extractedText = '';

    console.log(`Analyzing file: ${fullPath} with extension ${fileExtension}`);

    if (fileExtension === '.pdf') {
      const dataBuffer = fs.readFileSync(fullPath);
      const data = await pdf(dataBuffer);
      extractedText = data.text;
    } else if (['.png', '.jpg', '.jpeg'].includes(fileExtension)) {
      const { data: { text } } = await Tesseract.recognize(fullPath, 'eng', {
        logger: m => console.log(`[Tesseract]: ${m.status} (${(m.progress * 100).toFixed(2)}%)`),
      });
      extractedText = text;
    } else {
      return res.status(400).json({ error: 'Unsupported file type for analysis. Only PDF and image files are supported.' });
    }

    if (!extractedText || !extractedText.trim()) {
      extractedText = "No text could be extracted from this material.";
    }

    let finalContext = extractedText;
    if (comment && comment.trim()) {
      finalContext = `The teacher provided the following instruction or task: "${comment.trim()}"\n\n---\n\nHere is the content from the material:\n${extractedText}`;
    }

    res.status(200).json({ context: finalContext });

  } catch (error) {
    console.error('Error during material analysis:', error);
    res.status(500).json({ error: 'Server error during file analysis.' });
  }
});

app.post('/api/teachers/create-session', async (req, res) => {
  try {
    const { sessionName, subject, topic, description, targetClass } = req.body;
    const sessionId = 'session_' + Math.random().toString(36).substr(2, 9);
    const joinLink = `${process.env.APP_BASE_URL || 'http://localhost:3000'}/join/${sessionId}`;

    const newSession = new Session({
      sessionId,
      sessionName,
      subject,
      topic,
      description,
      joinLink,
      uploadedBy: "teacher",
      targetClass,
      scheduledTime: new Date()
    });

    await newSession.save();
    if (newSession.targetClass === 'All') {
      io.emit('session-notification', newSession);
    } else {
      io.to(`class-${newSession.targetClass}`).emit('session-notification', newSession);
    }
    res.status(201).json({ message: 'Session created and notifications sent.', session: newSession });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ error: 'Server error creating session.' });
  }
});

const THEME_PROMPTS = {
  cricket: "An ultra-detailed 3D render of an intense cricket moment — a batsman hitting the ball mid-swing, stumps flying, and the red leather ball glowing in motion. High contrast, vivid colors, cinematic lighting, hyper-realistic, crystal clear details.",

  space: "A breathtaking ultra-high resolution 3D render of outer space with glowing planets, radiant nebulae, asteroid belts, and a futuristic spaceship. High contrast, neon cosmic colors, cinematic depth, ray-traced reflections, Unreal Engine style.",

  nature: "A vibrant 3D render of an enchanted glowing forest with colorful flowers, luminous plants, flowing waterfalls, and friendly animals. High contrast, magical atmosphere, ultra-detailed textures, dreamlike yet realistic, cinematic lighting.",

  science: "A futuristic 3D render of a glowing science lab filled with advanced robots, holographic screens, neon circuits, and colorful experiments. High contrast, vivid colors, sharp reflections, cinematic and hyper-detailed sci-fi design.",

  art: "A surreal and colorful 3D render of a creative art studio with floating glowing paint strokes, vibrant sculptures, and radiant masterpieces suspended in the air. High contrast, dreamlike surrealism, ultra-polished textures, visually stunning.",

  history: "A dramatic 3D render combining vivid historical moments — a knight in shining armor, ancient pyramids, dinosaurs, and old temples — blended in a cinematic fantasy scene. High contrast, vibrant colors, hyper-detailed, rich textures.",

  global: "A striking 3D render of a glowing Earth with colorful network lines wrapping around it, surrounded by holograms of diverse cultures and landmarks. High contrast, radiant neon colors, futuristic high-tech look, cinematic quality.",

  lifeSkills: "A heartwarming 3D render showing people practicing life skills — cooking with glowing ingredients, teamwork with vibrant energy effects, meditation with radiant calm light. High contrast, colorful, ultra-detailed, uplifting atmosphere.",
};

app.post('/api/generate-theme-images', async (req, res) => {
  const { theme } = req.body;
  if (!theme || !THEME_PROMPTS[theme]) {
    return res.status(400).json({ error: 'Invalid theme provided.' });
  }

  const prompt = THEME_PROMPTS[theme];
  const publicImageUrls = [];
  const BACKEND_URL = process.env.VITE_BACKEND_URL || 'http://localhost:5001';
  const PYTHON_API_URL = 'http://localhost:5002/generate';
  const numberOfImages = 5;

  try {
    for (let i = 0; i < numberOfImages; i++) {
      const response = await fetch(PYTHON_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: prompt }),
      });

      if (!response.ok) {
        throw new Error(`Python API failed with status ${response.status}`);
      }

      const result = await response.json();
      publicImageUrls.push(`${BACKEND_URL}${result.path}`);
    }

    res.status(200).json({ backgrounds: publicImageUrls });
  } catch (error) {
    console.error('Error calling Python generation API:', error);
    res.status(500).json({ error: 'Failed to generate images.' });
  }
});

app.post('/api/generate-topic-image', async (req, res) => {
  const { topic } = req.body;
  if (!topic) {
    return res.status(400).json({ error: 'Topic is required.' });
  }

  try {
    // Generate prompt using Gemini
    const promptResponse = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
      {
        contents: [{ role: 'user', parts: [{ text: `Generate a detailed, visual prompt for Stable Diffusion to create an educational image about: "${topic}". Make it suitable for students, clear, illustrative, and educational. Respond with only the prompt, no other text.` }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 200 },
      },
      {
        headers: { 'Content-Type': 'application/json' },
        params: { key: process.env.GEMINI_API_KEY },
      }
    );

    const generatedPrompt = promptResponse.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || topic;

    // Call Python API
    const pythonResponse = await fetch('http://localhost:5002/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: generatedPrompt }),
    });

    if (!pythonResponse.ok) {
      throw new Error(`Python API failed with status ${pythonResponse.status}`);
    }

    const result = await pythonResponse.json();
    const BACKEND_URL = process.env.VITE_BACKEND_URL || 'http://localhost:5001';
    res.status(200).json({ imageUrl: `${BACKEND_URL}${result.path}` });
  } catch (error) {
    console.error('Error generating topic image:', error);
    res.status(500).json({ error: 'Failed to generate image.' });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));