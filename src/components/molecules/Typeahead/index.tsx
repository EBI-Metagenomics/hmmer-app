import _ from "lodash";
import { ChangeEvent, useState } from "react";

interface TypeaheadProps<T> {
    data: T[],
    placeholder?: string,
    renderItem: (item: T) => React.ReactNode,
    onTextChange: (text: string) => void,
    onValueSelected: (value: T) => void,
}

export const Typeahead = <T,>({ data, placeholder, onTextChange, onValueSelected, renderItem }: TypeaheadProps<T>) => {
    const [showOptions, setShowOptions] = useState(true);

    const deboncedChangeHandler = _.debounce((e: ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        onTextChange(e.target?.value);
    }, 300);

    return (
        <form action="#" className="vf-form vf-form--search vf-form--search--mini | vf-sidebar vf-sidebar--end">
            <div className="vf-sidebar__inner">
                <div className="vf-form__item">
                    <label className="vf-form__label vf-u-sr-only | vf-search__label" htmlFor="searchitem">
                        Search
                    </label>
                    <input
                        type="search"
                        placeholder={placeholder ?? "Enter your search terms"}
                        id="searchitem"
                        onChange={deboncedChangeHandler}
                        onClick={() => setShowOptions(true)}
                        onFocus={(e) => {
                            e.preventDefault();
                            setShowOptions(true);
                        }}
                        onBlur={(e) => {
                            e.preventDefault();
                            setShowOptions(false);
                        }}
                        className="vf-form__input"
                        aria-owns="vf-form--search__results-list"
                    />
                    {showOptions && (data.length > 0) && (
                        <ul
                            id="vf-form--search__results-list"
                            className="vf-list | vf-form--search__results-list | vf-stack vf-stack--custom"
                            aria-labelledby="searchitem"
                            style={{ width: "calc(100% - 8px" }}
                        >
                            {_.map(data, (item, index) => (
                                <li
                                    id={`vf-form--search__results-list--${index}`}
                                    className="vf-list__item"
                                    role="option"
                                    key={index}
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        setShowOptions(false);
                                        onValueSelected(item);
                                    }}
                                >
                                    {renderItem(item)}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </form>
    );
};
