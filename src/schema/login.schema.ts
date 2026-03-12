import z from "zod";

export const LoginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "Email or phone number is required" })
    .refine(
      (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

        const phoneRegex =
          /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;

        const digitsOnly = value.replace(/\D/g, "");

        return (
          emailRegex.test(value) ||
          (phoneRegex.test(value) && digitsOnly.length >= 10)
        );
      },
      {
        message:
          "Please enter a valid email address or phone number (at least 10 digits)",
      },
    ),
  password: z.string().trim().min(1, { message: "Password is required" }),
});
