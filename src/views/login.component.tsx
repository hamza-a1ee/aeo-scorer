"use client";
import CoverImage from "@/../public/assets/6.svg";
import SocialButton from "@/components/button/social-button.component";
import InputWithLabelComponent from "@/components/input/input-with-label.component";
import Separator from "@/components/separator.component";
import Heading from "@/components/text/heading.component";
import SubText from "@/components/text/subtext.component";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import BackIcon from "@/icons/back.icon";
import GoogleIcon from "@/icons/google.icon";
import SignupIcon from "@/icons/signup.icon";
import { LoginSchema } from "@/schema/login.schema";
import { ILoginPayload } from "@/types/interfaces/auth/auth-api.interface";
import { TLoginForm } from "@/types/types/auth/login/login.type";
import { TVoidCallback } from "@/types/types/common/common.type";
import AuthWrapper from "@/wrappers/auth.wrapper";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";

interface Props {
  signupRoute: string;
  googleAuthUrl: string;
  onSubmit: TVoidCallback<[TLoginForm]>;
  forgotPasswordRoute: string;
  switchRoleHref?: string;
  isLoading?: boolean;
}

export default function Login({
  signupRoute,
  googleAuthUrl,
  forgotPasswordRoute,
  onSubmit,
  switchRoleHref,
  isLoading = false,
}: Props) {
  // ==================RHF=================
  const form = useForm<TLoginForm>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
  });
  const handleSubmit = (data: TLoginForm) => {
    onSubmit(data);
  };

  return (
    <AuthWrapper img={CoverImage}>
      <div className="w-full flex flex-col gap-4 md:gap-7">
        {switchRoleHref && (
          <Link
            href={switchRoleHref}
            className="flex items-center gap-2 text-test-secondary hover:text-test-primary transition-colors group"
          >
            <BackIcon />
            <span className="font-medium">Switch Role</span>
          </Link>
        )}
        <SignupIcon />

        {/* Heading */}
        <div>
          <Heading>Log In</Heading>
          <SubText>
            <span>{`Don’t have an account?`}</span>{" "}
            <Link
              className="text-primary cursor-pointer hover:underline"
              href={signupRoute}
            >
              Sign up
            </Link>
          </SubText>
        </div>

        {/* Social Button */}
        <div className="space-y-6">
          <SocialButton
            className="bg-social-btn font-normal rounded-xl"
            href={googleAuthUrl}
          >
            <GoogleIcon />
            <span>Continue with Google</span>
          </SocialButton>
          <Separator />
        </div>
      </div>

      {/* Form */}
      <Form {...form}>
        <form
          className="space-y-8"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit(handleSubmit)();
          }}
        >
          <InputWithLabelComponent
            placeholder="Enter Email or Phone Number"
            label="Email or Phone Number"
            required
            control={form.control}
            name="email"
          />
          <InputWithLabelComponent
            placeholder="Enter Password"
            label="Password"
            type="password"
            required
            control={form.control}
            name="password"
          />
          <div className="-mt-4 w-full flex justify-end">
            <Link
              className="text-primary cursor-pointer hover:underline text-sm font-medium underline"
              href={forgotPasswordRoute}
            >
              Forgot Password?
            </Link>
          </div>
          <Button
            type="submit"
            variant={"default"}
            disabled={!form.formState.isValid || isLoading}
          >
            Log In
          </Button>
        </form>{" "}
      </Form>
    </AuthWrapper>
  );
}
