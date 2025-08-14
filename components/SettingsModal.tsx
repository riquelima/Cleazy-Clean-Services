

import React, { useState } from 'react';
import { type User, type NewUser } from '../types';
import { TrashIcon, UserAvatarIcon } from './icons';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  addUser: (user: NewUser) => Promise<boolean>;
  deleteUser: (username: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  users,
  addUser,
  deleteUser,
}) => {
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) {
    return null;
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword.trim()) {
      setError('Usuário e senha são obrigatórios.');
      return;
    }
    setIsLoading(true);
    setError('');
    const success = await addUser({ username: newUsername, password: newPassword });
    if (success) {
      setNewUsername('');
      setNewPassword('');
    } else {
        setError('Este nome de usuário já está em uso.');
    }
    setIsLoading(false);
  };
  
  const managedUsers = users.filter(user => user.username !== 'cleazy');

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-md text-gray-800 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <h2 id="settings-title" className="text-xl font-semibold text-gray-900">Configurações de Usuários</h2>
          <p className="text-sm text-gray-500 mt-1">Adicione ou remova usuários do sistema.</p>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Add User Form */}
          <form onSubmit={handleAddUser} className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2 mb-3">Adicionar Novo Usuário</h3>
            <div>
              <label htmlFor="new-username" className="block text-sm font-medium text-gray-700 mb-2">Novo Usuário</label>
              <input
                id="new-username"
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="ex: joao.silva"
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="new-password"className="block text-sm font-medium text-gray-700 mb-2">Nova Senha</label>
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button 
              type="submit" 
              className="w-full p-2 rounded-lg text-white font-semibold bg-cyan-500 hover:bg-cyan-600 transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Adicionando...' : 'Adicionar Usuário'}
            </button>
          </form>

          {/* User List */}
          <div className="space-y-3">
             <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2 mb-3">Usuários Atuais</h3>
            {managedUsers.length === 0 ? (
              <div className="text-center py-4 px-2 bg-gray-50 rounded-lg">
                <p className="text-gray-500 text-sm">Nenhum usuário foi adicionado ainda.</p>
              </div>
            ) : (
              managedUsers.map((user) => (
                <div key={user.username} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                      <UserAvatarIcon className="w-8 h-8" />
                      <span className="font-medium text-gray-800">{user.username}</span>
                  </div>
                  <button 
                    onClick={() => deleteUser(user.username)}
                    className="p-1.5 rounded-full text-gray-500 hover:bg-red-100 hover:text-red-600 transition-colors"
                    aria-label={`Deletar usuário ${user.username}`}
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end flex-shrink-0">
          <button 
            onClick={onClose} 
            className="px-4 py-2 rounded-lg font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};