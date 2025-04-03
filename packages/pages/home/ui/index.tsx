import { Link } from "react-router-dom";

export const Home = () => {
  return (
    <div>
      <h1>Welcome to Viking Survivors</h1>
      <Link to="/selectionscreen">Login</Link>
    </div>
  );
};
