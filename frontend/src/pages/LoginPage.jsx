import LoginForm from "../components/auth/LoginForm";

const LoginPage = () => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-100 dark:bg-gray-900">
      {/* Left branding panel */}
      <div className="hidden md:flex md:w-1/2 items-center justify-center bg-blue-600 dark:bg-blue-900 text-white p-10">
        <div className="max-w-md text-center">
          <h1 className="text-4xl font-bold mb-4">Talent Gate</h1>
          {/* <img
            src="/assets/static/login-illustration.svg"
            alt="Login Illustration"
            className="mt-6 w-3/4 mx-auto"
          /> */}
        </div>
      </div>

      {/* Right login form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
