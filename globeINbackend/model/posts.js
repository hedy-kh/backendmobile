const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    description: { type: String },
    imgUrl: { type: String },
    createdAt: { type: Date, default: Date.now },
    scheduledAt: { type: Date, default: Date.now },
    timeLeft: { type: Number }, // Change to Number to represent duration
    price: { type: Number },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    active: { type: Boolean, default: false }
});

// Set default values for createdAt and scheduledAt using functions
ProductSchema.pre('save', function(next) {
    if (!this.createdAt) {
        this.createdAt = new Date();
    }
    if (!this.scheduledAt) {
        this.scheduledAt = new Date();
    }
    next();
});

ProductSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Product', ProductSchema);
