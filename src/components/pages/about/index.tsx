import _ from "lodash";

import papers from "@/assets/papers.json";

const About: React.FC = () => {
    const paper = _.find(papers, ["DOI", "10.1093/nar/gky448"]);

    return (
        <div className="vf-stack vf-stack__200 | vf-text-body vf-text-body--2 | vf-u-padding__top--400">
            <h2 className="vf-text vf-text-heading--2">HMMER project background</h2>
            <section>
                <div className="vf-section-header">
                    <h3 className="vf-section-header__heading">About the project</h3>
                </div>
                <div className="vf-content">
                    <p>
                        The HMMER project is a collaborative project between the HMMER algorithm developers, led by{" "}
                        <a className="vf-link" href="http://eddylab.org/">
                            Sean Eddy
                        </a>{" "}
                        at <a href="https://www.hhmi.org/">HHMI/Harvard University</a>, and the HMMER web service team,
                        lead by <a href="https://www.ebi.ac.uk/about/people/rob-finn">Rob Finn</a> at{" "}
                        <a href="https://www.ebi.ac.uk/">EMBL-EBI</a>. Between us, we aim to provide Life science
                        researchers fast and sensitive homology searches, which are accessible to the broadest possible
                        community.
                    </p>
                    <p>
                        More information about this project is available on ReadTheDocs at{" "}
                        <a href="https://hmmer-web-docs.readthedocs.io/en/latest/about.html">
                            hmmer-web-docs.readthedocs.io/en/latest/about.html
                        </a>
                    </p>
                </div>
            </section>
            <section>
                <div className="vf-section-header">
                    <h3 className="vf-section-header__heading">Staying informed</h3>
                </div>
                <div className="vf-content">
                    <p>The following are aimed at keeping users informed about changes or issues:</p>
                    <ul className="vf-list vf-list--tight vf-u-margin__left--400">
                        <li className="vf-list__item">
                            <a href="https://bsky.app/profile/hmmer.bsky.social">Bluesky</a> - follow{" "}
                            <a href="https://bsky.app/profile/hmmer.bsky.social">@hmmer.bsky.social</a> for micro-blogs
                            about the HMMER website updates, target database updates and new web features.
                        </li>
                        <li className="vf-list__item">
                            <a href="https://hmmer-web-docs.readthedocs.io/en/latest/changes.html">Changelog</a> - lists
                            new features, bug fixes and improvements made to the site
                        </li>
                    </ul>
                </div>
            </section>
            <section>
                <div className="vf-section-header">
                    <h3 className="vf-section-header__heading">Citing us</h3>
                </div>
                <div className="vf-content">
                    <p>
                        If you have used the HMMER website, please consider citing the following reference that
                        describes this work:
                    </p>
                    <article className="vf-summary vf-summary--publication vf-u-padding__left--400">
                        <h3 className="vf-summary__title">
                            <a className="vf-summary__link" href={paper?.resource.primary.URL}>
                                {paper?.title[0]}
                            </a>
                        </h3>
                        <p className="vf-summary__author">
                            {_.map(
                                paper?.author as any,
                                (author) => `${author.family} ${_(author.given).words().map(_.head).join("")}`,
                            ).join(", ")}
                            .
                        </p>
                        <p className="vf-summary__source">
                            {paper?.["container-title"]}
                            <span className="vf-summary__date"> ({paper?.published["date-parts"][0][0]})</span>{" "}
                            <span>
                                {paper?.volume}
                                {": "}
                                {paper?.page}
                            </span>{" "}
                            <span>
                                <a className="vf-link" href={paper?.link[0].URL}>
                                    PDF
                                </a>
                            </span>
                        </p>
                    </article>
                </div>
            </section>
            <section>
                <div className="vf-section-header">
                    <h3 className="vf-section-header__heading">Funding</h3>
                </div>
                <div className="vf-content">
                    <p>HMMER is supported by the following organisations:</p>
                    <div className="vf-grid vf-grid__col-6 vf-u-padding__left--400" style={{ alignItems: "center" }}>
                        <div>
                            <img src="images/embl.png" alt="EMBL logo" />
                        </div>
                        <div className="vf-grid__col--span-5">
                            <p className="vf-u-type__text-body--2 vf-u-margin--0">
                                EMBL is EMBL-EBI's parent organisation. It provides core funding (staff, space,
                                equipment) for HMMER.
                            </p>
                        </div>
                        <div>
                            <img src="images/welcome.jpg" alt="Welcome Trust logo" />
                        </div>
                        <div className="vf-grid__col--span-5">
                            <p className="vf-u-type__text-body--2 vf-u-margin--0">
                                As well as providing and maintaining the campus on which the EMBL-EBI is located, the
                                Wellcome Trust also now provides funding for HMMER (grant 108433/Z/15/Z). The current
                                grant runs from October 2015 to September 2020.
                            </p>
                        </div>
                        <div>
                            <img src="images/hhmi.jpg" alt="HHMI logo" />
                        </div>
                        <div className="vf-grid__col--span-5">
                            <p className="vf-u-type__text-body--2 vf-u-margin--0">
                                The Howard Hughes Medical Institute supports the Eddy group.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
            <div className="vf-grid vf-grid__col-2 vf-u-margin__top--1200" style={{ justifyItems: "center" }}>
                <div>
                    <a href="https://www.ebi.ac.uk/">
                        <img src="images/ebi.jpg" alt="EMBL-EBI logo" />
                    </a>
                </div>
                <div>
                    <a href="https://www.mcb.harvard.edu/mcb/home/">
                        <img src="images/harvard.png" alt="Harvard logo" />
                    </a>
                </div>
                <div></div>
            </div>
        </div>
    );
};

export default About;
