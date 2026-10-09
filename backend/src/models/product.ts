import mongoose from 'mongoose';

const printingServiceSchema = new mongoose.Schema({
    printType: {
        type: String,
        required: true,
    },
    additionalPricePerPiece: {
        type: Number,
        required: true,
    },
    maxWidthMm: {
        type: Number,
        required: true,
    },
    maxHeightMm: {
        type: Number,
        required: true,
    }
});

const commentSchema = new mongoose.Schema({
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const productSchema = new mongoose.Schema({
    printerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    code: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    subcategory: {
        type: String,
        required: true
    },
    unitPrice: {
        type: Number,
        required: true
    },
    stockQuantity: {
        type: Number,
        required: true,
        min: 0
    },
    availableColors: [{
        type: String
    }],
    imageUrl: {
        type: String,
        required: true
    },
    additionalImages: [{
        type: String
    }],
    printServices: [
        printingServiceSchema
    ],

    // social elements
    likes: {
        type: Number,
        default: 0
    }, 
    dislikes: {
        type: Number,
        default: 0
    },
    likedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    dislikedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [
        commentSchema
    ]
}, { timestamps: true });

export default mongoose.model('Product', productSchema);