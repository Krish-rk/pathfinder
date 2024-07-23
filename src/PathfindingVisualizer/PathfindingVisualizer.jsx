import React, { Component } from "react";
import Node from "./Node/Node";
import { dijkstra, getNodesInShortestPathOrder } from "../algorithms/dijkstras";
import "./PathfindingVisualizer.css";

const START_NODE_ROW = 10;
const START_NODE_COL = 15;
const FINISH_NODE_ROW = 10;
const FINISH_NODE_COL = 35;

export default class PathfindingVisualizer extends Component {
  state = {
    grid: [],
    mouseIsPressed: false,
    isPlacingStart: false,
    isPlacingFinish: false,
    startNode: { row: START_NODE_ROW, col: START_NODE_COL },
    finishNode: { row: FINISH_NODE_ROW, col: FINISH_NODE_COL },
  };

  componentDidMount() {
    const grid = getInitialGrid(this.state.startNode, this.state.finishNode);
    this.setState({ grid });
  }

  handleMouseDown(row, col) {
    const { isPlacingStart, isPlacingFinish, startNode, finishNode, grid } =
      this.state;

    if (isPlacingStart) {
      this.setState({
        startNode: { row, col },
        grid: updateGridWithStartNode(grid, startNode, row, col),
        isPlacingStart: false,
      });
    } else if (isPlacingFinish) {
      this.setState({
        finishNode: { row, col },
        grid: updateGridWithFinishNode(grid, finishNode, row, col),
        isPlacingFinish: false,
      });
    } else {
      const newGrid = getNewGridWithWallToggled(grid, row, col);
      this.setState({ grid: newGrid, mouseIsPressed: true });
    }
  }

  handleMouseEnter(row, col) {
    if (!this.state.mouseIsPressed) return;
    const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
    this.setState({ grid: newGrid });
  }

  handleMouseUp() {
    this.setState({ mouseIsPressed: false });
  }

  animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder) {
    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
      if (i === visitedNodesInOrder.length) {
        setTimeout(() => {
          this.animateShortestPath(nodesInShortestPathOrder);
        }, 10 * i);
        return;
      }
      setTimeout(() => {
        const node = visitedNodesInOrder[i];
        document.getElementById(`node-${node.row}-${node.col}`).className =
          "node node-visited";
      }, 10 * i);
    }
  }

  animateShortestPath(nodesInShortestPathOrder) {
    for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
      setTimeout(() => {
        const node = nodesInShortestPathOrder[i];
        document.getElementById(`node-${node.row}-${node.col}`).className =
          "node node-shortest-path";
      }, 50 * i);
    }
  }

  visualizeDijkstra() {
    const { grid, startNode, finishNode } = this.state;
    const start = grid[startNode.row][startNode.col];
    const finish = grid[finishNode.row][finishNode.col];
    const visitedNodesInOrder = dijkstra(grid, start, finish);
    const nodesInShortestPathOrder = getNodesInShortestPathOrder(finish);
    this.animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder);
  }

  resetGrid() {
    window.location.reload();
  }

  render() {
    const { grid, mouseIsPressed } = this.state;

    return (
      <>
        <div className="buttons-container">
          <button onClick={() => this.setState({ isPlacingStart: true })}>
            Select Start Node
          </button>
          <button onClick={() => this.setState({ isPlacingFinish: true })}>
            Select Finish Node
          </button>
          <button onClick={() => this.visualizeDijkstra()}>
            Visualize Dijkstra's Algorithm
          </button>
          <button onClick={() => this.resetGrid()}>Reset Grid</button>
        </div>
        <div className="grid">
          {grid.map((row, rowIdx) => {
            return (
              <div key={rowIdx}>
                {row.map((node, nodeIdx) => {
                  const { row, col, isFinish, isStart, isWall } = node;
                  return (
                    <Node
                      key={nodeIdx}
                      col={col}
                      isFinish={isFinish}
                      isStart={isStart}
                      isWall={isWall}
                      mouseIsPressed={mouseIsPressed}
                      onMouseDown={(row, col) => this.handleMouseDown(row, col)}
                      onMouseEnter={(row, col) =>
                        this.handleMouseEnter(row, col)
                      }
                      onMouseUp={() => this.handleMouseUp()}
                      row={row}
                    ></Node>
                  );
                })}
              </div>
            );
          })}
        </div>
      </>
    );
  }
}

const getInitialGrid = (startNode, finishNode) => {
  const grid = [];
  for (let row = 0; row < 20; row++) {
    const currentRow = [];
    for (let col = 0; col < 50; col++) {
      currentRow.push(createNode(col, row, startNode, finishNode));
    }
    grid.push(currentRow);
  }
  return grid;
};

const createNode = (col, row, startNode, finishNode) => {
  return {
    col,
    row,
    isStart: row === startNode.row && col === startNode.col,
    isFinish: row === finishNode.row && col === finishNode.col,
    distance: Infinity,
    isVisited: false,
    isWall: false,
    previousNode: null,
  };
};

const updateGridWithStartNode = (grid, startNode, newRow, newCol) => {
  const newGrid = grid.slice();
  newGrid[startNode.row][startNode.col] = {
    ...newGrid[startNode.row][startNode.col],
    isStart: false,
  };
  newGrid[newRow][newCol] = {
    ...newGrid[newRow][newCol],
    isStart: true,
  };
  return newGrid;
};

const updateGridWithFinishNode = (grid, finishNode, newRow, newCol) => {
  const newGrid = grid.slice();
  newGrid[finishNode.row][finishNode.col] = {
    ...newGrid[finishNode.row][finishNode.col],
    isFinish: false,
  };
  newGrid[newRow][newCol] = {
    ...newGrid[newRow][newCol],
    isFinish: true,
  };
  return newGrid;
};

const getNewGridWithWallToggled = (grid, row, col) => {
  const newGrid = grid.slice();
  const node = newGrid[row][col];
  const newNode = {
    ...node,
    isWall: !node.isWall,
  };
  newGrid[row][col] = newNode;
  return newGrid;
};
