const Wallet = require("../models/Wallet");
const mongoose = require("mongoose");

// Get all wallets for the logged-in user
exports.getAllWallets = async (req, res) => {
  try {
    const wallets = await Wallet.find({
      userId: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: wallets.length,
      data: wallets,
    });
  } catch (error) {
    console.error("Error fetching wallets:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// Get single wallet by ID - only if user owns it
exports.getWalletById = async (req, res) => {
  try {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid wallet ID",
      });
    }

    const wallet = await Wallet.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        error: "Wallet not found",
      });
    }

    res.status(200).json({
      success: true,
      data: wallet,
    });
  } catch (error) {
    console.error("Error fetching wallet:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// Create new wallet for the logged-in user
exports.createWallet = async (req, res) => {
  try {
    const { name, type, icon, color, balance, description } = req.body;

    // Validate required fields
    if (!name || !type) {
      return res.status(400).json({
        success: false,
        error: "Name and type are required",
      });
    }

    // Check if wallet with same name already exists for this user
    const existingWallet = await Wallet.findOne({
      name: name.trim(),
      userId: req.user._id,
    });

    if (existingWallet) {
      return res.status(400).json({
        success: false,
        error: "Wallet with this name already exists",
      });
    }

    const wallet = await Wallet.create({
      name: name.trim(),
      type,
      icon: icon || "wallet",
      color: color || "#3b82f6",
      balance: balance || 0,
      description: description || "",
      isDefault: false,
      userId: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: wallet,
    });
  } catch (error) {
    console.error("Error creating wallet:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        error: messages.join(", "),
      });
    }

    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// Update wallet - only if user owns it
exports.updateWallet = async (req, res) => {
  try {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid wallet ID",
      });
    }

    let wallet = await Wallet.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        error: "Wallet not found or you don't have permission to update it",
      });
    }

    // Prevent updating default wallets
    if (wallet.isDefault) {
      return res.status(400).json({
        success: false,
        error: "Cannot update default wallets",
      });
    }

    const { name, type, icon, color, balance, description } = req.body;

    // Check if new name conflicts with existing wallets
    if (name && name.trim() !== wallet.name) {
      const existingWallet = await Wallet.findOne({
        name: name.trim(),
        userId: req.user._id,
        _id: { $ne: req.params.id },
      });

      if (existingWallet) {
        return res.status(400).json({
          success: false,
          error: "Wallet with this name already exists",
        });
      }
    }

    // Build update object
    const updateFields = {};
    if (name) updateFields.name = name.trim();
    if (type) updateFields.type = type;
    if (icon) updateFields.icon = icon;
    if (color) updateFields.color = color;
    if (balance !== undefined) updateFields.balance = balance;
    if (description !== undefined) updateFields.description = description;

    wallet = await Wallet.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: wallet,
    });
  } catch (error) {
    console.error("Error updating wallet:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        error: messages.join(", "),
      });
    }

    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// Delete wallet - only if user owns it
exports.deleteWallet = async (req, res) => {
  try {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid wallet ID",
      });
    }

    const wallet = await Wallet.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        error: "Wallet not found or you don't have permission to delete it",
      });
    }

    // Prevent deleting default wallets
    if (wallet.isDefault) {
      return res.status(400).json({
        success: false,
        error: "Cannot delete default wallets",
      });
    }

    await Wallet.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {},
      message: "Wallet deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting wallet:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// Get wallets by type for the logged-in user
exports.getWalletsByType = async (req, res) => {
  try {
    const { type } = req.params;

    const validTypes = [
      "cash",
      "bank",
      "bkash",
      "nagad",
      "rocket",
      "credit_card",
      "other",
    ];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: "Invalid wallet type",
      });
    }

    const wallets = await Wallet.find({
      type,
      userId: req.user._id,
    }).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: wallets.length,
      data: wallets,
    });
  } catch (error) {
    console.error("Error fetching wallets by type:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};
