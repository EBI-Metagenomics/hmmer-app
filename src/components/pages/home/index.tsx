import _ from "lodash";
import { Link } from "react-router";

import {
    BlueskyPostDisplay,
    BlueskyPostLoading,
    BlueskyConfigProvider,
    useBlueskyProfile,
    useBlueskyProfilePosts,
} from "bluesky-embed-react";

import papers from "@/assets/papers.json";

const pages = [
    {
        title: "Search",
        link: "/search",
        description: "Perform searches using HMMER",
    },
    {
        title: "Results",
        link: "/results",
        description: "View your previous search results",
    },
    {
        title: "Software",
        link: "http://hmmer.org/download.html",
        description: "Download latest HMMER packages",
    },
    {
        title: "Help",
        link: "/help",
        description: "Info about using the HMMER website",
    },
    {
        title: "About",
        link: "/about",
        description: "",
    },
    {
        title: "Contact",
        link: "https://www.ebi.ac.uk/about/contact/support/hmmer",
        description: "",
    },
];

const Home = () => {
    return (
        <>
            <section className="vf-grid vf-grid__col-3 | vf-card-container | vf-u-fullbleed vf-u-background-color-ui--grey--light | vf-u-padding__top--800 vf-u-padding__bottom--800">
                <div className="vf-grid__col--span-2">
                    <div className="vf-grid vf-grid__col-2">
                        {_.map(pages, (pageProps) => (
                            <NavigationCard key={pageProps.link} {...pageProps} />
                        ))}
                    </div>
                </div>
                <div>
                    <article className="vf-card vf-card--brand vf-card--striped">
                        <div className="vf-card__content | vf-stack vf-stack--400">
                            <h3 className="vf-card__heading">About HMMER</h3>
                            <p className="vf-card__text">
                                The HMMER web server: fast and sensitive homology searches. This site has been designed
                                to provide near interactive searches for most queries, coupled with intuitive and
                                interactive results visualisations.
                            </p>
                        </div>
                    </article>
                </div>
            </section>
            <div className="vf-stack vf-stack__400 | vf-u-fullbleed | vf-u-padding__top--400 vf-u-padding__bottom--800 ">
                <div>
                    <h3 className="vf-text vf-text-heading--3">Latest News</h3>
                </div>
                <section className="vf-grid vf-grid__col-3 | vf-card-container | vf-u-padding__top--200">
                    <div className="vf-grid__col--span-2">
                        <BlueskyPosts userHandle="hmmer.bsky.social" />
                    </div>
                    <div>
                        <a className="vf-button vf-button--secondary" href="https://bsky.app/profile/hmmer.bsky.social">
                            <div className="vf-stack vf-stack__200">
                                <p>Follow HMMER on Bluesky</p>
                                <svg width="32" height="28">
                                    <image xlinkHref="images/bluesky.svg" width="32" height="28" />
                                </svg>
                            </div>
                        </a>
                    </div>
                </section>
            </div>

            <section
                className="vf-summary-container | vf-stack vf-stack__200 | vf-u-fullbleed vf-u-background-color-ui--grey--light | vf-u-padding__top--800 vf-u-padding__bottom--800"
                style={{ marginBottom: -48 }}
            >
                <div className="vf-u-padding__bottom--200">
                    <h3 className="vf-text vf-text-heading--3">Papers</h3>
                </div>
                <div>
                    <Papers papers={papers} />
                </div>
                <a className="vf-button vf-button--tertiary vf-button--sm" href="http://eddylab.org/publications.html">
                    more
                </a>
            </section>
        </>
    );
};

interface NavigationCardProps {
    title: string;
    link: string;
    description?: string;
}

const NavigationCard: React.FC<NavigationCardProps> = ({ title, link, description }) => {
    return (
        <article className="vf-card vf-card--brand vf-card--bordered">
            <div className="vf-card__content | vf-stack vf-stack--400">
                <h3 className="vf-card__heading">
                    <Link to={link} className="vf-card__link">
                        {title}{" "}
                        <svg
                            aria-hidden="true"
                            className="vf-card__heading__icon | vf-icon vf-icon-arrow--inline-end"
                            width="1em"
                            height="1em"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M0 12c0 6.627 5.373 12 12 12s12-5.373 12-12S18.627 0 12 0C5.376.008.008 5.376 0 12zm13.707-5.209l4.5 4.5a1 1 0 010 1.414l-4.5 4.5a1 1 0 01-1.414-1.414l2.366-2.367a.25.25 0 00-.177-.424H6a1 1 0 010-2h8.482a.25.25 0 00.177-.427l-2.366-2.368a1 1 0 011.414-1.414z"
                                fill="currentColor"
                                fillRule="nonzero"
                            ></path>
                        </svg>
                    </Link>
                </h3>
                <p className="vf-card__text">{description}</p>
            </div>
        </article>
    );
};

interface BlueskyPostsProps {
    userHandle: string;
    limit?: number;
}

const BlueskyPosts: React.FC<BlueskyPostsProps> = ({ userHandle, limit = 5 }) => {
    const { value: profile, loading: profileLoading } = useBlueskyProfile(userHandle);
    const { value: posts, loading: postsLoading } = useBlueskyProfilePosts(userHandle, limit);

    if (posts?.feed.length === 0) {
        return (
            <div className="vf-u-margin__top--800">
                <p className="vf-text-body vf-text-body--5">No tweets available</p>
            </div>
        );
    }

    return (
        <BlueskyConfigProvider borderRadius={0} borderColor="transparent">
            <div className="vf-stack vf-stack__200">
                {(profileLoading || postsLoading) && _.times(limit, (index) => <BlueskyPostLoading key={index} />)}
                {!(profileLoading || postsLoading) &&
                    posts?.feed.map(({ post }) => (
                        <div key={post.cid} className="vf-card">
                            <BlueskyPostDisplay profile={profile!} post={post} />
                        </div>
                    ))}
            </div>
        </BlueskyConfigProvider>
    );
};

interface PapersProps {
    papers: Record<string, any>[];
}

const Papers: React.FC<PapersProps> = ({ papers }) => {
    return (
        <>
            {papers.map((paper) => (
                <article className="vf-summary vf-summary--publication">
                    <h3 className="vf-summary__title">
                        <a className="vf-summary__link" href={paper.resource.primary.URL}>
                            {paper.title[0]}
                        </a>
                    </h3>
                    <p className="vf-summary__author">
                        {_.map(
                            paper.author,
                            (author) => `${author.family} ${_(author.given).words().map(_.head).join("")}`,
                        ).join(", ")}
                        .
                    </p>
                    <p className="vf-summary__source">
                        {paper["container-title"]}
                        <span className="vf-summary__date"> ({paper.published["date-parts"][0][0]})</span>{" "}
                        <span>
                            {paper.volume}
                            {": "}
                            {paper.page}
                        </span>{" "}
                        <span>
                            <a className="vf-link" href={paper.link[0].URL}>
                                PDF
                            </a>
                        </span>
                    </p>
                    <p className="vf-summary__text"></p>
                </article>
            ))}
        </>
    );
};

export default Home;
