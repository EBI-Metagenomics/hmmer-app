import { useState } from "react";
import { addYears } from "date-fns";

export const CookieBanner: React.FC = () => {
    const [display, setDisplay] = useState(document && !document.cookie.match(/cookies-accepted=(true|false)/i));

    const handleAccept = () => {
        const expires = addYears(new Date(), 1);

        document.cookie = `cookies-accepted=true;expires=${expires.toUTCString()};path=${import.meta.env.BASE_URL}`;

        if (window._paq) {
            window._paq.push(["setConsentGiven"]);
        }

        setDisplay(false);
    };

    const handleReject = () => {
        const expires = addYears(new Date(), 1);

        document.cookie = `cookies-accepted=false;expires=${expires.toUTCString()};path=${import.meta.env.BASE_URL}`;

        setDisplay(false);
    };

    if (!display) return null;

    return (
        <div className="vf-banner vf-banner--fixed vf-banner--bottom vf-banner--notice">
            <div className="vf-banner__content | vf-grid">
                <p className="vf-banner__text vf-banner__text--lg">
                    This site uses cookies. We use essential cookies for site functionality, and non-essential cookies
                    to help improve the service using Matomo analytics. No data is shared with third parties for
                    advertising. See our{" "}
                    <a className="vf-banner__link" href={`${import.meta.env.BASE_URL}privacy-notice.pdf`}>
                        Privacy Notice
                    </a>{" "}
                    and{" "}
                    <a className="vf-banner__link" href="//www.ebi.ac.uk/about/terms-of-use">
                        Terms Of Use
                    </a>
                    .
                </p>

                <button className="vf-button vf-button--primary" onClick={handleAccept} type="button">
                    Accept all
                </button>

                <button className="vf-button vf-button--secondary" onClick={handleReject} type="button">
                    Reject non-essential
                </button>
            </div>
        </div>
    );
};
