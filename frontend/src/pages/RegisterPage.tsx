
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/Button/Button";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    console.log("Register submitted:", {
      name,
      email,
      password,
    });

    // Temporary: after registering, go to login
    navigate("/login");
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#17182F] px-6 py-10">

      {/* Background glow */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-[#7652B8]/30 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-[#E9A0C5]/20 blur-3xl" />

      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#D0BCFF]/10 blur-3xl" />

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

      {/* Content */}
      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center justify-center">

        <div className="w-full">

          {/* Brand */}
          <div className="mb-6 text-center">
            <p className="font-['Press_Start_2P'] text-xs leading-6 text-[#D0BCFF]">
              ✦ JOB TRACKER ✦
            </p>
          </div>

          {/* Card */}
          <div className="rounded-2xl bg-[#D0BCFF] p-8 shadow-[7px_7px_0px_#7652B8]">

            {/* Heading */}
            <div className="mb-7">
              <h1 className="mb-3 font-['Press_Start_2P'] text-xl leading-8 text-[#29233A]">
                Create account
              </h1>

              <p className="text-sm font-medium text-[#5F5670]">
                Start tracking your job hunt today!
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-bold text-[#29233A]"
                >
                  Name
                </label>

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Enter your name"
                  required
                  className="w-full rounded-xl border-2 border-[#B39AE8] bg-[#F5F0FF] px-4 py-3 font-medium text-[#29233A] placeholder-[#D0BCFF] outline-none transition focus:border-[#7652B8] focus:ring-4 focus:ring-[#7652B8]/15"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-bold text-[#29233A]"
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
                  className="w-full rounded-xl border-2 border-[#B39AE8] bg-[#F5F0FF] px-4 py-3 font-medium text-[#29233A] placeholder-[#D0BCFF] outline-none transition focus:border-[#7652B8] focus:ring-4 focus:ring-[#7652B8]/15"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-bold text-[#29233A]"
                >
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Create a password"
                  required
                  className="w-full rounded-xl border-2 border-[#B39AE8] bg-[#F5F0FF] px-4 py-3 font-medium text-[#29233A] placeholder-[#D0BCFF] outline-none transition focus:border-[#7652B8] focus:ring-4 focus:ring-[#7652B8]/15"
                />
              </div>

              {/* Confirm password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-bold text-[#29233A]"
                >
                  Confirm password
                </label>

                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Confirm your password"
                  required
                  className="w-full rounded-xl border-2 border-[#B39AE8] bg-[#F5F0FF] px-4 py-3 font-medium text-[#29233A] placeholder-[#D0BCFF] outline-none transition focus:border-[#7652B8] focus:ring-4 focus:ring-[#7652B8]/15"
                />
              </div>

              <div className="pt-2">
                <Button type="submit">
                  Create account
                </Button>
              </div>

            </form>

            {/* Login link */}
            <p className="mt-6 text-center text-sm font-medium text-[#5F5670]">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-extrabold text-[#51358B] hover:underline"
              >
                Log in
              </Link>
            </p>

          </div>

          <p className="mt-6 text-center text-xs font-semibold text-[#8A78A8]">
            Track it. Apply it. Get hired. ♡
          </p>

        </div>
      </div>
    </main>
  );
}