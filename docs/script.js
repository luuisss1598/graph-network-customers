const width = window.innerWidth;
const height = window.innerHeight;

const svg = d3.select("#graph").append("svg")
    .attr("width", width)
    .attr("height", height)
    .call(d3.zoom().on("zoom", (event) => {
        container.attr("transform", event.transform);
    }))
    .append("g");

const container = svg.append("g");

d3.csv("../data/full_data.csv").then(function(data) {
    const links = data.map(d => ({
        source: d.SOURCE,
        target: d.DESTINATION
    }));

    let nodeDegrees = {};
    links.forEach(link => {
        nodeDegrees[link.source] = (nodeDegrees[link.source] || 0) + 1;
        nodeDegrees[link.target] = (nodeDegrees[link.target] || 0) + 1;
    });

    const filteredLinks = links.filter(link => nodeDegrees[link.source] >= 2 && nodeDegrees[link.target] >= 2);

    let nodes = {};
    filteredLinks.forEach(link => {
        if (nodeDegrees[link.source] >= 2) nodes[link.source] = { id: link.source };
        if (nodeDegrees[link.target] >= 2) nodes[link.target] = { id: link.target };
    });

    nodes = Object.values(nodes);

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
    const radiusScale = d3.scaleSqrt().domain([6, d3.max(Object.values(nodeDegrees))]).range([10, 30]);

    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(filteredLinks).id(d => d.id).distance(50))
        .force("charge", d3.forceManyBody().strength(-100))
        .force("center", d3.forceCenter(width / 2, height / 2));

    const link = container.selectAll("line")
        .data(filteredLinks)
        .join("line")
        .style("stroke", "#aaa");

    const node = container.selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("r", d => radiusScale(nodeDegrees[d.id]))
        .style("fill", d => colorScale(d.id));

    simulation.on("tick", () => {
        link.attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node.attr("cx", d => d.x)
            .attr("cy", d => d.y);
    });
}).catch(function(error) {
    console.error('Error loading the CSV file:', error);
});
