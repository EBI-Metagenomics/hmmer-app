import _ from "lodash";
import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { zSearchRequestSchema } from "@/client/zod.gen";

import { SearchRequestSchemaSchema } from "@/client/schemas.gen";
import { SearchRequestSchema } from "@/client/types.gen";
import { searchApiSearchMutation } from "@/client/@tanstack/react-query.gen";
import { MenuSection } from "@components/atoms";
import {
    // TaxonomyFilterInput,
    CutOffInput,
    GapPenaltiesInput,
    FilterInput,
    SequenceDatabaseInput,
    HMMDatabaseInput,
    Input,
    Toast,
} from "@components/molecules";

interface FormProps {
    algo: "phmmer" | "hmmscan" | "hmmsearch" | "jackhmmer";
}

export const Form: React.FC<FormProps> = ({ algo }) => {
    const navigate = useNavigate();

    const defaultValues = useMemo(
        () => ({
            ..._.mapValues(SearchRequestSchemaSchema.properties, "default"),
            input: "",
            threshold: algo === "hmmscan" ? "cut_ga" : "evalue",
        }),
        [algo],
    );

    const methods = useForm<SearchRequestSchema>({
        defaultValues,
        resolver: zodResolver(zSearchRequestSchema),
        mode: "onChange",
    });

    const { resetField, formState, getFieldState } = methods;
    const seqFieldState = getFieldState("input", formState);
    const submitDisabled = seqFieldState.invalid || !seqFieldState.isDirty || formState.isSubmitting;
    const resetDisabled = formState.isSubmitting || !seqFieldState.isDirty;
    const cleanDisabled = formState.isSubmitting || !seqFieldState.isDirty;

    const { mutateAsync, error } = useMutation({
        ...searchApiSearchMutation(),
    });

    useEffect(() => {
        if (error) {
            // @ts-ignore
            _.each(error.detail, (e) => {
                toast.error(e.msg);
            });
        }
    }, [error]);

    useEffect(() => {
        resetField("input");
    }, [algo]);

    return (
        <div className="vf-stack vf-stack--1200 | vf-u-padding__top--400">
            <h3 className="vf-text vf-text-heading--3 vf-u-text-color--grey">
                {algo === "phmmer" && "protein sequence vs protein sequence database"}
                {algo === "hmmscan" && "protein sequence vs profile-HMM database"}
                {algo === "hmmsearch" && "protein alignment/profile-HMM vs protein sequence database"}
            </h3>
            <FormProvider {...methods}>
                <form
                    onSubmit={methods.handleSubmit((data) => {
                        mutateAsync(
                            {
                                path: { algo },
                                body: { ...data, with_architecture: true, with_taxonomy: true },
                            },
                            {
                                onSuccess: (data) => {
                                    navigate(`/results/${data.id}`);
                                },
                            },
                        );
                    })}
                >
                    <div className="vf-stack vf-stack--800">
                        <MenuSection title={algo === "hmmsearch" ? "Alignment/HMM" : "Sequence"}>
                            <div className="vf-stack vf-stack--200">
                                <Input mode={algo === "hmmsearch" ? "hmm" : "sequence"} />
                                <div>
                                    <button
                                        className="vf-button vf-button--primary vf-button--sm"
                                        type="submit"
                                        disabled={submitDisabled}
                                    >
                                        Submit
                                    </button>
                                    <button
                                        className="vf-button vf-button--tertiary vf-button--sm"
                                        type="reset"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            resetField("input");
                                        }}
                                        disabled={resetDisabled}
                                    >
                                        Reset
                                    </button>
                                    <button
                                        className="vf-button vf-button--tertiary vf-button--sm"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            resetField("input");
                                        }}
                                        // disabled={cleanDisabled}
                                        disabled={true}
                                    >
                                        Clean
                                    </button>
                                </div>
                            </div>
                        </MenuSection>
                        {algo !== "hmmscan" && (
                            <MenuSection title="Sequence database">
                                <SequenceDatabaseInput />
                            </MenuSection>
                        )}
                        {algo === "hmmscan" && (
                            <MenuSection title="HMM database">
                                <HMMDatabaseInput />
                            </MenuSection>
                        )}
                        <MenuSection title="Cut off">
                            <CutOffInput algo={algo} />
                        </MenuSection>
                        {algo !== "hmmscan" && algo !== "hmmsearch" && (
                            <MenuSection title="Gap penalties">
                                <GapPenaltiesInput />
                            </MenuSection>
                        )}
                        <MenuSection title="Filter">
                            <FilterInput />
                        </MenuSection>
                        {/* <MenuSection title="Taxonomy filter">
              <TaxonomyFilterInput />
            </MenuSection> */}
                    </div>
                </form>
            </FormProvider>
        </div>
    );
};
