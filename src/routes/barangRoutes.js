import express from 'express';
import * as controller from '../controllers/barangController.js';

const router = express.Router();

router.get('/', controller.getAll);
router.get('/kode-berikutnya', controller.getKodeBerikutnya); // route khusus harus sebelum '/:id'
router.get('/lokasi', controller.getLokasi);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

export default router;
