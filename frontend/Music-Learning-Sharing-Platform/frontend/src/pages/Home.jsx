import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function Home() {
  const [updates, setUpdates] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:9090/api/progress-updates/user/4')
      .then((res) => setUpdates(res.data));
  }, []);

  console.log(updates);

  return (
    <div className='p-4'>
      <h1 className='text-2xl font-bold mb-4'>Progress Updates</h1>
      <Link to='/create' className='bg-blue-500 text-white px-4 py-2 rounded'>+ New</Link>
      <ul className='mt-4'>
        {updates.map((u) => (
          <li key={u.id} className='border p-2 mb-2 rounded'>
            <p>{u.caption}</p>
            <Link to={`/update/${u.id}`} className='text-blue-600 underline'>View</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
