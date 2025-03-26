import React, { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import _ from "lodash";
import * as d3 from "d3";

import { taxonomyApiGetTaxonomyDistributionOptions } from "@/client/@tanstack/react-query.gen";
import { ProgressIndicator } from "@/components/atoms";

import "./index.scss";

interface DistributionGraphProps {
    id: string;
}

export const DistributionGraph: React.FC<DistributionGraphProps> = ({ id }) => {
    const graphRef = useRef<HTMLDivElement>(null);

    const { data: graphData, isPending } = useQuery({
        ...taxonomyApiGetTaxonomyDistributionOptions({ path: { id } }),
        refetchInterval(query) {
            if (query.state.data?.status === "SUCCESS") return false;
            if (query.state.data?.status === "FAILURE") return false;

            return Math.min(1000 * 2 ** query.state.dataUpdateCount, 5 * 60 * 1000);
        },
    });

    useEffect(() => {
        if (!graphData) return;

        // Clear any existing SVG
        d3.select(graphRef.current).selectAll("*").remove();

        const height = 50;
        const width = 410;

        const data = graphData.graph?.data ?? [];
        const labels = graphData.graph?.labels ?? [];
        let oMax = 0;

        const animation = {
            delay: 50,
            duration: 250,
        };

        const nBins = data.length;

        // Calculate max column total and remaining counts
        let remaining = 0;
        for (let j = 0; j < nBins; j++) {
            let colTotal = 0;
            for (let k = 0; k < data[j].length; k++) {
                remaining += data[j][k];
                colTotal += data[j][k];
            }
            if (colTotal > oMax) oMax = colTotal;
        }

        // Create SVG
        const svg = d3.select(graphRef.current).append("svg").attr("width", width).attr("height", height);

        // Draw arrow to indicate direction
        const arrow = svg
            .append("path")
            .attr("d", "M0 25 L345 22 L345 18 L360 25 L345 33 L345 29 L0 25")
            .attr("stroke", "#000")
            .attr("fill", "#999")
            .attr("opacity", "0.2");

        // Animate arrow
        arrow
            .style("transform", `translateX(-${width}px)`)
            .transition()
            .duration(animation.delay * nBins + animation.duration)
            .style("transform", "translateX(0)");

        // Draw text indication
        const text = svg
            .append("text")
            .attr("x", 385)
            .attr("y", height / 2 + 1)
            .attr("fill", "#444")
            .attr("font-size", "9px")
            .attr("text-anchor", "middle");

        text.append("tspan").attr("x", 382).attr("dy", 0).text("more");

        text.append("tspan").attr("x", 382).attr("dy", "1.2em").text("significant");

        const binWidth = (width - 50 - (nBins - 1) * 2) / nBins;

        // Draw bins
        for (let i = 0; i < nBins; i++) {
            // opacity, less significant -> more significant: ≈25% -> 100%
            const opacity = 0.25 + (0.75 * (i + 1)) / nBins;

            // Calculate total hits for this bin
            const hits = data[i].reduce((a, b) => a + b, 0);

            // Draw a grey line marker to indicate position of the bin
            const x = i * (binWidth + 2);

            // Update remaining counter
            remaining -= hits;
            const row = remaining;

            if (hits) {
                // Draw marker line
                svg.append("path")
                    .attr("d", `M${x} ${height - 1} L${x + binWidth} ${height - 1}`)
                    .attr("stroke", "#666");

                const label = labels[i];

                // Draw stacked rectangles for each kingdom
                let previous = 0;
                for (let t = 0; t < data[i].length; t++) {
                    if (data[i][t] > 0) {
                        // Draw the scaled rectangles for each kingdom
                        const pos = (47 * data[i][t]) / oMax;
                        const rect = svg
                            .append("rect")
                            .attr("x", x)
                            .attr("y", 47 - (pos + previous))
                            .attr("width", binWidth)
                            .attr("height", pos)
                            .attr("stroke", graphData.graph?.colors[t] ?? "")
                            .attr("fill", graphData.graph?.colors[t] ?? "")
                            .attr("opacity", opacity)
                            .attr("stroke-opacity", 0.8);

                        // Animation
                        rect.style("transform", `translateY(${height}px)`)
                            .transition()
                            .duration(animation.duration)
                            .delay(i * animation.delay)
                            .style("transform", "translateY(0)")
                            .ease(d3.easeCubicOut);

                        previous += pos;
                    }
                }

                // Create mouse over target that is bigger than the scaled column
                const target = svg
                    .append("rect")
                    .attr("id", `target-${i}`)
                    .attr("x", x)
                    .attr("y", 0)
                    .attr("width", binWidth)
                    .attr("height", 47)
                    .attr("fill", "#18974c")
                    .attr("stroke", "#18974c")
                    .attr("opacity", 0)
                    .attr("cursor", "pointer")
                    .attr("data-row", row + 1)
                    .attr("class", "target");


                // Create tooltip content
                const tooltipId = `tooltip-${i}`;
                target
                    .on("mouseover", () => {
                        // Show tooltip
                        d3.select("#" + tooltipId).style("display", "block");
                        d3.select(`#target-${i}`).style("opacity", 0.1);
                    })
                    .on("mouseout", () => {
                        // Hide tooltip
                        d3.select("#" + tooltipId).style("display", "none");
                        d3.select(`#target-${i}`).style("opacity", 0);
                    });

                // Create tooltip element
                const tooltip = d3
                    .select(graphRef.current)
                    .append("div")
                    .attr("id", tooltipId)
                    .attr("class", "vf-card")
                    .style("position", "absolute")
                    .style("display", "none")
                    .style("pointer-events", "none")
                    .style("font-size", "small")
                    .style("z-index", 100);

                tooltip.append("div").attr("class", "card-heading").text(label);

                const list = tooltip
                    .append("div")
                    .style("padding", "10px")
                    .style("display", "flex")
                    .style("flex-direction", "column");

                _.each(graphData?.graph?.categories, (category, index) => {
                    const listItem = list.append("div").style("display", "flex").style("align-items", "center");

                    listItem
                        .append("div")
                        .style("width", "10px")
                        .style("height", "10px")
                        .style("background-color", graphData?.graph?.colors[index] ?? "")
                        .style("display", "inline-block")
                        .style("margin-right", "5px");

                    listItem.append("span").text(`${category}: ${data[i][index]}`);
                });

                target.on("mousemove", (event) => {
                    tooltip.style("left", event.pageX + 10 + "px").style("top", event.pageY - 20 + "px");
                });
            } else {
                // Draw marker line for empty bins
                svg.append("path")
                    .attr("d", `M${x} ${height - 1} L${x + binWidth} ${height - 1}`)
                    .attr("stroke", "#ccc");
            }
        }
    }, [graphData]);

    if (isPending || graphData?.status !== "SUCCESS") {
        return (
            <div className="vf-stack vf-stack--400 | vf-u-padding__top--400">
                <p className="vf-text-body vf-text-body--2">Fetching Distribution Graph...</p>
                <ProgressIndicator />
            </div>
        );
    }

    return (
        <div className="container">
            <div>
                <h4 className="vf-text vf-text-heading--4">Distribution of Significant Hits</h4>
            </div>
            <div id="barGraph" ref={graphRef} style={{ width: "410px", height: "50px" }}></div>
            <div className="legend">
                {_.map(graphData?.graph?.categories, (label, index) => (
                    <div key={index}>
                        <div style={{ width: 10, height: 10, backgroundColor: graphData?.graph?.colors[index] }} />
                        <span>{label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
