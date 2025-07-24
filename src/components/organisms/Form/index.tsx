import _ from "lodash";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { zSearchRequestSchema } from "@/client/zod.gen";

import { SearchRequestSchemaSchema } from "@/client/schemas.gen";
import { SearchRequestSchema } from "@/client/types.gen";
import { searchApiSearchMutation } from "@/client/@tanstack/react-query.gen";
import { MenuSection } from "@components/atoms";
import {
    TaxonomyFilterInput,
    CutOffInput,
    GapPenaltiesInput,
    FilterInput,
    DatabaseInput,
    IterationsInput,
    EmailInput,
    Input,
} from "@components/molecules";

interface FormProps {
    algo: "phmmer" | "hmmscan" | "hmmsearch" | "jackhmmer";
}

export const Form: React.FC<FormProps> = ({ algo }) => {
    const navigate = useNavigate();
    const [isBatch, setIsBatch] = useState(false);

    const defaultValues = useMemo(
        () => ({
            ..._.mapValues(SearchRequestSchemaSchema.properties, "default"),
            input: "",
            database: algo === "hmmscan" ? "pfam" : "refprot",
            threshold: algo === "hmmscan" ? "cut_ga" : "evalue",
        }),
        [algo],
    );

    const methods = useForm<SearchRequestSchema>({
        defaultValues,
        resolver: zodResolver(zSearchRequestSchema),
        mode: "onChange",
    });

    const { resetField, formState, getFieldState, setError, watch } = methods;
    const seqFieldState = getFieldState("input", formState);
    const submitDisabled = seqFieldState.invalid || !seqFieldState.isDirty || formState.isSubmitting;
    const resetDisabled = formState.isSubmitting || !seqFieldState.isDirty;
    const cleanDisabled = formState.isSubmitting || !seqFieldState.isDirty;

    const iterations = watch("iterations");

    const { mutateAsync, error } = useMutation({
        ...searchApiSearchMutation(),
    });

    useEffect(() => {
        if (error) {
            _.each(error.detail, ({ loc, type, msg }) => {
                const errorSource = _.last(loc);
                // @ts-ignore
                setError(errorSource, { type: type, message: msg });
            });
        }
    }, [error]);

    useEffect(() => {
        resetField("input");
        setIsBatch(false);
    }, [algo]);
    console.log(formState.errors);
    useEffect(() => {
        const subscription = watch(({ input }, { name, type }) => {
            if (name === "input" && type === "change") {
                const multipleFastaRegex = /^>.*[\r\n]+[\s\S]*?[\r\n]+>.*[\r\n]+[\s\S]*$/m;

                if (multipleFastaRegex.test(input ?? "")) setIsBatch(true);
                else setIsBatch(false);
            }
        });

        return () => subscription.unsubscribe();
    }, [watch]);

    return (
        <div className="vf-stack vf-stack--1200 | vf-u-padding__top--400">
            <h3 className="vf-text vf-text-heading--3 vf-u-text-color--grey">
                {algo === "phmmer" && "protein sequence vs protein sequence database"}
                {algo === "hmmscan" && "protein sequence vs profile-HMM database"}
                {algo === "hmmsearch" && "protein alignment/profile-HMM vs protein sequence database"}
                {algo === "jackhmmer" && "iterative search vs protein sequence database"}
            </h3>
            <FormProvider {...methods}>
                <form
                    onSubmit={methods.handleSubmit((data) => {
                        console.log(data);
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
                        <MenuSection
                            title={
                                algo === "jackhmmer"
                                    ? "Sequence/Alignment/Hmm"
                                    : algo === "hmmsearch"
                                      ? "Alignment/HMM"
                                      : "Sequence"
                            }
                        >
                            <div className="vf-stack vf-stack--200">
                                <Input
                                    mode={
                                        algo === "jackhmmer"
                                            ? ["alignment", "hmm", "sequence"]
                                            : algo === "hmmsearch"
                                              ? ["alignment", "hmm"]
                                              : ["sequence"]
                                    }
                                />
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
                                <DatabaseInput type="seq" />
                            </MenuSection>
                        )}
                        {algo === "jackhmmer" && (
                            <MenuSection title="Number of iterations">
                                <IterationsInput />
                            </MenuSection>
                        )}
                        {((algo === "jackhmmer" && (iterations ?? 1) > 1) || (algo !== "jackhmmer" && isBatch)) && (
                            <MenuSection title="Email address">
                                <EmailInput />
                                <p className="vf-form__helper">
                                    {algo === "jackhmmer"
                                        ? "Get notified when your search converges or reaches desired number of iterations"
                                        : "Get notified when the results are ready"}
                                </p>
                            </MenuSection>
                        )}
                        {algo === "hmmscan" && (
                            <MenuSection title="HMM database">
                                <DatabaseInput type="hmm" />
                            </MenuSection>
                        )}
                        {algo !== "hmmscan" && (
                            <MenuSection title="Taxonomy restriction">
                                <TaxonomyFilterInput />
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
