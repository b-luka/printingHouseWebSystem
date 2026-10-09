import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema({
    printerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    totalPrice: {
        type: Number,
        required: true
    },
    offerDate: {
        type: Date,
        default: Date.now
    },
    isWinning: {
        type: Boolean,
        default: false
    }
});

const requestedProductSchema = new mongoose.Schema({
    category: {
        type: String
    },
    name: {
        type: String
    },
    quantity: {
        type: Number,
        required: true
    }
});

const procurementSchema = new mongoose.Schema({
    clientLegalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [
        requestedProductSchema
    ],
    createdAt: {
        type: Date,
        default: Date.now
    },
    isActive: {          // expires after 10 minutes
        type: Boolean,
        default: true
    }, 
    offers: [
        offerSchema
    ]
});

export default mongoose.model('Procurement', procurementSchema);