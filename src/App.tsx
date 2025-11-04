import React, { useState, useCallback } from 'react';
import type { Equation, Term, VisualSettings, DragState, Operation } from './types/equation';
import { isTerm } from './types/equation';
import { EquationParser } from './utils/equationParser';
import { HistoryManager } from './utils/historyManager';
import EquationDisplay from './components/EquationDisplay';
import OperationInput from './components/OperationInput';
import HistoryPanel from './components/HistoryPanel';
import './App.css';

const DEFAULT_EQUATION = '2x + 3 = 7';

function App() {
  const [equation, setEquation] = useState<Equation>(() => EquationParser.parseEquation(DEFAULT_EQUATION));
  const [historyManager] = useState(() => new HistoryManager());
  const [equationInput, setEquationInput] = useState(DEFAULT_EQUATION);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedTerms: [],
    sourceSide: null,
    targetSide: null
  });
  const [visualSettings, setVisualSettings] = useState<VisualSettings>({
    viewMode: 'single',
    colors: {},
    showOperationFeedback: true
  });

  // Initialize history with the starting equation
  React.useEffect(() => {
    historyManager.addStep(equation, null, 'Initial equation');
  }, []);

  const handleEquationInput = (input: string) => {
    try {
      const newEquation = EquationParser.parseEquation(input);
      setEquation(newEquation);
      setEquationInput(input);
      historyManager.clear();
      historyManager.addStep(newEquation, null, 'Initial equation');
    } catch (error) {
      alert(`Invalid equation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleTermSelect = useCallback((termId: string, side: 'left' | 'right', isMultiSelect: boolean) => {
    setEquation(prevEquation => {
      const newEquation = {
        ...prevEquation,
        left: {
          terms: prevEquation.left.terms.map(term => ({ ...term }))
        },
        right: {
          terms: prevEquation.right.terms.map(term => ({ ...term }))
        }
      };
      
      if (!isMultiSelect) {
        // Deselect all terms first
        newEquation.left.terms.forEach(term => { term.isSelected = false; });
        newEquation.right.terms.forEach(term => { term.isSelected = false; });
      }
      
      // Toggle selection for the clicked term
      const term = newEquation[side].terms.find(t => t.id === termId);
      if (term) {
        term.isSelected = !term.isSelected;
      }
      
      return newEquation;
    });
  }, []);

  const handleTermMove = useCallback((termIds: string[], fromSide: 'left' | 'right', toSide: 'left' | 'right') => {
    const newEquation = EquationParser.moveTerms(equation, termIds, fromSide, toSide);
    setEquation(newEquation);
    
    // Add to history
    const movedTerms = equation[fromSide].terms.filter(item => {
      if (isTerm(item) && termIds.includes(item.id)) {
        return true;
      }
      return false;
    }) as Term[];
    const description = `Moved ${movedTerms.map(term => {
      const absCoefficient = Math.abs(term.coefficient);
      if (term.isConstant) return absCoefficient;
      if (absCoefficient === 1) return term.variable;
      return `${absCoefficient}${term.variable}`;
    }).join(', ')} from ${fromSide} to ${toSide}`;
    
    historyManager.addStep(newEquation, null, description);
    
    // Reset drag state
    setDragState({
      isDragging: false,
      draggedTerms: [],
      sourceSide: null,
      targetSide: null
    });
  }, [equation, historyManager]);

  const handleApplyOperation = useCallback((operation: Operation) => {
    try {
      const newEquation = EquationParser.applyOperation(equation, operation);
      setEquation(newEquation);
      
      const description = EquationParser.getOperationDescription(operation);
      historyManager.addStep(newEquation, operation, description);
    } catch (error) {
      alert(`Error applying operation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [equation, historyManager]);

  const handleUndo = () => {
    const step = historyManager.undo();
    if (step) {
      setEquation(step.equation);
    }
  };

  const handleRedo = () => {
    const step = historyManager.redo();
    if (step) {
      setEquation(step.equation);
    }
  };

  const toggleViewMode = () => {
    setVisualSettings(prev => ({
      ...prev,
      viewMode: prev.viewMode === 'single' ? 'cloud' : 'single'
    }));
  };

  const currentHistory = historyManager.getHistory();

  return (
    <div className="app">
      <header className="app-header">
        <h1>Interactive Equation Rearranger</h1>
        <p>Drag terms between sides or apply operations to solve equations</p>
      </header>

      <div className="app-content">
        <div className="controls-panel">
          <div className="equation-input-section">
            <label htmlFor="equation-input">Enter Equation:</label>
            <input
              id="equation-input"
              type="text"
              value={equationInput}
              onChange={(e) => setEquationInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleEquationInput(equationInput)}
              placeholder="e.g., 2x + 3 = 7"
              className="equation-input"
            />
            <button 
              onClick={() => handleEquationInput(equationInput)}
              className="load-button"
            >
              Load Equation
            </button>
          </div>

          <div className="view-controls">
            <button 
              onClick={toggleViewMode}
              className="view-toggle"
            >
              Switch to {visualSettings.viewMode === 'single' ? 'Cloud' : 'Single'} View
            </button>
            
            <div className="undo-redo">
              <button 
                onClick={handleUndo}
                disabled={!historyManager.canUndo()}
                className="undo-button"
              >
                Undo
              </button>
              <button 
                onClick={handleRedo}
                disabled={!historyManager.canRedo()}
                className="redo-button"
              >
                Redo
              </button>
            </div>
          </div>
        </div>

        <div className="equation-section">
          <EquationDisplay
            equation={equation}
            visualSettings={visualSettings}
            onTermSelect={handleTermSelect}
            onTermMove={handleTermMove}
            dragState={dragState}
          />
        </div>

        <div className="operations-section">
          <OperationInput onApplyOperation={handleApplyOperation} />
        </div>

        <div className="history-section">
          <HistoryPanel
            history={currentHistory}
            currentStepIndex={historyManager['currentIndex']}
            onStepClick={(index) => {
              console.log('Step navigation not yet implemented');
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
