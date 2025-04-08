import _ from "lodash";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";

import { searchApiGetDatabasesOptions } from "@/client/@tanstack/react-query.gen";

interface DatabaseInputProps {
    type: "seq" | "hmm";
}

export const DatabaseInput: React.FC<DatabaseInputProps> = ({ type }) => {
    const { register, setValue } = useFormContext();

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

    return (
        <div className="vf-form__item">
            <select {...register("database")} className="vf-form__select" id="vf-form__select">
                {_(databases ?? [])
                    .filter(["type", type])
                    .map((database) => (
                        <option key={database.id} value={database.id ?? ""}>
                            {database.name} ({database.version})
                        </option>
                    ))
                    .value()}
            </select>
        </div>
    );
};
