import JobListing from '../models/JobListing.js';

// Get all job listings
export const getJobListings = async (req, res) => {
  try {
    const { search, location, source } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (source) {
      query.source = source;
    }

    const listings = await JobListing.find(query).sort({ createdAt: -1 });
    res.json(listings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single job listing
export const getJobListing = async (req, res) => {
  try {
    const listing = await JobListing.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: 'Job listing not found' });
    res.json(listing);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create job listing
export const createJobListing = async (req, res) => {
  try {
    const listing = new JobListing(req.body);
    await listing.save();
    res.status(201).json(listing);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update job listing
export const updateJobListing = async (req, res) => {
  try {
    const listing = await JobListing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!listing) return res.status(404).json({ error: 'Job listing not found' });
    res.json(listing);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete job listing
export const deleteJobListing = async (req, res) => {
  try {
    const listing = await JobListing.findByIdAndDelete(req.params.id);
    if (!listing) return res.status(404).json({ error: 'Job listing not found' });
    res.json({ message: 'Job listing deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Toggle bookmark
export const toggleBookmark = async (req, res) => {
  try {
    const listing = await JobListing.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: 'Job listing not found' });
    listing.isBookmarked = !listing.isBookmarked;
    await listing.save();
    res.json(listing);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
