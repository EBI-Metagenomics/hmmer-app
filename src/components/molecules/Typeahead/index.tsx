import _ from "lodash";
import { ChangeEvent, useRef, useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import "./index.scss";

interface TypeaheadProps<T> {
    data?: T[];
    placeholder?: string;
    renderItem: (item: T) => React.ReactNode;
    onTextChange: (text: string) => void;
    onValueSelected: (value: T) => void;
}

export const Typeahead = <T,>({ data, placeholder, onTextChange, onValueSelected, renderItem }: TypeaheadProps<T>) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [showOptions, setShowOptions] = useState(true);

    const deboncedChangeHandler = _.debounce((e: ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        onTextChange(e.target?.value);
    }, 300);

    return (
        <div className="vf-form vf-form--search vf-form--search--mini | vf-sidebar vf-sidebar--end">
            <div className="vf-sidebar__inner">
                <div className="vf-form__item">
                    <label className="vf-form__label vf-u-sr-only | vf-search__label" htmlFor="searchitem">
                        Search
                    </label>
                    <div className="input-container">
                        <input
                            type="search"
                            placeholder={placeholder ?? "Enter your search terms"}
                            id="searchitem"
                            ref={inputRef}
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
                            className="vf-form__input input-with-clear"
                            aria-owns="vf-form--search__results-list"
                        />
                        <button
                            className="clear-button"
                            onClick={(e) => {
                                e.preventDefault();

                                if (inputRef.current) {
                                    inputRef.current.value = "";
                                    inputRef.current.focus();
                                    onTextChange("");
                                }
                            }}
                        >
                            &times;
                        </button>
                    </div>
                    {showOptions && !data && inputRef.current?.value && (
                        <ul
                            id="vf-form--search__results-list"
                            className="vf-list | vf-form--search__results-list | vf-stack vf-stack--custom"
                            aria-labelledby="searchitem"
                            style={{ width: "calc(100% - 8px", maxHeight: "300px", overflowY: "auto" }}
                        >
                            {_.times(5, (index) => (
                                <li
                                    id={`vf-form--search__results-list--${index}`}
                                    className="vf-list__item"
                                    role="option"
                                    key={index}
                                >
                                    <Skeleton borderRadius={0} />
                                </li>
                            ))}
                        </ul>
                    )}
                    {showOptions && (data?.length ?? 0) > 0 && (
                        <ul
                            id="vf-form--search__results-list"
                            className="vf-list | vf-form--search__results-list | vf-stack vf-stack--custom"
                            aria-labelledby="searchitem"
                            style={{ width: "calc(100% - 8px", maxHeight: "300px", overflowY: "auto" }}
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
                    {showOptions && data?.length == 0 && inputRef.current?.value && (
                        <ul
                            id="vf-form--search__results-list"
                            className="vf-list | vf-form--search__results-list | vf-stack vf-stack--custom"
                            aria-labelledby="searchitem"
                            style={{ width: "calc(100% - 8px" }}
                        >
                            <li id={`vf-form--search__results-list--0`} className="vf-list__item" role="option">
                                No results
                            </li>
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};
