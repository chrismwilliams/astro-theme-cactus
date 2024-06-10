// /* eslint-disable @typescript-eslint/restrict-template-expressions */
// /* eslint-disable @typescript-eslint/no-unsafe-member-access */
// /* eslint-disable @typescript-eslint/no-unsafe-call */
// /* eslint-disable @typescript-eslint/no-unsafe-return */
// /* eslint-disable @typescript-eslint/no-unsafe-assignment */
// import type React from 'react';

// /* eslint-disable @typescript-eslint/no-unsafe-argument */
// import gsap from 'gsap';
// import { useEffect, useRef, useState } from 'react';

// const CELL_SIZE = 10; // Size of each cell

// const GameOfLife: React.FC = () => {
//   const containerRef = useRef<HTMLDivElement | null>(null);

//   // Calculate number of rows and columns based on viewport size
//   const numRows = Math.ceil(window.innerHeight / CELL_SIZE);
//   const numCols = Math.ceil(window.innerWidth / CELL_SIZE);

//   const [grid, setGrid] = useState<boolean[][]>([]);

//   useEffect(() => {
//     const initGrid = () => {
//       const newGrid = Array.from({ length: numRows }, () =>
//         Array.from({ length: numCols }, () => Math.random() > 0.5)
//       );
//       setGrid(newGrid);
//     };
//     initGrid();
//   }, [numRows, numCols]);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setGrid((prevGrid) => {
//         const newGrid = prevGrid.map((row, i) =>
//           row.map((cell, j) => {
//             const neighbors = countNeighbors(prevGrid, i, j);
//             if (cell && (neighbors < 2 || neighbors > 3)) return false;
//             if (!cell && neighbors === 3) return true;
//             return cell;
//           })
//         );
//         animateGrid(newGrid);
//         return newGrid;
//       });
//     }, 200); // Reduced interval time for smoother transitions

//     return () => {
//       clearInterval(interval);
//     };
//   }, []);

//   const countNeighbors = (grid: boolean[][], x: number, y: number): number => {
//     let count = 0;
//     for (let i = -1; i <= 1; i++) {
//       for (let j = -1; j <= 1; j++) {
//         if (i === 0 && j === 0) continue;
//         const newRow = x + i;
//         const newCol = y + j;
//         if (newRow >= 0 && newRow < numRows && newCol >= 0 && newCol < numCols) {
//           if (grid[newRow][newCol]) count++;
//         }
//       }
//     }
//     return count;
//   };

//   const animateGrid = (newGrid: boolean[][]) => {
//     if (!containerRef.current) return;
//     const cells = containerRef.current.querySelectorAll('.cell');
//     newGrid.flat().forEach((isAlive, index) => {
//       const cell = cells[index] as HTMLElement;
//       gsap.to(cell, {
//         backgroundColor: isAlive ? '#333' : '#eee', // Subtle color transition
//         duration: 0.2, // Shorter duration for more subtle effect
//       });
//     });
//   };

//   return (
//     <div
//       ref={containerRef}
//       style={{
//         display: 'grid',
//         gridTemplateColumns: `repeat(${numCols}, ${CELL_SIZE}px)`,
//         gridTemplateRows: `repeat(${numRows}, ${CELL_SIZE}px)`,
//         height: '100vh',
//         left: 0,
//         position: 'fixed',
//         top: 0,
//         width: '100vw',
//       }}
//     >
//       {grid.flatMap((row, rowIndex) =>
//         row.map((isAlive, colIndex) => (
//           <div
//             className="cell"
//             key={`${rowIndex}-${colIndex}`}
//             style={{
//               backgroundColor: isAlive ? '#333' : '#eee', // Subtle color transition
//               height: `${CELL_SIZE}px`,
//               width: `${CELL_SIZE}px`,
//             }}
//           />
//         ))
//       )}
//     </div>
//   );
// };

// export default GameOfLife;