import mongoose from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";
import validator from "validator";

const imageSchema = new mongoose.Schema(
    {
        url: {
            type: String,
            trim: true,
        },
        publicId: {
            type: String,
            trim: true,
        },
    },
    {
        _id: false,
    }
);

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: [true, "Full name is required"],
            trim: true,
            minlength: 2,
            maxlength: 50,
        },

        username: {
            type: String,
            required: [true, "Username is required"],
            
            lowercase: true,
            trim: true,
            minlength: 3,
            maxlength: 20,
        },

        isEmailVerified: {
            type: Boolean,
            default: false,
        },

        email: {
            type: String,
            required: [true, "Email is required"],
            lowercase: true,
            trim: true,
            validate: {
                validator: validator.isEmail,
                message: "Invalid email address",
            },
        },

        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: 8,
            select: false,
        },

        avatar: {
            type: imageSchema,
            default: () => ({}),
        },

        coverImage: {
            type: imageSchema,
            default: () => ({}),
        },

        bio: {
            type: String,
            trim: true,
            maxlength: 300,
            default: "",
        },

        refreshToken: {
            type: String,
            select: false,
        },

        passwordResetToken: {
            type: String,
            select: false,
        },

        passwordResetTokenExpiry: {
            type: Date,
            select: false,
        },

        emailVerificationToken: {
            type: String,
            select: false,
        },

        emailVerificationTokenExpiry: {
            type: Date,
            select: false,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }

    this.password = await bcrypt.hash(this.password, 12);

    next();
});

userSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
};

userSchema.methods.createPasswordResetToken = function () {
    const rawToken = crypto.randomBytes(32).toString("hex");

    this.passwordResetToken = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");

    this.passwordResetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);

    return rawToken;
};

userSchema.methods.createEmailVerificationToken = function () {
    const rawToken = crypto.randomBytes(32).toString("hex");

    this.emailVerificationToken = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");

    this.emailVerificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    return rawToken;
};

userSchema.methods.toJSON = function () {
    const user = this.toObject();

    delete user.password;
    delete user.refreshToken;
    delete user.passwordResetToken;
    delete user.passwordResetTokenExpiry;
    delete user.emailVerificationToken;
    delete user.emailVerificationTokenExpiry;

    return user;
};

userSchema.index({ email: 1 });
userSchema.index({ username: 1 });

const User = mongoose.model("User", userSchema);

export default User;
