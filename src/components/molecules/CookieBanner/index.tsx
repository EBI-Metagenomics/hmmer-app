import { useState } from "react";
import { addYears } from "date-fns";

export const CookieBanner: React.FC = () => {
    const [display, setDisplay] = useState(document && !(document.cookie.match(/cookies-accepted=(true)/i) || [])[1]);

    const handleClick = () => {
        const expires = addYears(new Date(), 1);

        document.cookie = `cookies-accepted=true;expires=${expires.toUTCString()};path=${import.meta.env.BASE_URL}`;

        setDisplay(false);
    };

    if (!display) return null;

    return (
        <div className="vf-banner vf-banner--fixed vf-banner--bottom vf-banner--notice">
            <div className="vf-banner__content | vf-grid">
                <p className="vf-banner__text vf-banner__text--lg">
                    This website uses cookies, and the limiting processing of your personal data to function. By using
                    the site you are agreeing to this as outlined in our{" "}
                    <a
                        className="vf-banner__link"
                        href="https://www.ebi.ac.uk/data-protection/privacy-notice/embl-ebi-public-website"
                    >
                        Privacy Notice
                    </a>{" "}
                    and{" "}
                    <a className="vf-banner__link" href="https://www.ebi.ac.uk/about/terms-of-use">
                        Terms Of Use
                    </a>
                    .
                </p>

                <button className="vf-button vf-button--primary" onClick={handleClick} type="button">
                    I agree, dismiss this banner
                </button>
            </div>
        </div>
    );
};
