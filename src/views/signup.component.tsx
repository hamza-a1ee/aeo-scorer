"use client";
import CoverImage from "@/../public/assets/4.svg";
import SocialButtonComponent from "@/components/button/social-button.component";
import InputWithLabelComponent from "@/components/input/input-with-label.component";
import Separator from "@/components/separator.component";
import Heading from "@/components/text/heading.component";
import SubText from "@/components/text/subtext.component";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import BackIcon from "@/icons/back.icon";
import GoogleIcon from "@/icons/google.icon";
import SignupIcon from "@/icons/signup.icon";
import { SignupSchema } from "@/schema/signup.schema";
import { ISignupFormInterface } from "@/types/interfaces/signup-form.interface";
import { TVoidCallback } from "@/types/types/common/common.type";
import AuthWrapper from "@/wrappers/auth.wrapper";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";

interface Props {
  route: string;
  onSubmit: TVoidCallback<[ISignupFormInterface]>;
  isLoading: boolean;
  googleLoginPath: string;
  switchRoleHref: string;
}
export default function SignupComponent({
  route,
  onSubmit,
  isLoading,
  googleLoginPath,
  switchRoleHref,
}: Props) {
  // ==================Form=================

  const form = useForm<ISignupFormInterface>({
    resolver: zodResolver(SignupSchema),
    defaultValues: {
      emailOrPhone: "",
      password: "",
      confirmPassword: "",
      isAgreed: false,
    },
    mode: "onChange",
  });

  // ==================Handlers=================
  const handleSubmit = (data: ISignupFormInterface) => {
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
        <div>
          <Heading>Sign up</Heading>
          <SubText>
            Already have an account?{" "}
            <Link href={route}>
              {" "}
              <span className="text-primary cursor-pointer hover:underline">
                Login
              </span>
            </Link>
          </SubText>
        </div>

        <div className="space-y-6">
          <SocialButtonComponent
            href={googleLoginPath}
            className="bg-social-btn border-neutral-gray-10 text-base font-medium text-[#3B3F58]"
          >
            <GoogleIcon />
            <span>Continue with Google</span>
          </SocialButtonComponent>
          <Separator />
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          <InputWithLabelComponent
            label="Email or Phone Number"
            control={form.control}
            name="emailOrPhone"
            placeholder="Enter your Email or Phone Number"
            required
          />
          <InputWithLabelComponent
            label="Password"
            control={form.control}
            name="password"
            type="password"
            placeholder="Enter Password"
            required
          />
          <InputWithLabelComponent
            label="Confirm Password"
            control={form.control}
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            required
          />

          <div className="flex items-center gap-2 text-xs text-test-secondary">
            <Controller
              control={form.control}
              name="isAgreed"
              render={({ field }) => (
                <>
                  <Checkbox
                    className="cursor-pointer"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    id="terms"
                  />
                  <Label
                    htmlFor="terms"
                    className="cursor-pointer font-normal text-sm"
                  >
                    Accept{" "}
                    <Link className="text-primary" href={""}>
                      <span className="underline">Terms</span>{" "}
                      <span className="text-black no-underline">&</span>{" "}
                      <span className="underline">Conditions</span>
                    </Link>
                  </Label>
                </>
              )}
            />
          </div>
          <Button
            type="submit"
            className="cursor-pointer"
            disabled={!form.formState.isValid || isLoading}
          >
            Sign up
          </Button>
        </form>
      </Form>
    </AuthWrapper>
  );
}
