interface NotFoundProps {
    title?: string;
    lede?: string;
    message?: string;
}

export const NotFound: React.FC<NotFoundProps> = ({ title, lede, message }) => {
    return (
        <div className="vf-stack vf-stack--800 | vf-u-margin__top--400">
            <div className="vf-stack">
                <div>
                    <h1 className="vf-intro__heading ">{title ?? "Error: 404"}</h1>
                </div>
                <div>
                    <p className="vf-lede">{lede ?? "We’re sorry - we can’t find the page or file you requested."}</p>
                </div>
                <div>
                    <p className="vf-intro__text">
                        {message ?? "It may have been removed, had its name changed, or be temporarily unavailable."}
                    </p>
                </div>
            </div>
            <div>
                <h3>Need assistance?</h3>
                <a className="vf-button vf-button--primary" href="https://www.ebi.ac.uk/about/contact/support/hmmer">
                    Contact support
                </a>
            </div>
        </div>
    );
};
