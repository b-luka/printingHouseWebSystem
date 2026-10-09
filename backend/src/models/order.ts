import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    productName: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    color: {
        type: String,
        default: 'white'
    },
    printServiceId: {
        type: mongoose.Schema.Types.ObjectId
    },
    printTypeName: {
        type: String,
        default: 'None'
    },
    artworkUrl: {
        type: String
    },
    artworkText: {
        type: String
    },
    itemTotalPrice: {
        type: Number,
        required: true
    }
});

const orderSchema = new mongoose.Schema({
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true 
    },
    printerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [
        orderItemSchema
    ],
    totalAmount: {
        type: Number,
        required: true
    },
    status: { 
        type: String, 
        enum: ['ordered', 'paid', 'in_printing', 'delivered', 'received', 'canceled'], 
        default: 'ordered'
    }
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);