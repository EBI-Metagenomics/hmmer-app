import "./index.scss";

export const Hero: React.FC = () => {
    return (
        <section
            className="vf-hero | vf-u-fullbleed"
        >
            <div className="vf-hero__content | vf-box | vf-stack vf-stack--400">
                <p className="vf-hero__kicker">EMBL-EBI</p>
                <h1 className="vf-hero__heading">HMMER</h1>
                <p className="vf-hero__subheading">Biosequence analysis using profile hidden Markov Models</p>
            </div>
        </section>
    );
};
