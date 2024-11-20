import { useState, FormEvent } from 'react';
import styles from './Dialer.module.scss';
import useWebRtcSdk from '../../../hooks/useWebRtcSdk';

const getLettersForKey = (key: number | string): string => {
  const letters: { [key: number]: string } = {
    2: 'ABC',
    3: 'DEF',
    4: 'GHI',
    5: 'JKL',
    6: 'MNO',
    7: 'PQRS',
    8: 'TUV',
    9: 'WXYZ',
  };
  return letters[key as number] || '';
};

const Dialer = () => {
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { startSoftphoneSession } = useWebRtcSdk();

  console.log('input value =========> ', inputValue);

  // Function to handle button clicks
  const handleButtonClick = (key: number | string) => {
    setInputValue((prev) => prev + key); // Append the clicked key to the input value
  };

  const placeCall = (event?: FormEvent<HTMLFormElement>) => {
    setIsLoading(false);
    if (event) {
      event.preventDefault();
    }
    if (!inputValue) {
      alert('Please enter a valid phone number');
      return false;
    }
    startSoftphoneSession(inputValue);
    setInputValue('');
    setIsLoading(true);
  };

  return (
    <div className={styles.dialerContainer}>
      <div style={{ padding: '10px' }}>
        <input
          type="text"
          id="input"
          placeholder="Type Number"
          value={inputValue}
          readOnly
        />
      </div>
      <div className={styles.grid}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, '*', 0, '#'].map((key) => (
          <button
            key={key}
            className={styles.keyButton}
            type="button"
            onClick={() => handleButtonClick(key)}
          >
            <div className={styles.number}>{key}</div>
            <div className={styles.letters}>{getLettersForKey(key)}</div>
          </button>
        ))}
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '10px',
        }}
      >
        {!isLoading ? (
          <div
            onClick={() => placeCall()}
            style={{
              backgroundColor: '#006FCF',
              cursor: 'pointer',
              width: '70px',
              height: '70px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: '40px',
            }}
          ></div>
        ) : (
          'Loading ....'
        )}
      </div>
    </div>
  );
};

export default Dialer;
