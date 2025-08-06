import { Link } from "react-router-dom";
import { useState } from "react";
import LoginModal from "./LoginModal";
import { useUser } from "../contexts/UserContext";

const Header = () => {
  const { user, isLoggedIn, login, logout, register } = useUser();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleLogin = async (username, password) => {
    const result = await login(username, password);
    if (result.success) {
      setShowLoginModal(false);
    } else {
      // 显示错误信息
      alert(result.error);
    }
  };

  const handleRegister = async (username, password) => {
    const result = await register(username, password);
    if (result.success) {
      setShowLoginModal(false);
    } else {
      alert(result.error);
    }
  };

  const handleLogout = () => {
    logout();
  }; 

  return (
    <>
      <header className="bg-blue-600 text-white px-4 py-3 flex justify-between items-center">
        <Link to="/">
          <h1 className="text-xl font-semibold">🧪 LabTrack</h1>
        </Link>
        
        <nav className="space-x-4 flex items-center">
          {isLoggedIn ? (
            <>
              <span className="text-sm">Welcome, {user.username}!</span>
              <button
                onClick={handleLogout}
                className="hover:underline text-white bg-red-500 px-3 py-1 rounded text-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="hover:underline text-white bg-blue-500 px-3 py-1 rounded text-sm"
            >
              Login
            </button>
          )}
        </nav>
      </header>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />
    </>
  );
};

export default Header;