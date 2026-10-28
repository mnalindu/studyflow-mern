
import { useState } from "react";
import { registerUser } from "../services/authApi";
import {
  ArrowLeft,
  ArrowRight,
  GraduationCap,
  UserRound,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  Leaf,
} from "lucide-react";

import { LoginStory } from "./Login";
import "./Signup.css";
import { useAuth } from "./AuthContext";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form submission
  
const handleSubmit = async (event) => {
  event.preventDefault();

  setNotice("");

  // Validate form fields
  if (!name.trim() || !email.trim() || !password) {
    setNotice("Please fill in all fields.");
    return;
  }

  if (password.length < 8) {
    setNotice(
      "Password must be at least 8 characters."
    );
    return;
  }

  setIsSubmitting(true);

  try {
    // Send registration data to backend
    const response = await registerUser({
      name: name.trim(),
      email: email.trim(),
      password,
    });

      
    if (response.success && response.user) {
       // Save newly registered user in AuthContext
       setAuthenticatedUser(response.user);

       setNotice("");

       // Navigate to Dashboard
       window.location.hash = "#dashboard";
    }

  } catch (error) {
    setNotice(
      error.message ||
        "Registration failed. Please try again."
    );
  } finally {
    setIsSubmitting(false);
  }
};


  return (
    <main className="sf-login sf-signup">

      {/* Reuse the exact Login left panel */}
      <LoginStory />

      {/* Signup right panel */}
      <section
        className="sf-login__panel sf-signup__panel"
        aria-labelledby="sf-signup-title"
      >

        {/* Back to home */}
        <div className="sf-login__top">
          <a href="#home" className="sf-login__back">
            <ArrowLeft size={18} />
            Back to home
          </a>
        </div>

        <div className="sf-signup__content">

          {/* Welcome Icon */}
          <div className="sf-signup__welcome-icon">
            <GraduationCap
              size={34}
              strokeWidth={1.9}
            />
          </div>

          {/* Heading */}
          <h1 id="sf-signup-title">
            Your next chapter starts
            <br />
            here.
          </h1>

          <p className="sf-signup__subtitle">
            A fresh start, a little focus, and a space
            that's yours.
          </p>

          {/* Login / Signup Navigation */}
          <nav
            className="sf-signup__tabs"
            aria-label="Account pages"
          >
            <a href="#login" className="sf-signup__tab">
              Log in
            </a>

            <span
              className="sf-signup__tab sf-signup__tab--active"
              aria-current="page"
            >
              Create account
            </span>
          </nav>

          {/* Registration Form */}
          <form
            className="sf-login__form sf-signup__form"
            onSubmit={handleSubmit}
          >

            {/* Full Name */}
            <div className="sf-login__form-group">
              <label htmlFor="sf-signup-name">
                What should we call you?
              </label>

              <div className="sf-login__input-wrapper">
                <UserRound
                  size={21}
                  className="sf-login__input-icon"
                  aria-hidden="true"
                />

                <input
                  id="sf-signup-name"
                  name="name"
                  type="text"
                  placeholder="Your name"
                  autoComplete="name"
                  maxLength={80}
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    setNotice("");
                  }}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="sf-login__form-group">
              <label htmlFor="sf-signup-email">
                Email address
              </label>

              <div className="sf-login__input-wrapper">
                <Mail
                  size={21}
                  className="sf-login__input-icon"
                  aria-hidden="true"
                />

                <input
                  id="sf-signup-email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setNotice("");
                  }}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="sf-login__form-group">
              <label htmlFor="sf-signup-password">
                Password
              </label>

              <div className="sf-login__input-wrapper">
                <LockKeyhole
                  size={21}
                  className="sf-login__input-icon"
                  aria-hidden="true"
                />

                <input
                  id="sf-signup-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  autoComplete="new-password"
                  minLength={8}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setNotice("");
                  }}
                  aria-describedby="sf-signup-password-hint"
                  required
                />

                <button
                  type="button"
                  className="sf-login__eye"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  aria-pressed={showPassword}
                  onClick={() =>
                    setShowPassword((current) => !current)
                  }
                >
                  {showPassword ? (
                    <EyeOff size={21} />
                  ) : (
                    <Eye size={21} />
                  )}
                </button>
              </div>

              <p
                className="sf-signup__password-hint"
                id="sf-signup-password-hint"
              >
                Use at least 8 characters.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="sf-login__submit sf-signup__submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                 ? "Creating account..." : "Create account"}
                 
              <ArrowRight size={20} />
            </button>
          </form>

          {/* UI-only notice */}
          {notice && (
            <p
              className="sf-login__notice"
              role="status"
            >
              {notice}
            </p>
          )}

          {/* Divider */}
          <div className="sf-login__divider sf-signup__divider">
            <span>or</span>
          </div>

          {/* Back to Login */}
          <p className="sf-login__signup-text sf-signup__login-text">
            Already have an account?{" "}
            <a href="#login">
              Log in
            </a>
          </p>
        </div>

        {/* Footer */}
        <footer className="sf-login__footer">
          <span>© 2026 StudyFlow</span>

          <span>
            A little more focused. A little more you.
            <Leaf size={14} />
          </span>
        </footer>

      </section>
    </main>
  );
}
