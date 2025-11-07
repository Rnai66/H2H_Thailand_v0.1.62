import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  itemId:   { type: mongoose.Schema.Types.ObjectId, required: true },
  buyerId:  { type: mongoose.Schema.Types.ObjectId, required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, required: true },
  price:    { type: Number, required: true },
  method:   { type: String, enum: ["bank_transfer", "cash_meetup"], required: true },
  status:   {
    type: String,
    enum: [
      "INITIATED",
      "PENDING_PAYMENT",
      "PAID_PENDING_VERIFY",
      "PAID_VERIFIED",
      "FULFILLED",
      "COMPLETED",
      "CANCELLED"
    ],
    default: "INITIATED"
  },
  slip: {
    url: String,
    filename: String,
    uploadedAt: Date
  },
  notes: String
}, { timestamps: true });

const Order = mongoose.model("Order", OrderSchema);
export default Order;
