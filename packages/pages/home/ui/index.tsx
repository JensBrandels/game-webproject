import "./style.scss";
import { Link } from "react-router-dom";

export const Home = () => {
  return (
    <div className="home-container">
      <h1 className="home-title">Welcome to Viking Survivors</h1>
      <Link to="/selectionscreen">Login</Link>
    </div>
  );
};
