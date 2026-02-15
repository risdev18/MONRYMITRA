import { Router } from 'express';
import { createCustomer, getCustomers, updateCustomer, deleteCustomer, clearAllCustomers } from './customer.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', createCustomer);
router.get('/', getCustomers);
router.delete('/clear-all', clearAllCustomers);
router.put('/:id', updateCustomer);
router.delete('/:id', deleteCustomer);

export default router;
