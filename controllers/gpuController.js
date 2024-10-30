import GPU from '../models/GPU.js';

// Create GPU Listing
export const createGPU = async (req, res, next) => {
    console.log("API called for creating GPU");
    try {
        // Ensure the user has the 'seller' role
        if (req.user.role !== "seller") {
            return res.status(403).json({ message: "Forbidden: Only sellers can create GPUs" });
        }

        // Ensure the request body has the required fields
        const { name, description, price } = req.body;

        // Validate request body
        if (!name || !description || !price) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Create a new GPU object
        const gpu = new GPU({
            name,
            description,
            price,
            sellerId: req.user._id, 
            bidStatus: "Open"
        });

       
        console.log("Creating GPU:", gpu);

        // Save the GPU to the database
        await gpu.save();

        // Respond with the created GPU data
        res.status(201).json(gpu);
    } catch (error) {
        console.error("Error creating GPU:", error); 
        res.status(500).json({ message: error.message });
    }
};

export const toggleBidStatus = async (req, res) => {
  try {
      const gpu = await GPU.findOne({ _id: req.params.id, sellerId: req.user.id });
      if (!gpu) return res.status(404).json({ message: "GPU not found or unauthorized" });
      gpu.bidStatus = gpu.bidStatus === "Open" ? "Closed" : "Open";
      await gpu.save();
      res.status(200).json({ message: `Bidding is now ${gpu.bidStatus}`, gpu });
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};

// Get All GPU Listings
export const getAllGPUs = async (req, res, next) => {
    console.log("Fetching all GPUs with bid user information");
    try {
      // Ensure the user is authenticated
      if (!req.user || !req.user._id) {
        return res.status(403).json({ message: "User not authenticated" });
      }
  
      // Fetch all GPUs with user info for bids
      const allGPUs = await GPU.find().populate("bids.userId", "username");
      
      // Filter for seller's GPUs
      const myGPUs = allGPUs.filter(gpu => gpu.sellerId.toString() === req.user._id.toString());
      const otherGPUs = allGPUs.filter(gpu => gpu.sellerId.toString() !== req.user._id.toString());
  
      res.json({ myGPUs, otherGPUs });
    } catch (error) {
      console.error("Error fetching GPUs:", error);
      res.status(500).json({ message: error.message });
    }
  };
  
  
  
  // Get All GPU Buyers Listings
export const getAllGPUBuyerss = async (req, res, next) => {
    console.log("Fetching all GPUs with bid user information");
    try {
      const gpus = await GPU.find().populate("bids.userId", "username"); 
      res.json(gpus);
    } catch (error) {
      console.error("Error fetching GPUs:", error);
      res.status(500).json({ message: error.message });
    }
  };

  export const getSingleGpu = async (req, res, next) => {
    console.log("Fetching single GPUs with bid user information");
    try {
        const gpu = await GPU.findById(req.params.id).populate("bids.userId", "username");
        if (!gpu) {
            return res.status(404).json({ message: "GPU not found" });
        }
        res.json(gpu);
    } catch (error) {
        console.error("Error fetching GPU:", error);
        res.status(500).json({ message: error.message });
    }
  };


export const updateGPU = async (req, res, next) => {
    try {
        const gpu = await GPU.findOneAndUpdate(
            { _id: req.params.id, sellerId: req.user.id }, // Check by GPU ID and seller ID
            req.body,
            { new: true } // Return the updated document
        );
        
        if (!gpu) {
            return res.status(404).json({ message: "GPU not found or unauthorized" });
        }

        res.status(200).json(gpu);
    } catch (error) {
        console.error("Error updating GPU:", error);
        res.status(400).json({ message: error.message });
    }
};

// Delete GPU Listing - Only the seller who created it can delete
export const deleteGPU = async (req, res, next) => {
    try {
        const gpu = await GPU.findOneAndDelete({
            _id: req.params.id,
            sellerId: req.user.id // Check by GPU ID and seller ID
        });

        if (!gpu) {
            return res.status(404).json({ message: "GPU not found or unauthorized" });
        }

        res.status(200).json({ message: "GPU deleted" });
    } catch (error) {
        console.error("Error deleting GPU:", error);
        res.status(400).json({ message: error.message });
    }
};

// Place Bid
export const placeBid = async (req, res, next) => {
    try {
      const gpu = await GPU.findById(req.params.id);
      if (!gpu) return res.status(404).json({ message: "GPU not found" });
      if (gpu.bidStatus === "Closed") {
        return res.status(403).json({ message: "Bidding is currently closed for this GPU" });
      }
  
      const bidAmount = req.body.amount;
      if (bidAmount <= 0) {
        return res.status(400).json({ message: "Bid amount must be greater than zero" });
      }
  
      // Get the current highest bid
      const highestBid = gpu.bids.length ? Math.max(...gpu.bids.map(bid => bid.amount)) : 0;
  
      //  new bid is greater than the highest bid
      if (bidAmount <= highestBid) {
        return res.status(400).json({ message: `Bid must be higher than the current highest bid of $${highestBid}` });
      }
  
      //  if the user has already placed a bid on this GPU
      const existingBidIndex = gpu.bids.findIndex(bid => bid.userId.toString() === req.user.id);
  
      if (existingBidIndex !== -1) {
        // Update the existing bid amount for the user
        gpu.bids[existingBidIndex].amount = bidAmount;
      } else {
        // If no existing bid, create a new bid for the user
        gpu.bids.push({ userId: req.user.id, amount: bidAmount });
      }
  
      await gpu.save();
      res.status(201).json({ message: "Bid placed successfully", gpu });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
  
  
