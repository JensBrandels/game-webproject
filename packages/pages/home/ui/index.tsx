import "./style.scss";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const Home = () => {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  const navigate = useNavigate();

  return (
    <div className="home-container">
      <h1 className="home-title">Welcome to Viking Survivors</h1>
      <div className="home-content">
        <div className="home-about">
          <p>
            Viking Survivors is a fast-paced, web-based action roguelike
            inspired by Vampire Survivors.
            <br />
            <br /> Battle endless waves of enemies, collect powerful items, and
            survive as long as you can — all in your browser, no downloads
            needed. Choose your Viking, master your build, and fight for glory.
          </p>
        </div>

        <div className="home-login">
          <div className="tab-buttons">
            <button
              className={activeTab === "login" ? "active" : ""}
              onClick={() => setActiveTab("login")}
            >
              Login
            </button>
            <button
              className={activeTab === "register" ? "active" : ""}
              onClick={() => setActiveTab("register")}
            >
              Create Account
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "login" && (
              <motion.div
                key="login"
                className="tab-content"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <form
                  className="login"
                  onSubmit={(e) => {
                    e.preventDefault(); // prevent page reload
                    navigate("/selectionscreen");
                  }}
                >
                  <label>Email</label>
                  <input type="email" placeholder="Enter your email" />
                  <label>Password</label>
                  <input type="password" placeholder="Enter your password" />
                  <button type="submit">Login</button>
                </form>
              </motion.div>
            )}

            {activeTab === "register" && (
              <motion.div
                key="register"
                className="tab-content"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <form className="create-account">
                  <label>Username</label>
                  <input type="text" placeholder="Choose a username" />
                  <label>Email</label>
                  <input type="email" placeholder="Enter your email" />
                  <label>Password</label>
                  <input type="password" placeholder="Create a password" />
                  <button type="submit">Create Account</button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
