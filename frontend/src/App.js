import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn, useAuth } from "@clerk/clerk-react";
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import api, { setTokenGetter } from './services/api';

const clerkPubKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  console.warn("Missing REACT_APP_CLERK_PUBLISHABLE_KEY");
}

function AuthSynchronizer() {
  const { getToken } = useAuth();
  useEffect(() => {
    setTokenGetter(getToken);
  }, [getToken]);
  return null;
}

function RequireAppUser({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await api.auth.getMe();
        setUser(userData);
      } catch (err) {
        console.error("Failed to load user data", err);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="glass-panel rounded-3xl p-8 text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground font-body">Loading Profile...</p>
        </div>
      </div>
    );
  }

  return React.cloneElement(children, { user, setUser });
}

function AppRouter() {
  const navigate = useNavigate();
  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      navigate={(to) => navigate(to)}
    >
      <AuthSynchronizer />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/dashboard"
          element={
            <>
              <SignedIn>
                <RequireAppUser>
                  <Dashboard />
                </RequireAppUser>
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn afterSignInUrl="/dashboard" />
              </SignedOut>
            </>
          }
        />
      </Routes>
    </ClerkProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" richColors />
      <AppRouter />
    </BrowserRouter>
  );
}

export default App;
