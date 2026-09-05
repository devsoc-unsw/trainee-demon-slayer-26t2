type ButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
};

export function Button({
  children,
  variant = "primary",
  type = "button",
  disabled = false,
  onClick,
}: ButtonProps) {
  const baseStyles =
    "w-full rounded-lg px-5 py-3 font-semibold transition-all duration-100";

  const variantStyles = {
    primary:
      "bg-[#7652B8] text-white shadow-[4px_4px_0px_#17182F] hover:-translate-y-0.5 hover:shadow-[4px_5px_0px_#17182F] active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0px_#17182F]",

    secondary:
      "bg-[#D0BCFF] text-[#29233A] shadow-[4px_4px_0px_#17182F] hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant]} disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {children}
    </button>
  );
}