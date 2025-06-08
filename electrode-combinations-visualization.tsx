const React = window.React;
import { useState, useEffect } from 'react';

const ElectrodeCombinationsVisualizer = () => {
  const [dots, setDots] = useState([]);
  const [selectedPairs, setSelectedPairs] = useState([]);
  const [combinations, setCombinations] = useState([]);
  const [hoveredDot, setHoveredDot] = useState(null);
  
  // Constants for visualization
  const WIDTH = 500;
  const HEIGHT = 500;
  const CENTER_X = WIDTH / 2;
  const CENTER_Y = HEIGHT / 2;
  const RADIUS = 200;
  const DOT_RADIUS = 10;
  
  // Generate 20 dots positioned in a circle
  useEffect(() => {
    const newDots = [];
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * 2 * Math.PI;
      const x = CENTER_X + RADIUS * 0.8 * Math.cos(angle);
      const y = CENTER_Y + RADIUS * 0.8 * Math.sin(angle);
      newDots.push({
        id: i + 1,
        name: `E${i + 1}`,
        x,
        y,
      });
    }
    setDots(newDots);
  }, []);
  
  // Generate all combinations when selected pairs change
  useEffect(() => {
    if (selectedPairs.length >= 2) {
      const newCombinations = [];
      
      // Flatten the pairs into a single array of electrodes
      const allElectrodes = selectedPairs.flat();
      
      // Prepare a lookup to know which pair each electrode belongs to
      const pairLookup = {};
      selectedPairs.forEach((pair, pairIndex) => {
        pair.forEach(electrode => {
          pairLookup[electrode.id] = pairIndex;
        });
      });
      
      // Generate all possible valid electrode pairs 
      // (electrodes from different original groups)
      const validPairs = [];
      for (let i = 0; i < allElectrodes.length; i++) {
        for (let j = i + 1; j < allElectrodes.length; j++) {
          const electrode1 = allElectrodes[i];
          const electrode2 = allElectrodes[j];
          
          // Skip if electrodes are from the same original pair/group
          if (pairLookup[electrode1.id] === pairLookup[electrode2.id]) {
            continue;
          }
          
          validPairs.push([electrode1, electrode2]);
        }
      }
      
      // Now generate all combinations of 2 valid pairs
      for (let i = 0; i < validPairs.length; i++) {
        for (let j = i + 1; j < validPairs.length; j++) {
          const pair1 = validPairs[i];
          const pair2 = validPairs[j];
          
          // Check if these pairs share any electrodes
          const usedElectrodes = new Set([
            pair1[0].id, pair1[1].id, pair2[0].id, pair2[1].id
          ]);
          
          // If there are 4 distinct electrodes, this is a valid combination
          if (usedElectrodes.size === 4) {
            newCombinations.push([pair1, pair2]);
          }
        }
      }
      
      setCombinations(newCombinations);
    } else {
      setCombinations([]);
    }
  }, [selectedPairs]);
  
  // Handle dot click to select pairs
  const handleDotClick = (dot) => {
    if (hoveredDot === null) {
      setHoveredDot(dot);
    } else {
      if (hoveredDot.id !== dot.id) {
        // Create a pair
        const newPair = [hoveredDot, dot];
        
        // Check if we already have 4 pairs
        if (selectedPairs.length < 4) {
          setSelectedPairs([...selectedPairs, newPair]);
        } else {
          // Replace the first pair (rotate)
          const updatedPairs = [...selectedPairs.slice(1), newPair];
          setSelectedPairs(updatedPairs);
        }
      }
      setHoveredDot(null);
    }
  };
  
  // Reset all selections
  const handleReset = () => {
    setSelectedPairs([]);
    setHoveredDot(null);
    setCombinations([]);
  };
  
  // Get color for dot based on status
  const getDotColor = (dot) => {
    if (hoveredDot && hoveredDot.id === dot.id) {
      return '#ff7700'; // Highlighted dot
    }
    
    // Check if dot is part of any selected pair
    for (const pair of selectedPairs) {
      if (pair[0].id === dot.id || pair[1].id === dot.id) {
        return '#0088ff'; // Selected dot
      }
    }
    
    return '#555'; // Default color
  };
  
  // Get color for pair connection line
  const getPairColor = (index) => {
    const colors = ['#ff3333', '#33ff33', '#3333ff', '#ffff33'];
    return colors[index % colors.length];
  };

  return (
    <div className="flex flex-col items-center p-4">
      <h2 className="text-2xl font-bold mb-4">Electrode Combination Visualizer</h2>
      
      <div className="mb-4">
        <button 
          className="px-4 py-2 bg-red-500 text-white rounded mr-2"
          onClick={handleReset}
        >
          Reset
        </button>
        <span className="ml-2">
          {hoveredDot ? `Select second electrode to pair with ${hoveredDot.name}` : 'Select first electrode of a pair'}
        </span>
      </div>
      
      <div className="mb-4">
        <div className="font-semibold">Selected Pairs:</div>
        <div className="flex flex-wrap gap-2">
          {selectedPairs.map((pair, index) => (
            <div 
              key={index} 
              className="px-2 py-1 rounded" 
              style={{ backgroundColor: getPairColor(index) + '44' }}
            >
              {pair[0].name} & {pair[1].name}
            </div>
          ))}
        </div>
      </div>
      
      {combinations.length > 0 && (
        <div className="mb-4">
          <div className="font-semibold">Combinations ({combinations.length}):</div>
          <div className="text-sm max-h-32 overflow-y-auto">
            {combinations.map((comb, index) => (
              <div key={index} className="text-xs">
                ({comb[0][0].name}-{comb[0][1].name}) + ({comb[1][0].name}-{comb[1][1].name})
              </div>
            ))}
          </div>
        </div>
      )}
      
      <svg width={WIDTH} height={HEIGHT} className="border border-gray-300 rounded">
        {/* Outer circle */}
        <circle 
          cx={CENTER_X} 
          cy={CENTER_Y} 
          r={RADIUS} 
          fill="none" 
          stroke="#333" 
          strokeWidth="2" 
        />
        
        {/* Connection lines for selected pairs */}
        {selectedPairs.map((pair, index) => (
          <line 
            key={`pair-${index}`}
            x1={pair[0].x}
            y1={pair[0].y}
            x2={pair[1].x}
            y2={pair[1].y}
            stroke={getPairColor(index)}
            strokeWidth="2"
          />
        ))}
        
        {/* Lines for all combinations */}
        {combinations.map((comb, index) => (
          <g key={`comb-${index}`}>
            {/* First pair */}
            <line 
              x1={comb[0][0].x}
              y1={comb[0][0].y}
              x2={comb[0][1].x}
              y2={comb[0][1].y}
              stroke="#3366FF44"
              strokeWidth="2"
            />
            {/* Second pair */}
            <line 
              x1={comb[1][0].x}
              y1={comb[1][0].y}
              x2={comb[1][1].x}
              y2={comb[1][1].y}
              stroke="#FF336644"
              strokeWidth="2"
            />
          </g>
        ))}
        
        {/* Dots */}
        {dots.map((dot) => (
          <g key={dot.id} onClick={() => handleDotClick(dot)}>
            <circle 
              cx={dot.x} 
              cy={dot.y} 
              r={DOT_RADIUS} 
              fill={getDotColor(dot)} 
              stroke="#000"
              strokeWidth="1"
              className="cursor-pointer"
            />
            <text 
              x={dot.x} 
              y={dot.y} 
              textAnchor="middle" 
              dominantBaseline="middle" 
              fontSize="10"
              fill="#fff"
              className="pointer-events-none"
            >
              {dot.name}
            </text>
          </g>
        ))}
      </svg>
      
      <div className="mt-4 text-sm">
        <p>Instructions:</p>
        <ol className="list-decimal pl-5">
          <li>Click on two dots to create a pair</li>
          <li>Create up to 4 pairs</li>
          <li>All possible combinations between pairs will be generated</li>
          <li>Use the reset button to start over</li>
        </ol>
      </div>
    </div>
  );
};

export default ElectrodeCombinationsVisualizer;
