import express from 'express';
import {
  getJobListings,
  getJobListing,
  createJobListing,
  updateJobListing,
  deleteJobListing,
  toggleBookmark,
  enrichFromUrl
} from '../controllers/jobListingController.js';

const router = express.Router();

router.get('/', getJobListings);
router.get('/:id', getJobListing);
router.post('/', createJobListing);
router.put('/:id', updateJobListing);
router.delete('/:id', deleteJobListing);
router.patch('/:id/bookmark', toggleBookmark);
router.post('/enrich', enrichFromUrl);

export default router;
