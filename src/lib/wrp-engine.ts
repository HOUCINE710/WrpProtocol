import { Node, Link, RoutingEntry, NodeState } from '../types/wrp';

export interface WRPEvent {
  type: 'update_received' | 'table_changed' | 'link_failure' | 'convergence';
  nodeId: string;
  description: string;
  timestamp: number;
}

export class WRPEngine {
  private nodes: Map<string, NodeState> = new Map();
  private topology: { nodes: Node[], links: Link[] } = { nodes: [], links: [] };
  private events: WRPEvent[] = [];

  constructor(nodes: Node[], links: Link[]) {
    this.topology = { nodes, links };
    this.initializeNodes();
  }

  public getEvents() {
    return this.events;
  }

  public clearEvents() {
    this.events = [];
  }

  private addEvent(event: Omit<WRPEvent, 'timestamp'>) {
    this.events.push({ ...event, timestamp: Date.now() });
    if (this.events.length > 50) this.events.shift();
  }

  private initializeNodes() {
    this.topology.nodes.forEach(node => {
      this.nodes.set(node.id, {
        routingTable: new Map(),
        distanceTable: new Map(),
        linkCostTable: new Map(),
        neighbors: new Set(),
      });
      
      // Self entry
      const state = this.nodes.get(node.id)!;
      state.routingTable.set(node.id, {
        destination: node.id,
        nextHop: node.id,
        distance: 0,
        predecessor: node.id,
      });
    });

    this.updateLinkCosts();
  }

  private updateLinkCosts() {
    // Reset neighbors and link costs
    this.nodes.forEach(state => {
      state.neighbors.clear();
      state.linkCostTable.clear();
    });

    this.topology.links.forEach(link => {
      if (link.status === 'broken') return;
      
      const sourceNode = this.topology.nodes.find(n => n.id === link.source);
      const targetNode = this.topology.nodes.find(n => n.id === link.target);
      
      if (!sourceNode || !targetNode || sourceNode.status === 'inactive' || targetNode.status === 'inactive') return;

      const sState = this.nodes.get(link.source)!;
      const tState = this.nodes.get(link.target)!;

      sState.neighbors.add(link.target);
      sState.linkCostTable.set(link.target, link.cost);

      tState.neighbors.add(link.source);
      tState.linkCostTable.set(link.source, link.cost);
    });
  }

  public step(): boolean {
    let changed = false;
    const newStates = new Map<string, NodeState>();

    // Clone current states for synchronous update simulation
    this.nodes.forEach((state, id) => {
      newStates.set(id, {
        routingTable: new Map(state.routingTable),
        distanceTable: new Map(Array.from(state.distanceTable.entries()).map(([k, v]) => [k, new Map(v)])),
        linkCostTable: new Map(state.linkCostTable),
        neighbors: new Set(state.neighbors),
      });
    });

    // For each node, simulate receiving updates from neighbors
    this.topology.nodes.forEach(node => {
      if (node.status === 'inactive') return;
      
      const myState = this.nodes.get(node.id)!;
      const myNewState = newStates.get(node.id)!;

      // WRP Logic: Update distance table based on neighbor's routing tables
      myState.neighbors.forEach(neighborId => {
        const neighborNode = this.topology.nodes.find(n => n.id === neighborId);
        if (!neighborNode || neighborNode.status === 'inactive') return;

        const neighborState = this.nodes.get(neighborId)!;
        
        neighborState.routingTable.forEach((entry, destId) => {
          const currentDist = myNewState.distanceTable.get(destId)?.get(neighborId) ?? Infinity;
          const newDist = entry.distance;

          if (currentDist !== newDist) {
            if (!myNewState.distanceTable.has(destId)) {
              myNewState.distanceTable.set(destId, new Map());
            }
            myNewState.distanceTable.get(destId)!.set(neighborId, newDist);
            changed = true;
            this.addEvent({
              type: 'update_received',
              nodeId: node.id,
              description: `Received update from ${neighborNode.name} about destination ${this.topology.nodes.find(n => n.id === destId)?.name || destId}`,
            });
          }
        });
      });

      // Recalculate Routing Table based on Distance Table and Link Cost Table
      // Bellman-Ford style but with WRP specific predecessor check to avoid loops
      this.topology.nodes.forEach(destNode => {
        if (destNode.id === node.id) return;

        let minDistance = Infinity;
        let bestNextHop = '';
        let bestPredecessor = '';

        myNewState.distanceTable.get(destNode.id)?.forEach((distToDestViaNeighbor, neighborId) => {
          const linkCost = myNewState.linkCostTable.get(neighborId) ?? Infinity;
          const totalDist = distToDestViaNeighbor + linkCost;

          if (totalDist < minDistance) {
            minDistance = totalDist;
            bestNextHop = neighborId;
            
            const neighborRT = this.nodes.get(neighborId)?.routingTable.get(destNode.id);
            bestPredecessor = neighborRT?.predecessor ?? neighborId;
          }
        });

        const currentRT = myNewState.routingTable.get(destNode.id);
        if (!currentRT || currentRT.distance !== minDistance || currentRT.nextHop !== bestNextHop) {
          myNewState.routingTable.set(destNode.id, {
            destination: destNode.id,
            nextHop: bestNextHop,
            distance: minDistance,
            predecessor: bestPredecessor,
          });
          changed = true;
          this.addEvent({
            type: 'table_changed',
            nodeId: node.id,
            description: `Updated route to ${destNode.name} via ${this.topology.nodes.find(n => n.id === bestNextHop)?.name || 'None'} (Dist: ${minDistance})`,
          });
        }
      });
    });

    if (changed) {
      this.nodes = newStates;
    } else if (this.events.length > 0 && this.events[this.events.length - 1].type !== 'convergence') {
      this.addEvent({
        type: 'convergence',
        nodeId: 'system',
        description: 'Network has converged. All routing tables are consistent.',
      });
    }
    
    return changed;
  }

  public getStates() {
    return this.nodes;
  }

  public updateTopology(nodes: Node[], links: Link[]) {
    this.topology = { nodes, links };
    // Ensure all nodes exist in our state map
    nodes.forEach(node => {
      if (!this.nodes.has(node.id)) {
        this.nodes.set(node.id, {
          routingTable: new Map([[node.id, { destination: node.id, nextHop: node.id, distance: 0, predecessor: node.id }]]),
          distanceTable: new Map(),
          linkCostTable: new Map(),
          neighbors: new Set(),
        });
      }
    });
    this.updateLinkCosts();
  }
}
