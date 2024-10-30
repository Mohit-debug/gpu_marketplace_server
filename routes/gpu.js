import express from 'express';
import {
  createGPU,
  getAllGPUs,
  updateGPU,
  deleteGPU,
  placeBid,
  getAllGPUBuyerss,
  getSingleGpu,
  toggleBidStatus
} from '../controllers/gpuController.js';
import verifyToken from '../middleware/verifyToken.js';


const router = express.Router();

router.post('/creategpu', verifyToken(), createGPU);          
router.get('/getallgpu', verifyToken(), getAllGPUs);    
router.get('/getallgpubuyer', getAllGPUBuyerss);                   
router.put('/updategpu/:id', verifyToken(), updateGPU);        
router.get('/single/:id', verifyToken(), getSingleGpu);
router.delete('/delete/:id', verifyToken(), deleteGPU);     
router.post('/:id/bid', verifyToken(), placeBid);    
router.patch('/toggleBidStatus/:id', verifyToken(), toggleBidStatus);

export default router;
