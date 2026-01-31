"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authValidator, AuthValidatorType } from "@/validators/api/auth/auth";
import { useLogin } from "@/hooks/query/auth";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import FormField from "@/components/form-inputs/FormField";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

const Login = () => {
  const { mutate } = useLogin();

  const form = useForm<AuthValidatorType>({
    defaultValues: { loginId: "", password: "" },
    resolver: zodResolver(authValidator),
  });

  const onSubmit = (values: AuthValidatorType) => {
    mutate(values);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardContent className="pt-8 pb-4 gap-1">
          {/* Title */}
          <h1 className="text-xl font-bold text-center text-primary mb-6">
            HMS PORTAL LOGIN
          </h1>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              {/* Username Input */}
              <FormField<AuthValidatorType>
                type="text"
                placeholder="Enter Access Code"
                label="Access Code"
                name="loginId"
                control={form.control}
              />

              <FormField<AuthValidatorType>
                type="password"
                placeholder="Enter Password"
                label="Password"
                name="password"
                control={form.control}
              />

              {/* Action Buttons */}
              <div className="flex justify-center gap-3 pt-2">
                <Button
                  type="submit"
                  className="px-8 bg-primary text-primary-foreground hover:bg-primary/90 w-full"
                >
                  Sign In
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="flex flex-col items-center pb-6 pt-2">
          {/* Made with love */}
          <p className="text-sm text-card-foreground flex items-center gap-1">
            Made with{" "}
            <Heart className="w-4 h-4 fill-destructive text-destructive" /> in
            India
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
