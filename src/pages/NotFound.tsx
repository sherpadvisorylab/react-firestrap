import { ActionButton } from '../components/Buttons';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className='d-flex flex-column justify-content-center align-items-center vh-100'>
            <h1>404</h1>
            <p>Oops! Pagina non trovata.</p>
            <ActionButton
                onClick={() => navigate('/')}
                label='Torna alla home'
                icon='bi bi-house-door'
            />
        </div>
    );
};

export default NotFound;
