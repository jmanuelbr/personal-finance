if (!Object.hasOwn) {
    Object.hasOwn = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
}

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = 3001;
const DATA_FILE = path.join(__dirname, '../finance_data.json');
const UPLOADS_DIR = path.join(__dirname, '../uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR);
}

// Configure multer for file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

app.use(cors());
app.use(bodyParser.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/dist')));
// Serve uploaded images
app.use('/uploads', express.static(UPLOADS_DIR));

// Upload endpoint
app.post('/api/upload', upload.single('logo'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    const filePath = `/uploads/${req.file.filename}`;
    res.json({ filePath });
});

// Get data
app.get('/api/data', (req, res) => {
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading data file:', err);
            // If file doesn't exist, return default structure
            if (err.code === 'ENOENT') {
                return res.json({ accounts: [], history: [] });
            }
            return res.status(500).send('Error reading data');
        }
        try {
            res.json(JSON.parse(data));
        } catch (parseError) {
            console.error('Error parsing JSON:', parseError);
            res.status(500).send('Error parsing data');
        }
    });
});

// Update data
app.post('/api/data', (req, res) => {
    const newData = req.body;
    fs.writeFile(DATA_FILE, JSON.stringify(newData, null, 2), (err) => {
        if (err) {
            console.error('Error writing data file:', err);
            return res.status(500).send('Error saving data');
        }
        res.json({ success: true });
    });
});

// The "catchall" handler
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

const HOST = '0.0.0.0';
app.listen(PORT, HOST, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
});

process.on('SIGINT', () => {
    process.exit(0);
});
