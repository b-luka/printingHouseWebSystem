import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    userType: {
        type: String,
        enum: ["admin", "client_individual", "client_legal", "printer"],
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {         // kept as hash
        type: String,
        required: true,
    },
    firstname: {
        type: String,
        required: true,
    },
    lastname: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    profilePicture: {
        type: String,
        required: false,
        default: "default_profile_image.jpg",
    },

    // cart
    cart: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        selectedServiceId: {
            type: mongoose.Schema.Types.ObjectId,   // ref: ProductService
            default: null
        },
        selectedColor: {
            type: String,
            default: 'Bela'
        },
        customText: {
            type: String,
            default: ''
        },
        customImage: {
            type: String,
            default: ''
        }
    }],

    // fields specific to legal clients and employees
    institutionName: {
        type: String,
    },
    headquartersAddress: {
        type: String,
    },
    city: {
        type: String,
    },
    registrationNumber: {
        type: String,
        match: [/^\d{8}$/, 'Registration number must be exactly 8 digits']
    },
    taxId: {
        type: String,
        match: [/^[1-9]\d{8}$/, 'Tax ID must be 9 digits and cannot start with a zero']
    },
    
    // status of approval
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
    },
}, { timestamps: true });

export default mongoose.model("User", userSchema);