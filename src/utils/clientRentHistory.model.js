const mongoose = require("mongoose");

const clientRentHistorySchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
      index: true,
    },

    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
      index: true,
    },

    bedId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bed",
      required: true,
    },

    stayType: {
      type: String,
      enum: ["Permanent", "Temporary"],
      required: true,
    },

    month: {
      // Example : 2026-07
      type: String,
      required: true,
    },

    rentAmt: {
      type: Number,
      default: 0,
    },

    ebAmt: {
      type: Number,
      default: 0,
    },

    flatEB: {
      type: Number,
      default: 0,
    },

    adjEB: {
      type: Number,
      default: 0,
    },

    adjAmt: {
      type: Number,
      default: 0,
    },

    processingFees: {
      type: Number,
      default: 0,
    },

    previousDue: {
      type: Number,
      default: 0,
    },

    totalReceivable: {
      type: Number,
      default: 0,
    },

    totalReceived: {
      type: Number,
      default: 0,
    },

    currentDue: {
      type: Number,
      default: 0,
    },

    rentDOJ: Date,

    ebDOJ: Date,

    paymentStatus: {
      type: String,
      enum: [
        "Pending",
        "Partial",
        "Paid",
      ],
      default: "Pending",
    },

    paymentComments: {
      type: String,
      default: "",
    },

    isCancelled: {
      type: Boolean,
      default: false,
    },

    remarks: String,
  },
  {
    timestamps: true,
  }
);