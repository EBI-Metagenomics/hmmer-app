import _ from "lodash";
import { useCallback, useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { useDropzone } from "react-dropzone";
import pluralize from "pluralize";
import { useFileContent } from "@hooks/useFileContent";

import { SearchRequestSchema } from "@/client/types.gen";
import { ProgressIndicator } from "@components/atoms/ProgressIndicator";

import "./index.scss";

const EXAMPLE_SEQUENCE = `>2abl_A mol:protein length:163  ABL TYROSINE KINASE
MGPSENDPNLFVALYDFVASGDNTLSITKGEKLRVLGYNHNGEWCEAQTKNGQGWVPSNYITPVNSLEKHSWYHGPVSRNAAEYLLSSGINGSFLVRESESSPGQRSISLRYEGRVYHYRINTASDGKLYVSSESRFNTLAELVHHHSTVADGLITTLHYPAP`;

const EXAMPLE_ALIGNMENT = `# STOCKHOLM 1.0
YQ53_CAEEL/650-977                DILVGIAR.EKKPD.VHDILKYFEESIGLQTIQLCQQTVDKM.....MG....GQGGRQTIDNVMRKFNLKCGGTNFFVEIPNAVRGKAVCSNNETLRKKLLEHVQFIGFEISHGASRTLFDRSRSQMDGEPSVVGVSYSLT...NSTQLGGFTYLQTQKEYKLQKLDE............FFPKCVRSYKEHSKT.LPTRIVIYRVGAGEGNFNRVKE.EVEEMRRTFD.......KIQ.PGYR..PHLVVIIAQRASHARVFPSCISG.....................NRATDQNIPSGTCV...ENVLTSYGYDEFILSSQTPLIGTVRPCKYTILVNDA...KWSKNEL.MHL......TYFRAFGHQVSY....QPPSV........PDVLYAAENLAKRGRNNYK
Q21691_CAEEL/673-1001             TIVFGIIA.EKRPD.MHDILKYFEEKLGQQTIQISSETADKF.....MR....DHGGKQTIDNVIRKLNPKCGGTNFLIDVPESVGHRVVCNNSAEMRAKLYAKTQFIGFEMSHTGARTRFDIQKVMFDGDPTVVGVAYSL..KHSAQLGGFSYFQESRLHKLTN.LQE............KMQICLNAYEQSSSY.LPETVVVYRVGSGEGDYPQIVN.EVNEMKLAAR.......KKK.HGYN..PKFLVICTQRNSHIRVFPEHINE....................RGKSMEQNVKSGTCV...DVPGASHGYEEFILCCQTPLIGTVKPTKYTIIVNDC...RWSKNEI.MNV......TYHLAFAHQVSY....APPAI........PNVSYAAQNLAKRGHNNYK
O48771_ARATH/542-860              FILCILPERKTSDI.YGPWKKICLTEEGIHTQCICPIKI.................SDQYLTNVLLKINSKLGGINS.LLGIEYSYNIPLINKIPTL.........ILGMDVSHGPPGR.........ADVPSVAAVVGSKCWPLISRYRAAVRTQSPRLEMIDSLFQP..IENTEKGDNGIMNELFVEFYRTSRARKPKQIIIFRDGVSESQFEQVLKIEVDQIIKAYQ.......RLG.ESDV..PKFTVIVAQKNHHTKLFQAKGPE...........................NVPAGTVV...DTKIVHPTNYDFYMCAHAGKIGTSRPAHYHVLLDEI...GFSPDDL.QNL......IHSLSYKLLNSI....FNVSSLLCVFVLSVAPVRYAHLAAAQVAQFTK
Q9ZVD5_ARATH/577-885              FILCVLPDKKNSDL.YGPWKKKNLTEFGIVTQCMAPTRQPND................QYLTNLLLKINAKLGGLNS.MLSVERTPAFTVISKVPTI.........ILGMDVSHGSPGQ.........SDVPSIAAVVSSREWPLISKYRASVRTQPSKAEMIESLVKK.....NGTEDDGIIKELLVDFYTSSNKRKPEHIIIFRDGVSESQFNQVLNIELDQIIEACK.......LLD.ANWN..PKFLLLVAQKNHHTKFFQPTSPE...........................NVPPGTII...DNKICHPKNNDFYLCAHAGMIGTTRPTHYHVLYDEI...GFSADEL.QEL......VHSLSYVYQRST....SAISV........VAPICYAHLAAAQLGTFMK
TAG76_CAEEL/660-966               CIIVVLQS.KNSDI.YMTVKEQSDIVHGIMSQCVLMKNVSRP..............TPATCANIVLKLNMKMGGIN..SRIVADKITNKYLVDQPTM.........VVGIDVTHPTQAE.......MRMNMPSVAAIVANVD.LLPQSYGANVKVQKKCRESVVY.LLD............AIRERIITFYRHTKQ.KPARIIVYRDGVSEGQFSEVLREEIQSIRTACL.......AIA.EDFR..PPITYIVVQKRHHARIFCKYQND.....................MVGKAKNVPPGTTV...DTGIVSPEGFDFYLCSHYGVQGTSRPARYHVLLDEC...KFTADEI.QSI......TYGMCHTYGRCT....RSVSI........PTPVYYADLVATRARCHVK
O16720_CAEEL/566-867              LIVVVLPG..KTPI.YAEVKRVGDTVLGIATQCVQAKNAIRT..............TPQTLSNLCLKMNVKLGGVNS.ILLPNVRPR...IFNEPVI.........FLGCDITHPAAGD.........TRKPSIAAVVGSMD.AHPSRYAATVRVQQHRQEIITD.LTY............MVRELLVQFYRNTRF.KPARIVVYRDGVSEGQLFNVLQYELRAIREACV.......MLE.SGYQ..PGITFIAVQKRHHTRLFAADKAD.....................QVGKAFNIPPGTTV...DVGITHPTEFDFFLCSHAGIQGTSRPSHYHVLWDDN...DLTADEL.QQL......TYQMCHTYVRCT....RSVSI........PAPAYYAHLVAFRARYHLV
PINH_ARATH/625-946                LLLAILPD.NNGSL.YGDLKRICETELGLISQCCLTKHVFKI..............SKQYLANVSLKINVKMGGRNT.VLVDAISCRIPLVSDIPTI.........IFGADVTHPENGE.........ESSPSIAAVVASQDWPEVTKYAGLVCAQAHRQELIQDLYKTWQDPVRGTVSGGMIRDLLISFRKATGQ.KPLRIIFYRDGVSEGQFYQVLLYELDAIRKACA.......SLE.PNYQ..PPVTFIVVQKRHHTRLFANNHRD...................KNSTDRSGNILPGTVV...DTKICHPTEFDFYLCSHAGIQGTSRPAHYHVLWDEN...NFTADGI.QSL......TNNLCYTYARCT....RSVSI........VPPAYYAHLAAFRARFYLE
AGO1_SCHPO/500-799                YLFFILDK.NSPEP.YGSIKRVCNTMLGVPSQCAISKHILQS..............KPQYCANLGMKINVKVGGINC.SLIPKSNP....LGNVPTL.........ILGGDVYHPGVGA..........TGVSIASIVASVD.LNGCKYTAVSRSQPRHQEVIEG.MKD............IVVYLLQGFRAMTKQ.QPQRIIYFRDGTSEGQFLSVINDELSQIKEACH.......SLS.PKYN..PKILVCTTQKRHHARFFIKNKSD......................GDRNGNPLPGTII...EKHVTHPYQYDFYLISHPSLQGVSVPVHYTVLHDEI...QMPPDQF.QTL......CYNLCYVYARAT....SAVSL........VPPVYYAHLVSNLARYQDV
O76922_DROME/555-852              IVMVVMRS.PNEEK.YSCIKKRTCVDRPVPSQVVTLKVIAPR.....QQ...KPTGLMSIATKVVIQMNAKLMGA...PWQVVIPL.......HGLM.........TVGFDVCHSPKNK...........NKSYGAFVATMDQKESFRYFSTVNEHIKGQELSEQ.MSV............NMACALRSYQEQHRS.LPERILFFRDGVGDGQLYQVVNSEVNTLKDRLDEI...YKSAG.KQEG..CRMTFIIVSKRINSRYFT.............................GHRNPVPGTVV...DDVITLPERYDFFLVSQAVRIGTVSPTSYNVISDNM...GLNADKL.QML......SYKMTHMYYNYS....GTIRV........PAVCHYAHKLAFLVAESIN
PIWI_DROME/538-829                LILCLVPN.DNAER.YSSIKKRGYVDRAVPTQVVTLKTTKNR.....SL........MSIATKIAIQLNCKLGYT...PWMIELPL.......SGLM.........TIGFDIAKSTRDR...........KRAYGALIASMDLQQNSTYFSTV.TECSAFDVLANTLWP............MIAKALRQYQHEHRK.LPSRIVFYRDGVSSGSLKQLFEFEVKDIIEKLKTE...YARVQ.LSP...PQLAYIVVTRSMNTRFFLN.............................GQNPPPGTIV...DDVITLPERYDFYLVSQQVRQGTVSPTSYNVLYSSM...GLSPEKM.QKL......TYKMCHLYYNWS....GTTRV........PAVCQYAKKLATLVGTNLH
Q17567_CAEEL/397-708              MLVVMLAD.DNKTR.YDSLKKYLCVECPIPNQCVNLRTLAGK.....SKDGGENKNLGSIVLKIVLQMICKTGGA...LWKVNIPL.......KSTM.........IVGYDLYHDSTLK...........GKTVGACVSTTS.NDFTQFYSQTRPHENPTQLGNN.LTH............FVRKSLKQYYDNNDKTLPSRLILYRDGAGDGQIPYIKNTEVKLVRDACDAVTDKAAELS.NKVQEKIKLAFIIVTKRVNMRILKQGSSS.......................KSAINPQPGTVV...DTTVTRPERMDFYLVPQFVNQGTVTPVSYNIIHDDT...GLGPDKH.QQL......AFKLCHLYYNWQ....GTVRV........PAPCQYAHKLAFLTAQSLH
PIWL1_HUMAN/555-847               IVVCLLSS.NRKDK.YDAIKKYLCTDCPTPSQCVVARTLGKQ.....QT.......VMAIATKIALQMNCKMGGE...LWRVDIPL.......KLVM.........IVGIDCYHDMTAG...........RRSIAGFVASIN.EGMTRWFSRCIFQDRGQELVDG.LKV............CLQAALRAW.NSCNEYMPSRIIVYRDGVGDGQLKTLVNYEVPQFLDCLK.......SIG.RGYN..PRLTVIVVKKRVNTRFFAQSGGR.........................LQNPLPGTVI...DVEVTRPEWYDFFIVSQAVRSGSVSPTHYNVIYDNS...GLKPDHI.QRL......TYKLCHIYYNWP....GVIRV........PAPCQYAHKLAFLVGQSIH
PIWI_ARCFU/110-406                GIMLVLPE.YNTPL.YYKLKSYLINS..IPSQFMRYDILSNR.....NL........TFYVDNLLVQFVSKLGGK...PWILNVDPEK....................GSDIIIGTGAT........RIDNVNLFCFAMVFK.KDGTMLWNEISPIVTSSEYLTY.LKS............TIKKVVYGFKKSNPDWDVEKLTLHVSG....KRPKMKDGETKILKETVE.......ELK.KQEMVSRDVKYAILHLNETHPFWVMGDPN........................NRFHPYEGTKVKLSSKRYLLTLLQPYLKRNGLEMVTPIKPLSVEIVSDN.....WTSEEYYHNVHEILDEIYYLSKMNWRGF....RSRNL........PVTVNYPKLVAGIIANVNR
Y1321_METJA/426-699               CFALIIGKEKYKDNDYYEILKKQLFDLKIISQNILWENWRKD.....DK........GYMTNNLLIQIMGKLGIK...YFILDSKTPYDY................IMGLDTGLGIFGN............HRVGGCTVVYDSEGKIRRIQPIETPAPGERLHLP................YVIEYLEN..KANIDMENKNILFLRDG.......FIQNSERNDLKEISK.......ELN.......SNIEVISIRKNNKYKVFTSDYRI........................GSVFGNDGIFLPHKTPFGSNPVKLSTWLRFNCGNEEGLK...IN.............ESI.MQL......LYDLTKMNYSALYGEGRYLRI........PAPIHYADKFVKALGKNWK
O67434_AQUAE/419-694              LVIVFLEEYPKVDP.YKSFLLYDFVKRELLKKMIPSQVILNR.....TL...KNENLKFVLLNVAEQVLAKTGNIP..YKLKEIEGKVDA................FVGIDISRITRDG..........KTVNAVAFTKIFNSKGELVRYYLTSYPAFGEKLTEK................AIGDVFSLLEKLGF.KKGSKIVVHRDG.......RLYRDEVAAFK...........KYG.ELYG..YSLELLEIIKRNNPRFFSNEKFI..............................KGYFYKLSEDSVILATYNQVY.......EGTHQPIKVRKVYGE.....LPVEVL.CSQ......ILSLTLMNYSSF....QPIKL........PATVHYSDKITKLMLRGIE
Q21495_CAEEL/52-336               GIVLPTPRIFFRDG..........QETSLNNQSFRNPT...................DFAQTGFFVDAKQQLGGLN..YVVNS.....ETWNDSGLL.........LIGLSTAPYLNSY........SSENVTTIGFVSNTM.DHPQKFAGGYKYVKSGSDVFGQVMPE............ILLNSLRSARKARKI.KPMNIVIYLCGMSESRFSIVKEEYVRNCHSVFK.......TLG.EKYS..PQLTIIVGSKGHSTRLYARGERD........................QISNLQPGTIV...DSVIVSPDYNKFFHCGAVARQGTCKATKYTVLYPE....SPKMEWI.QRM......TNDLCYMHEIVF....HPVSL........PAPLYLTAEMAERGTKNLA
O16386_CAEEL/548-847              QLIMFITK..SMNN.YHTEIKCLEQEFDLLTQDIRFETAVKL.....AQ.......QQNTRKNIIYKTNMKLGGLN..YELRS.....GVFSNSKRL.........IIGFETSQRGGLG..........DAPIAIGFAANMM.SHSQQFAGGYMFVKKSADNYGPVIPE............ILLTILKQAKANRPNDRPDELLIYFSGVSEGQHALVNEYYANQVKAACG.......LFN.ESFR..PHITLILASKVHNTRVYKSENGG........................GVCNVEPGTVI...DHTIVSPVLSEWYHAGSLARQGTSKLVKYSLIFNTK...KNEKLSVYERL......TNELCYEMQIVF....HPTSL........PIPLHIAGTYSERGSQMLA
O02095_CAEEL/574-878              QLLFFVVK..SRYN.YHQQIKALEQKYDVLTQEIRAETAEKV.....FR.......QPQTRLNIINKTNMKLGGLN..YAIGS.....EAFNKPNRL.........IVGFVTSQRVGGN.........PDYPISVGFAANML.KHHQKFAGGYVYVHRDRDVFGSIIKD............TLLAIFKTCTEQRG..RPDDILLYFNGVSEGQFSMINEEFSARVKEACMAF...QKEGT.PPFR..PHITIIASSKAHNERLYKSDKGR.........................IVNLEPGTVV...DHTIVSNVYTEWYHASAVARQGTAKATKFTLIFTTKAGPQAEPLWHLEQL......TNDLCYDHQIVF....HPVGL........PVPLYIADRYSQRGAMVLA
Q19645_CAEEL/674-996              PFVLFISD..DVPN.IHECLKFEERMSDIPTQHVLLKNVKKMRDNIEKKSQGGRRAYDLTLDNIVMKANIKCGGLN..YT.ADIPRDLACWNEVSTF.........VIGMDVAHPDRNA.......AREGNPSTVGLSCNSA.ENPYSFIGDFLYTDPRREAIQDEILR...........KFTDQSVRNFAEIRG..FPKKVIIFRDGVSFGEETAALK.EVEIIEQTIKTA...AKSMGHSDYA..PKVLAIVVKKRHHTRFYAKGGHH......................GNMPINPLPDTSV...GGDIAEYGKRQIFIQAFRPVQGTAKVPSFLVIRDDE...EVSDEHV.AKM......VCAVCSLHQLVN....SPTSI........PTPVYVAHELAKRGTGLYK
Q23415_CAEEL/40-350               KFAFVITD.DSITH.LHKKYKALEQKSMMVIQDMKISKANSV.....VK.....DGKRLTLENVINKTNMKLGGLN..YTVSDAKKSMT....DEQL.........IIGVGVSAPPAGT.KYMMDNKGHLNPQIIGFASNA..VANHEFVGDFVLAPSGQDTMAS.IED............VLKSSIDLFEMNRNT.LPKRIIIYRSGASDGSHASILAYEIPLARATIQ.......GYS.KDIN....LIYIIVTKEHSYRFFRDQLRS....................GGKATEMNIPPGIVL...DSAVTNPACKQFFLNGHTTLQGTAKTPLYTILADDC...NAPMDRL.EEL......TYTLCHHHQIVA....LSTSI........PTPLYVANEYAKRGRDLWS
O62275_CAEEL/594-924              TFVFIITD.DSITT.LHQRYKMIEKDTKMIVQDMKLSKALSV..........INAGKRLTLENVINKTNVKLGGSN..YVFVDAKKQL.....DSHL.........IIGVGISAPPAGT.KYAMENKGVLNPNVIGYAYNA..QHNQEFSGDFVLNSASQDTLAP.IED............IVMHSLNEYQKFHDGGLPRRVIVYRTGTSEGNHGSIMAYEIPLARAAMR.......DFS.PDIQ....LVYIVVSKDHSFRFFKPDLASLASRPQATSSTASRHSAMPAAPKAWDLNIAPGILV...DSIVTNPACKQFFLNSHITLQGTAKTPLYTVLADDA...KVSMTAL.EDI......TYKLCHLHQIVG....LPTSL........PTPLYVANEYAKRGRNLWN
//`;

interface InputProps {
    mode: ("sequence" | "hmm" | "alignment")[];
    onBatchModeChange: (isBatch: boolean) => void;
}

export const Input: React.FC<InputProps> = ({ mode, onBatchModeChange }) => {
    const [file, setFile] = useState<File | null>(null);
    const [isEmpty, setIsEmpty] = useState(true);
    const [helperMessage, setHelperMessage] = useState("");

    const { content, error: fileError, isLoading } = useFileContent(file);

    const {
        register,
        setValue,
        watch,
        resetField,
        formState: { isSubmitted, isSubmitting, errors },
    } = useFormContext<SearchRequestSchema>();

    useEffect(() => {
        if (content) {
            setValue("input", content, { shouldDirty: true });
        }
    }, [content, setValue]);

    useEffect(() => {
        const { unsubscribe } = watch((value, { name }) => {
            if (name === "input") {
                setIsEmpty(value.input === "");

                if (!value.input || !value.input.trim()) {
                    setFile(null);
                    onBatchModeChange(false);
                    setHelperMessage("");

                    return;
                }

                const singleFastaRegex = />[^\n\r]*\r?\n(?:[A-Za-z*-]+\r?\n?)+/g;
                const fastaMatches = value.input.match(singleFastaRegex);

                if (fastaMatches) {
                    const biggestAminoAcidCount = _(fastaMatches)
                        .map((match) => {
                            return _(match)
                                .trim()
                                .split(/\r?\n/)
                                .filter((line) => !_.startsWith(line, ">"))
                                .join("")
                                .replace(/[^A-Za-z]/, "").length;
                        })
                        .max();

                    if (fastaMatches.length > 1) {
                        onBatchModeChange(true);
                        setHelperMessage(
                            `${fastaMatches.length} sequences with the longest having ${biggestAminoAcidCount} amino ${pluralize("acid", biggestAminoAcidCount)}`,
                        );
                    } else {
                        onBatchModeChange(false);
                        setHelperMessage(
                            `1 sequence of ${biggestAminoAcidCount} amino ${pluralize("acid", biggestAminoAcidCount)}`,
                        );
                    }

                    return;
                }

                const singneHMMRegex = /\bHMMER.*?^\/\/$/gms;
                const hmmMatches = value.input.match(singneHMMRegex);

                if (hmmMatches) {
                    if (hmmMatches.length > 1) {
                        onBatchModeChange(true);
                        setHelperMessage(`${hmmMatches.length} HMMs`);
                    } else {
                        onBatchModeChange(false);
                        setHelperMessage("");
                    }

                    return;
                }
            }
        });

        return () => unsubscribe();
    }, [watch]);

    const resetInput = () => {
        setFile(null);
        resetField("input");
    };

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file) {
            setFile(file);
        }
        setHelperMessage("");
    }, []);

    const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
        onDrop,
        maxSize: 20 * 1024 * 1024,
        multiple: false,
        noClick: true,
    });

    return (
        <>
            <div {...getRootProps({ className: "input-wrapper" })}>
                <textarea
                    rows={10}
                    className="vf-form__textarea vf-font-plex-mono"
                    {...register("input")}
                    readOnly={isLoading}
                />
                <input {...getInputProps()} />

                {isDragActive && (
                    <div className="input-helper-text vf-text-body vf-text-body--3 disable-parent">
                        <span>Drop the files here ...</span>
                    </div>
                )}

                {isLoading && (
                    <div
                        className="input-helper-text vf-text-body vf-text-body--3 disable-parent"
                        hidden={!isEmpty || isSubmitted}
                    >
                        Processing {file?.name}... <ProgressIndicator width={"80%"} />
                    </div>
                )}

                {fileError && (
                    <div className="input-helper-text vf-text-body vf-text-body--3 disable-parent">
                        <p className="vf-text--error">Error with file {file?.name}</p>
                        <p className="vf-text--error">{fileError.message}</p>
                        <a
                            onClick={(e) => {
                                e.preventDefault();
                                resetInput();
                            }}
                            className="vf-link"
                        >
                            Start over
                        </a>
                    </div>
                )}

                {isEmpty && !isLoading && (
                    <div className="input-helper-text vf-text-body vf-text-body--3">
                        <span>
                            {" "}
                            Paste in your{" "}
                            {`${mode.length > 1 ? _.join([_(mode).initial().join(", "), _.last(mode)], " or ") : mode[0]}`}
                            , use the{" "}
                            <a
                                onClick={(e) => {
                                    e.preventDefault();
                                    setValue(
                                        "input",
                                        _.includes(mode, "sequence") ? EXAMPLE_SEQUENCE : EXAMPLE_ALIGNMENT,
                                        {
                                            shouldDirty: true,
                                        },
                                    );
                                }}
                                className="vf-link"
                            >
                                example
                            </a>
                            , drag a file over or{" "}
                            <a
                                onClick={(e) => {
                                    e.preventDefault();
                                    open();
                                }}
                                className="vf-link"
                            >
                                choose a file to upload
                            </a>
                        </span>
                    </div>
                )}

                {isSubmitting && (
                    <div className="input-helper-text disable-parent">
                        <span>Submitting your search...</span>
                        <ProgressIndicator width={"80%"} />
                    </div>
                )}

                {file && !isSubmitting && <div className="filename-container">{file.name}</div>}
            </div>
            {helperMessage && <p className="vf-form__helper">{helperMessage}</p>}
            {errors.input && <p className="vf-form__helper vf-form__helper--error">{errors.input.message as string}</p>}
        </>
    );
};
