import mongoose from 'mongoose';

const bidSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now }
  });
  
  const gpuSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bids: [bidSchema],
    bidStatus: { type: String, enum: ["Open", "Closed"], default: "Open" }
  });

export default mongoose.model('GPU', gpuSchema);
