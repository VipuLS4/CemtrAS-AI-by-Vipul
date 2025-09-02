import React from "react";

interface ChatHistoryListProps {
  history: { id: string; title: string }[];
  onSelect: (id: string) => void;
}

export const ChatHistoryList: React.FC<ChatHistoryListProps> = ({ history, onSelect }) => {
  return (
    <div className="h-full flex flex-col p-3" role="region" aria-label="Chat history">
      <h2 className="text-lg font-bold mb-3 text-gray-800" id="chat-history-title">Chat History</h2>

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1" role="list" aria-labelledby="chat-history-title">
        {history.length === 0 ? (
          <p className="text-sm text-gray-500 italic" role="status">No chats yet</p>
        ) : (
          history.map((chat) => (
            <button
              key={chat.id}
              onClick={() => onSelect(chat.id)}
              className="w-full text-left px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 
                         text-gray-800 text-sm shadow-sm transition"
              role="listitem"
              aria-label={`Load chat: ${chat.title}`}
            >
              {chat.title}
            </button>
          ))
        )}
      </div>
    </div>
  );
};
