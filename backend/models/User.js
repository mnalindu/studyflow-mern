const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // Required for email/password accounts, optional for Google-only accounts.
    // Never return the hash from ordinary user queries.
    passwordHash: {
      type: String,
      required: function () {
        return !this.googleId;
      },
      select: false,
    },

    // Stable Google account identifier ("sub" from a VERIFIED ID token).
    // Not the email address: Google account emails can change.
    googleId: {
      type: String,
      trim: true,
      select: false,
      maxlength: 255,
    },
  },
  {
    timestamps: true,
  }
);

// Existing users without googleId are not affected by this index.
// A Google account can be linked to only one StudyFlow account.
userSchema.index(
  { googleId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      googleId: { $type: "string" },
    },
    name: "unique_google_account_id",
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
