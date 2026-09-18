function AuthPage({
  authMode,
  setAuthMode,
  loginForm,
  setLoginForm,
  signupForm,
  setSignupForm,
  login,
  signup,
  authError,
}) {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="brand-row">
          <div className="brand-dot" />
          <h1>Task Management</h1>
        </div>

        <div className="auth-toggle">
          <button
            className={authMode === "login" ? "toggle-btn active" : "toggle-btn"}
            onClick={() => setAuthMode("login")}
          >
            Login
          </button>
          <button
            className={authMode === "signup" ? "toggle-btn active" : "toggle-btn"}
            onClick={() => setAuthMode("signup")}
          >
            Sign Up
          </button>
        </div>

        {authMode === "login" ? (
          <div className="auth-form">
            <input
              type="text"
              placeholder="Username"
              value={loginForm.username}
              onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
            />
            <input
              type="password"
              placeholder="Password"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
            />
            <button className="primary-btn" onClick={login}>Login</button>
          </div>
        ) : (
          <div className="auth-form">
            <input
              type="text"
              placeholder="Full Name"
              value={signupForm.first_name}
              onChange={(e) => setSignupForm({ ...signupForm, first_name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Username"
              value={signupForm.username}
              onChange={(e) => setSignupForm({ ...signupForm, username: e.target.value })}
            />
            <input
              type="password"
              placeholder="Password"
              value={signupForm.password}
              onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
            />
            <button className="primary-btn" onClick={signup}>Create Account</button>
          </div>
        )}
        {authError && <p className="auth-error">{authError}</p>}
      </div>
    </div>
  );
}

export default AuthPage;
