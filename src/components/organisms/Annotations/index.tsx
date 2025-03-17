import _ from "lodash";
import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
// @ts-ignore
import DomainGraphic from "domain-gfx";

import { architectureApiGetAnnotationsOptions } from "@/client/@tanstack/react-query.gen";
import { ProgressIndicator } from "@/components/atoms";

import "./index.scss";

interface AnnotationsProps {
    id: string;
}

export const Annotations: React.FC<AnnotationsProps> = ({ id }) => {
    const graphicsContainerRef = useRef<HTMLDivElement>(null);

    const { data, isPending } = useQuery({
        ...architectureApiGetAnnotationsOptions({
            path: { id },
        }),
    });

    const transformSnakeToCamel = (obj: Record<string, any> | any[]) =>
        _.transform(
            obj,
            (result, value, key) => {
                const camelKey = _.camelCase(key);
                const transformed = _.isObject(value) ? transformSnakeToCamel(value) : value;

                result[camelKey] = transformed;
            },
            (_.isArray(obj) ? [] : {}) as any,
        );

    useEffect(() => {
        if (data?.annotations && data.annotations[0].regions.length > 0) {
            const graphicsElement = new DomainGraphic({
                data: transformSnakeToCamel(data?.annotations?.[0]),
                parent: graphicsContainerRef.current,
            });

            return graphicsElement.delete;
        }
    }, [data]);

    if (isPending || data?.status !== "SUCCESS") {
        return (
            <div className="vf-stack vf-stack--400 | vf-u-padding__top--400">
                <p className="vf-text-body vf-text-body--2">Fetching sequence features...</p>
                <ProgressIndicator />
            </div>
        );
    }
    return (
        <div className="container">
            <h4 className="vf-text vf-text-heading--4 vf-u-margin__bottom--0">Sequence Features and Matches</h4>
            {data?.annotations && data.annotations[0].regions.length > 0 ? (
                <div ref={graphicsContainerRef} />
            ) : (
                <div>
                    <p className="vf-text vf-text-body--5">No matches found</p>
                </div>
            )}
        </div>
    );
};
