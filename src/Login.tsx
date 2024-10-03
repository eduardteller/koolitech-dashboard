import { CircleUserRound, KeyRound, LogIn } from "lucide-react";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { z } from "zod";
import Footer from "./Components/Footer";
import Header from "./Components/Header";

const loginSchema = z.object({
  username: z.string().min(1, "Sisestage Kasutajanimi"),
  password: z.string().min(1, "Sisestage Salasõna"),
});

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState({
    username: false,
    password: false,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: { target: { name: string; value: string } }) => {
    const { name, value } = e.target;
    setCredentials((prevData) => ({ ...prevData, [name]: value }));
  };

  const sendLogin = async () => {
    const validation = loginSchema.safeParse(credentials);
    if (!validation.success) {
      validation.error.errors.forEach((error) => {
        toast.error(error.message);
        setError((prevData) => ({ ...prevData, [error.path[0]]: true }));
      });
      return;
    } else {
      setError({
        username: false,
        password: false,
      });
    }

    const { username, password } = credentials;
    setLoading(true);
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("token", data.token);
      document.location.href = "/client";
    } else {
      toast.error("Vale kasutajanimi või salasõna");
    }
    setLoading(false);
  };
  return (
    <>
      <div>
        <Toaster />
      </div>
      <main className="bg-base-200 font-inter h-screen">
        <Header></Header>
        <div className="flex h-full flex-1 flex-col items-center justify-start px-8 pt-32">
          <div className="card bg-base-100 flex h-[364px] w-96 flex-col items-center justify-around p-4 shadow-xl">
            <div className="flex w-full flex-col items-center justify-center">
              <h2 className="text-2xl font-semibold">
                Logi sisse <LogIn className="inline" />
              </h2>
            </div>
            <form className="w-full">
              <label
                className={`input mb-4 flex items-center gap-2 ${error.username ? "border-error" : "input-bordered"}`}
              >
                <CircleUserRound className="inline h-4 w-4" />
                <input
                  value={credentials.username}
                  type="text"
                  className="grow"
                  onChange={handleChange}
                  name="username"
                  placeholder="Kool/Kasutaja"
                  disabled={loading}
                />
              </label>
              <label
                className={`input flex items-center gap-2 ${error.password ? "border-error" : "input-bordered"}`}
              >
                <KeyRound className="inline h-4 w-4" />
                <input
                  onChange={handleChange}
                  name="password"
                  type="password"
                  className="grow"
                  value={credentials.password}
                  placeholder="Salasõna"
                  disabled={loading}
                />
              </label>
            </form>
            <div className="flex w-full flex-row items-center justify-center">
              <button
                disabled={loading}
                onClick={sendLogin}
                className="btn btn-secondary btn-wide"
              >
                {loading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  "Logi sisse"
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer></Footer>
    </>
  );
};

export default Login;
