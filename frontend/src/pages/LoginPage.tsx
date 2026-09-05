import { useState } from "react";
import { Button } from "../components/Button/Button";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    console.log("Login submitted:", {
      email,
      password,
    });
  };

  return (
    <main className="min-h-screen bg-[#17182F] px-6 py-12">

    {/* Background decoration */}
    <div className="pointer-events-none absolute -left-32 -top-32 h-120 w-120 rounded-full bg-[#7652B8]/30 blur-3xl" />

    <div className="pointer-events-none absolute -bottom-32 -right-32 h-120 w-120 rounded-full bg-[#E9A0C5]/20 blur-3xl" />

     {/* Decorative stars */}
      <span className="absolute left-[10%] top-[20%] text-2xl text-[#D0BCFF]">
        ✦
      </span>

      <span className="absolute right-[12%] top-[30%] text-lg text-[#E9A0C5]">
        ✦
      </span>

      <span className="absolute bottom-[20%] left-[15%] text-sm text-[#D0BCFF]">
        ✦
      </span>

      <span className="absolute bottom-[15%] right-[18%] text-2xl text-[#E9A0C5]">
        ✦
      </span>

    {/* Login content */}
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-md items-center justify-center">
        <div className="w-full rounded-2xl bg-[#D0BCFF] p-8 shadow-[6px_6px_0px_#7652B8]">

          {/* Logo / App name */}
          <div className="mb-8 text-center">
            <p className="mb-3 font-['Press_Start_2P'] text-xs leading-6 text-[#51358B]">
              ✦ Job Tracker ✦
            </p>

            <h1 className="mb-3 font-['Press_Start_2P'] text-xl leading-8 text-[#29233A]">
              Welcome back!
            </h1>
 
            <p className="font-['Press_Start_2P'] text-xs text-[#5F5670]">
              Log in to continue your job hunt.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-[#29233A]"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email"
                required
                className="w-full rounded-lg border-2 border-[#B39AE8] bg-[#FDF0FF] px-4 py-3 text-[#29233A] placeholder-[#8A78A8] outline-none transition focus:border-[#7652B8] focus:ring-2 focus:ring-[#7652B8]/20"              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-[#29233A]"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
                className="w-full rounded-lg border-2 border-[#B39AE8] bg-[#FDF0FF] px-4 py-3 text-[#29233A] placeholder-[#8A78A8] outline-none transition focus:border-[#7652B8] focus:ring-2 focus:ring-[#7652B8]/20"
              />
            </div>

            {/* Forgot password */}
            <div className="text-right">
              <button
                type="button"
                className="text-sm font-semibold text-[#51358B] hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {/* Login */}
            <Button type="submit">
              Login
            </Button>
          </form>

          {/* Register */}
          <div className="mt-6 text-center text-sm text-[#5F5670]">
            Don't have an account?{" "}
            <button
              type="button"
              className="font-bold text-[#51358B] hover:underline"
            >
              Sign up
            </button>
          </div>

           {/* Bottom decoration */}
          <p className="mt-6 text-center text-xs font-semibold text-[#8A78A8]">
            Track it. Apply it. Get hired. ♡
          </p>
        </div>
      </div>
    </main>
  );
}