import React, { useState, useEffect } from 'react';
import FrontendApp from './components/FrontendApp';
import AdminDashboard from './components/AdminDashboard';
import { db } from './services/storage';
import { Lock, ShieldCheck } from 'lucide-react';
import { AdminAccount } from './types';

const App: React.FC = () => {
  const [isAuthenticatedUser, setIsAuthenticatedUser] = useState(false);
  const [isAuthenticatedAdmin, setIsAuthenticatedAdmin] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState<AdminAccount | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  // Login Form States
  const [userPwd, setUserPwd] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminPwd, setAdminPwd] = useState('');
  const [loginMode, setLoginMode] = useState<'USER' | 'ADMIN'>('USER');
  const [errorMsg, setErrorMsg] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
        const { role, userId } = db.getSession();
        if (role === 'USER') {
          setIsAuthenticatedUser(true);
        } else if (role === 'ADMIN' && userId) {
          const admin = await db.getAdminById(userId);
          if (admin) {
            setIsAuthenticatedAdmin(true);
            setCurrentAdmin(admin);
          } else {
            db.clearSession();
          }
        }
        setIsLoading(false);
    };
    checkSession();
  }, []);

  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const currentFrontendPwd = await db.getFrontendPassword();
    setIsLoading(false);
    
    if (userPwd === currentFrontendPwd) {
      setIsAuthenticatedUser(true);
      setErrorMsg('');
      if (rememberMe) {
        db.setSession('USER');
      }
    } else {
      setErrorMsg('密碼錯誤，請重新輸入');
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const admin = await db.verifyAdmin(adminName, adminPwd);
    setIsLoading(false);
    
    if (admin) {
      setIsAuthenticatedAdmin(true);
      setCurrentAdmin(admin);
      setErrorMsg('');
      if (rememberMe) {
        db.setSession('ADMIN', admin.id);
      }
    } else {
      setErrorMsg('帳號或密碼錯誤');
    }
  };

  const handleLogout = () => {
    setIsAuthenticatedUser(false);
    setIsAuthenticatedAdmin(false);
    setCurrentAdmin(undefined);
    db.clearSession();
    setUserPwd('');
    setAdminPwd('');
    setAdminName('');
  };

  if (isLoading) {
      return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">Loading...</div>;
  }

  if (isAuthenticatedAdmin && currentAdmin) {
    return <AdminDashboard 
      currentUser={currentAdmin}
      onLogout={handleLogout} 
      onGoToFrontend={() => {
        setIsAuthenticatedAdmin(false);
        setIsAuthenticatedUser(true);
      }}
    />;
  }

  if (isAuthenticatedUser) {
    return <FrontendApp 
      onLogout={handleLogout} 
      onGoToAdmin={() => {
        handleLogout();
        setLoginMode('ADMIN');
      }}
    />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 p-4">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-md">
        <div className="flex text-sm font-bold text-center border-b bg-gray-50">
          <button 
            onClick={() => { setLoginMode('USER'); setErrorMsg(''); }}
            className={`flex-1 py-4 uppercase tracking-wider transition-all border-t-4 ${
              loginMode === 'USER' 
                ? 'bg-white text-primary border-primary' 
                : 'bg-gray-100 text-gray-400 border-transparent hover:bg-gray-50'
            }`}
          >
            員工點餐
          </button>
          <button 
            onClick={() => { setLoginMode('ADMIN'); setErrorMsg(''); }}
            className={`flex-1 py-4 uppercase tracking-wider transition-all border-t-4 ${
              loginMode === 'ADMIN' 
                ? 'bg-white text-slate-800 border-slate-800' 
                : 'bg-gray-100 text-gray-400 border-transparent hover:bg-gray-50'
            }`}
          >
            後台管理
          </button>
        </div>

        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-800 mb-2">羿鈞科技</h1>
            <p className="text-slate-500 text-sm">訂餐、揪團系統</p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded border border-red-200 text-center">
              {errorMsg}
            </div>
          )}

          {loginMode === 'USER' ? (
            <form onSubmit={handleUserLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">請輸入密碼</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                  <input 
                    type="password" 
                    value={userPwd}
                    onChange={e => setUserPwd(e.target.value)}
                    className="pl-10 w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    placeholder="請輸入密碼" 
                    autoComplete="current-password"
                  />
                </div>
              </div>
              
              <div className="flex items-center">
                <input 
                  id="remember-user" 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary bg-white"
                />
                <label htmlFor="remember-user" className="ml-2 block text-sm text-slate-600 cursor-pointer">
                  保持登入 (Remember me)
                </label>
              </div>

              <button type="submit" className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors">
                開始點餐
              </button>
            </form>
          ) : (
             <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">系統帳號</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-3 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    value={adminName}
                    onChange={e => setAdminName(e.target.value)}
                    className="pl-10 w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none"
                    placeholder="請輸入系統帳號" 
                    autoComplete="username"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">管理密碼</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                  <input 
                    type="password" 
                    value={adminPwd}
                    onChange={e => setAdminPwd(e.target.value)}
                    className="pl-10 w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none"
                    placeholder="請輸入管理密碼" 
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <div className="flex items-center pt-2">
                <input 
                  id="remember-admin" 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-slate-800 border-gray-300 rounded focus:ring-slate-800 bg-white"
                />
                <label htmlFor="remember-admin" className="ml-2 block text-sm text-slate-600 cursor-pointer">
                  保持登入 (Remember me)
                </label>
              </div>

              <button type="submit" className="w-full bg-slate-800 text-white py-3 rounded-lg font-bold hover:bg-slate-900 transition-colors mt-2">
                登入後台
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;