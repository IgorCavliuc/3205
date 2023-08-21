import React, { useEffect, useState} from 'react';
import axios from 'axios';


interface ApiResponse {
  data: {
    error?: string;
    email: string;
    number: string;
  };
}

function App() {

  const [email, setEmail] = useState('');
  const [number, setNumber] = useState<string>('');
  const [result, setResult] = useState<ApiResponse['data'][]>([])
  const [emailError, setEmailError] = useState('');
  const [seconds, setSeconds] = useState(0);
const [stateSecond, setStateSecond] = useState(false)


  function formatNumberInput(inputStr:string) {
    // Оставить только цифры и ограничить длину до 6 символов
    const digitsOnly = inputStr.replace(/\D/g, '').slice(0, 6);

    // Разделить цифры на группы по 2 символа и объединить их знаком "-"
    const formattedNumber = digitsOnly.replace(/(\d{2})/g, '$1-');

    // Если последний символ "-"
    if (formattedNumber.endsWith('-')) {
      return formattedNumber.slice(0, -1);
    }

    return formattedNumber;
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedNumber = e.target.value
    setNumber(formattedNumber)

  }
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setEmailError('');
  };

  const validateEmail = (emailValue: string) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(emailValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setEmailError('Invalid email format');
      return;
    }

    const reportError = ({message}: {message: ApiResponse["data"]}) => {
      setResult([message])
    }
    try {
      setStateSecond(true)
      const response = await axios.post('http://localhost:5000/search', { email, number });

      setResult(response.data);
      if(response){
        setStateSecond(false)
        setSeconds(0)
      }
    } catch (error:any) {
      reportError({message: error.response.data})
      setStateSecond(false);
      setSeconds(0);
    }
  };


  useEffect(() => {
    const timerInterval = setInterval(() => {
      if (stateSecond) {
        setSeconds(prevSeconds => prevSeconds + 1);
      }
    }, 1000);

    return () => {
      clearInterval(timerInterval);
    };
  }, [stateSecond, seconds]);

  return (
      <div className="test-app">

        <h1>Search email item</h1>
        <form onSubmit={handleSubmit}>
          <div className='test-app__form_item'>
            <label>Email:</label>
            <input
                type="email"
                required
                value={email}
                onChange={handleEmailChange}
            />
            {emailError && <p className="error">{emailError}</p>}
          </div>
          <div className='test-app__form_item'>
            <label>Number:</label>
            <input
                placeholder="99-99-99"
                value={formatNumberInput(number)}
                onChange={handleNumberChange}
            />
          </div>
          <button type="submit">Submit</button>
        </form>
        <div>
          <p>Result:</p>
          <pre>{!stateSecond ? (result ?? []).map((item:ApiResponse["data"], index:number)=>{
            return <p key={index}>{item?.email} - {item?.number}</p>
          }) : seconds}</pre>
        </div>
      </div>
  );
}

export default App;
