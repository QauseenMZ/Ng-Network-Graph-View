import { Component, ViewChild, ElementRef } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'network-graph-app';
  networkObject = {
    "vertices": [{
        "id": "n1",
        "label": "Node 1",
        "type": "node"
      },
      {
        "id": "n2",
        "label": "Node 2",
        "type": "node"
      },
      {
        "id": "a1",
        "label": "Alarm 1",
        "type": "alarm"
      }
    ],
    "edges": [{
        "id": "e1",
        "label": "edge n1-n2",
        "type": "link",
        "source_id": "n1",
        "target_id": "n2"
      },
      {
        "id": "e2",
        "label": "edge n2-a1",
        "type": "link",
        "source_id": "n2",
        "target_id": "a1"
      }
    ]
  };

  @ViewChild('graphContainer') graphContainer: ElementRef;

  width = 960;
  height = 600;
  colors = d3.scaleOrdinal(d3.schemeCategory10);

  svg: any;
  force: any;
  path: any;
  circle: any;
  drag: any;
  dragLine: any;


  selectedNode = null;
  selectedLink = null;
  lastNodeId = 2;
  nodes = [];
  links = [];

  setNetworkValue(networkObject){
    let $self = this;
    let new_nodes:any = [];
    let new_links:any = [];
    let verticeData = networkObject.vertices;
    let edgeData = networkObject.edges;

    for(let i=0; i<verticeData.length; i++){
      let verticeObj = verticeData[i];
      verticeObj['nodeId'] = verticeData[i].id
      verticeObj['id'] = i;
      verticeObj['reflexive'] = false;    
      new_nodes.push(verticeObj);  
    }

    edgeData.forEach((edgeD) => {
      let edgeObj = {
        left: false,
        right: true,
        label: edgeD.label
      };

      verticeData.forEach((obj, index) => {
          if(obj.nodeId === edgeD.source_id){
            edgeObj['source'] = obj;
          }
          if(obj.nodeId === edgeD.target_id){
            edgeObj['target'] = obj;
          }
      })

      new_links.push(edgeObj);
      $self.nodes = new_nodes;
      $self.links = new_links
    })
  }

  getNodeObject(nodeID, verticeData){
    verticeData.forEach((obj, index) => {
      if(obj.nodeId === nodeID){
        return obj;
      }
    })
  }

  ngAfterContentInit() {
    this.setNetworkValue(this.networkObject);
    const rect = this.graphContainer.nativeElement.getBoundingClientRect();
    this.width = rect.width;

    this.svg = d3.select('#graphContainer')
      .attr('oncontextmenu', 'return false;')
      .attr('width', this.width)
      .attr('height', this.height);

    this.force = d3.forceSimulation()
      .force('link', d3.forceLink().id((d: any) => d.id).distance(150))
      .force('charge', d3.forceManyBody().strength(-500))
      .force('x', d3.forceX(this.width / 2))
      .force('y', d3.forceY(this.height / 2))
      .on('tick', () => this.tick());

    this.drag = d3.drag()
      .on('start', (d: any) => {
        if (!d3.event.active) this.force.alphaTarget(0.3).restart();

        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (d: any) => {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
      })
      .on('end', (d: any) => {
        if (!d3.event.active) this.force.alphaTarget(0.3);

        d.fx = null;
        d.fy = null;
      });


    this.svg.append('svg:defs').append('svg:marker')
      .attr('id', 'end-arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 19)
      .attr('markerWidth', 3)
      .attr('markerHeight', 3)
      .attr('orient', 'auto')
      .append('svg:path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#000');

    this.svg.append('svg:defs').append('svg:marker')
      .attr('id', 'start-arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 4)
      .attr('markerWidth', 3)
      .attr('markerHeight', 3)
      .attr('orient', 'auto')
      .append('svg:path')
      .attr('d', 'M10,-5L0,0L10,5')
      .attr('fill', '#000');

    this.path = this.svg.append('svg:g').selectAll('path');
    this.circle = this.svg.append('svg:g').selectAll('g');

    d3.select(window);
    this.restart();
  }


  tick() {
      this.path.attr('d', (d: any) => {
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

    this.circle.attr('transform', (d) => `translate(${d.x},${d.y})`);
  }

  restart() {
    this.path = this.path.data(this.links);

    this.path.classed('selected', (d) => d === this.selectedLink)
      .style('marker-start', (d) => d.left ? 'url(#start-arrow)' : '')
      .style('marker-end', (d) => d.right ? 'url(#end-arrow)' : '');

    this.path.exit().remove();

    this.path = this.path.enter().append('svg:path')
      .attr('class', 'link')
      .classed('selected', (d) => d === this.selectedLink)
      .style('marker-start', (d) => d.left ? 'url(#start-arrow)' : '')
      .style('marker-end', (d) => d.right ? 'url(#end-arrow)' : '')
      .merge(this.path);

    this.circle = this.circle.data(this.nodes, (d) => d.id);

    this.circle.selectAll('circle')
      .style('fill', (d) => {
        if(d === this.selectedNode) {
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

    this.circle.exit().remove();

    const g = this.circle.enter().append('svg:g');

    g.append('svg:circle')
      .attr('class', 'node')
      .attr('r', 27)
      .style('fill', (d) => {
        if(d === this.selectedNode) {
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
      .style('stroke', (d) => d3.rgb(this.colors(d.id)).darker().toString())
      .classed('reflexive', (d) => d.reflexive);
      
    g.append('svg:text')
      .attr('x', 0)
      .attr('y', 4)
      .attr('class', 'id')
      .text((d) => { return (d.label || d.id)});   

    this.circle = g.merge(this.circle);

    this.force
      .nodes(this.nodes)
      .force('link').links(this.links);

    this.force.alphaTarget(0.3).restart();
  }

  spliceLinksForNode(node) {
    const toSplice = this.links.filter((l) => l.source === node || l.target === node);
    for (const l of toSplice) {
      this.links.splice(this.links.indexOf(l), 1);
    }
  }

  submitJSON(jsonString){
    this.networkObject = eval('(' + JSON.parse(JSON.stringify(jsonString))+ ')');  
    this.setNetworkValue(this.networkObject);
    this.restart();
  }
}
