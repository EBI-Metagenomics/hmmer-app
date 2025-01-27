import _ from "lodash";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { zPhmmerJobSchema } from "@/client/zod.gen";

import { PhmmerJobSchemaSchema } from "@/client/schemas.gen";
import { PhmmerJobSchema } from "@/client/types.gen";
import { MenuSection } from "@components/atoms";
import {
  // TaxonomyFilterInput,
  CutOffInput,
  GapPenaltiesInput,
  FilterInput,
  SequenceDatabaseInput,
  SequenceInput,
  TaxonomyFilterInput
} from "@components/molecules";

const defaultValues = {..._.mapValues(PhmmerJobSchemaSchema.properties, "default"), seq: ""};

const Form: React.FC<{ onSubmit: (data: PhmmerJobSchema) => void }> = ({
  onSubmit,
}) => {
  const methods = useForm<PhmmerJobSchema>({
    defaultValues,
    resolver: zodResolver(zPhmmerJobSchema),
    mode: "onChange",
  });

  const { resetField, formState, getFieldState } = methods;

  const seqFieldState = getFieldState("seq", formState);
  const submitDisabled =
    seqFieldState.invalid || !seqFieldState.isDirty || formState.isSubmitting;
  const resetDisabled = formState.isSubmitting || !seqFieldState.isDirty;
  const cleanDisabled = formState.isSubmitting || !seqFieldState.isDirty;

  return (
    <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <div className="vf-stack vf-stack--800">
            <MenuSection title="Sequence">
              <div className="vf-stack vf-stack--200">
                <SequenceInput />
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
                      resetField("seq");
                    }}
                    disabled={resetDisabled}
                  >
                    Reset
                  </button>
                  <button
                    className="vf-button vf-button--tertiary vf-button--sm"
                    onClick={(e) => {
                      e.preventDefault();
                      resetField("seq");
                    }}
                    // disabled={cleanDisabled}
                    disabled={true}
                  >
                    Clean
                  </button>
                </div>
              </div>
              {/* <div className="vf-cluster vf-cluster--400">
                <div className="vf-cluster__inner">
                  
                </div>
              </div> */}
            </MenuSection>
            <MenuSection title="Sequence database">
              <SequenceDatabaseInput />
            </MenuSection>
            <MenuSection title="Cut off">
              <CutOffInput />
            </MenuSection>
            <MenuSection title="Gap penalties">
              <GapPenaltiesInput />
            </MenuSection>
            <MenuSection title="Filter">
              <FilterInput />
            </MenuSection>
            {/* <MenuSection title="Taxonomy filter">
              <TaxonomyFilterInput />
            </MenuSection> */}
          </div>
        </form>
    </FormProvider>
  );
};

export { Form };
