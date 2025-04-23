import { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Функция регистрации
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('http://localhost:5000/api/user/registration', {
        email,
        password
      });
      
      // Сохраняем токен
      localStorage.setItem('token', response.data.token);
      setUser(jwtDecode(response.data.token));
      alert('⠀⠀⠀⠀⢀⣴⠶⠿⠟⠛⠻⠛⠳⠶⣄⡀⠀⠀              ⠀⠀⠀⠀   ⠀⠀⣠⣶⣿⣿⣿⣶⣖⠶⢶⣤⡀⠀⠈⢿⣆⠀⠀⠀⠀⠀ ⢀⣴⣿⠋⠉⠉⠀⠀⠈⠉⠛⠿⢿⣷⡀⠀⠈⢷⡀⠀⠀⠀ ⡾⠉⡏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠙⢦⡀⠘⣷⡀⠀⠀ ⣷⢰⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢳⡀⢸⡇⠀⠀ ⢻⡜⡄⠀⢀⣀⣤⣶⣶⡄⣴⣾⣿⣛⣓⠀⠀⣧⢸⣇⠀⠀ ⢈⣧⣧⠀⢩⠞⠿⠿⠻⠀⠘⠙⠃⠛⠛⠓⠀⣿⣻⠿⣷⠀ ⢸⡵⣿⠀⠀⠀⠀⠀⠀⠀⠀⠠⡀⠀⠀⠀⠀⠀⢻⣇⡟⠀ ⠘⢧⣿⡀⠀⠀⠀⠀⢧⣤⣤⣶⣗⠀⠀⠀⠀⠀⠜⣽⠁⠀ ⠀⠈⢿⣧⠀⠀⠀⠀⣿⣿⣿⣿⣿⣀⠀⠀⠀⢠⡟⠁⠀⠀ ⠀⠀⠀⠘⣇⠀⠀⠰⠋⠉⠙⠂⠀⠉⠀⠀⠀⣼⡅⠀⠀⠀ ⠀⠀⠀⠀⠹⣦⡀⠀⠀⠀⠉⠉⠁⠀⠀⠀⣠⠏⢻⣤⡀⠀ ⠀⠀⠀⠀⠀⢹⡷⢦⣄⣀⣀⣀⣀⣤⣴⡾⠃⠀⠘⡿⠙⢶ ⠀⠀⠀⠀⠀⢨⡷⣤⡀⠈⠉⠉⢁⡴⠋⠀⠀⠀⣸⠃⠀⠀ ');
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка регистрации');
      console.error('Да как так?', err);
    } finally {
      setLoading(false);
    }
  };
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('http://localhost:5000/api/user/login', {
        email,
        password
      });
      
      // Сохраняем токен
      localStorage.setItem('token', response.data.token);
      setUser(jwtDecode(response.data.token));
      alert('Внимание! Пидр обнаружен!');
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка регистрации');
      console.error('Опа...', err);
    } finally {
      setLoading(false);
    }
  };

  // Проверка авторизации при загрузке
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const decoded = jwtDecode(token);
        
        // Проверяем срок действия токена
        if (decoded.exp * 1000 < Date.now()) {
          throw new Error('Token expired');
        }

        // Запрашиваем данные пользователя
        const response = await axios.get(`http://localhost:5000/api/user/${decoded.id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setUser(response.data);
      } catch (err) {
        console.error('Auth check error:', err);
        localStorage.removeItem('token');
        setError('Сессия истекла, войдите снова');
      }
    };

    checkAuth();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setError('');
  };

  if (loading) return <div>Загрузка...</div>;

  return (
    <div className="app">
      {user ? (
        <div className="profile">
          <h2>Добро пожаловать, {user.email}!</h2>
          <p>Роль: {user.role}</p>
          <button onClick={handleLogout}>Выйти</button>
        </div>
      ) : (
        <form onSubmit={handleRegister}>
          <h2>Почеши мне яйки (っ˘ω˘ς )</h2>
          {error && <div className="error">{error}</div>}
          <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required
          />
          <input type="password" placeholder="Пароль" onChange={(e) => setPassword(e.target.value)} required minLength="6"
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Чипируем' : 'Бесплатная кострация'}
          </button>
        </form>

      )}
      {user ? (
        <div></div>
      ) : (
        <form onSubmit={handleLogin}>
          <h2>Войди в меня („• ᴗ •„)</h2>
          {error && <div className="error">{error}</div>}
          <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required
          />
          <input type="password" placeholder="Пароль" onChange={(e) => setPassword(e.target.value)} required minLength="6"
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Регистрация...' : 'Аххх'}
          </button>
        </form>
      )}
    </div>
  );
}

export default App;