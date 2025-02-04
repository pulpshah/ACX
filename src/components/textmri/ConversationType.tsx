"use client";
import { useState } from "react";

export interface ConversationTypeProps {
  onSelect: (type: string) => void;
  initialType?: string;
}

const conversationTypes = [
  {
    id: "turn-based",
    label: "Turn Based",
    description: "Analysis of conversation turns between participants",
  },
  {
    id: "essay",
    label: "Essay",
    description: "Analysis of a complete essay or article",
  },
  {
    id: "turn-group",
    label: "Turn vs Group of Turns",
    description: "Compare individual turns against groups of turns",
  },
  {
    id: "comments",
    label: "Comment Section",
    description: "Analysis of comments from a URL",
  },
];

export default function ConversationType({ onSelect }: ConversationTypeProps) {
  const [selected, setSelected] = useState<string>("");

  const handleSelect = (type: string) => {
    setSelected(type);
    onSelect(type);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Select Conversation Type</h2>
        <p className="text-gray-400">Choose how you want to analyze the text</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {conversationTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => handleSelect(type.id)}
            className={`p-4 rounded-lg border ${
              selected === type.id
                ? "border-purple-500 bg-purple-500/10"
                : "border-gray-700 hover:border-purple-500/50"
            } transition-all`}
          >
            <h3 className="font-semibold text-lg mb-1">{type.label}</h3>
            <p className="text-gray-400 text-sm">{type.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
