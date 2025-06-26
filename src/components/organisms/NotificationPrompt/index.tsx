import _ from "lodash";
import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { searchApiUpdateSearchMutation } from "@/client/@tanstack/react-query.gen";
import { SearchPatchSchema } from "@/client/types.gen";
import { zSearchPatchSchema } from "@/client/zod.gen";

import { EmailInput } from "@/components/molecules";

import "./index.scss";

interface NotificationPromptProps {
    id: string;
    email_address?: string;
}

export const NotificationPrompt: React.FC<NotificationPromptProps> = ({ id, email_address }) => {
    const methods = useForm<SearchPatchSchema>({
        defaultValues: { email_address },
        resolver: zodResolver(zSearchPatchSchema),
        mode: "onSubmit",
    });

    const { mutateAsync, error } = useMutation({
        ...searchApiUpdateSearchMutation(),
    });

    const { formState } = methods;

    useEffect(() => {
        if (error) {
            _.each(error.detail, ({ loc, type, msg }) => {
                const errorSource = _.last(loc);
                // @ts-ignore
                methods.setError(errorSource, { type: type, message: msg });
            });
        }
    }, [error]);

    return (
        <FormProvider {...methods}>
            <div className="vf-u-padding__top--800">
                <p className="vf-text-body vf-text-body--2">
                    {formState.defaultValues?.email_address || formState.isSubmitted
                        ? "You'll receive a notification at the provided email address once the search is complete. You can update this address at any time."
                        : "Enter your email address to be notified when the search is complete. You can update it at any time."}
                </p>
                <form
                    onSubmit={methods.handleSubmit((data) => {
                        mutateAsync({
                            path: { id },
                            body: { ...data },
                        });
                    })}
                >
                    <div className="email-container">
                        <EmailInput />
                        <button
                            className="vf-button vf-button--primary vf-button--sm"
                            type="submit"
                            disabled={!formState.isValid}
                        >
                            {formState.defaultValues?.email_address || formState.isSubmitted ? "Update" : "Submit"}
                        </button>
                    </div>
                </form>
            </div>
        </FormProvider>
    );
};
