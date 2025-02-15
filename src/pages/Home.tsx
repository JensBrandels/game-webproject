import { Link } from "react-router-dom"

const Home = () => {
  return (
    <div>
      <h1>Welcome to Viking Survivors</h1>
      <Link to="/character-select">Login</Link>
    </div>
  )
}

export default Home