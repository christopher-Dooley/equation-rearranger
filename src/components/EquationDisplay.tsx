import React, { useState, useRef } from 'react';
import type { Equation, VisualSettings, DragState, Term } from '../types/equation';
import { isTerm } from '../types/equation';
import TermComponent from './TermComponent';

interface EquationDisplayProps {
  equation: Equation;
  visualSettings: VisualSettings;
  onTermSelect: (termId: string, side: 'left' | 'right', isMultiSelect: boolean) => void;
  onTermMove: (termIds: string[], fromSide: 'left' | 'right', toSide: 'left' | 'right') => void;
  dragState: DragState;
}

const EquationDisplay: React.FC<EquationDisplayProps> = ({
  equation,
  visualSettings,
  onTermSelect,
  onTermMove,
  dragState
}) => {
  const [dragOverSide, setDragOverSide] = useState<'left' | 'right' | null>(null);
  const leftSideRef = useRef<HTMLDivElement>(null);
  const rightSideRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.DragEvent, termId: string, side: 'left' | 'right') => {
    e.dataTransfer.setData('text/plain', JSON.stringify({
      termIds: [termId],
      fromSide: side
    }));
  };

  const handleDragOver = (e: React.DragEvent, side: 'left' | 'right') => {
    e.preventDefault();
    setDragOverSide(side);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverSide(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetSide: 'left' | 'right') => {
    e.preventDefault();
    setDragOverSide(null);
    
    try {
      const dragData = JSON.parse(e.dataTransfer.getData('text/plain'));
      const { termIds, fromSide } = dragData;
      
      if (fromSide !== targetSide) {
        onTermMove(termIds, fromSide, targetSide);
      }
    } catch (error) {
      console.error('Error parsing drag data:', error);
    }
  };

  const renderSide = (side: 'left' | 'right', ref: React.RefObject<HTMLDivElement | null>) => {
    const items = equation[side].terms;
    const isDragOver = dragOverSide === side;
    
    // Filter only individual terms for dragging (not groups)
    const individualTerms = items.filter(isTerm);

    return (
      <div
        ref={ref}
        className={`equation-side ${side} ${isDragOver ? 'drag-over' : ''}`}
        onDragOver={(e) => handleDragOver(e, side)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, side)}
      >
        <div className="terms-container">
          {items.map((item, index) => {
            if (isTerm(item)) {
              return (
                <React.Fragment key={item.id}>
                  {index > 0 && (
                    <span className="operator">
                      {item.coefficient >= 0 ? '+' : '-'}
                    </span>
                  )}
                  <div
                    draggable
                    onDragStart={(e) => handleDragStart(e, item.id, side)}
                    className="term-wrapper"
                  >
                    <TermComponent
                      term={item}
                      visualSettings={visualSettings}
                      onSelect={(termId, isMultiSelect) => onTermSelect(termId, side, isMultiSelect)}
                      isDragging={dragState.isDragging && dragState.draggedTerms.some(t => t.id === item.id)}
                    />
                  </div>
                </React.Fragment>
              );
            } else {
              // Handle term groups (parentheses)
              return (
                <React.Fragment key={item.id}>
                  {index > 0 && (
                    <span className="operator">+</span>
                  )}
                  <div className="term-group-wrapper">
                    <div className="term-group">
                      <span className="parentheses">(</span>
                      <div className="grouped-terms">
                        {item.terms.map((term, termIndex) => (
                          <React.Fragment key={term.id}>
                            {termIndex > 0 && (
                              <span className="operator">
                                {term.coefficient >= 0 ? '+' : '-'}
                              </span>
                            )}
                            <div className="term-wrapper">
                              <TermComponent
                                term={term}
                                visualSettings={visualSettings}
                                onSelect={(termId, isMultiSelect) => onTermSelect(termId, side, isMultiSelect)}
                                isDragging={dragState.isDragging && dragState.draggedTerms.some(t => t.id === term.id)}
                              />
                            </div>
                          </React.Fragment>
                        ))}
                      </div>
                      <span className="parentheses">)</span>
                    </div>
                  </div>
                </React.Fragment>
              );
            }
          })}
          {items.length === 0 && (
            <div className="empty-side">0</div>
          )}
        </div>
        
        {/* Operation feedback */}
        {dragState.isDragging &&
         dragState.sourceSide === side &&
         dragState.draggedTerms.length > 0 && (
          <div className="operation-feedback">
            -{dragState.draggedTerms.map(term => {
              const absCoefficient = Math.abs(term.coefficient);
              if (term.isConstant) return absCoefficient;
              if (absCoefficient === 1) return term.variable;
              return `${absCoefficient}${term.variable}`;
            }).join(', ')}
          </div>
        )}
        
        {dragState.isDragging &&
         dragState.targetSide === side &&
         dragState.draggedTerms.length > 0 && (
          <div className="operation-feedback">
            +{dragState.draggedTerms.map(term => {
              const absCoefficient = Math.abs(term.coefficient);
              if (term.isConstant) return absCoefficient;
              if (absCoefficient === 1) return term.variable;
              return `${absCoefficient}${term.variable}`;
            }).join(', ')}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="equation-display">
      {renderSide('left', leftSideRef)}
      <div className="equals-sign">=</div>
      {renderSide('right', rightSideRef)}
    </div>
  );
};

export default EquationDisplay;