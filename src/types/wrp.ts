
export interface Node {
  id: string;
  name: string;
  x: number;
  y: number;
  status: 'active' | 'inactive';
}

export interface Link {
  source: string;
  target: string;
  cost: number;
  status: 'active' | 'broken';
}

export interface RoutingEntry {
  destination: string;
  nextHop: string;
  distance: number;
  predecessor: string;
}

export interface DistanceEntry {
  destination: string;
  neighbor: string;
  distance: number;
}

export interface LinkCostEntry {
  neighbor: string;
  cost: number;
}

export interface NodeState {
  routingTable: Map<string, RoutingEntry>;
  distanceTable: Map<string, Map<string, number>>; // destination -> neighbor -> distance
  linkCostTable: Map<string, number>; // neighbor -> cost
  neighbors: Set<string>;
}

export interface SimulationStats {
  updatesSent: number;
  messagesSent: number;
  convergenceTime: number;
  lastUpdateTime: number;
}
