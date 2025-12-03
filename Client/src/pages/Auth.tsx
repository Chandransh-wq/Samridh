import { useState } from "react";
import Input from "../Components/Input";
import { Theme } from "../assets/Theme";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "../utils/authServies";

interface authProps {
  darkMode: boolean;
}

const Auth: React.FC<authProps> = ({ darkMode }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const navigate = useNavigate();

  const submit = () => {
    if (!isLogin) {
      if (password !== confirm) {
        alert("Passwords do not match.");
        return;
      }
      const res = registerUser({ name, email, password }, darkMode);
      if (res.success) navigate("/");
    } else {
      const res = loginUser(email, password, darkMode);
      if (res.success) navigate("/");
    }
  };

  const cardBg = darkMode ? Theme.dark.secondary : Theme.light.secondary;
  const textColor = darkMode ? "text-white" : "text-black";

  return (
    <div
      className={`absolute left-0 w-screen h-screen flex justify-center items-center overflow-hidden ${
        darkMode ? "bg-gray-900" : "bg-gray-100"
      }`}
    >
      {/* Animated blobs */}
      <div className="absolute w-full h-full top-0 left-0">
        <div
          className="absolute w-80 h-80 rounded-full blur-3xl opacity-60 animate-blob mix-blend-multiply"
          style={{
            background: darkMode ? "#6366F1" : "#60A5FA",
            top: "20%",
            left: "15%",
          }}
        />
        <div
          className="absolute w-72 h-72 rounded-full blur-3xl opacity-60 animate-blob mix-blend-multiply animation-delay-2000"
          style={{
            background: darkMode ? "#F472B6" : "#A78BFA",
            top: "50%",
            left: "60%",
          }}
        />
        <div
          className="absolute w-72 h-72 rounded-full blur-3xl opacity-60 animate-blob mix-blend-multiply animation-delay-4000"
          style={{
            background: darkMode ? "#34D399" : "#FBBF24",
            top: "70%",
            left: "25%",
          }}
        />
      </div>

      {/* Card */}
      <div
        className={`relative z-10 w-full max-w-md p-8 rounded-2xl shadow-2xl ${cardBg} ${textColor}`}
        style={{
          boxShadow: darkMode
            ? "0 10px 40px rgba(255,255,255,0.08)"
            : "0 10px 40px rgba(0,0,0,0.15)",
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold tracking-wide">
            {isLogin ? "Login" : "Create an Account"}
          </h2>
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm underline opacity-70 hover:opacity-100 transition"
          >
            {isLogin ? "Register?" : "Login?"}
          </button>
        </div>

        {/* Inputs */}
        <div className="flex flex-col gap-4">
          {!isLogin && (
            <Input
              placeholder="Your name"
              darkMode={darkMode}
              type="text"
              onChange={(e) => setName(e.target.value)}
            />
          )}
          <Input
            placeholder="Email"
            darkMode={darkMode}
            type="email"
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            placeholder="Password"
            darkMode={darkMode}
            type="password"
            onChange={(e) => setPassword(e.target.value)}
          />
          {!isLogin && (
            <Input
              placeholder="Confirm password"
              darkMode={darkMode}
              type="password"
              onChange={(e) => setConfirm(e.target.value)}
            />
          )}
        </div>

        {/* Submit button */}
        <button
          onClick={submit}
          className="w-full py-2 mt-6 rounded-md bg-blue-600 text-white font-semibold text-lg hover:scale-105 active:scale-95 transition-transform duration-150"
        >
          {isLogin ? "Login" : "Register"}
        </button>
      </div>
    </div>
  );
};

export default Auth;
