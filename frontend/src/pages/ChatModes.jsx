import React from "react";

export default function ChatModes() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-3">Chat Modes</h1>

      <div className="card p-4">
        <p>Chat modes allow you to make the assistant behave differently.</p>
        <ul className="mt-3">
          <li>• Default AI mode</li>
          <li>• Study mode</li>
          <li>• Task helper mode</li>
          <li>• Mentor mode</li>
          <li>• Motivation mode</li>
        </ul>
      </div>
    </div>
  );
}
