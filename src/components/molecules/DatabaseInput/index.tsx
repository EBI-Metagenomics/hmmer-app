import _ from "lodash";
import { useEffect, useState } from "react";
import ReactModal from "react-modal";
import { useQuery } from "@tanstack/react-query";
import { useFormContext, Controller } from "react-hook-form";
import { SearchRequestSchema } from "@/client/types.gen";
import { searchApiGetDatabasesOptions } from "@/client/@tanstack/react-query.gen";

interface DatabaseInputProps {
    type: "seq" | "hmm";
}
const customStyles = {
    content: {
        top: "50%",
        left: "50%",
        right: "auto",
        bottom: "auto",
        marginRight: "-50%",
        transform: "translate(-50%, -50%)",
        borderRadius: 0,
        borderWidth: 2,
    },
    overlay: {
        zIndex: 99999,
    },
};

export const DatabaseInput: React.FC<DatabaseInputProps> = ({ type }) => {
    const [showConfirm, setShowConfirm] = useState(false);
    const [pendingDatabase, setPendingDatabase] = useState<string>();

    const {
        control,
        setValue,
        watch,
        getValues,
        formState: { errors },
    } = useFormContext<SearchRequestSchema>();

    const { data: databases } = useQuery({
        ...searchApiGetDatabasesOptions(),
    });

    useEffect(() => {
        if (databases) {
            setValue(
                "database",
                _(databases ?? [])
                    .filter(["type", type])
                    .head()?.id ?? "",
                { shouldValidate: false },
            );
        }
    }, [databases]);

    const taxonomyIds = watch("taxonomy_ids");

    const onConfirm = () => {
        setValue("database", pendingDatabase);
        setShowConfirm(false);
        setPendingDatabase(undefined);
    };

    const onDatabaseChange = (newDatabase: string, onChange: (...event: any[]) => void) => {
        if (!taxonomyIds || taxonomyIds.length === 0) {
            onChange(newDatabase);

            return;
        }

        if (newDatabase !== getValues("database")) {
            setPendingDatabase(newDatabase);
            setShowConfirm(true);
        }

    };

    return (
        <div className="vf-form__item">
            <Controller
                name="database"
                control={control}
                render={({ field: { value, onChange, ...field } }) => (
                    <select
                        {...field}
                        value={value!}
                        onChange={(e) => onDatabaseChange(e.target.value, onChange)}
                        className="vf-form__select"
                        id="vf-form__select"
                    >
                        {_(databases ?? [])
                            .filter(["type", type])
                            .map((database) => (
                                <option key={database.id} value={database.id ?? ""}>
                                    {database.name} ({database.version})
                                </option>
                            ))
                            .value()}
                    </select>
                )}
            />
            {errors.database && (
                <p className="vf-form__helper vf-form__helper--error">{errors.database.message as string}</p>
            )}
            {showConfirm && (
                <ReactModal
                    style={customStyles}
                    contentLabel="Customization"
                    isOpen={showConfirm}
                    onRequestClose={() => setShowConfirm}
                >
                    <div className="vf-stack vf-stack--800">
                        <div>
                            <p className="warning-text vf-text-body vf-text-body--2">
                                Warning, changing the database selection will clear you current taxonomy restriction.
                            </p>
                        </div>
                        <div className="button-container">
                            <button className="vf-button vf-button--primary vf-button--sm" onClick={onConfirm}>
                                Confirm
                            </button>
                            <button
                                className="vf-button vf-button--secondary vf-button--sm"
                                onClick={() => setShowConfirm(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </ReactModal>
            )}
        </div>
    );
};
