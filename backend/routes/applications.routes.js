import express from 'express'; 
import { getApplications, getApplication, createApplication, editApplication, deleteApplication, } from '../applications.js';
const router = express.Router(); 

router.get('/', getApplications); 
router.get('/:id', getApplication); 
router.post('/', createApplication); 
router.patch('/:id', editApplication); 
router.delete('/:id', deleteApplication); 
export default router;