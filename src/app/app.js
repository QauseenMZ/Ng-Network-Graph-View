const width = 960;
const height = 500;
const colors = d3.scaleOrdinal(d3.schemeCategory10);

const svg = d3.select('body')
  .append('svg')
  .attr('oncontextmenu', 'return false;')
  .attr('width', width)
  .attr('height', height);

const nodes = [
  { id: 0, reflexive: false },
  { id: 1, reflexive: true },
  { id: 2, reflexive: false }
];
let lastNodeId = 2;
const links = [
  { source: nodes[0], target: nodes[1], left: false, right: true },
  { source: nodes[1], target: nodes[2], left: false, right: true }
];

const force = d3.forceSimulation()
  .force('link', d3.forceLink().id((d) => d.id).distance(150))
  .force('charge', d3.forceManyBody().strength(-500))
  .force('x', d3.forceX(width / 2))
  .force('y', d3.forceY(height / 2))
  .on('tick', tick);

const drag = d3.drag()
  .on('start', (d) => {
    if (!d3.event.active) force.alphaTarget(0.3).restart();

    d.fx = d.x;
    d.fy = d.y;
  })
  .on('drag', (d) => {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  })
  .on('end', (d) => {
    if (!d3.event.active) force.alphaTarget(0);

    d.fx = null;
    d.fy = null;
  });

svg.append('svg:defs').append('svg:marker')
    .attr('id', 'end-arrow')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 6)
    .attr('markerWidth', 3)
    .attr('markerHeight', 3)
    .attr('orient', 'auto')
  .append('svg:path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', '#000');

svg.append('svg:defs').append('svg:marker')
    .attr('id', 'start-arrow')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 4)
    .attr('markerWidth', 3)
    .attr('markerHeight', 3)
    .attr('orient', 'auto')
  .append('svg:path')
    .attr('d', 'M10,-5L0,0L10,5')
    .attr('fill', '#000');

const dragLine = svg.append('svg:path')
  .attr('class', 'link dragline hidden')
  .attr('d', 'M0,0L0,0');

let path = svg.append('svg:g').selectAll('path');
let circle = svg.append('svg:g').selectAll('g');

let selectedNode = null;
let selectedLink = null;

function tick() {
  path.attr('d', (d) => {
    const deltaX = d.target.x - d.source.x;
    const deltaY = d.target.y - d.source.y;
    const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const normX = deltaX / dist;
    const normY = deltaY / dist;
    const sourcePadding = d.left ? 17 : 12;
    const targetPadding = d.right ? 17 : 12;
    const sourceX = d.source.x + (sourcePadding * normX);
    const sourceY = d.source.y + (sourcePadding * normY);
    const targetX = d.target.x - (targetPadding * normX);
    const targetY = d.target.y - (targetPadding * normY);

    return `M${sourceX},${sourceY}L${targetX},${targetY}`;
  });

  circle.attr('transform', (d) => `translate(${d.x},${d.y})`);
}

function restart() {
  path = path.data(links);

  path.classed('selected', (d) => d === selectedLink)
    .style('marker-start', (d) => d.left ? 'url(#start-arrow)' : '')
    .style('marker-end', (d) => d.right ? 'url(#end-arrow)' : '');

  path.exit().remove();

  path = path.enter().append('svg:path')
    .attr('class', 'link')
    .classed('selected', (d) => d === selectedLink)
    .style('marker-start', (d) => d.left ? 'url(#start-arrow)' : '')
    .style('marker-end', (d) => d.right ? 'url(#end-arrow)' : '')
    .merge(path);

  circle = circle.data(nodes, (d) => d.id);

  circle.selectAll('circle')
    .style('fill', (d) => {
        if(d === selectedNode) {
          if(d.type == "alarm"){
            return d3.rgb(255,0,0).brighter().toString() 
          }
          return d3.rgb(30,144,255).brighter().toString()
        } 
        else {
          if(d.type == "alarm"){
            return d3.rgb(255,0,0).brighter().toString() 
          }
          return d3.rgb(30,144,255).brighter().toString();
        }
      })
    .classed('reflexive', (d) => d.reflexive);

  circle.exit().remove();

  const g = circle.enter().append('svg:g');

  g.append('svg:circle')
    .attr('class', 'node')
    .attr('r', 27)
    .style('fill', (d) => {
        if(d === selectedNode) {
          if(d.type == "alarm"){
            return d3.rgb(255,0,0).brighter().toString() 
          }
          return d3.rgb(30,144,255).brighter().toString();
        } 
        else {
          if(d.type == "alarm"){
            return d3.rgb(255,0,0).brighter().toString() 
          }
          return d3.rgb(30,144,255).brighter().toString();
        }
      })
    .style('stroke', (d) => d3.rgb(colors(d.id)).darker().toString())
    .classed('reflexive', (d) => d.reflexive)

  g.append('svg:text')
    .attr('x', 0)
    .attr('y', 4)
    .attr('class', 'id')
    .text((d) => d.id);

  circle = g.merge(circle);

  force
    .nodes(nodes)
    .force('link').links(links);

  force.alphaTarget(0.3).restart();
}


function spliceLinksForNode(node) {
  const toSplice = links.filter((l) => l.source === node || l.target === node);
  for (const l of toSplice) {
    links.splice(links.indexOf(l), 1);
  }
}

restart();