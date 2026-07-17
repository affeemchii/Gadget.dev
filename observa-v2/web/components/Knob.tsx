import React from 'react';
import styles from './Knob.module.css';

export interface KnobProps {
  ariaLabel: string;
  selected: boolean;
  onClick: () => void;
}

export const Knob: React.FC<KnobProps> = ({ ariaLabel, selected, onClick }) => {
  return (
    <button
      className={`${styles.track} ${selected ? styles.track_on : ''}`}
      aria-label={ariaLabel}
      role="switch"
      type="button"
      aria-checked={selected}
      onClick={onClick}
    >
      <div className={`${styles.knob} ${selected ? styles.knob_on : ''}`}></div>
    </button>
  );
};

export default Knob;
