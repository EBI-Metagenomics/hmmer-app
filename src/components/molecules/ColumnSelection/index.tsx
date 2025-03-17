import _ from "lodash";

interface ColumnSelectionProps {
    columns: {
        id: string;
        name: string;
        checked: boolean;
        onChange: () => void;
    }[];
}

export const ColumnSelection: React.FC<ColumnSelectionProps> = ({ columns }) => {
    return (
        <fieldset className="vf-form__fieldset vf-stack vf-stack--200">
            <legend className="vf-form__legend">Columns</legend>
            {_.map(columns, (column) => {
                return (
                    <div key={column.id} className="vf-form__item vf-form__item--checkbox">
                        <input
                            {...{
                                type: "checkbox",
                                id: `${column.id}`,
                                checked: column.checked,
                                onChange: column.onChange,
                                className: "vf-form__checkbox",
                            }}
                        />
                        <label htmlFor={`${column.id}`} className="vf-form__label">
                            {column.name}
                        </label>
                    </div>
                );
            })}
        </fieldset>
    );
};
