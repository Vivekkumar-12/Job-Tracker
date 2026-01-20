import Reminder from '../models/Reminder.js';

// Get all reminders
export const getReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find({ userId: req.user.id }).sort({ reminderDate: 1 }).populate('applicationId');
    res.json(reminders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single reminder
export const getReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOne({ 
      _id: req.params.id,
      userId: req.user.id 
    }).populate('applicationId');
    if (!reminder) return res.status(404).json({ error: 'Reminder not found' });
    res.json(reminder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create reminder
export const createReminder = async (req, res) => {
  try {
    const reminder = new Reminder({
      ...req.body,
      userId: req.user.id
    });
    await reminder.save();
    await reminder.populate('applicationId');
    res.status(201).json(reminder);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update reminder
export const updateReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('applicationId');
    if (!reminder) return res.status(404).json({ error: 'Reminder not found' });
    res.json(reminder);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete reminder
export const deleteReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    if (!reminder) return res.status(404).json({ error: 'Reminder not found' });
    res.json({ message: 'Reminder deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mark reminder as completed
export const completeReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isCompleted: true, updatedAt: new Date() },
      { new: true }
    ).populate('applicationId');
    if (!reminder) return res.status(404).json({ error: 'Reminder not found' });
    res.json(reminder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
