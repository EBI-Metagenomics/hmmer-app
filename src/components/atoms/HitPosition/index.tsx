import { useEffect, useRef } from "react";
import _ from "lodash";

import { P7Hit } from "@/client/types.gen";

interface HitInfo {
    target: {
        len: number;
        hits: { from: number; to: number; count: number }[];
    };
    query: {
        len: number;
        hits: { from: number; to: number; count: number }[];
    };
}

interface HitPositionProps {
    hit: P7Hit;
}

export const HitPosition: React.FC<HitPositionProps> = ({ hit }) => {
    const width = 150;
    const height = 14;
    const colors = ["#d41645", "#f4c61f", "#18974c", "#3b6fb6"];

    const canvasRef = useRef<HTMLCanvasElement>(null);

    const transformHits = (hit: P7Hit) => {
        const hitInfo: HitInfo = {
            target: {
                len: _(hit.domains).filter("is_reported").first()?.alignment_display.l ?? 0,
                hits: [],
            },
            query: {
                len: _(hit.domains).filter("is_reported").first()?.alignment_display.m ?? 0,
                hits: [],
            },
        };

        if (hit.is_included) {
            let count = 0;

            _(hit.domains ?? []).filter("is_reported").each((domain) => {
                if (count === 0) {
                    hitInfo.query.hits.push({
                        from: domain.alignment_display.hmmfrom,
                        to: domain.alignment_display.hmmto,
                        count,
                    });
                    hitInfo.target.hits.push({
                        from: domain.alignment_display.sqfrom,
                        to: domain.alignment_display.sqto,
                        count,
                    });
                    count++;
                } else {
                    const previous = hitInfo.query.hits[count - 1];

                    if (domain.alignment_display.hmmfrom <= previous.to && domain.alignment_display.hmmto >= previous.from) {
                        previous.from = _.min([domain.alignment_display.hmmfrom, previous.from])!;
                        previous.to = _.max([domain.alignment_display.hmmto, previous.to])!;

                        hitInfo.target.hits.push({
                            from: domain.alignment_display.sqfrom,
                            to: domain.alignment_display.sqto,
                            count: previous.count,
                        });
                    } else {
                        hitInfo.query.hits.push({
                            from: domain.alignment_display.hmmfrom,
                            to: domain.alignment_display.hmmto,
                            count,
                        });
                        hitInfo.target.hits.push({
                            from: domain.alignment_display.sqfrom,
                            to: domain.alignment_display.sqto,
                            count,
                        });
                        count++;
                    }
                }
            });
        }

        const longest = _.max([hitInfo.query.len, hitInfo.target.len])!;

        const scaled = _.mapValues(hitInfo, (value) => ({
            len: _.round((value.len * width) / longest),
            hits: _.map(value.hits, (hit) => ({
                ...hit,
                from: _.round(((hit.from - 1) * width) / longest),
                to: _.round(((hit.to - 1) * width) / longest),
            })),
        }));

        return scaled;
    };

    const drawHit = (context: CanvasRenderingContext2D, hit: { from: number; to: number; count: number }, y: number) => {
        const hitWidth = hit.to - hit.from + 1;
    
        context.fillStyle = colors[hit.count];
        context.fillRect(hit.from, y, hitWidth, 4);
    };
    
    useEffect(() => {
        if (canvasRef.current) {
            
            const transformedHits = transformHits(hit);
            const context = canvasRef.current.getContext("2d");

            if (context) {
                // Fix canvas blurriness
                const dpr = window.devicePixelRatio;
                const rect = canvasRef.current.getBoundingClientRect();

                canvasRef.current.width = rect.width * dpr;
                canvasRef.current.height = rect.height * dpr;
                context.scale(dpr, dpr);
                canvasRef.current.style.width = `${rect.width}px`;
                canvasRef.current.style.height = `${rect.height}px`;

                // Draw the target/query sequences
                context.fillStyle = "#8d8f8e";
                context.fillRect(0, 3, transformedHits.query.len, 2);
                context.fillRect(0, 9, transformedHits.target.len, 2);

                // Draw the matches on the query
                _.each(transformedHits.query.hits, (hit) => drawHit(context, hit, 2));
                // Draw the matches on the target
                _.each(transformedHits.target.hits, (hit) => drawHit(context, hit, 8));
            }
        }
    }, [hit]);

    return <canvas width={width} height={height} ref={canvasRef} />;
};
