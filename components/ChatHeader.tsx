
import React from 'react';
import { type User } from '../types';
import { SettingsIcon, LogoutIcon, WebsiteIcon } from './icons';

interface ChatHeaderProps {
  currentUser: User | null;
  onToggleSettings: () => void;
  onLogout: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ currentUser, onToggleSettings, onLogout }) => {

  return (
    <div className="p-4 bg-white text-gray-800 border-b border-gray-200 flex-shrink-0 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <img
          src="https://raw.githubusercontent.com/riquelima/Cleazy-Clean-Services/refs/heads/main/logo-transparent.png"
          alt="Cleazy Clean Services Logo"
          className="w-32 h-auto"
        />
        <div>
          <h1 className="text-lg font-bold text-gray-900">Cleazy Clean Services</h1>
          <div className="flex items-center mt-1">
            <span className="h-2 w-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
            <p className="text-sm font-medium text-gray-500">Online - Assistente de Orçamento</p>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {currentUser?.username === 'cleazy' && (
            <>
              <a
                href="https://cleazy-clean.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                aria-label="Abrir site"
              >
                <WebsiteIcon className="w-6 h-6" />
              </a>
              <button 
                onClick={onToggleSettings}
                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                aria-label="Abrir configurações"
              >
                <SettingsIcon className="w-6 h-6" />
              </button>
            </>
        )}
        <button 
          onClick={onLogout}
          className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
          aria-label="Sair"
        >
          <LogoutIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};