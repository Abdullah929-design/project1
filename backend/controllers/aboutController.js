const About = require('../models/About');

exports.getAbout = async (req, res) => {
  try {
    const about = await About.findOne();
    res.json({ content: about ? about.content : '' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateAbout = async (req, res) => {
  try {
    const { content } = req.body;
    let about = await About.findOne();
    if (about) {
      about.content = content;
      await about.save();
    } else {
      about = new About({ content });
      await about.save();
    }
    res.json({ message: 'About content updated', content: about.content });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}; 