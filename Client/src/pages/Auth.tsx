import { useState, useRef } from "react"; // Added useRef
import Input from "../Components/Input";
import { loginUser, registerUser } from "../assets/Services/auth.service.ts";
import { useNavigate } from "react-router-dom";

interface authProps {
  darkMode: boolean;
}

const Auth: React.FC<authProps> = ({ darkMode }) => {
  const navigate = useNavigate();

  const [registering, setRegistering] = useState(true);
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cPass, setCPass] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");

  // Create a reference to the hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Centralized logic to handle the file (from any source)
  const handleFile = (file: File | undefined) => {
    if (file && file.type.startsWith("image/")) {
      setAvatar(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Triggers the hidden input's click event
  const handleClickZone = () => {
    fileInputRef.current?.click();
  };
  const user = {
    email: email,
    password: password,
  };

  const handleAction = async () => {
    // 1. Function to convert File to Base64 String
    const getBase64 = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
      });
    };

    if (!registering) {
      loginUser(user, navigate, darkMode);
    } else {
      let finalAvatar = "";

      // 2. If an avatar exists, convert it to a string
      if (avatar) {
        try {
          finalAvatar = await getBase64(avatar);
        } catch (err) {
          console.error("Error processing image:", err);
        }
      }

      const newUser = {
        email: email,
        username: userName,
        password: password,
        avatarURL: finalAvatar, // Now this is a valid String!
      };

      registerUser(newUser, navigate, darkMode);
    }
  };

  return (
    <>
      {/* Hidden File Input for Device Selection */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleFile(e.target.files?.[0])}
        accept="image/*"
        className="hidden"
      />

      {/* DESKTOP VIEW */}
      <div
        className={`absolute left-0 w-screen h-screen hidden md:flex justify-center items-center overflow-hidden ${
          darkMode ? "bg-gray-900" : "bg-gray-100"
        }`}
      >
        <div
          className="hidden md:flex h-80 w-80 rounded-full mr-96 items-center justify-center overflow-hidden shadow-xl"
          id="blob"
        >
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover pointer-events-none"
          >
            <source src="/Untitled design.mp4" type="video/mp4" />
          </video>
        </div>

        <div className="absolute left-[50%] text-2xl text-black bg-white p-6 rounded-xl shadow-2xl w-[25%] min-w-[320px] z-10">
          <h2 className="font-bold mb-4">
            {registering ? "Sign-Up" : "Sign-In"}
          </h2>
          <div className="space-y-2">
            {registering && (
              <Input
                darkMode={darkMode}
                placeholder="Enter your name"
                type="text"
                onChange={(e) => setUserName(e.target.value)}
              />
            )}
            <Input
              darkMode={darkMode}
              placeholder="Enter your email-ID"
              type="text"
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              darkMode={darkMode}
              placeholder={
                registering ? "Select a password" : "Enter your password"
              }
              type="password"
              onChange={(e) => setPassword(e.target.value)}
            />
            {registering && (
              <Input
                darkMode={darkMode}
                placeholder="Re-Enter your password"
                type="password"
                onChange={(e) => setCPass(e.target.value)}
              />
            )}
          </div>
          <div
            className="text-xs mt-3 text-blue-500 cursor-pointer hover:underline"
            onClick={() => setRegistering(!registering)}
          >
            {registering
              ? "Already have an account?"
              : "New User? Create Account"}
          </div>
          <button
            className="bg-blue-600 text-sm font-bold p-3 w-full text-white rounded-md mt-4 shadow-md hover:bg-blue-700 transition-all"
            onClick={() => handleAction()}
          >
            {registering ? "Sign-Up" : "Sign-In"}
          </button>
        </div>

        {/* Desktop Avatar Zone (Click or Drag) */}
        {registering && (
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={handleClickZone} // Click to open file picker
            className={`cursor-pointer h-46 w-64 rounded-full border-2 border-dashed transition-all flex items-center justify-center text-center p-1 relative -left-40 group
            ${
              preview
                ? "border-green-500"
                : "border-gray-400 hover:border-blue-400"
            } 
            ${
              darkMode ? "bg-gray-800 text-gray-300" : "bg-white text-zinc-600"
            }`}
          >
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="h-full w-full object-cover rounded-full"
              />
            ) : (
              <div className="text-xs pointer-events-none">
                <p className="font-bold">Drag or Click</p>
                <p className="opacity-60">to select picture</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MOBILE VIEW */}
      <div className="md:hidden flex h-screen items-center justify-center w-full p-1 bg-zinc-100">
        <div className="mx-2 mt-1 text-2xl text-black bg-white p-6 rounded-2xl shadow-2xl shadow-[#363535a8] w-[calc(100%-1rem)] min-w-[320px] z-10">
          <h2 className="font-bold mb-4">
            {registering ? "Sign-Up" : "Sign-In"}
          </h2>
          <div className="space-y-2 flex flex-col items-center">
            {/* Mobile Avatar Zone (Click or Drag) */}
            {registering && (
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={handleClickZone}
                className={`cursor-pointer h-32 w-32 rounded-full border-2 border-dashed transition-all flex items-center justify-center text-center p-1 mb-2
                ${preview ? "border-green-500" : "border-gray-400"} 
                ${
                  darkMode
                    ? "bg-gray-800 text-gray-300"
                    : "bg-white text-zinc-600"
                }`}
              >
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="h-full w-full object-cover rounded-full"
                  />
                ) : (
                  <div className="text-[10px] pointer-events-none">
                    <p className="font-bold">Tap to Upload</p>
                  </div>
                )}
              </div>
            )}
            {/* Form Inputs */}
            <div className="w-full">
              {registering && (
                <Input
                  darkMode={darkMode}
                  placeholder="Enter your name"
                  type="text"
                  onChange={(e) => setUserName(e.target.value)}
                />
              )}
              <Input
                darkMode={darkMode}
                placeholder="Enter your email-ID"
                type="text"
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                darkMode={darkMode}
                placeholder={
                  registering ? "Select a password" : "Enter your password"
                }
                type="password"
                onChange={(e) => setPassword(e.target.value)}
              />
              {registering && (
                <Input
                  darkMode={darkMode}
                  placeholder="Re-Enter your password"
                  type="password"
                  onChange={(e) => setCPass(e.target.value)}
                />
              )}
            </div>
          </div>
          <div
            className="text-xs mt-3 text-blue-500 cursor-pointer hover:underline"
            onClick={() => setRegistering(!registering)}
          >
            {registering
              ? "Already have an account?"
              : "New User? Create Account"}
          </div>
          <button
            className="bg-blue-600 text-sm font-bold p-3 w-full text-white rounded-md mt-4 shadow-md"
            disabled={registering && (password !== cPass || password === "")}
            onClick={() => handleAction()}
          >
            {registering ? "Sign-Up" : "Sign-In"}
          </button>
        </div>
      </div>
    </>
  );
};

export default Auth;
