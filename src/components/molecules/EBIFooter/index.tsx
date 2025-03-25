import { useState, useEffect } from "react";

import "./index.scss";

export const EBIFooter: React.FC = () => {
    const [innerHtml, setInnerHtml] = useState<string>("");

    useEffect(() => {
        const fetchHtml = async () => {
            const response = await fetch(
                "https://www.embl.org/api/v1/pattern.html?filter-content-type=article&filter-id=106902&pattern=node-body&source=contenthub",
            );

            const html = await response.text();

            setInnerHtml(html);
        };

        fetchHtml();
    }, []);

    return <div className="vf-u-margin__top--1200" dangerouslySetInnerHTML={{ __html: innerHtml }}></div>;
};
