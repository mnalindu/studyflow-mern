
import { useState } from "react";
import {
  Leaf,
  ArrowLeft,
  ArrowRight,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  Sun,
  Check,
  Flame,
  Sparkles,
} from "lucide-react";

import "./Login.css";
import { loginUser } from "../services/authApi";
import { signInWithGoogle } from "../services/googleAuthApi";
import GoogleSignInButton from "./GoogleSignInButton";
import { useAuth } from "./AuthContext";

// Decorative dashboard preview on the left
function LoginPreview() {
  return (
    <div className="sf-login-preview" aria-hidden="true">
      <span className="sf-login-preview__star sf-login-preview__star--one">
        ✧
      </span>

      <span className="sf-login-preview__star sf-login-preview__star--two">
        ✦
      </span>

      <div className="sf-login-preview__card">
        <div className="sf-login-preview__brand">
          <Leaf size={16} />
          <span>StudyFlow</span>
        </div>

        <h3>
          Hey, future you. <span>✳</span>
        </h3>

        <p>A little progress looks good on you.</p>

        <div className="sf-login-preview__stats">
          <div className="sf-login-preview__stat">
            <span>Tasks done</span>
            <strong>
              08 <small>/10</small>
            </strong>
            <div className="sf-login-preview__progress">
              <div />
            </div>
          </div>

          <div className="sf-login-preview__stat">
            <span>Focus time</span>
            <strong>
              2<small>h</small> 30<small>m</small>
            </strong>

            <div className="sf-login-preview__bars">
              {[8, 12, 15, 18, 13, 22, 17].map(
                (height, index) => (
                  <span
                    key={index}
                    style={{ height: `${height}px` }}
                  />
                )
              )}
            </div>
          </div>
        </div>

        <div className="sf-login-preview__task">
          <Check size={14} />
          <span>Finish one small thing</span>
          <small>Done</small>
        </div>

        <div className="sf-login-preview__task">
          <Check size={14} />
          <span>Keep making progress</span>
          <small>Done</small>
        </div>
      </div>

      <div className="sf-login-preview__badge">
        <span>
          <Flame size={23} />
        </span>

        <div>
          <strong>You're on a roll!</strong>
          <small>Little wins, every day.</small>
        </div>
      </div>

      <div className="sf-login-preview__floating-note">
        <Check size={16} />
        One step closer to your goals
      </div>
    </div>
  );
}

// Left side branding panel
export function LoginStory() {
  return (
    <aside className="sf-login__story">
      <div className="sf-login__story-inner">

        <a
          href="#home"
          className="sf-login__brand"
          aria-label="StudyFlow home"
        >
          <span className="sf-login__brand-icon">
            <Leaf size={28} strokeWidth={1.8} />
          </span>

          <span>
            StudyFlow<span className="sf-login__brand-dot">.</span>
          </span>
        </a>

        <div className="sf-login__story-copy">
          <p className="sf-login__eyebrow">
            <span>•</span>
            A LITTLE STRUCTURE. A LOT MORE POSSIBILITY.
          </p>

          <h2>
            A calmer mind.
            <br />
            A clearer plan.
            <br />
            <span>A brighter you.</span>
          </h2>

          <p className="sf-login__story-description">
            Your goals deserve a little space to grow.
            <br />
            Bring your tasks, focus, and big ideas together
            <br />
            in one happy place.
          </p>
        </div>

        <LoginPreview />

        <div className="sf-login__story-bottom">
          <div className="sf-login__benefits">
            <span>
              <Check size={17} /> Plan smarter
            </span>

            <span>
              <Check size={17} /> Focus better
            </span>

            <span>
              <Check size={17} /> Grow daily
            </span>
          </div>

          <p>MADE FOR YOUR NEXT BIG CHAPTER</p>
        </div>

      </div>
    </aside>
  );
}

