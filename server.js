require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

// Đọc biến môi trường
const PORT = process.env.PORT || 3000;
const ADMIN_PASS = process.env.ADMIN_PASS || 'admin123';
const MONGO_URI = process.env.MONGO_URI; // ✅ đúng biến

console.log('🔍 MONGO_URI type:', typeof MONGO_URI); // debug

// Kết nối MongoDB
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Schema + Model
const videoSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  link: { type: String, required: true }
});
const Video = mongoose.model('Video', videoSchema);

// API
app.get('/api/videos', async (req, res) => {
  const videos = await Video.find({});
  const data = {};
  videos.forEach(v => data[v.code] = v.link);
  res.json(data);
});

app.get('/api/videos/:code', async (req, res) => {
  try {
    const video = await Video.findOne({ code: req.params.code });
    if (!video) {
      return res.status(404).json({ error: 'Không tìm thấy mã này' });
    }
    res.json({ link: video.link });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

app.post('/api/videos', async (req, res) => {
  const { pass, code, link } = req.body;
  if (pass !== ADMIN_PASS) return res.status(403).json({ error: 'Sai mật khẩu admin' });
  if (!code || !link) return res.status(400).json({ error: 'Thiếu code hoặc link' });
  const updated = await Video.findOneAndUpdate({ code }, { link }, { upsert: true, new: true });
  res.json({ success: true, data: updated });
});

app.delete('/api/videos/:code', async (req, res) => {
  if (req.query.pass !== ADMIN_PASS) return res.status(403).json({ error: 'Sai mật khẩu admin' });
  const result = await Video.deleteOne({ code: req.params.code });
  if (result.deletedCount > 0) res.json({ success: true });
  else res.status(404).json({ error: 'Không tìm thấy mã này' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
