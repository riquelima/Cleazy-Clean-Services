
import React, { useState, useEffect } from 'react';
import { ChatHeader } from './components/ChatHeader';
import { ChatMessages } from './components/ChatMessages';
import { ChatInput } from './components/ChatInput';
import { LoginScreen } from './components/LoginScreen';
import { type Message, Sender, type User, type NewUser } from './types';
import { getBotResponse } from './services/webhookService';
import { SettingsModal } from './components/SettingsModal';
import { supabase } from './services/supabaseClient';
import { DatabaseSetupScreen } from './components/DatabaseSetupScreen';

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState<'checking' | 'setup-required' | 'ready'>('checking');

  const initializeApp = async () => {
    // This robust script ensures the admin user exists with the correct password in the new table.
    const flag = 'admin_user_cleazy_users_v1'; // Use a new flag to re-run for the new table name
    if (!localStorage.getItem(flag)) {
        console.log("Garantindo a configuração do usuário 'cleazy' na tabela 'cleazy_users'...");

        // Step 1: Find any user with a case-insensitive 'cleazy' username.
        const { data: existingAdmin, error: findError } = await supabase
            .from('cleazy_users')
            .select('id, username')
            .ilike('username', 'cleazy')
            .limit(1)
            .maybeSingle(); 

        if (findError) {
            console.error("Erro ao verificar o usuário cleazy:", findError.message);
        } else if (existingAdmin) {
            // Step 2a: User exists. Update password and normalize username to lowercase.
            console.log(`Usuário cleazy encontrado ('${existingAdmin.username}'). Atualizando para credenciais padrão.`);
            const { error: updateError } = await supabase
                .from('cleazy_users')
                .update({ password: '1234', username: 'cleazy' }) // Enforce lowercase username
                .eq('id', existingAdmin.id);

            if (updateError) {
                console.error('Falha ao ATUALIZAR o usuário cleazy:', updateError.message);
            } else {
                console.log('Usuário cleazy atualizado com sucesso.');
                localStorage.setItem(flag, 'true');
            }
        } else {
            // Step 2b: User does not exist. Create it.
            console.log("Usuário 'cleazy' não encontrado. Criando usuário cleazy padrão.");
            const { error: insertError } = await supabase
                .from('cleazy_users')
                .insert({ username: 'cleazy', password: '1234' });

            if (insertError) {
                console.error('Falha ao CRIAR o usuário cleazy:', insertError.message);
            } else {
                console.log('Usuário cleazy criado com sucesso.');
                localStorage.setItem(flag, 'true');
            }
        }
    }
  };

  const checkAndInitialize = async () => {
    setDbStatus('checking');
    // A SELECT with LIMIT 0 is cheap and will fail if the table is not there.
    const { error } = await supabase.from('cleazy_users').select('id').limit(0);

    // 42P01 is PostgreSQL for 'undefined_table'
    if (error && error.code === '42P01') {
        console.warn('Tabela "cleazy_users" não encontrada. Exibindo tela de configuração.');
        setDbStatus('setup-required');
    } else if (error) {
        console.error("Erro inesperado no banco de dados durante a verificação inicial:", error);
        // Show setup screen as a fallback for other DB errors
        setDbStatus('setup-required');
    } else {
        // Table exists, proceed with app initialization
        await initializeApp();
        setDbStatus('ready');
    }
  };

  useEffect(() => {
    checkAndInitialize();
  }, []);

  // Fetch all users once authenticated.
  useEffect(() => {
    const fetchUsers = async () => {
      if (dbStatus !== 'ready') return;
      const { data, error } = await supabase.from('cleazy_users').select('*');
      if (error) {
        console.error('Error fetching users:', error);
      } else {
        setUsers(data || []);
      }
    };
    if (isAuthenticated) {
      fetchUsers();
    }
  }, [isAuthenticated, dbStatus]);

  // Load chat history when the current user changes.
  useEffect(() => {
    if (currentUser) {
      try {
        const storedMessages = localStorage.getItem(`chat_history_${currentUser.username}`);
        setMessages(storedMessages ? JSON.parse(storedMessages) : []);
      } catch (e) {
        console.error("Failed to parse messages from localStorage", e);
        setMessages([]);
      }
    }
  }, [currentUser]);

  // Save chat history when messages change.
  useEffect(() => {
    if (currentUser && isAuthenticated) {
      localStorage.setItem(`chat_history_${currentUser.username}`, JSON.stringify(messages));
    }
  }, [messages, currentUser, isAuthenticated]);

  const handleLogin = async (username: string, pass: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('cleazy_users')
      .select('*')
      .eq('username', username.toLowerCase())
      .eq('password', pass)
      .maybeSingle();
    
    if (error || !data) {
      if (error) {
        // Log only actual database errors, not "no user found" scenarios.
        console.error('Login failed:', error.message);
      }
      return false;
    }

    setCurrentUser(data);
    setIsAuthenticated(true);
    return true;
  };
  
  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const addUser = async (newUser: NewUser): Promise<boolean> => {
    const { data: existingUser, error: findError } = await supabase
        .from('cleazy_users')
        .select('username')
        .eq('username', newUser.username.toLowerCase())
        .single();
    
    if (findError && findError.code !== 'PGRST116') { // PGRST116: "exact one row not found"
        console.error('Error checking for existing user:', findError);
        return false;
    }

    if (existingUser) {
        return false; // User already exists
    }
    
    const { data, error } = await supabase
        .from('cleazy_users')
        .insert([{ ...newUser, username: newUser.username.toLowerCase() }])
        .select()
        .single();
    
    if (error) {
        console.error('Error adding user:', error);
        return false;
    }

    if (data) {
      setUsers(prev => [...prev, data]);
    }
    return true;
};


  const deleteUser = async (username: string) => {
    if (username === 'cleazy') return;
    
    const { error } = await supabase
      .from('cleazy_users')
      .delete()
      .eq('username', username);
      
    if (error) {
        console.error('Error deleting user:', error);
        return;
    }

    setUsers(prev => prev.filter(u => u.username !== username));
    localStorage.removeItem(`chat_history_${username}`);
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    
    const timestamp = new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: Sender.User,
      text,
      timestamp,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const botText = await getBotResponse(text);
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        sender: Sender.Bot,
        text: botText,
        timestamp: new Date().toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        sender: Sender.Bot,
        text: 'Desculpe, ocorreu um erro. Tente novamente em alguns instantes.',
        timestamp: new Date().toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDbSetupComplete = () => {
    // Re-run the check after user claims to have fixed the DB.
    checkAndInitialize();
  };

  if (dbStatus === 'checking') {
    return (
      <div className="bg-white h-screen flex flex-col items-center justify-center font-sans p-4">
        <div className="w-full max-w-sm text-center">
          <div className="flex justify-center mb-6">
              <img 
                src="https://raw.githubusercontent.com/riquelima/Cleazy-Clean-Services/refs/heads/main/logo-transparent.png" 
                alt="Cleazy Clean Services Logo"
                className="w-56 h-auto"
              />
          </div>
          <p className="text-lg text-gray-600 animate-pulse">Verificando banco de dados...</p>
        </div>
      </div>
    );
  }

  if (dbStatus === 'setup-required') {
    return <DatabaseSetupScreen onComplete={handleDbSetupComplete} />;
  }

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="w-full h-full min-h-screen font-sans flex items-center justify-center p-0 sm:p-4 bg-gray-100">
      <div className="w-full sm:w-[95%] h-full sm:h-[calc(100vh-2rem)] sm:max-h-[900px] bg-white flex flex-col overflow-hidden sm:rounded-2xl shadow-2xl">
        <ChatHeader 
          currentUser={currentUser}
          onToggleSettings={() => setIsSettingsOpen(true)}
          onLogout={handleLogout}
        />
        <ChatMessages messages={messages} isLoading={isLoading} />
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        {currentUser?.username === 'cleazy' && (
          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            users={users}
            addUser={addUser}
            deleteUser={deleteUser}
          />
        )}
      </div>
    </div>
  );
};

export default App;
