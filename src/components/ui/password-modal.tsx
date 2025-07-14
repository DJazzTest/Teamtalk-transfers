import React, { useState } from "react";

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  correctPassword: string;
}

const PasswordModal: React.FC<PasswordModalProps> = ({ isOpen, onClose, onSuccess, correctPassword }) => {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input === correctPassword) {
      setError("");
      setInput("");
      onSuccess();
      onClose();
    } else {
      setError("Incorrect password");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs">
        <h2 className="text-lg font-bold mb-4 text-blue-700">Admin Access</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={input}
            onChange={e => setInput(e.target.value)}
            className="w-full mb-2 p-2 border border-gray-300 rounded"
            placeholder="Enter password"
            autoFocus
          />
          {error && <div className="text-red-600 text-xs mb-2">{error}</div>}
          <div className="flex gap-2 mt-2">
            <button type="submit" className="flex-1 bg-blue-700 text-white py-2 rounded hover:bg-blue-800">Enter</button>
            <button type="button" className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordModal;
