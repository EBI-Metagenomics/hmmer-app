import _ from "lodash";
import { useRef } from "react";

const Help: React.FC = () => {
    const cliDocsRef = useRef<HTMLElement>(null);
    const webDocsRef = useRef<HTMLElement>(null);

    return (
        <div className="vf-stack vf-stack__200 | vf-text-body vf-text-body--2 | vf-u-padding__top--400">
            <h2 className="vf-text vf-text-heading--2">Using the HMMER website</h2>
            <section>
                <div className="vf-content">
                    <p>
                        There are two flavours of HMMER documentation available: the first concerns the{" "}
                        <a
                            onClick={(e) => {
                                e.preventDefault();
                                cliDocsRef.current?.scrollIntoView();
                            }}
                            className="vf-link"
                        >
                            command line use of the tool
                        </a>
                        ; the second describes{" "}
                        <a
                            onClick={(e) => {
                                e.preventDefault();
                                webDocsRef.current?.scrollIntoView();
                            }}
                            className="vf-link"
                        >
                            the use of HMMER through this website
                        </a>
                        , which can be accessed using either the web interface or the application program interface
                        (API).
                    </p>
                    <p>
                        The comprehensive command line documentation provides background on profile HMMs and the details
                        of the different algorithms, as well as providing a description of all available options. This
                        website provides access to the same algorithms, and makes available the more widely used command
                        line options.
                    </p>
                    <p>
                        The results from the command line and website versions of HMMER are all identical for a given
                        query, database and options. However, the website provides additional views of the results to
                        permit a deeper analysis, using just a few mouse clicks.
                    </p>
                </div>
            </section>
            <section ref={webDocsRef}>
                <div className="vf-section-header">
                    <h3 className="vf-section-header__heading">Documentation for the website</h3>
                </div>
                <div className="vf-content">
                    <p>
                        The documentation is on ReadTheDocs at{" "}
                        <a className="vf-link" href="https://hmmer-web-docs.readthedocs.io/en/latest/index.html">
                            hmmer-web-docs.readthedocs.io
                        </a>
                        .
                    </p>
                </div>
            </section>
            <section ref={cliDocsRef}>
                <div className="vf-section-header">
                    <h3 className="vf-section-header__heading">Documentation for the HMMER software</h3>
                </div>
                <div className="vf-content">
                    <p>
                        Please see{" "}
                        <a className="vf-link" href="http://hmmer.org/documentation.html">
                            {" "}
                            hmmer.org/documentation.html
                        </a>{" "}
                        or download as a{" "}
                        <a className="vf-link" href="http://eddylab.org/software/hmmer/Userguide.pdf">
                            PDF
                        </a>
                        .
                    </p>
                </div>
            </section>
            <section>
                <div className="vf-section-header">
                    <h3 className="vf-section-header__heading">Helpdesk</h3>
                </div>
                <div className="vf-content">
                    <p>
                        Your questions are important to us. Use our{" "}
                        <a className="vf-link" href="https://www.ebi.ac.uk/about/contact/support/hmmer">
                            contact form
                        </a>{" "}
                        for any questions regarding the use of the HMMER servers. If you are referring to a specific
                        result set, please include the{" "}
                        <a
                            className="vf-link"
                            href="https://hmmer-web-docs.readthedocs.io/en/latest/appendices.html#appendix-e-job-id"
                        >
                            job-id
                        </a>{" "}
                        in the email.
                    </p>
                    <p>
                        For questions about the command line version HMMER, please email Sean Eddy {"<"}
                        <a href="mailto:sean@eddylab.org">sean@eddylab.org</a>
                        {">"}. See{" "}
                        <a className="vf-link" href="http://hmmer.org/documentation.html">
                            here, in the "reporting bugs section"
                        </a>
                        .
                    </p>
                </div>
            </section>
        </div>
    );
};

export default Help;
