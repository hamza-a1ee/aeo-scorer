import CoverImage from "@/../public/assets/8.svg";
import GoBackButton from "@/components/button/go-back-button.component";
import InputWithLabelComponent from "@/components/input/input-with-label.component";
import Heading from "@/components/text/heading.component";
import SubText from "@/components/text/subtext.component";
import { Form } from "@/components/ui/form";
import SignupIcon from "@/icons/signup.icon";
import { cn } from "@/lib/utils";
import { SetNewPasswordSchema } from "@/schema/set-new-password.schema";
import { ISetNewPasswordForm } from "@/types/interfaces/auth/forgot-password/form.interface";
import { TVoidCallback } from "@/types/types/common/common.type";
import AuthWrapper from "@/wrappers/auth.wrapper";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

interface Props {
  onBack: TVoidCallback;
  onSubmit: TVoidCallback<[string]>;
  isLoading?: boolean;
}
export default function SetNewPassword({ onBack, onSubmit, isLoading }: Props) {
  const form = useForm<ISetNewPasswordForm>({
    resolver: zodResolver(SetNewPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const handleSubmit = () => {
    onSubmit(form.getValues("password"));
  };
  return (
    <AuthWrapper img={CoverImage}>
      <div className="space-y-8">
        <SignupIcon />
        <div>
          <Heading>Set New Password</Heading>
          <SubText>Create a new password for your account</SubText>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-8"
          >
            <InputWithLabelComponent
              placeholder="Enter Password"
              control={form.control}
              label="Password"
              name="password"
              type="password"
            />
            <InputWithLabelComponent
              placeholder="Enter Confirm Password"
              control={form.control}
              label="Confirm Password"
              name="confirmPassword"
              type="password"
            />

            <div className="flex items-center gap-3 lg:gap-6">
              <GoBackButton onClick={onBack} />
              <button
                type="submit"
                className={cn(
                  "w-full bg-primary hover:bg-primary/90 h-12 rounded-lg cursor-pointer font-medium text-white",
                  (isLoading || !form.formState.isValid) &&
                  "disabled:bg-primary/50",
                )}
                disabled={isLoading || !form.formState.isValid}
              >
                Continue
              </button>
            </div>
          </form>
        </Form>
      </div>
    </AuthWrapper>
  );
}