// Main login page
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { setAuthenticatedUser } = useAuth();

  
const handleSubmit = async (event) => {
  event.preventDefault();

  setNotice("");

  // Basic validation
  if (!email.trim() || !password) {
    setNotice("Please enter your email and password.");
    return;
  }

  setIsSubmitting(true);

  try {
    // Send credentials to Express backend
    const response = await loginUser({
      email: email.trim(),
      password,
    });

    
    if (response.success && response.user) {
        // Save logged-in user in AuthContext
        setAuthenticatedUser(response.user);

        setNotice("");

        // Navigate to Dashboard
        window.location.hash = "#dashboard";
     }

  } catch (error) {
    // Display backend validation/login errors
    setNotice(
      error.message || "Login failed. Please try again."
    );
  } finally {
    setIsSubmitting(false);
  }
};


  // Google Identity Services gives us a Google ID token.
  // The Express backend verifies the token and sets the usual
  // StudyFlow HttpOnly session cookie. Never store the ID token.
  async function handleGoogleCredential(credential) {
    if (isSubmitting) return;

    setNotice("");
    setIsSubmitting(true);

    try {
      const response = await signInWithGoogle(credential);

      if (!response.success || !response.user) {
        throw new Error("Google sign-in could not be completed.");
      }

      setAuthenticatedUser(response.user);
      window.location.hash = "#dashboard";
    } catch (error) {
      setNotice(error.message || "Google sign-in failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleForgotPassword() {
    setNotice(
      "Password recovery will be available after account authentication is connected."
    );
  }

  return (
    <main className="sf-login">
      <LoginStory />

      <section
        className="sf-login__panel"
        aria-labelledby="sf-login-heading"
      >
        <div className="sf-login__top">
          <a href="#home" className="sf-login__back">
            <ArrowLeft size={18} />
            Back to home
          </a>
        </div>

        <div className="sf-login__content">

          <div className="sf-login__welcome-icon">
            <Sun size={33} strokeWidth={1.9} />
          </div>

          <h1 id="sf-login-heading">
            Hello again, achiever.
            <span> ✦</span>
          </h1>

          <p className="sf-login__subtitle">
            Ready to make progress? Your space is waiting.
          </p>

          <form
            className="sf-login__form"
            onSubmit={handleSubmit}
          >
            {/* Email */}
            <div className="sf-login__form-group">
              <label htmlFor="sf-login-email">
                Email address
              </label>

              <div className="sf-login__input-wrapper">
                <Mail
                  size={21}
                  className="sf-login__input-icon"
                  aria-hidden="true"
                />

                <input
                  id="sf-login-email"
                  type="email"
                  name="email"
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
              <div className="sf-login__label-row">
                <label htmlFor="sf-login-password">
                  Password
                </label>

                <button
                  type="button"
                  className="sf-login__forgot"
                  onClick={handleForgotPassword}
                >
                  Forgot password?
                </button>
              </div>

              <div className="sf-login__input-wrapper">
                <LockKeyhole
                  size={21}
                  className="sf-login__input-icon"
                  aria-hidden="true"
                />

                <input
                  id="sf-login-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setNotice("");
                  }}
                  required
                />

                <button
                  type="button"
                  className="sf-login__eye"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  aria-pressed={showPassword}
                >
                  {showPassword ? (
                    <EyeOff size={21} />
                  ) : (
                    <Eye size={21} />
                  )}
                </button>
              </div>
            </div>

            {/* Login button */}
            <button
              type="submit"
              className="sf-login__submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing in..." : "Log in"}
              <ArrowRight size={20} />
            </button>
          </form>

          {/* Backend status notice */}
          {notice && (
            <p
              className="sf-login__notice"
              role="status"
            >
              {notice}
            </p>
          )}

          <div className="sf-login__divider">
            <span>or</span>
          </div>

          {/* Google Identity Services official sign-in button */}
          <div className="sf-login__google">
            <GoogleSignInButton
              onCredential={handleGoogleCredential}
              busy={isSubmitting}
            />
          </div>

          <p className="sf-login__signup-text">
            A fresh start?{" "}
            <a href="#signup">
              Create your account
            </a>
          </p>
        </div>

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

// Temporary page until we build the Signup UI.
export function SignupComingSoon() {
  return (
    <main className="sf-signup-pending">
      <div className="sf-signup-pending__card">
        <span className="sf-signup-pending__icon">
          <Sparkles size={30} />
        </span>

        <h1>Create your StudyFlow account</h1>

        <p>
          We're preparing your signup page.
          The full registration form will be added
          in the next development step.
        </p>

        <a href="#login">
          <ArrowLeft size={18} />
          Back to log in
        </a>

        <a href="#home" className="sf-signup-pending__home">
          Go to home
        </a>
      </div>
    </main>
  );
}
