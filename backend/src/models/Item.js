import mongoose from "mongoose";
export function ItemModel(conn) {
  const name = "Item";
  if (conn.models[name]) return conn.models[name];
  const schema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, trim: true },
    images: [{ type: String }],
    sellerId: { type: String, required: true, index: true },
    status: { type: String, enum: ["active", "sold", "hidden"], default: "active", index: true },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null }
  }, { timestamps: true });
  schema.index({ title: "text", description: "text" });
  return conn.model(name, schema);
}

